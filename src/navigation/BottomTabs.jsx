import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/dashboard.jsx";
import History from "../screens/history.jsx";
import Notifications from "../screens/notifications.jsx";
import Alert from "../screens/alert.jsx";
import { Home, BarChart2, Bell, AlertTriangle } from "lucide-react-native";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: "#121212",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#0aff91",
        tabBarInactiveTintColor: "#777",
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
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Alerts" component={Alert} />
    </Tab.Navigator>
  );
}
