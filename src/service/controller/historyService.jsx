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
      console.log('[HISTORY SERVICE] ========================================');
      console.log('[HISTORY SERVICE] Fetching grid historical data...');
      console.log('[HISTORY SERVICE] User Role:', user?.role);
      console.log('[HISTORY SERVICE] User Email:', user?.email);
      console.log('[HISTORY SERVICE] Parameters:');
      console.log('  - gridId:', gridId || 'auto (controller gridId)');
      console.log('  - start:', start || 'not provided');
      console.log('  - end:', end || 'not provided');
      console.log('  - granularity:', granularity);
      
      const params = new URLSearchParams();
      if (gridId) params.append('gridId', gridId);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (granularity) params.append('granularity', granularity);
      
      const queryString = params.toString();
      const url = `/api/generation/history-by-grid${queryString ? `?${queryString}` : ''}`;
      console.log('[HISTORY SERVICE] Endpoint:', url);
      console.log('[HISTORY SERVICE] ========================================');
      
      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && (user?.role === 'CONTROLLER' || user?.role === 'SUPER_ADMIN'),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    onSuccess: (data) => {
      console.log('[HISTORY SERVICE] ✅ Historical data received');
      console.log('[HISTORY SERVICE] Response structure:', {
        hasSuccess: !!data?.success,
        hasData: !!data?.data,
        hasAggregatedData: !!data?.data?.aggregatedData,
        gridId: data?.data?.gridId,
        housesCount: data?.data?.houses,
        dataPointsCount: data?.data?.count,
        period: data?.data?.period
      });
      if (data?.data?.aggregatedData) {
        console.log('[HISTORY SERVICE] Chart data summary:');
        console.log('  - Voltage data points:', data.data.aggregatedData.voltage?.data?.length || 0);
        console.log('  - Current data points:', data.data.aggregatedData.current?.data?.length || 0);
        console.log('  - Power data points:', data.data.aggregatedData.power?.data?.length || 0);
        console.log('  - Battery data points:', data.data.aggregatedData.battery?.data?.length || 0);
        console.log('  - Solar Input data points:', data.data.aggregatedData.solarInput?.data?.length || 0);
      }
      console.log('[HISTORY SERVICE] ========================================');
    },
    onError: (error) => {
      console.log('[HISTORY SERVICE] ❌ Error fetching historical data');
      console.log('[HISTORY SERVICE] Error message:', error.message);
      console.log('[HISTORY SERVICE] Error response:', error.response?.data);
      console.log('[HISTORY SERVICE] Error status:', error.response?.status);
      console.log('[HISTORY SERVICE] ========================================');
    },
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
  console.log('[HISTORY DOWNLOAD SERVICE] ========================================');
  console.log('[HISTORY DOWNLOAD SERVICE] Starting download...');
  console.log('[HISTORY DOWNLOAD SERVICE] Parameters:');
  console.log('  - gridId:', gridId || 'auto (controller gridId)');
  console.log('  - start:', start || 'not provided');
  console.log('  - end:', end || 'not provided');
  console.log('  - granularity:', granularity);

  const params = new URLSearchParams();
  if (gridId) params.append('gridId', gridId);
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (granularity) params.append('granularity', granularity);

  const queryString = params.toString();
  const url = `/api/generation/export-history-by-grid${queryString ? `?${queryString}` : ''}`;
  console.log('[HISTORY DOWNLOAD SERVICE] Endpoint:', url);

  try {
    const response = await api({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer', // Use arraybuffer for React Native compatibility
    });

    console.log('[HISTORY DOWNLOAD SERVICE] ✅ File downloaded successfully');
    console.log('[HISTORY DOWNLOAD SERVICE] File size:', response.data.byteLength || response.data.length, 'bytes');
    console.log('[HISTORY DOWNLOAD SERVICE] Content type:', response.headers['content-type']);
    console.log('[HISTORY DOWNLOAD SERVICE] ========================================');

    return response.data;
  } catch (error) {
    console.log('[HISTORY DOWNLOAD SERVICE] ❌ Error downloading file');
    console.log('[HISTORY DOWNLOAD SERVICE] Error message:', error.message);
    console.log('[HISTORY DOWNLOAD SERVICE] Error response:', error.response?.data);
    console.log('[HISTORY DOWNLOAD SERVICE] Error status:', error.response?.status);
    console.log('[HISTORY DOWNLOAD SERVICE] ========================================');
    throw error;
  }
};
