import { useCustomQuery } from '../../api/useQuery';
import { useAuthStore } from '../../store/authStore';

/**
 * User History Service
 * Fetches historical telemetry data for a user's house
 * Used by user history page to display historical charts
 */

const USER_HISTORY_KEYS = {
  consumption: ['user', 'history', 'consumption'],
  telemetry: ['user', 'history', 'telemetry'],
};

/**
 * Hook to fetch user consumption history
 * GET /api/consumer/:houseId/consumption
 * @param {object} options - Configuration options
 * @param {string} options.houseId - House ID (optional, uses user's houseId automatically)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {string} options.granularity - Time granularity: 'hour', 'day', 'month' (default: 'hour')
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with consumption history data
 */
export const useUserConsumptionHistory = ({
  houseId = null,
  start = null,
  end = null,
  granularity = 'hour',
  enabled = true
} = {}) => {
  const user = useAuthStore((state) => state.user);
  
  // Use provided houseId or get from user
  const targetHouseId = houseId || user?.houseId;
  
  return useCustomQuery({
    queryKey: [...USER_HISTORY_KEYS.consumption, targetHouseId, start, end, granularity],
    queryFn: () => {
      if (!targetHouseId) {
        throw new Error('House ID is required');
      }
      
      const params = new URLSearchParams();
      if (start) params.append('from', start);
      if (end) params.append('to', end);
      if (granularity) params.append('granularity', granularity);
      
      const queryString = params.toString();
      const url = `/api/consumer/${targetHouseId}/consumption${queryString ? `?${queryString}` : ''}`;
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && !!targetHouseId && !!user,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Hook to fetch user telemetry history (voltage, current, battery, etc.)
 * GET /api/telemetry/:houseId?from=xxx&to=xxx
 * @param {object} options - Configuration options
 * @param {string} options.houseId - House ID (optional, uses user's houseId automatically)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {number} options.limit - Number of records to fetch (default: 100)
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with telemetry history data
 */
export const useUserTelemetryHistory = ({
  houseId = null,
  start = null,
  end = null,
  limit = 100,
  enabled = true
} = {}) => {
  const user = useAuthStore((state) => state.user);
  
  // Use provided houseId or get from user
  const targetHouseId = houseId || user?.houseId;
  
  return useCustomQuery({
    queryKey: [...USER_HISTORY_KEYS.telemetry, targetHouseId, start, end, limit],
    queryFn: () => {
      if (!targetHouseId) {
        throw new Error('House ID is required');
      }
      
      const params = new URLSearchParams();
      if (start) params.append('from', start);
      if (end) params.append('to', end);
      if (limit) params.append('limit', limit.toString());
      
      const queryString = params.toString();
      const url = `/api/telemetry/${targetHouseId}${queryString ? `?${queryString}` : ''}`;
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && !!targetHouseId && !!user,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

