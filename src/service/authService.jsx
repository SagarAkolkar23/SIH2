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
        url: "/api/auth/login",
        data: { email, password },
      };
    },
    onSuccess: async (data) => {
      // Backend returns: { success: true, data: { user, token } }
      const token = data?.data?.token;
      const user = data?.data?.user;
      
      if (token && user) {
        console.log('[LOGIN] Setting auth data...');
        
        // Set auth data FIRST
        await setAuthData({
          token: token,
          user: user,
        });

        // Wait for AsyncStorage to complete and state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify auth state is set multiple times
        let retries = 0;
        const maxRetries = 5;
        
        while (retries < maxRetries) {
          const verifyToken = useAuthStore.getState().token;
          const verifyUser = useAuthStore.getState().user;

          if (verifyToken && verifyUser) {
            console.log('[LOGIN] ✅ Auth state verified successfully');
            break;
          }

          console.log(`[LOGIN] ⚠️ Auth state not set, retry ${retries + 1}/${maxRetries}`);
          
          // Retry setting auth data
          await setAuthData({
            token: token,
            user: user,
          });
          
          await new Promise(resolve => setTimeout(resolve, 300));
          retries++;
        }

        if (retries === maxRetries) {
          console.log('[LOGIN] ❌ Failed to verify auth state after maximum retries');
        }
        
        // NOW register FCM token with guaranteed auth state
        console.log('[FCM TOKEN LOGS] ========================================');
        console.log('[FCM TOKEN LOGS] Login successful, starting FCM registration...');
        console.log('[FCM TOKEN LOGS] User:', user?.email || 'N/A');
        console.log('[FCM TOKEN LOGS] User Role:', user?.role || 'N/A');
        
        try {
          const fcmToken = await initializeAndRegister();
          
          if (fcmToken) {
            console.log('[FCM TOKEN LOGS] ✅ FCM token registered successfully after login');
            console.log('[FCM TOKEN LOGS] Token preview:', fcmToken.substring(0, 30) + '...');
          } else {
            console.log('[FCM TOKEN LOGS] ⚠️ FCM token registration returned null');
          }
        } catch (error) {
          console.log('[FCM TOKEN LOGS] ❌ Error during FCM token registration after login');
          console.log('[FCM TOKEN LOGS] Error:', error.message);
          console.log('[FCM TOKEN LOGS] Stack:', error.stack);
        }
        
        console.log('[FCM TOKEN LOGS] ========================================');
      } else {
        console.log('[LOGIN] ❌ Missing token or user in response');
      }
    },
  });
};

export const useLogoutApi = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeTokenMutation = useRemoveFCMToken();

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
    }

    // Step 2: Clear auth data
    console.log('[FCM TOKEN LOGS] Step 2: Clearing auth data...');
    try {
      await clearAuth();
      console.log('[FCM TOKEN LOGS] ✅ Auth data cleared successfully');
    } catch (error) {
      console.log('[FCM TOKEN LOGS] ⚠️ Error clearing auth data, attempting manual clear...');
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