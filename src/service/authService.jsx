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
            break;
          }
          
          // Retry setting auth data
          await setAuthData({
            token: token,
            user: user,
          });
          
          await new Promise(resolve => setTimeout(resolve, 300));
          retries++;
        }
        
        // NOW register FCM token with guaranteed auth state
        try {
          await initializeAndRegister();
        } catch (error) {
          // Error during FCM token registration after login
        }
      }
    },
  });
};

export const useLogoutApi = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeTokenMutation = useRemoveFCMToken();

  const performLogout = async () => {
    // Step 1: Remove FCM token from backend
    try {
      await removeTokenMutation.mutateAsync();
    } catch (error) {
      // Failed to remove FCM token from backend, continuing with logout
    }

    // Step 2: Clear auth data
    try {
      await clearAuth();
    } catch (error) {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem("token");
        await AsyncStorage.default.removeItem("user");
        await AsyncStorage.default.removeItem("@fcm_token");
        useAuthStore.setState({ token: null, user: null });
      } catch (manualError) {
        // Failed to clear auth data manually
      }
    }
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