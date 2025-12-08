import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/useQuery";

// POST /api/notification/send-notification - Send notification to multiple consumers
export const useSendNotificationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [NOTIFICATION] Sending notification:', data);
      const response = await api.post("/api/notification/send-notification", data);
      console.log('✅ [NOTIFICATION] Notification sent:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate any notification-related queries if needed
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// POST /api/notification/send-alert - Consumer sends alert to controller
export const useSendAlertApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [NOTIFICATION] Sending alert:', data);
      const response = await api.post("/api/notification/send-alert", data);
      console.log('✅ [NOTIFICATION] Alert sent:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
