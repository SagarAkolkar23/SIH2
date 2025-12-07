import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { 
  Zap, 
  Battery, 
  TrendingUp, 
  Activity, 
  Sun, 
  Moon,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import UserTopAppBar from "../../components/users/TopAppBar";
import ProfileModal from "../../components/users/ProfileModal";

export default function UserDashboard() {
  const { colors, toggleTheme, theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    currentUsage: 2.5,
    batteryLevel: 75,
    solarGeneration: 3.2,
    efficiency: 92,
    status: "Normal",
    lastUpdated: new Date(),
    monthlyUsage: 156.8,
    savings: 2450.50,
  });

  // Simulated live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData((prev) => ({
        ...prev,
        currentUsage: 2.3 + Math.random() * 0.5,
        batteryLevel: Math.min(prev.batteryLevel + (Math.random() * 0.1 - 0.05), 100),
        solarGeneration: 3.0 + Math.random() * 0.4,
        efficiency: 90 + Math.random() * 4,
        lastUpdated: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuPress = () => {
    Alert.alert("Menu", "Menu options coming soon");
  };

  const handleNotificationPress = () => {
    Alert.alert("Notifications", "No new notifications");
  };

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  const handleSettingsPress = () => {
    Alert.alert("Settings", "Settings coming soon");
  };

  const getStatusColor = () => {
    if (dashboardData.status === "Normal") return colors.success;
    if (dashboardData.status === "Warning") return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <UserTopAppBar
        title="VeerGrid"
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
        onSettingsPress={handleSettingsPress}
        notificationCount={0}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 32,
        }}
      >
        {/* Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            alignSelf: "flex-end",
            marginBottom: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
          activeOpacity={0.7}
        >
          {theme === "dark" ? (
            <Sun size={18} color={colors.accent} />
          ) : (
            <Moon size={18} color={colors.accent} />
          )}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Text>
        </TouchableOpacity>

        {/* Welcome Header */}
        <View
          style={{
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 28,
              fontWeight: "800",
              marginBottom: 8,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
            }}
          >
            {user?.username || user?.email || "User"}
          </Text>
        </View>

        {/* Status Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: getStatusColor(),
                marginRight: 12,
              }}
            />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              System Status: {dashboardData.status}
            </Text>
          </View>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Your microgrid is operating normally. All systems are functioning as expected.
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Clock size={14} color={colors.textTertiary} />
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                marginLeft: 6,
              }}
            >
              Last updated: {dashboardData.lastUpdated.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Current Usage */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              width: "48%",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Zap size={20} color={colors.accent} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 8,
                  fontWeight: "600",
                }}
              >
                Current Usage
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {dashboardData.currentUsage.toFixed(1)} kW
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Real-time consumption
            </Text>
          </View>

          {/* Battery Level */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              width: "48%",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Battery size={20} color={colors.success} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 8,
                  fontWeight: "600",
                }}
              >
                Battery Level
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {Math.round(dashboardData.batteryLevel)}%
            </Text>
            <View
              style={{
                marginTop: 8,
                height: 4,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${dashboardData.batteryLevel}%`,
                  height: "100%",
                  backgroundColor: colors.success,
                }}
              />
            </View>
          </View>

          {/* Solar Generation */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              width: "48%",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Sun size={20} color={colors.warning} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 8,
                  fontWeight: "600",
                }}
              >
                Solar Generation
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {dashboardData.solarGeneration.toFixed(1)} kW
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Current output
            </Text>
          </View>

          {/* Efficiency */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              width: "48%",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TrendingUp size={20} color={colors.success} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 8,
                  fontWeight: "600",
                }}
              >
                Efficiency
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {Math.round(dashboardData.efficiency)}%
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginTop: 4,
              }}
            >
              System performance
            </Text>
          </View>
        </View>

        {/* Monthly Summary */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Monthly Summary
          </Text>
          
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Total Usage
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                {dashboardData.monthlyUsage.toFixed(1)} kWh
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Savings
              </Text>
              <Text
                style={{
                  color: colors.success,
                  fontSize: 20,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                ₹{dashboardData.savings.toFixed(2)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={16} color={colors.success} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginLeft: 8,
              }}
            >
              On track for monthly target
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 12,
            }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Activity size={20} color={colors.accent} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  View Usage History
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Check your energy consumption patterns
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <TrendingUp size={20} color={colors.success} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  View Reports
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Download detailed energy reports
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <AlertTriangle size={20} color={colors.warning} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  View Alerts
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Check system alerts and notifications
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View
          style={{
            marginTop: 8,
            padding: 12,
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 10,
              textAlign: "center",
              lineHeight: 16,
            }}
          >
            VeerGrid User Portal v2.0{"\n"}
            Real-time microgrid monitoring{"\n"}
            Data refreshes every 3 seconds
          </Text>
        </View>
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </SafeAreaView>
  );
}
