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
      
      if (token && user) {
        await setAuthData({
          token: token,
          user: user,
        });

        // Verify auth state is set
        const verifyToken = useAuthStore.getState().token;
        const verifyUser = useAuthStore.getState().user;

        if (!verifyToken || !verifyUser) {
          // Retry setting auth data
          await setAuthData({
            token: token,
            user: user,
          });
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Register FCM token after successful login
        // This is non-blocking and will fail silently if permissions are denied
        console.log('[FCM TOKEN LOGS] ========================================');
        console.log('[FCM TOKEN LOGS] Login successful, initializing FCM token registration...');
        console.log('[FCM TOKEN LOGS] User:', user?.email || 'N/A');
        console.log('[FCM TOKEN LOGS] User Role:', user?.role || 'N/A');
        try {
          await initializeAndRegister();
          console.log('[FCM TOKEN LOGS] ✅ FCM token registration completed after login');
        } catch (error) {
          console.log('[FCM TOKEN LOGS] ❌ Error during FCM token registration after login:', error.message);
          console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
        }
        console.log('[FCM TOKEN LOGS] ========================================');
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
    console.log('[FCM TOKEN LOGS] ========================================');
    console.log('[FCM TOKEN LOGS] Logout initiated, removing FCM token...');
    
    // Step 1: Remove FCM token from backend
    try {
      console.log('[FCM TOKEN LOGS] Step 1: Removing FCM token from backend...');
      await removeTokenMutation.mutateAsync();
      console.log('[FCM TOKEN LOGS] ✅ FCM token removed from backend');
    } catch (error) {
      console.log('[FCM TOKEN LOGS] ⚠️ Failed to remove FCM token from backend:', error.message);
      console.log('[FCM TOKEN LOGS] Continuing with logout...');
      // Continue with logout even if token removal fails
    }

    // Step 2: Clear auth data (removes token and user from AsyncStorage and state)
    console.log('[FCM TOKEN LOGS] Step 2: Clearing auth data...');
    try {
      await clearAuth();
      console.log('[FCM TOKEN LOGS] ✅ Auth data cleared successfully');
    } catch (error) {
      console.log('[FCM TOKEN LOGS] ⚠️ Error clearing auth data, attempting manual clear...');
      // Still try to clear manually
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem("token");
        await AsyncStorage.default.removeItem("user");
        await AsyncStorage.default.removeItem("@fcm_token");
        useAuthStore.setState({ token: null, user: null });
        console.log('[FCM TOKEN LOGS] ✅ Auth data cleared manually');
      } catch (manualError) {
        console.log('[FCM TOKEN LOGS] ❌ Failed to clear auth data manually:', manualError.message);
      }
    }
    console.log('[FCM TOKEN LOGS] Logout completed');
    console.log('[FCM TOKEN LOGS] ========================================');
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
