import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/controller/dashboard.jsx";
import History from "../screens/controller/history.jsx";
import Notifications from "../screens/controller/notifications.jsx";
import Alert from "../screens/controller/alert.jsx";
import Panels from "../screens/controller/panels.jsx";
import { Home, BarChart2, Bell, AlertTriangle, Sun } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";

const Tab = createBottomTabNavigator();

export default function ControllerBottomTabs() {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarIcon: ({ focused, color }) => {
          const size = focused ? 26 : 22;

          if (route.name === "Dashboard")
            return <Home size={size} color={color} />;
          if (route.name === "History")
            return <BarChart2 size={size} color={color} />;
          if (route.name === "Notifications")
            return <Bell size={size} color={color} />;
          if (route.name === "Alerts")
            return <AlertTriangle size={size} color={color} />;
          if (route.name === "Panels")
            return <Sun size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Panels" component={Panels} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Alerts" component={Alert} />
    </Tab.Navigator>
  );
}
