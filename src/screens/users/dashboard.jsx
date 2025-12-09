// UserDashboard.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { 
  Zap, 
  Activity,
  Thermometer,
  Moon,
  Clock,
  CheckCircle,
  Battery,
  IndianRupee,
  TrendingUp,
  Sun
} from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import UserTopAppBar from "../../components/users/TopAppBar";
import ProfileModal from "../../components/users/ProfileModal";
import IndustrialGauge from "../../components/controller/dashboard/industrialGauge";
import IndustrialBattery from "../../components/controller/dashboard/IndustrialBattery";

// Odisha Electricity Tariff (Domestic Category)
const ELECTRICITY_RATES = {
  // Slab-based pricing for Odisha (CESU rates as of 2024)
  slabs: [
    { max: 50, rate: 3.20 },      // 0-50 units: ₹3.20/unit
    { max: 200, rate: 4.80 },     // 51-200 units: ₹4.80/unit
    { max: 400, rate: 6.00 },     // 201-400 units: ₹6.00/unit
    { max: Infinity, rate: 6.50 } // 401+ units: ₹6.50/unit
  ],
  fixedCharge: 30, // Fixed monthly charge in ₹
};

// Calculate electricity bill based on units consumed
const calculateElectricityBill = (units) => {
  let remainingUnits = units;
  let totalCost = ELECTRICITY_RATES.fixedCharge;
  let previousMax = 0;

  for (const slab of ELECTRICITY_RATES.slabs) {
    if (remainingUnits <= 0) break;

    const slabUnits = Math.min(remainingUnits, slab.max - previousMax);
    totalCost += slabUnits * slab.rate;
    remainingUnits -= slabUnits;
    previousMax = slab.max;
  }

  return totalCost;
};

export default function UserDashboard() {
  const { colors, toggleTheme, theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    currentUsage: 2.5,
    batteryLevel: 75,
    current: 12.5, // Current in Amperes
    efficiency: 92,
    temperature: 28,
    voltage: 230,
    status: "Normal",
    lastUpdated: new Date(),
    monthlyUnitsConsumed: 156.8, // Units consumed this month
    savings: 2450.50,
    isCharging: true,
    batteryPowerKW: 1.2,
  });

  // Simulated live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData((prev) => {
        const newUsage = 2.3 + Math.random() * 0.5;
        const newVoltage = 220 + Math.random() * 20;
        // Calculate current based on Power = Voltage × Current
        const newCurrent = (newUsage * 1000) / newVoltage; // Convert kW to W, then calculate current
        
        return {
          ...prev,
          currentUsage: newUsage,
          batteryLevel: Math.min(Math.max(prev.batteryLevel + (Math.random() * 2 - 1), 0), 100),
          current: newCurrent,
          efficiency: 90 + Math.random() * 4,
          temperature: 25 + Math.random() * 8,
          voltage: newVoltage,
          lastUpdated: new Date(),
          isCharging: prev.batteryLevel < 95,
          batteryPowerKW: 0.5 + Math.random() * 2,
          // Simulate monthly consumption increase (small increment)
          monthlyUnitsConsumed: prev.monthlyUnitsConsumed + (Math.random() * 0.001),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuPress = () => {
    // Handle menu
  };

  const handleNotificationPress = () => {
    // Handle notifications
  };

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  const handleSettingsPress = () => {
    // Handle settings
  };

  // Calculate monthly bill
  const monthlyBill = calculateElectricityBill(dashboardData.monthlyUnitsConsumed);

  // Determine bill rate based on consumption
  const getCurrentRate = (units) => {
    if (units <= 50) return 3.20;
    if (units <= 200) return 4.80;
    if (units <= 400) return 6.00;
    return 6.50;
  };

  const currentRate = getCurrentRate(dashboardData.monthlyUnitsConsumed);

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
        showsVerticalScrollIndicator={false}
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
        <View style={{ marginBottom: 24 }}>
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
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.success,
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
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

        {/* Industrial Gauges Section */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800",
            marginBottom: 16,
          }}
        >
          Live Monitoring
        </Text>

        {/* Power Consumption Gauge with Units Display */}
        <View>
          <IndustrialGauge
            value={dashboardData.currentUsage}
            max={5}
            label="Power Consumption"
            unit="kW"
            icon={Zap}
            lowWarning={0.5}
            highWarning={4}
            greenZoneStart={1}
            greenZoneEnd={3}
          />
          
          {/* Monthly Units Consumed Card below gauge */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginTop: -8,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Monthly Consumption
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 24,
                    fontWeight: "800",
                  }}
                >
                  {dashboardData.monthlyUnitsConsumed.toFixed(1)}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  kWh
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.accent + "20",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Units
              </Text>
            </View>
          </View>
        </View>

        {/* Current Gauge (replacing Solar Generation) */}
        <IndustrialGauge
          value={dashboardData.current}
          max={30}
          label="Current Draw"
          unit="A"
          icon={Activity}
          lowWarning={2}
          highWarning={25}
          greenZoneStart={5}
          greenZoneEnd={20}
        />

        {/* Grid Voltage Gauge */}
        <IndustrialGauge
          value={dashboardData.voltage}
          max={250}
          label="Grid Voltage"
          unit="V"
          icon={Activity}
          lowWarning={200}
          highWarning={245}
          greenZoneStart={220}
          greenZoneEnd={240}
        />

        {/* Temperature Gauge */}
        <IndustrialGauge
          value={dashboardData.temperature}
          max={50}
          label="System Temperature"
          unit="°C"
          icon={Thermometer}
          lowWarning={10}
          highWarning={40}
          greenZoneStart={20}
          greenZoneEnd={35}
        />

       

        {/* Monthly Bill Summary (Updated with Odisha Rates) */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: colors.warning,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <IndianRupee size={20} color={colors.warning} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: "700",
                marginLeft: 8,
              }}
            >
              Monthly Bill Estimate
            </Text>
          </View>
          
          <View
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {/* Bill Amount */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 12,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Total Bill Amount
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    color: colors.warning,
                    fontSize: 32,
                    fontWeight: "800",
                  }}
                >
                  ₹{monthlyBill.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Units Consumed */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 13,
                }}
              >
                Units Consumed
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                {dashboardData.monthlyUnitsConsumed.toFixed(1)} kWh
              </Text>
            </View>

            {/* Current Rate */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 13,
                }}
              >
                Current Rate
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                ₹{currentRate.toFixed(2)}/kWh
              </Text>
            </View>

            {/* Fixed Charges */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 13,
                }}
              >
                Fixed Charges
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                ₹{ELECTRICITY_RATES.fixedCharge.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Tariff Info */}
          <View
            style={{
              backgroundColor: colors.surfaceTertiary,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Odisha Tariff Slabs (CESU)
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                lineHeight: 16,
              }}
            >
              0-50 units: ₹3.20/unit{"\n"}
              51-200 units: ₹4.80/unit{"\n"}
              201-400 units: ₹6.00/unit{"\n"}
              401+ units: ₹6.50/unit
            </Text>
          </View>
        </View>

        {/* Savings Card */}
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
              marginBottom: 12,
            }}
          >
            <TrendingUp size={20} color={colors.success} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: "700",
                marginLeft: 8,
              }}
            >
              Monthly Savings
            </Text>
          </View>
          
          <View
            style={{
              backgroundColor: colors.success + "10",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.success,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 8 }}>
              <Text
                style={{
                  color: colors.success,
                  fontSize: 36,
                  fontWeight: "800",
                }}
              >
                ₹{dashboardData.savings.toFixed(2)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
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
                Saved through microgrid optimization
              </Text>
            </View>
          </View>
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
            Data refreshes every 3 seconds{"\n"}
            Tariff rates as per Odisha CESU 2024
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