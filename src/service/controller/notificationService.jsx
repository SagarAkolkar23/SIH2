import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/useQuery";
import { useCustomQuery } from "../../api/useQuery";

// Query Keys
const NOTIFICATION_KEYS = {
  grids: ["notifications", "grids"],
  stats: ["notifications", "stats"],
  history: ["notifications", "history"],
};

/**
 * Get all grids (microgrids) for notification sending
 * Controllers see only their grid, SUPER_ADMIN sees all
 */
export const useMicrogridsQuery = () => {
  return useCustomQuery({
    queryKey: NOTIFICATION_KEYS.grids,
    queryFn: () => ({
      method: "GET",
      url: "/api/grids",
    }),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Get notification statistics for a grid
 * @param {string} gridId - Grid ID (optional, controller's grid is used automatically)
 */
export const useNotificationStatsQuery = (gridId = null) => {
  return useCustomQuery({
    queryKey: [...NOTIFICATION_KEYS.stats, gridId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (gridId) params.append("gridId", gridId);
      const queryString = params.toString();
      return {
        method: "GET",
        url: `/api/notification/stats${queryString ? `?${queryString}` : ""}`,
      };
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Get notification history
 * @param {string} gridId - Grid ID (optional, for SUPER_ADMIN filtering)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 */
export const useNotificationHistoryQuery = (gridId = null, page = 1, limit = 50) => {
  return useCustomQuery({
    queryKey: [...NOTIFICATION_KEYS.history, gridId, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (gridId) params.append("gridId", gridId);
      return {
        method: "GET",
        url: `/api/notification/history?${params.toString()}`,
      };
    },
    enabled: true,
    staleTime: 10 * 1000, // 10 seconds
    retry: 2,
  });
};

/**
 * Send notification to all consumers in a grid (Primary endpoint for controllers)
 * POST /api/notification/send-by-grid
 */
export const useSendNotificationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      // Backend expects: gridId, title, body, notificationType, priority, data
      const payload = {
        gridId: data.gridId || data.microgridId, // Support both field names
        title: data.title,
        body: data.body || data.message, // Support both field names
        notificationType: data.notificationType || "info",
        priority: data.priority || "medium",
        data: data.data || {},
      };
      
      const response = await api.post("/api/notification/send-by-grid", payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification-related queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.history });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats });
    },
  });
};

/**
 * Send notification to specific users or by gridId
 * POST /api/notification/send-notification
 */
export const useSendNotificationToUsersApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      // Backend expects: userIds (array), gridId, title, body, notificationType, priority, data
      const payload = {
        ...(data.userIds && { userIds: data.userIds }),
        ...(data.gridId && { gridId: data.gridId }),
        title: data.title,
        body: data.body || data.message,
        notificationType: data.notificationType || "info",
        priority: data.priority || "medium",
        data: data.data || {},
      };
      
      const response = await api.post("/api/notification/send-notification", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.history });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats });
    },
  });
};

/**
 * Consumer sends alert to controller
 * POST /api/notification/send-alert
 */
export const useSendAlertApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/notification/send-alert", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.history });
    },
  });
};
