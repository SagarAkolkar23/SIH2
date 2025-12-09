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
      const startTime = Date.now();
      console.log('[FCM TOKEN LOGS] ========================================');
      console.log('[FCM TOKEN LOGS] Starting FCM token registration with backend...');
      console.log('[FCM TOKEN LOGS] Token length:', token?.length || 0);
      console.log('[FCM TOKEN LOGS] Token preview:', token?.substring(0, 30) || 'N/A', '...');
      
      if (!token) {
        console.log('[FCM TOKEN LOGS] ❌ Registration failed: Token is required');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw new Error('FCM token is required');
      }

      try {
        console.log('[FCM TOKEN LOGS] Sending PUT request to /api/profile/fcm-token...');
        
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: token,
        });

        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ✅ Token registration successful');
        console.log('[FCM TOKEN LOGS] Response status:', response?.status || 'N/A');
        console.log('[FCM TOKEN LOGS] Response data:', JSON.stringify(response?.data || {}).substring(0, 200));
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');

        return response.data;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ❌ Token registration failed:');
        console.log('[FCM TOKEN LOGS] Error message:', error.message || 'Unknown error');
        console.log('[FCM TOKEN LOGS] Error response status:', error.response?.status || 'N/A');
        console.log('[FCM TOKEN LOGS] Error response data:', JSON.stringify(error.response?.data || {}).substring(0, 200));
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[FCM TOKEN LOGS] Invalidating user profile query cache...');
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
    console.log('[FCM TOKEN LOGS] ========================================');
    console.log('[FCM TOKEN LOGS] === INITIALIZE AND REGISTER FCM TOKEN ===');
    const startTime = Date.now();
    
    try {
      // First, try to get stored token
      console.log('[FCM TOKEN LOGS] Step 1: Checking for stored token...');
      let token = await getStoredFCMToken();

      // If no stored token, initialize notifications and get new token
      if (!token) {
        console.log('[FCM TOKEN LOGS] Step 2: No stored token found, generating new token...');
        token = await initializeNotifications();
      } else {
        console.log('[FCM TOKEN LOGS] Step 2: Using stored token');
      }

      // If we have a token, register it with backend
      if (token) {
        console.log('[FCM TOKEN LOGS] Step 3: Token available, checking auth state...');
        
        // Check if auth token is available before making API call
        let authToken = useAuthStore.getState().token;
        console.log('[FCM TOKEN LOGS] Initial auth token check:', authToken ? 'Found' : 'Not found');
        
        if (!authToken) {
          console.log('[FCM TOKEN LOGS] Auth token not found, waiting 500ms and checking again...');
          // Wait a bit and check again (auth might still be setting up)
          await new Promise(resolve => setTimeout(resolve, 500));
          authToken = useAuthStore.getState().token;
          console.log('[FCM TOKEN LOGS] Second auth token check:', authToken ? 'Found' : 'Not found');
          
          if (!authToken) {
            const duration = Date.now() - startTime;
            console.log('[FCM TOKEN LOGS] ⚠️ Auth token not available, returning token for later registration');
            console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
            console.log('[FCM TOKEN LOGS] ========================================');
            return token; // Return token anyway, it can be registered later
          }
        }
        
        // Add additional delay to ensure auth state is fully set
        console.log('[FCM TOKEN LOGS] Waiting 200ms to ensure auth state is fully set...');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('[FCM TOKEN LOGS] Step 4: Registering token with backend...');
        try {
          await registerTokenMutation.mutateAsync(token);
          const duration = Date.now() - startTime;
          console.log('[FCM TOKEN LOGS] ✅ Token initialized and registered successfully');
          console.log('[FCM TOKEN LOGS] Total duration:', duration, 'ms');
          console.log('[FCM TOKEN LOGS] ========================================');
          return token;
        } catch (error) {
          const duration = Date.now() - startTime;
          console.log('[FCM TOKEN LOGS] ⚠️ Token registration failed, but token is available for retry');
          console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
          console.log('[FCM TOKEN LOGS] ========================================');
          // Don't return null here - still return token so it can be retried
          return token;
        }
      }

      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ❌ No token available after initialization');
      console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
      return null;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ❌ Exception during initialize and register:');
      console.log('[FCM TOKEN LOGS] Error message:', error.message);
      console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
      console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
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
      console.log('[FCM TOKEN LOGS] ========================================');
      console.log('[FCM TOKEN LOGS] Removing FCM token from backend...');
      const startTime = Date.now();
      
      try {
        console.log('[FCM TOKEN LOGS] Sending PUT request to /api/profile/fcm-token with null token...');
        const response = await api.put('/api/profile/fcm-token', {
          fcmToken: null,
        });
        
        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ✅ Token removal from backend successful');
        console.log('[FCM TOKEN LOGS] Response status:', response?.status || 'N/A');
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');
        
        return response.data;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ❌ Token removal from backend failed:');
        console.log('[FCM TOKEN LOGS] Error message:', error.message || 'Unknown error');
        console.log('[FCM TOKEN LOGS] Error response status:', error.response?.status || 'N/A');
        console.log('[FCM TOKEN LOGS] Error response data:', JSON.stringify(error.response?.data || {}).substring(0, 200));
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw error;
      }
    },
    onSuccess: async () => {
      console.log('[FCM TOKEN LOGS] Removing token from local storage...');
      // Remove token from local storage
      try {
        await removeFCMToken();
        console.log('[FCM TOKEN LOGS] ✅ Token removed from local storage');
      } catch (error) {
        console.log('[FCM TOKEN LOGS] ❌ Error removing token from local storage:', error.message);
      }
      
      console.log('[FCM TOKEN LOGS] Invalidating user profile query cache...');
      // Optionally invalidate user profile query if it exists
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};
