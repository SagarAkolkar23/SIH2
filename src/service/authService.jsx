import { useCustomMutation } from "../api/useQuery";
import { useAuthStore } from "../store/authStore";
import { useInitializeAndRegisterFCM, useRemoveFCMToken } from "./userNotificationService";

export const useLoginApi = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const { initializeAndRegister } = useInitializeAndRegisterFCM();

  return useCustomMutation({
    mutationFn: ({ email, password }) => {
      return {
        method: "POST",
        url: "/api/auth/login", // Fixed: Added leading slash
        data: { email, password },
      };
    },
    onSuccess: async (data) => {
      // Backend returns: { success: true, data: { user, token } }
      const token = data?.data?.token;
      const user = data?.data?.user;
      
      console.log('[LOGIN] Login successful for user:', user?.email);
      console.log('[LOGIN] User ID:', user?._id);
      console.log('[LOGIN] User role:', user?.role);
      
      if (token && user) {
        setAuthData({
          token: token,
          user: user,
        });

        console.log('[LOGIN] Auth data stored, starting FCM token registration...');
        
        // Register FCM token after successful login
        // This is non-blocking and will fail silently if permissions are denied
        try {
          const fcmToken = await initializeAndRegister();
          if (fcmToken) {
            console.log('[LOGIN] ✅ FCM token registration initiated successfully');
            console.log('[LOGIN] FCM Token (first 30 chars):', fcmToken.substring(0, 30) + '...');
          } else {
            console.log('[LOGIN] ⚠️ FCM token registration failed or permissions denied');
          }
        } catch (error) {
          console.log('[LOGIN] ❌ Error during FCM token registration:', error.message);
        }
      } else {
        console.log('[LOGIN] ❌ Missing token or user data');
      }
    },
  });
};

export const useLogoutApi = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeTokenMutation = useRemoveFCMToken();

  // Logout is handled client-side (backend has no logout endpoint)
  // JWT tokens are stateless, so we just clear local storage
  // But we should remove FCM token from backend before clearing auth
  return {
    mutate: async () => {
      // Remove FCM token from backend before clearing auth
      // This is non-blocking - if it fails, we still proceed with logout
      try {
        await removeTokenMutation.mutateAsync();
      } catch (error) {
        // Silent fail - proceed with logout even if token removal fails
      }
      
      // Clear auth data (removes token and user from AsyncStorage and state)
      clearAuth();
    },
    mutateAsync: async () => {
      // Remove FCM token from backend before clearing auth
      try {
        await removeTokenMutation.mutateAsync();
      } catch (error) {
        // Silent fail - proceed with logout even if token removal fails
      }
      
      // Clear auth data
      clearAuth();
      return Promise.resolve();
    },
  };
};
