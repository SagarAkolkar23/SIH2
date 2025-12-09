// UserDashboard.js
import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
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
import { useUserDashboardQuery } from "../../service/user/dashboardService";

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
  
  // Fetch live dashboard data from backend
  const { 
    data: dashboardResponse, 
    isLoading: dashboardLoading,
    isError: dashboardError 
  } = useUserDashboardQuery();

  // Hardcoded fallback data
  const fallbackData = {
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
  };

  // Transform backend data to match frontend format, with fallback
  const getDashboardData = () => {
    // If loading or error, use fallback
    // Backend returns: { success: true, data: dashboard }
    // useCustomQuery returns res.data, so dashboardResponse = { success: true, data: dashboard }
    if (dashboardLoading || dashboardError || !dashboardResponse?.data) {
      if (dashboardLoading) {
        console.log('[USER DASHBOARD] ⏳ Loading dashboard data, using fallback');
      } else if (dashboardError) {
        console.log('[USER DASHBOARD] ❌ Error loading dashboard data, using fallback');
      } else if (!dashboardResponse?.data) {
        console.log('[USER DASHBOARD] ⚠️ No dashboard data in response, using fallback');
      }
      return fallbackData;
    }

    const backendData = dashboardResponse.data;
    console.log('[USER DASHBOARD] 📊 Processing live dashboard data');
    console.log('[USER DASHBOARD] Backend data keys:', Object.keys(backendData));
    console.log('[USER DASHBOARD] Voltage:', backendData.current_voltage);
    console.log('[USER DASHBOARD] Current:', backendData.current_current);
    console.log('[USER DASHBOARD] Power:', backendData.current_power || backendData.consumption);
    console.log('[USER DASHBOARD] Battery:', backendData.battery_percentage);
    console.log('[USER DASHBOARD] Temperature:', backendData.temperature);
    console.log('[USER DASHBOARD] Inverter Status:', backendData.inverter_status);
    console.log('[USER DASHBOARD] Last Updated:', backendData.lastUpdated);
    
    // Calculate power in kW from backend data (power is in W)
    const powerW = backendData.current_power || backendData.consumption || 0;
    const powerKW = powerW / 1000; // Convert W to kW
    
    // Get voltage (backend returns in V)
    const voltage = backendData.current_voltage || 230;
    
    // Calculate current from power and voltage: I = P / V
    const calculatedCurrent = voltage > 0 ? powerW / voltage : 12.5;
    
    // Use backend current if available, otherwise use calculated
    const current = backendData.current_current || calculatedCurrent;

    // Map backend data to frontend format
    return {
      currentUsage: powerKW > 0 ? powerKW : fallbackData.currentUsage,
      batteryLevel: backendData.battery_percentage !== null && backendData.battery_percentage !== undefined 
        ? backendData.battery_percentage 
        : fallbackData.batteryLevel,
      current: current || fallbackData.current,
      efficiency: 92, // Not provided by backend, use fallback
      temperature: backendData.temperature !== null && backendData.temperature !== undefined 
        ? backendData.temperature 
        : fallbackData.temperature,
      voltage: voltage > 0 ? voltage : fallbackData.voltage,
      status: backendData.inverter_status === 'ON' ? "Normal" : 
              backendData.inverter_status === 'FAULT' ? "Fault" : 
              backendData.inverter_status === 'OFF' ? "Off" : 
              "Normal",
      lastUpdated: backendData.lastUpdated ? new Date(backendData.lastUpdated) : new Date(),
      monthlyUnitsConsumed: fallbackData.monthlyUnitsConsumed, // Not provided by backend, use fallback
      savings: fallbackData.savings, // Not provided by backend, use fallback
      isCharging: backendData.battery_percentage !== null && backendData.battery_percentage !== undefined
        ? backendData.battery_percentage < 95 
        : fallbackData.isCharging,
      batteryPowerKW: fallbackData.batteryPowerKW, // Not provided by backend, use fallback
    };
  };

  const dashboardData = getDashboardData();
  
  // Show loading indicator if initial load
  const isInitialLoad = dashboardLoading && !dashboardResponse;
  
  // Check if we're using live data or fallback
  const isUsingLiveData = !dashboardLoading && !dashboardError && !!dashboardResponse?.data;

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
                backgroundColor: dashboardData.status === "Normal" ? colors.success : 
                                dashboardData.status === "Fault" ? colors.error : colors.warning,
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
            {isInitialLoad && (
              <View style={{ marginLeft: 8 }}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            )}
            {dashboardError && (
              <Text
                style={{
                  color: colors.warning,
                  fontSize: 11,
                  marginLeft: 8,
                  fontStyle: "italic",
                }}
              >
                (Using fallback data)
              </Text>
            )}
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
              {isUsingLiveData && " (Live)"}
              {dashboardError && " (Fallback)"}
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