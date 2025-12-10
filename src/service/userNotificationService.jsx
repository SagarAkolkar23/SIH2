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

      // Check if auth token exists
      const authToken = useAuthStore.getState().token;
      console.log('[FCM TOKEN LOGS] Auth token check:', authToken ? 'Present' : 'Missing');
      
      if (!authToken) {
        console.log('[FCM TOKEN LOGS] ❌ Registration failed: No auth token available');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw new Error('Authentication required - no auth token');
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
      // Step 1: Check auth state FIRST
      console.log('[FCM TOKEN LOGS] Step 1: Verifying auth state...');
      let authToken = useAuthStore.getState().token;
      const authUser = useAuthStore.getState().user;
      
      console.log('[FCM TOKEN LOGS] Auth check results:');
      console.log('[FCM TOKEN LOGS]   - Token:', authToken ? 'Present' : 'Missing');
      console.log('[FCM TOKEN LOGS]   - User:', authUser?.email || 'Missing');
      
      if (!authToken) {
        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ❌ Auth token not available');
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw new Error('Authentication required - please log in first');
      }

      // Step 2: Try to get stored token first (avoid regenerating unnecessarily)
      console.log('[FCM TOKEN LOGS] Step 2: Checking for stored FCM token...');
      let token = await getStoredFCMToken();

      // Step 3: If no stored token, initialize and generate new token
      if (!token) {
        console.log('[FCM TOKEN LOGS] Step 3: No stored token, generating new FCM token...');
        token = await initializeNotifications();
        
        if (!token) {
          const duration = Date.now() - startTime;
          console.log('[FCM TOKEN LOGS] ❌ Failed to generate FCM token');
          console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
          console.log('[FCM TOKEN LOGS] ========================================');
          throw new Error('Failed to generate FCM token');
        }
        
        console.log('[FCM TOKEN LOGS] ✅ New FCM token generated');
        console.log('[FCM TOKEN LOGS] Token length:', token.length);
        console.log('[FCM TOKEN LOGS] Token preview:', token.substring(0, 30) + '...');
      } else {
        console.log('[FCM TOKEN LOGS] Step 3: Using stored FCM token');
        console.log('[FCM TOKEN LOGS] Token length:', token.length);
        console.log('[FCM TOKEN LOGS] Token preview:', token.substring(0, 30) + '...');
      }

      // Step 4: Verify auth token again before API call
      authToken = useAuthStore.getState().token;
      if (!authToken) {
        const duration = Date.now() - startTime;
        console.log('[FCM TOKEN LOGS] ❌ Auth token lost before registration');
        console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
        console.log('[FCM TOKEN LOGS] ========================================');
        throw new Error('Auth token not available for registration');
      }
      
      console.log('[FCM TOKEN LOGS] Step 4: Registering token with backend...');
      console.log('[FCM TOKEN LOGS] Auth token verified before registration');
      
      // Register token with backend
      await registerTokenMutation.mutateAsync(token);
      
      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ✅ Token initialized and registered successfully');
      console.log('[FCM TOKEN LOGS] Total duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
      
      return token;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ❌ Exception during initialize and register:');
      console.log('[FCM TOKEN LOGS] Error type:', error.constructor.name);
      console.log('[FCM TOKEN LOGS] Error message:', error.message);
      console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
      console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
      
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
      try {
        await removeFCMToken();
        console.log('[FCM TOKEN LOGS] ✅ Token removed from local storage');
      } catch (error) {
        console.log('[FCM TOKEN LOGS] ❌ Error removing token from local storage:', error.message);
      }
      
      console.log('[FCM TOKEN LOGS] Invalidating user profile query cache...');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};