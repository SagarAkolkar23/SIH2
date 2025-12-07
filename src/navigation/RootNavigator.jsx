import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import Login from "../screens/auth";
import ControllerBottomTabs from "./BottomTabs";
import UserBottomTabs from "./UserBottomTabs";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error("Error loading auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Determine if user is controller
  const userRole = user?.role || user?.userType;
  const isController = userRole === "controller" || userRole === "admin";

  if (isLoading) {
    // Return a loading screen or null while checking auth
    return null;
  }

  return (
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
  );
}
