import { useCustomQuery } from '../../api/useQuery';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/useQuery';

/**
 * History Service
 * Fetches aggregated historical telemetry data for a grid
 * Used by controller history page to display historical charts
 */

const HISTORY_KEYS = {
  gridHistory: ['history', 'grid'],
};

/**
 * Hook to fetch grid-level historical data
 * @param {object} options - Configuration options
 * @param {string} options.gridId - Grid ID (optional, uses controller's gridId automatically)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {string} options.granularity - Time granularity: 'hour', 'day', 'week', 'month' (default: 'day')
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with aggregated historical data
 * 
 * @example
 * const { data, isLoading, error } = useGridHistoricalData({
 *   start: '2024-01-01',
 *   end: '2024-01-07',
 *   granularity: 'day'
 * });
 * 
 * // Access chart data
 * const voltageData = data?.data?.aggregatedData?.voltage;
 * const powerData = data?.data?.aggregatedData?.power;
 */
export const useGridHistoricalData = ({
  gridId = null,
  start = null,
  end = null,
  granularity = 'day',
  enabled = true
} = {}) => {
  const user = useAuthStore((state) => state.user);
  
  return useCustomQuery({
    queryKey: [...HISTORY_KEYS.gridHistory, gridId, start, end, granularity],
    queryFn: () => {
      const params = new URLSearchParams();
      if (gridId) params.append('gridId', gridId);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (granularity) params.append('granularity', granularity);
      
      const queryString = params.toString();
      const url = `/api/generation/history-by-grid${queryString ? `?${queryString}` : ''}`;
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && (user?.role === 'CONTROLLER' || user?.role === 'SUPER_ADMIN'),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Hook to fetch Generation history chart data (by deviceId/location)
 * @param {object} options - Configuration options
 * @param {string} options.deviceId - Device ID (optional)
 * @param {string} options.location - Location (optional)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {string} options.granularity - Time granularity: 'hour', 'day', 'week', 'month' (default: 'day')
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with aggregated chart data
 */
export const useGenerationHistoryCharts = ({
  deviceId = null,
  location = null,
  start = null,
  end = null,
  granularity = 'day',
  enabled = true
} = {}) => {
  const user = useAuthStore((state) => state.user);
  
  return useCustomQuery({
    queryKey: ['generation', 'history-charts', deviceId, location, start, end, granularity],
    queryFn: () => {
      const params = new URLSearchParams();
      if (deviceId) params.append('deviceId', deviceId);
      if (location) params.append('location', location);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (granularity) params.append('granularity', granularity);
      
      const queryString = params.toString();
      const url = `/api/generation/history-charts${queryString ? `?${queryString}` : ''}`;
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && (user?.role === 'CONTROLLER' || user?.role === 'SUPER_ADMIN') && (deviceId || location),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Download Generation history data as Excel file (by deviceId/location)
 * @param {object} options - Download options
 * @param {string} options.deviceId - Device ID (optional)
 * @param {string} options.location - Location (optional)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {string} options.granularity - Time granularity: 'hour', 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Blob>} Excel file blob
 */
export const downloadGenerationHistoryCharts = async ({
  deviceId = null,
  location = null,
  start = null,
  end = null,
  granularity = 'day'
} = {}) => {
  const params = new URLSearchParams();
  if (deviceId) params.append('deviceId', deviceId);
  if (location) params.append('location', location);
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (granularity) params.append('granularity', granularity);

  const queryString = params.toString();
  const url = `/api/generation/export-history-charts${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await api({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer', // Use arraybuffer for React Native compatibility
    });

    return response.data;

  } catch (error) {
    throw error;
  }
};

/**
 * Hook to fetch all generation data with panels (for panels table view)
 * @param {object} options - Configuration options
 * @param {string} options.deviceId - Device ID (optional)
 * @param {string} options.location - Location (optional)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with all generation data including panels
 */
export const useAllGenerationData = ({
  deviceId = null,
  location = null,
  start = null,
  end = null,
  enabled = true
} = {}) => {
  const user = useAuthStore((state) => state.user);
  
  return useCustomQuery({
    queryKey: ['generation', 'all', deviceId, location, start, end],
    queryFn: () => {
      const params = new URLSearchParams();
      if (deviceId) params.append('deviceId', deviceId);
      if (location) params.append('location', location);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      
      const queryString = params.toString();
      const url = `/api/generation/all${queryString ? `?${queryString}` : ''}`;
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: !!(enabled && (user?.role === 'CONTROLLER' || user?.role === 'SUPER_ADMIN') && (deviceId || location)),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Download aggregated historical data as Excel file
 * @param {object} options - Download options
 * @param {string} options.gridId - Grid ID (optional, uses controller's gridId automatically)
 * @param {string} options.start - Start date (ISO string, optional)
 * @param {string} options.end - End date (ISO string, optional)
 * @param {string} options.granularity - Time granularity: 'hour', 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Blob>} Excel file blob
 */
export const downloadGridHistoricalData = async ({
  gridId = null,
  start = null,
  end = null,
  granularity = 'day'
} = {}) => {
  const params = new URLSearchParams();
  if (gridId) params.append('gridId', gridId);
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (granularity) params.append('granularity', granularity);

  const queryString = params.toString();
  const url = `/api/generation/export-history-by-grid${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await api({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer', // Use arraybuffer for React Native compatibility
    });

    return response.data;

  } catch (error) {
    throw error;
  }
};
