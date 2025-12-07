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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ token: null, user: null });
  },

  // Helper to get user role
  getUserRole: () => {
    const state = useAuthStore.getState();
    return state.user?.role || state.user?.userType || null;
  },

  // Helper to check if user is controller
  isController: () => {
    const role = useAuthStore.getState().getUserRole();
    return role === "controller" || role === "admin";
  },
}));
