import { useCustomMutation } from "../api/useQuery";
import { useAuthStore } from "../store/authStore";

export const useLoginApi = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useCustomMutation({
    mutationFn: ({ email, password }) => {
      console.log('🚀 [FRONTEND AUTH SERVICE] Login mutation initiated');
      console.log('📧 [FRONTEND AUTH SERVICE] Email:', email ? email.substring(0, 3) + '***' : 'missing');
      
      return {
        method: "POST",
        url: "/api/auth/login", // Fixed: Added leading slash
        data: { email, password },
      };
    },
    onSuccess: (data) => {
      console.log('✅ [FRONTEND AUTH SERVICE] Login API response received');
      console.log('📦 [FRONTEND AUTH SERVICE] Response data keys:', Object.keys(data || {}));
      
      // Backend returns: { success: true, data: { user, token } }
      const token = data?.data?.token;
      const user = data?.data?.user;
      
      if (token && user) {
        console.log('✅ [FRONTEND AUTH SERVICE] Token found:', token.substring(0, 20) + '...');
        console.log('👤 [FRONTEND AUTH SERVICE] User data:', {
          id: user._id,
          email: user.email,
          role: user.role,
        });
        
        console.log('💾 [FRONTEND AUTH SERVICE] Saving auth data to store...');
        setAuthData({
          token: token,
          user: user,
        });
        
        console.log('✅ [FRONTEND AUTH SERVICE] Auth data saved to store successfully');
      } else {
        console.error('❌ [FRONTEND AUTH SERVICE] Login response missing token or user');
        console.error('📦 [FRONTEND AUTH SERVICE] Response:', data);
      }
    },
  });
};

export const useLogoutApi = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Logout is handled client-side (backend has no logout endpoint)
  // JWT tokens are stateless, so we just clear local storage
  return {
    mutate: () => {
      console.log('🚪 [FRONTEND AUTH SERVICE] Logout initiated');
      clearAuth();
      console.log('✅ [FRONTEND AUTH SERVICE] Logout successful, auth cleared');
    },
    mutateAsync: async () => {
      console.log('🚪 [FRONTEND AUTH SERVICE] Logout initiated');
      clearAuth();
      console.log('✅ [FRONTEND AUTH SERVICE] Logout successful, auth cleared');
      return Promise.resolve();
    },
  };
};
