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
      
      // Backend returns 'accessToken', not 'token'
      const token = data?.accessToken || data?.token;
      
      if (token && data?.user) {
        console.log('✅ [FRONTEND AUTH SERVICE] Token found:', token.substring(0, 20) + '...');
        console.log('👤 [FRONTEND AUTH SERVICE] User data:', {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        });
        
        console.log('💾 [FRONTEND AUTH SERVICE] Saving auth data to store...');
        setAuthData({
          token: token,
          user: data.user,
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

  return useCustomMutation({
    mutationFn: () => {
      console.log('🚪 [FRONTEND AUTH SERVICE] Logout mutation initiated');
      return {
        method: "POST",
        url: "/api/auth/logout", // Fixed: Added leading slash
      };
    },
    onSuccess: () => {
      console.log('✅ [FRONTEND AUTH SERVICE] Logout successful, clearing auth');
      clearAuth();
    },
  });
};
