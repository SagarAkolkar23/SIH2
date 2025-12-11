import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/useQuery';
import { initializeNotifications, getStoredFCMToken, removeFCMToken } from './notificationService';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to register FCM token with backend
 * PUT /api/profile/fcm-token
 */
export const useRegisterFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token) => {
      if (!token) {
        throw new Error('FCM token is required');
      }

      // Check if auth token exists
      const authToken = useAuthStore.getState().token;
      
      if (!authToken) {
        throw new Error('Authentication required - no auth token');
      }

      try {
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: token,
        });

        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

/**
 * Hook to initialize and register FCM token
 * This combines getting the token and registering it with backend
 */
export const useInitializeAndRegisterFCM = () => {
  const registerTokenMutation = useRegisterFCMToken();

  const initializeAndRegister = async () => {
    try {
      // Step 1: Check auth state FIRST
      let authToken = useAuthStore.getState().token;
      
      if (!authToken) {
        throw new Error('Authentication required - please log in first');
      }

      // Step 2: Try to get stored token first (avoid regenerating unnecessarily)
      let token = await getStoredFCMToken();

      // Step 3: If no stored token, initialize and generate new token
      if (!token) {
        token = await initializeNotifications();
        
        if (!token) {
          throw new Error('Failed to generate FCM token');
        }
      }

      // Step 4: Verify auth token again before API call
      authToken = useAuthStore.getState().token;
      if (!authToken) {
        throw new Error('Auth token not available for registration');
      }
      
      // Register token with backend
      await registerTokenMutation.mutateAsync(token);
      
      return token;
      
    } catch (error) {
      // Re-throw error so caller knows it failed
      throw error;
    }
  };

  return {
    initializeAndRegister,
    isPending: registerTokenMutation.isPending,
    isError: registerTokenMutation.isError,
    error: registerTokenMutation.error,
  };
};

/**
 * Hook to remove FCM token from backend
 * PUT /api/profile/fcm-token with null token
 */
export const useRemoveFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: null,
        });
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      try {
        await removeFCMToken();
      } catch (error) {
        // Error removing token from local storage
      }
      
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};