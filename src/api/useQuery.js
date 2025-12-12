import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---- BASE URL ----
let API_BASE_URL =
  Constants.expoConfig?.extra?.API_URL || "http://10.71.102.99:5000";

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ---- AXIOS INSTANCE ----
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Increased to 30 seconds to handle slow network connections
  validateStatus: function (status) {
    // Don't throw errors for 4xx and 5xx, let components handle them
    return status < 600;
  },
});

// ---- REQUEST INTERCEPTOR ----
api.interceptors.request.use(async (config) => {
  const storeToken = useAuthStore.getState().token;
  const storageToken = await AsyncStorage.getItem("token");

  const finalToken = storeToken || storageToken;

  if (finalToken) {
    config.headers.Authorization = `Bearer ${finalToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ---- RESPONSE INTERCEPTOR ----
api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    // Handle ERR_NETWORK (generic Axios network error - no response received)
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      const networkError = new Error('Network Error: Cannot connect to server. Please ensure the backend server is running at ' + API_BASE_URL + ' and your device is on the same network.');
      networkError.isNetworkError = true;
      networkError.code = err.code || 'ERR_NETWORK';
      networkError.originalError = err;
      return Promise.reject(networkError);
    }
    
    // Handle network errors gracefully (connection timeout, network unavailable, etc.)
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
      // Network timeout - don't crash the app, just reject with a user-friendly error
      const networkError = new Error('Network request timed out. Please check your connection and ensure the backend server is running.');
      networkError.isNetworkError = true;
      networkError.code = err.code || 'TIMEOUT';
      return Promise.reject(networkError);
    }
    
    // Handle connection errors (server not reachable)
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ENETUNREACH') {
      const connectionError = new Error('Cannot connect to server. Please ensure the backend server is running at ' + API_BASE_URL);
      connectionError.isNetworkError = true;
      connectionError.code = err.code || 'CONNECTION_ERROR';
      return Promise.reject(connectionError);
    }
    
    // Handle SocketTimeoutException (Android specific)
    if (err.message?.includes('SocketTimeoutException') || err.message?.includes('failed to connect')) {
      const socketError = new Error('Connection failed. Please check that your device and server are on the same network and the backend is running.');
      socketError.isNetworkError = true;
      socketError.code = 'SOCKET_TIMEOUT';
      return Promise.reject(socketError);
    }
    
    // Handle errors without response (network issues)
    if (!err.response) {
      const noResponseError = new Error('Network request failed. Please check your connection and ensure the backend server is running at ' + API_BASE_URL);
      noResponseError.isNetworkError = true;
      noResponseError.code = err.code || 'NO_RESPONSE';
      noResponseError.originalError = err;
      return Promise.reject(noResponseError);
    }
    
    if (err.response?.status === 401) {
      // On 401 (unauthorized), remove FCM token and clear auth
      // Try to remove FCM token from backend (non-blocking)
      try {
        await api.put('/api/profile/fcm-token', { fcmToken: null });
      } catch (error) {
        // Silent fail - proceed with logout even if token removal fails
      }
      
      // Clear auth data
      useAuthStore.getState().clearAuth();
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      
      // Remove FCM token from local storage
      await AsyncStorage.removeItem("@fcm_token");
    }
    return Promise.reject(err);
  }
);

// ---- QUERY HELPER ----
export const useCustomQuery = (options) => {
  return useQuery({
    ...options,
    // Don't retry on network errors - fail fast to prevent app freezing
    retry: (failureCount, error) => {
      // Don't retry if it's a network error (connection timeout, etc.)
      if (error?.isNetworkError) {
        return false;
      }
      // Use provided retry count or default to 2
      return failureCount < (options.retry || 2);
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff, but cap at 5 seconds
      return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
    },
    queryFn: async () => {
      // Call the original queryFn and await it (in case it's async)
      let requestConfig;
      try {
        requestConfig = await options.queryFn();
      } catch (error) {
        throw error;
      }
      
      // Validate requestConfig is an object
      if (!requestConfig || typeof requestConfig !== 'object') {
        throw new Error('Request config must be an object');
      }
      
      // Extract URL from requestConfig
      const url = requestConfig.url;
      
      // Validate URL exists
      if (!url) {
        throw new Error('Request URL is missing');
      }
      
      // Ensure URL is a string
      if (typeof url !== 'string') {
        throw new Error(`Request URL must be a string, got ${typeof url}`);
      }
      
      // Ensure URL starts with /
      const urlPath = url.startsWith('/') ? url : `/${url}`;

      const requestUrl = `${api.defaults.baseURL}${urlPath}`;
      
      // Validate final URL
      if (requestUrl.includes('undefined') || requestUrl.includes('null')) {
        throw new Error(`Malformed request URL: ${requestUrl}`);
      }
      
      // Create validated config with proper URL
      const validatedConfig = {
        method: requestConfig.method || 'GET',
        url: urlPath,
        ...(requestConfig.params && { params: requestConfig.params }),
        ...(requestConfig.data && { data: requestConfig.data }),
        ...(requestConfig.headers && { headers: requestConfig.headers })
      };

      try {
        const res = await api(validatedConfig);
        return res.data;
      } catch (error) {
        const errorDetails = {
          url: validatedConfig.url,
          fullUrl: requestUrl,
          method: validatedConfig.method,
          error: error.message,
          errorCode: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          isNetworkError: error.isNetworkError,
          hasResponse: !!error.response,
          baseURL: api.defaults.baseURL,
          timestamp: new Date().toISOString()
        };
        
        throw error;
      }
    },
  });
};

// ---- MUTATION HELPER ----
export const useCustomMutation = (options) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (variables) => {
      const requestConfig = options.mutationFn(variables);
      
      // Ensure URL starts with /
      if (requestConfig.url && !requestConfig.url.startsWith('/')) {
        requestConfig.url = '/' + requestConfig.url;
      }
      
      const res = await api(requestConfig);
      return res.data;
    },

    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
};

export { api };
