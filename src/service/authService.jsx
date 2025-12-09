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
  const performLogout = async () => {
    const user = useAuthStore.getState().user;
    
    console.log('[LOGOUT] ========================================');
    console.log('[LOGOUT] Starting logout process...');
    console.log('[LOGOUT] User:', user?.email);
    console.log('[LOGOUT] User Role:', user?.role);
    console.log('[LOGOUT] User ID:', user?._id);

    // Step 1: Remove FCM token from backend
    console.log('[LOGOUT] Step 1: Removing FCM token from backend...');
    try {
      await removeTokenMutation.mutateAsync();
      console.log('[LOGOUT] ✅ FCM token removed from backend');
    } catch (error) {
      console.log('[LOGOUT] ⚠️ Failed to remove FCM token from backend (non-blocking)');
      console.log('[LOGOUT] Error:', error.message);
      // Continue with logout even if token removal fails
    }

    // Step 2: Clear auth data (removes token and user from AsyncStorage and state)
    console.log('[LOGOUT] Step 2: Clearing auth data...');
    try {
      await clearAuth();
      console.log('[LOGOUT] ✅ Auth data cleared from AsyncStorage and state');
    } catch (error) {
      console.log('[LOGOUT] ❌ Error clearing auth data:', error.message);
      // Still try to clear manually
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem("token");
        await AsyncStorage.default.removeItem("user");
        await AsyncStorage.default.removeItem("@fcm_token");
        useAuthStore.setState({ token: null, user: null });
        console.log('[LOGOUT] ✅ Auth data cleared manually');
      } catch (manualError) {
        console.log('[LOGOUT] ❌ Failed to clear auth data manually:', manualError.message);
      }
    }

    console.log('[LOGOUT] ✅ Logout process completed');
    console.log('[LOGOUT] ========================================');
  };

  return {
    mutate: async () => {
      await performLogout();
    },
    mutateAsync: async () => {
      await performLogout();
      return Promise.resolve();
    },
  };
};
