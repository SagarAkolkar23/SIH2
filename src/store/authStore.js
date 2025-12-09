import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  token: null,
  user: null,

  setAuthData: async ({ token, user }) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  clearAuth: async () => {
    try {
      // Remove all auth-related items from AsyncStorage
      await AsyncStorage.multiRemove(["token", "user", "@fcm_token"]);
      
      // Clear state
      set({ token: null, user: null });
    } catch (error) {
      // Still clear state even if AsyncStorage fails
      set({ token: null, user: null });
    }
  },

  // Helper to get user role
  getUserRole: () => {
    const state = useAuthStore.getState();
    return state.user?.role || null;
  },

  // Helper to check if user is controller or super admin
  isController: () => {
    const role = useAuthStore.getState().getUserRole();
    return role === "CONTROLLER" || role === "SUPER_ADMIN";
  },

  // Helper to check if user is consumer
  isConsumer: () => {
    const role = useAuthStore.getState().getUserRole();
    return role === "CONSUMER";
  },

  // Helper to check if user is super admin
  isSuperAdmin: () => {
    const role = useAuthStore.getState().getUserRole();
    return role === "SUPER_ADMIN";
  },
}));
