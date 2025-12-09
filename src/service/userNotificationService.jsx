import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/useQuery';
import { initializeNotifications, getStoredFCMToken, removeFCMToken } from './notificationService';

/**
 * Hook to register FCM token with backend
 * PUT /api/profile/fcm-token
 */
export const useRegisterFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token) => {
      if (!token) {
        console.log('[FCM API] ❌ FCM token is required');
        throw new Error('FCM token is required');
      }

      console.log('[FCM API] Sending FCM token to backend...');
      console.log('[FCM API] Endpoint: PUT /api/profile/fcm-token');
      console.log('[FCM API] Token (first 30 chars):', token.substring(0, 30) + '...');

      const response = await api.put('/api/profile/fcm-token', {
        fcmToken: token,
      });

      console.log('[FCM API] ✅ Backend response received');
      console.log('[FCM API] Response status:', response.status);
      console.log('[FCM API] Response data:', response.data);

      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate user profile query if it exists
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
      console.log('[FCM] Starting FCM token initialization and registration...');
      
      // First, try to get stored token
      let token = await getStoredFCMToken();
      console.log('[FCM] Stored token found:', token ? 'Yes' : 'No');

      // If no stored token, initialize notifications and get new token
      if (!token) {
        console.log('[FCM] No stored token, initializing notifications...');
        token = await initializeNotifications();
        console.log('[FCM] New token obtained:', token ? 'Yes' : 'No');
      } else {
        console.log('[FCM] Using stored token');
      }

      // If we have a token, register it with backend
      if (token) {
        console.log('[FCM] Registering token with backend...');
        console.log('[FCM] Token (first 30 chars):', token.substring(0, 30) + '...');
        
        const result = await registerTokenMutation.mutateAsync(token);
        console.log('[FCM] ✅ Token registered successfully with backend');
        console.log('[FCM] Backend response:', result);
        return token;
      } else {
        console.log('[FCM] ⚠️ No token available to register');
      }

      return null;
    } catch (error) {
      console.log('[FCM] ❌ Error during FCM token registration:', error.message);
      console.log('[FCM] Error details:', error);
      return null;
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
      const response = await api.put('/api/profile/fcm-token', {
        fcmToken: null,
      });

      return response.data;
    },
    onSuccess: async () => {
      // Remove token from local storage
      await removeFCMToken();
      // Optionally invalidate user profile query if it exists
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};
