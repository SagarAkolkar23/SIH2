import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/useQuery";

// POST /api/controller/notifications/send
export const useSendNotificationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [NOTIFICATION] Sending notification:', data);
      const response = await api.post("/api/controller/notifications/send", data);
      console.log('✅ [NOTIFICATION] Notification sent:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate history query to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
    },
  });
};

// GET /api/controller/notifications/stats/:microgridId
export const useNotificationStatsQuery = (microgridId) => {
  return useQuery({
    queryKey: ["notification", "stats", microgridId],
    queryFn: async () => {
      if (!microgridId) return null;
      const response = await api.get(`/api/controller/notifications/stats/${microgridId}`);
      return response.data;
    },
    enabled: !!microgridId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// GET /api/controller/notifications/history
export const useNotificationHistoryQuery = (microgridId = null, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ["notifications", "history", microgridId, page, limit],
    queryFn: async () => {
      const params = { page, limit };
      if (microgridId) {
        params.microgridId = microgridId;
      }
      const response = await api.get("/api/controller/notifications/history", { params });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// GET /api/controller/notifications/history/:notificationId
export const useNotificationByIdQuery = (notificationId) => {
  return useQuery({
    queryKey: ["notifications", "history", notificationId],
    queryFn: async () => {
      const response = await api.get(`/api/controller/notifications/history/${notificationId}`);
      return response.data;
    },
    enabled: !!notificationId,
  });
};
