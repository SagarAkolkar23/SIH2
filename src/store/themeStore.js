import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const themes = {
  dark: {
    mode: "dark",
    // Backgrounds
    background: "#0a0a0a",
    surface: "#1a1a1a",
    surfaceSecondary: "#0a0a0a",
    surfaceTertiary: "#000",
    // Borders
    border: "#333",
    borderLight: "#2a2a2a",
    borderDark: "#666",
    // Text
    textPrimary: "#e5e7eb",
    textSecondary: "#9ca3af",
    textTertiary: "#6b7280",
    // Status colors
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    // Accents
    accent: "#fbbf24",
    accentSecondary: "#f59e0b",
    // Status panel colors
    statusOk: {
      bg: "#134e4a",
      border: "#14b8a6",
      text: "#5eead4",
      led: "#14b8a6",
    },
    statusWarning: {
      bg: "#713f12",
      border: "#f59e0b",
      text: "#fde047",
      led: "#f59e0b",
    },
    statusCritical: {
      bg: "#7f1d1d",
      border: "#ef4444",
      text: "#fca5a5",
      led: "#ef4444",
    },
    statusCriticalBg: "#450a0a",
    statusWarningBg: "#451a03",
    // Chart
    chartBackground: "#1a1a1a",
    chartGradientFrom: "#1a1a1a",
    chartGradientTo: "#0a0a0a",
  },
  light: {
    mode: "light",
    // Backgrounds
    background: "#ffffff",
    surface: "#f9fafb",
    surfaceSecondary: "#ffffff",
    surfaceTertiary: "#f3f4f6",
    // Borders
    border: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#9ca3af",
    // Text
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    textTertiary: "#6b7280",
    // Status colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    // Accents
    accent: "#f59e0b",
    accentSecondary: "#d97706",
    // Status panel colors
    statusOk: {
      bg: "#d1fae5",
      border: "#10b981",
      text: "#059669",
      led: "#10b981",
    },
    statusWarning: {
      bg: "#fef3c7",
      border: "#f59e0b",
      text: "#d97706",
      led: "#f59e0b",
    },
    statusCritical: {
      bg: "#fee2e2",
      border: "#ef4444",
      text: "#dc2626",
      led: "#ef4444",
    },
    statusCriticalBg: "#fee2e2",
    statusWarningBg: "#fef3c7",
    // Chart
    chartBackground: "#f9fafb",
    chartGradientFrom: "#f9fafb",
    chartGradientTo: "#ffffff",
  },
};

export const useThemeStore = create((set, get) => ({
  theme: "dark",
  colors: themes.dark,

  toggleTheme: async () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    const newColors = themes[newTheme];

    await AsyncStorage.setItem("theme", newTheme);
    set({ theme: newTheme, colors: newColors });
  },

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        set({ theme: savedTheme, colors: themes[savedTheme] });
      }
    } catch (error) {
      // Error loading theme
    }
  },
}));


