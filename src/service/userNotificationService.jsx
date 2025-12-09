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
        console.log('[FCM API] ❌ FCM token is required');
        throw new Error('FCM token is required');
      }

      // Get current user info for logging
      const user = useAuthStore.getState().user;
      console.log('[FCM API] ========================================');
      console.log('[FCM API] Sending FCM token to backend...');
      console.log('[FCM API] User Role:', user?.role);
      console.log('[FCM API] User Email:', user?.email);
      console.log('[FCM API] User ID:', user?._id);
      console.log('[FCM API] Endpoint: PUT /api/profile/fcm-token');
      console.log('[FCM API] Token (first 30 chars):', token.substring(0, 30) + '...');

      try {
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: token,
        });

        console.log('[FCM API] ✅ Backend response received');
        console.log('[FCM API] Response status:', response.status);
        console.log('[FCM API] Response data:', JSON.stringify(response.data, null, 2));
        console.log('[FCM API] ========================================');

        return response.data;
      } catch (error) {
        console.log('[FCM API] ❌ Error sending FCM token to backend');
        console.log('[FCM API] Error message:', error.message);
        console.log('[FCM API] Error response:', error.response?.data);
        console.log('[FCM API] Error status:', error.response?.status);
        console.log('[FCM API] Full error:', error);
        console.log('[FCM API] ========================================');
        throw error;
      }
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
      // Get current user info for logging
      const user = useAuthStore.getState().user;
      
      console.log('[FCM] ========================================');
      console.log('[FCM] Starting FCM token initialization and registration...');
      console.log('[FCM] User Role:', user?.role);
      console.log('[FCM] User Email:', user?.email);
      console.log('[FCM] User ID:', user?._id);
      
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
        // Check if auth token is available before making API call
        const authToken = useAuthStore.getState().token;
        if (!authToken) {
          console.log('[FCM] ⚠️ Auth token not available, waiting...');
          // Wait a bit and check again (auth might still be setting up)
          await new Promise(resolve => setTimeout(resolve, 500));
          const authTokenRetry = useAuthStore.getState().token;
          if (!authTokenRetry) {
            console.log('[FCM] ❌ Auth token still not available after wait');
            console.log('[FCM] ========================================');
            return token; // Return token anyway, it can be registered later
          }
        }
        
        console.log('[FCM] Registering token with backend...');
        console.log('[FCM] Auth token available:', authToken ? 'Yes' : 'No');
        console.log('[FCM] Token (first 30 chars):', token.substring(0, 30) + '...');
        
        try {
          const result = await registerTokenMutation.mutateAsync(token);
          console.log('[FCM] ✅ Token registered successfully with backend');
          console.log('[FCM] Backend response:', JSON.stringify(result, null, 2));
          console.log('[FCM] ========================================');
          return token;
        } catch (error) {
          console.log('[FCM] ❌ Failed to register token with backend');
          console.log('[FCM] Error:', error.message);
          console.log('[FCM] Error response:', error.response?.data);
          console.log('[FCM] Error status:', error.response?.status);
          console.log('[FCM] Full error:', error);
          console.log('[FCM] ========================================');
          // Don't return null here - still return token so it can be retried
          return token;
        }
      } else {
        console.log('[FCM] ⚠️ No token available to register');
        console.log('[FCM] ========================================');
      }

      return null;
    } catch (error) {
      console.log('[FCM] ❌ Error during FCM token registration:', error.message);
      console.log('[FCM] Error details:', error);
      console.log('[FCM] ========================================');
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
      const user = useAuthStore.getState().user;
      
      console.log('[FCM REMOVE] Removing FCM token from backend...');
      console.log('[FCM REMOVE] User:', user?.email);
      console.log('[FCM REMOVE] User Role:', user?.role);
      
      try {
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: null,
        });

        console.log('[FCM REMOVE] ✅ FCM token removed from backend');
        console.log('[FCM REMOVE] Response:', response.data);
        
        return response.data;
      } catch (error) {
        console.log('[FCM REMOVE] ❌ Error removing FCM token from backend');
        console.log('[FCM REMOVE] Error:', error.message);
        console.log('[FCM REMOVE] Error response:', error.response?.data);
        throw error;
      }
    },
    onSuccess: async () => {
      // Remove token from local storage
      console.log('[FCM REMOVE] Removing FCM token from local storage...');
      try {
        await removeFCMToken();
        console.log('[FCM REMOVE] ✅ FCM token removed from local storage');
      } catch (error) {
        console.log('[FCM REMOVE] ⚠️ Error removing token from local storage:', error.message);
      }
      
      // Optionally invalidate user profile query if it exists
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};
