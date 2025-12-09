import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import Login from "../screens/auth";
import ControllerBottomTabs from "./BottomTabs";
import UserBottomTabs from "./UserBottomTabs";
import NotificationHandler from "../components/NotificationHandler";
import { useInitializeAndRegisterFCM } from "../service/userNotificationService";

const Stack = createNativeStackNavigator();

// Loading Screen Component
function LoadingScreen() {
  const { colors } = useThemeStore();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
      <Text
        style={{
          marginTop: 16,
          color: colors.textSecondary,
          fontSize: 16,
        }}
      >
        Loading...
      </Text>
    </View>
  );
}

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [isLoading, setIsLoading] = useState(true);
  const { initializeAndRegister } = useInitializeAndRegisterFCM();

  // Load auth state from AsyncStorage on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setAuthData({
            token: storedToken,
            user: JSON.parse(storedUser),
          });
        }
      } catch (error) {
        // Error loading auth state
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, [setAuthData]);

  // Register FCM token when user is authenticated
  useEffect(() => {
    if (token && user) {
      // Initialize and register FCM token in background
      // This is non-blocking and will fail silently if permissions are denied
      initializeAndRegister();
    }
  }, [token, user, initializeAndRegister]);

  // Determine if user is controller (backend roles: SUPER_ADMIN, CONTROLLER, CONSUMER)
  const userRole = user?.role;
  const isController = userRole === "CONTROLLER" || userRole === "SUPER_ADMIN";

  if (isLoading) {
    // Return a loading screen while checking auth
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Notification Handler - handles incoming notifications */}
      {token && <NotificationHandler />}
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          // Not authenticated - show login
          <Stack.Screen name="Login" component={Login} />
        ) : isController ? (
          // Controller user - show controller navigation
          <Stack.Screen name="ControllerMain" component={ControllerBottomTabs} />
        ) : (
          // Regular user - show user navigation
          <Stack.Screen name="UserMain" component={UserBottomTabs} />
        )}
      </Stack.Navigator>
    </>
  );
}
