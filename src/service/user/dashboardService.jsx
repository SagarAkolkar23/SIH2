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
        throw new Error("House ID is required");
      }
      
      return {
        method: "GET",
        url: `/api/consumer/${targetHouseId}/dashboard`,
      };
    },
    enabled: !!targetHouseId && !!user,
    staleTime: 2000, // Consider data fresh for 2 seconds
    refetchInterval: 3000, // Refetch every 3 seconds (was incorrectly set to 1000ms)
    refetchIntervalInBackground: false, // Don't poll in background to save battery
    retry: (failureCount, error) => {
      // Don't retry on network errors to prevent app freezing
      if (error?.isNetworkError) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};
