import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useThemeStore } from "./src/store/themeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error caught by error boundary
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0a0a0a",
            padding: 20,
          }}
        >
          <Text style={{ color: "#ef4444", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const { colors } = useThemeStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeTheme();
      } catch (error) {
        // Error initializing theme
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [initializeTheme]);

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background || "#0a0a0a",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent || "#f59e0b"} />
        <Text
          style={{
            marginTop: 16,
            color: colors.textSecondary || "#9ca3af",
            fontSize: 16,
          }}
        >
          Initializing...
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
