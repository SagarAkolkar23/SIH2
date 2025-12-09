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
        console.log('[FCM] ✅ Token obtained, preparing to register with backend...');
        console.log('[FCM] Token length:', token.length);
        console.log('[FCM] Token (first 30 chars):', token.substring(0, 30) + '...');
        
        // Check if auth token is available before making API call
        let authToken = useAuthStore.getState().token;
        console.log('[FCM] Initial auth token check:', authToken ? 'Available' : 'Not available');
        
        if (!authToken) {
          console.log('[FCM] ⚠️ Auth token not available, waiting 500ms...');
          // Wait a bit and check again (auth might still be setting up)
          await new Promise(resolve => setTimeout(resolve, 500));
          authToken = useAuthStore.getState().token;
          console.log('[FCM] Auth token after wait:', authToken ? 'Available' : 'Still not available');
          
          if (!authToken) {
            console.log('[FCM] ❌ Auth token still not available after wait');
            console.log('[FCM] ⚠️ Will retry token registration later when auth is available');
            console.log('[FCM] Token stored locally, can be registered on next app start');
            console.log('[FCM] ========================================');
            return token; // Return token anyway, it can be registered later
          }
        }
        
        console.log('[FCM] ✅ Auth token available, proceeding with backend registration...');
        console.log('[FCM] Auth token (first 20 chars):', authToken.substring(0, 20) + '...');
        
        // Add additional delay to ensure auth state is fully set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        try {
          console.log('[FCM] Calling backend API to register token...');
          const result = await registerTokenMutation.mutateAsync(token);
          console.log('[FCM] ✅ Token registered successfully with backend');
          console.log('[FCM] Backend response:', JSON.stringify(result, null, 2));
          console.log('[FCM] ========================================');
          return token;
        } catch (error) {
          console.log('[FCM] ❌ Failed to register token with backend');
          console.log('[FCM] Error message:', error.message);
          console.log('[FCM] Error response:', error.response?.data);
          console.log('[FCM] Error status:', error.response?.status);
          console.log('[FCM] Error code:', error.code);
          console.log('[FCM] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          console.log('[FCM] ⚠️ Token is stored locally but not in database');
          console.log('[FCM] Token will be retried on next app start or when manually triggered');
          console.log('[FCM] ========================================');
          // Don't return null here - still return token so it can be retried
          return token;
        }
      } else {
        console.log('[FCM] ❌ No token available to register');
        console.log('[FCM] Possible reasons:');
        console.log('  1. Notification permissions denied');
        console.log('  2. Project ID not configured');
        console.log('  3. Expo notifications module error');
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
