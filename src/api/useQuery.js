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
    return res;
  },
  async (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

// ---- QUERY HELPER ----
export const useCustomQuery = (options) => {
  return useQuery({
    ...options,
    queryFn: async () => {
      const requestConfig = options.queryFn();
      
      // Ensure URL starts with /
      if (requestConfig.url && !requestConfig.url.startsWith('/')) {
        requestConfig.url = '/' + requestConfig.url;
      }
      
      const res = await api(requestConfig);
      return res.data;
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
