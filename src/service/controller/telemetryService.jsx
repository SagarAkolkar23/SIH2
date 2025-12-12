import React from 'react';
import { useCustomQuery } from '../../api/useQuery';

/**
 * Telemetry Service
 * Fetches live generation/telemetry data from ESP32 devices
 * Polls every 3.9 seconds for real-time updates
 */

const TELEMETRY_KEYS = {
  live: ['telemetry', 'live'],
  history: ['telemetry', 'history'],
};

/**
 * Hook to fetch live telemetry data with automatic polling every 3.9 seconds
 * This hook automatically polls the backend every 3.9 seconds to get the latest telemetry data
 * 
 * @param {object} options - Configuration options
 * @param {string} options.deviceId - Device ID (optional, can use location instead)
 * @param {string} options.location - Location identifier (optional, can use deviceId instead)
 * @param {boolean} options.enabled - Whether to enable polling (default: true)
 * @param {number} options.refetchInterval - Polling interval in milliseconds (default: 3900ms = 3.9 seconds)
 * @returns {object} Query result with telemetry data
 * 
 * @example
 * // Using deviceId - polls every 3.9 seconds
 * const { data, isLoading, error } = useLiveTelemetry({ deviceId: 'ESP32_001' });
 * 
 * // Access telemetry data
 * const telemetry = data?.data?.generation;
 * const voltage = telemetry?.incomingVoltage;
 * const generation = telemetry?.generation;
 * const battery = telemetry?.batteryPercentage;
 * 
 * @example
 * // Using location
 * const { data, isLoading, error } = useLiveTelemetry({ location: 'Grid_A' });
 * 
 * @example
 * // Disable polling temporarily
 * const { data } = useLiveTelemetry({ deviceId: 'ESP32_001', enabled: false });
 * 
 * @example
 * // Custom polling interval (default is 3.9 seconds)
 * const { data } = useLiveTelemetry({ 
 *   deviceId: 'ESP32_001', 
 *   refetchInterval: 5000 // Poll every 5 seconds instead
 * });
 */
export const useLiveTelemetry = ({ 
  deviceId, 
  location, 
  enabled = true,
  refetchInterval = 1000 // 3.9 seconds (3900ms)
} = {}) => {
  return useCustomQuery({
    queryKey: [...TELEMETRY_KEYS.live, deviceId, location],
    queryFn: () => {
      // Validate and normalize deviceId (handle both string and object)
      let normalizedDeviceId = deviceId;
      if (deviceId) {
        if (typeof deviceId === 'object' && deviceId._id) {
          normalizedDeviceId = String(deviceId._id);
        } else {
          normalizedDeviceId = String(deviceId);
        }
      }

      // Validate deviceId is a valid string (not "[object Object]")
      if (normalizedDeviceId && normalizedDeviceId.includes('[object')) {
        throw new Error('Invalid deviceId format. Expected string or object with _id property.');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (normalizedDeviceId) params.append('deviceId', normalizedDeviceId);
      if (location) params.append('location', String(location));

      const queryString = params.toString();
      if (!queryString) {
        throw new Error('Either deviceId or location must be provided');
      }

      const url = `/api/generation/live?${queryString}`;

      const requestConfig = {
        method: 'GET',
        url: url,
      };

      // The actual request is handled by useCustomQuery
      return requestConfig;
    },
    enabled: enabled && (!!deviceId || !!location), // Only enable if deviceId or location provided
    refetchInterval: enabled ? refetchInterval : false, // Poll every 3.9 seconds if enabled
    refetchIntervalInBackground: false, // Don't poll in background to save battery and prevent freezing
    staleTime: 0, // Always consider data stale to ensure fresh data on every poll
    gcTime: 10000, // Keep data in cache for 10 seconds
    retry: (failureCount, error) => {
      // Don't retry on network errors to prevent app freezing
      if (error?.isNetworkError) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000, // Wait 1 second between retries
  });
};

/**
 * Hook to fetch telemetry history
 * @param {object} options - Query options
 * @param {string} options.deviceId - Device ID (optional)
 * @param {string} options.location - Location identifier (optional)
 * @param {string} options.start - Start date (ISO string)
 * @param {string} options.end - End date (ISO string)
 * @param {number} options.limit - Number of records to fetch (default: 100)
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with history data
 */
export const useTelemetryHistory = ({
  deviceId,
  location,
  start,
  end,
  limit = 100,
  enabled = true,
} = {}) => {
  return useCustomQuery({
    queryKey: [...TELEMETRY_KEYS.history, deviceId, location, start, end, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (deviceId) params.append('deviceId', deviceId);
      if (location) params.append('location', location);
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (limit) params.append('limit', limit.toString());

      const queryString = params.toString();
      const url = `/api/generation/history${queryString ? `?${queryString}` : ''}`;

      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: enabled && (!!deviceId || !!location),
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });
};

/**
 * Hook to get the latest telemetry reading (single fetch, no polling)
 * Useful for one-time data fetches
 * @param {string} deviceId - Device ID
 * @param {string} location - Location identifier
 * @returns {object} Query result
 */
export const useLatestTelemetry = ({ deviceId, location } = {}) => {
  return useCustomQuery({
    queryKey: [...TELEMETRY_KEYS.live, 'latest', deviceId, location],
    queryFn: () => {
      const params = new URLSearchParams();
      if (deviceId) params.append('deviceId', deviceId);
      if (location) params.append('location', location);

      const queryString = params.toString();
      const url = `/api/generation/live${queryString ? `?${queryString}` : ''}`;

      return {
        method: 'GET',
        url: url,
      };
    },
    enabled: !!deviceId || !!location,
    refetchInterval: false, // No polling for this hook
  });
};
