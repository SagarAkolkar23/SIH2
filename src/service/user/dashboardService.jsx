import { useCustomQuery } from "../../api/useQuery";
import { useAuthStore } from "../../store/authStore";

// Query Keys
const DASHBOARD_KEYS = {
  dashboard: ["user", "dashboard"],
};

/**
 * Get user dashboard data
 * GET /api/consumer/:houseId/dashboard
 * @param {string} houseId - House ID (optional, will use user's houseId if not provided)
 */
export const useUserDashboardQuery = (houseId = null) => {
  const user = useAuthStore((state) => state.user);
  
  // Use provided houseId or get from user
  const targetHouseId = houseId || user?.houseId;
  
  return useCustomQuery({
    queryKey: [...DASHBOARD_KEYS.dashboard, targetHouseId],
    queryFn: () => {
      if (!targetHouseId) {
        console.log('[USER DASHBOARD] ❌ House ID is required');
        throw new Error("House ID is required");
      }
      
      console.log('[USER DASHBOARD] Fetching dashboard data...');
      console.log('[USER DASHBOARD] House ID:', targetHouseId);
      console.log('[USER DASHBOARD] User:', user?.email);
      console.log('[USER DASHBOARD] User Role:', user?.role);
      
      return {
        method: "GET",
        url: `/api/consumer/${targetHouseId}/dashboard`,
      };
    },
    enabled: !!targetHouseId && !!user,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchInterval: 1000, // Refetch every 3 seconds
    retry: 2,
    retryDelay: 1000,
    onSuccess: (data) => {
      console.log('[USER DASHBOARD] ✅ Dashboard data received');
      console.log('[USER DASHBOARD] Response structure:', {
        hasSuccess: !!data?.success,
        hasData: !!data?.data,
        dataKeys: data?.data ? Object.keys(data.data) : []
      });
    },
    onError: (error) => {
      console.log('[USER DASHBOARD] ❌ Error fetching dashboard data');
      console.log('[USER DASHBOARD] Error message:', error.message);
      console.log('[USER DASHBOARD] Error response:', error.response?.data);
      console.log('[USER DASHBOARD] Error status:', error.response?.status);
    },
  });
};
