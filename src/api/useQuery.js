import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---- BASE URL ----
let API_BASE_URL =
  Constants.expoConfig?.extra?.API_URL || "http://10.76.66.99:5000";

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ---- AXIOS INSTANCE ----
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout
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
    // Only log FCM token related responses for debugging
    if (res.config?.url?.includes('fcm-token')) {
      console.log('[API RESPONSE] FCM Token endpoint response');
      console.log('[API RESPONSE] URL:', res.config.url);
      console.log('[API RESPONSE] Status:', res.status);
      console.log('[API RESPONSE] Data:', res.data);
    }
    return res;
  },
  async (err) => {
    // Log errors for FCM token endpoint
    if (err.config?.url?.includes('fcm-token')) {
      console.log('[API ERROR] FCM Token endpoint error');
      console.log('[API ERROR] URL:', err.config.url);
      console.log('[API ERROR] Status:', err.response?.status);
      console.log('[API ERROR] Data:', err.response?.data);
      console.log('[API ERROR] Message:', err.message);
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
      
      try {
        // Create validated config with proper URL
        const validatedConfig = {
          method: requestConfig.method || 'GET',
          url: urlPath,
          ...(requestConfig.params && { params: requestConfig.params }),
          ...(requestConfig.data && { data: requestConfig.data }),
          ...(requestConfig.headers && { headers: requestConfig.headers })
        };

        const res = await api(validatedConfig);
        
        return res.data;
      } catch (error) {
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
