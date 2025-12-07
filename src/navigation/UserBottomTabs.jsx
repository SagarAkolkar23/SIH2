import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserDashboard from "../screens/users/dashboard";
import UserHistory from "../screens/users/history";
import UserAlerts from "../screens/users/alerts";
import UserNotifications from "../screens/users/notifications";
import { Home, BarChart2, Bell, AlertTriangle } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";

const Tab = createBottomTabNavigator();

export default function UserBottomTabs() {
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

          if (route.name === "UserDashboard")
            return <Home size={size} color={color} />;
          if (route.name === "UserHistory")
            return <BarChart2 size={size} color={color} />;
          if (route.name === "UserNotifications")
            return <Bell size={size} color={color} />;
          if (route.name === "UserAlerts")
            return <AlertTriangle size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen 
        name="UserDashboard" 
        component={UserDashboard}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen 
        name="UserHistory" 
        component={UserHistory}
        options={{ tabBarLabel: "History" }}
      />
      <Tab.Screen 
        name="UserNotifications" 
        component={UserNotifications}
        options={{ tabBarLabel: "Notifications" }}
      />
      <Tab.Screen 
        name="UserAlerts" 
        component={UserAlerts}
        options={{ tabBarLabel: "Alerts" }}
      />
    </Tab.Navigator>
  );
}
