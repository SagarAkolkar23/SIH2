// src/screens/Dashboard.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, Platform, TouchableOpacity } from "react-native";
import {
  Zap,
  Activity,
  Sun,
  Thermometer,
  Power,
  AlertTriangle,
} from "lucide-react-native";
import IndustrialGauge from "../../components/controller/dashboard/industrialGauge";
import IndustrialBattery from "../../components/controller/dashboard/IndustrialBattery";
import IndustrialStatusPanel from "../../components/controller/dashboard/IndustrialStatusPanel";
import TopAppBar from "../../components/controller/TopAppBar";
import { useThemeStore } from "../../store/themeStore";
import ProfileModal from "../../components/users/ProfileModal";
import RegistrationModal from "../../components/controller/RegistrationModal";
import { useSolarReadings } from "../../service/controller/testGen";
import { useFocusEffect } from "@react-navigation/native";
import WeatherWidget from "../../components/controller/dashboard/WeatherWidget";

export default function Dashboard() {
  const { colors } = useThemeStore();
  const [data, setData] = useState({
    voltage: 230,
    current: 11.8,
    battery: 62,
    temp: 41,
    solarInput: 2650,
    lastUpdated: new Date(),
  });
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  
  const handleWeatherToggle = () => {
    setIsWeatherExpanded(!isWeatherExpanded);
  };

  // Reset weather expansion state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Collapse weather widget when navigating back to dashboard
      setIsWeatherExpanded(false);
    }, [])
  );

  const { data: solarReadings, isLoading, isError } = useSolarReadings(true);
  const latestReading = solarReadings?.[0]?.voltage ?? 0;

const panelRatedPower = 10; // watts

// Derived current from real voltage reading
const calculatedCurrent =
  latestReading > 0 ? panelRatedPower / latestReading : 0;

// Add tiny randomness to simulate MPPT variation
const simulatedCurrent = Number(
  (calculatedCurrent * (0.95 + Math.random() * 0.1)).toFixed(2)
);


  // Simulated live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        voltage: 220 + Math.floor(Math.random() * 25),
        current: 8 + Math.random() * 7,
        battery: Math.min(prev.battery + 0.1, 100),
        temp: 36 + Math.floor(Math.random() * 10),
        solarInput: 2400 + Math.floor(Math.random() * 250),
        lastUpdated: new Date(),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const powerKW = (data.voltage * data.current) / 1000;
  

  // System status logic
  const systemStatus = (() => {
    if (data.voltage < 200 || data.voltage > 250) return "FAULT";
    if (data.temp >= 50) return "OVERHEAT";
    if (data.battery < 20) return "LOW BATTERY";
    return "OPERATIONAL";
  })();

  const systemStatusColor = (() => {
    if (systemStatus === "OPERATIONAL") return colors.success;
    if (systemStatus === "LOW BATTERY") return colors.warning;
    return colors.error;
  })();

  const handleMenuPress = () => {
    // Menu handler
  };

  const handleRegisterPress = () => {
    setRegistrationModalVisible(true);
  };

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopAppBar
        title="VeerGrid"
        systemStatus={systemStatus}
        onMenuPress={handleMenuPress}
        onRegisterPress={handleRegisterPress}
        onWeatherPress={handleWeatherToggle}
        onProfilePress={handleProfilePress}
        isWeatherExpanded={isWeatherExpanded}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 32,
        }}
      >
        {/* Weather Widget */}
        <WeatherWidget 
          isExpanded={isWeatherExpanded}
          onToggleExpand={handleWeatherToggle}
        />

        {/* Header Panel */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* System Status */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Power
                  size={18}
                  color={systemStatusColor}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  System Status
                </Text>
              </View>
              <Text
                style={{
                  color: systemStatusColor,
                  fontSize: 24,
                  fontWeight: "800",
                  marginTop: 6,
                  textShadowColor: systemStatusColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
                }}
              >
                {systemStatus}
              </Text>
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                Last update: {data.lastUpdated.toLocaleTimeString()}
              </Text>
            </View>

            {/* Plant Power Display */}
            <View
              style={{
                alignItems: "flex-end",
                backgroundColor: colors.surfaceSecondary,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 10,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                PLANT POWER
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 28,
                    fontWeight: "800",
                    fontFamily:
                      Platform.OS === "ios" ? "Courier New" : "monospace",
                    textShadowColor: colors.accent,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }}
                >
                  {powerKW.toFixed(2)}
                </Text>
                <Text
                  style={{
                    color: colors.accentSecondary,
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 4,
                  }}
                >
                  kW
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Sun
                  size={12}
                  color={colors.accent}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                  Solar: {(data.solarInput / 1000).toFixed(2)} kW
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Banner if needed */}
          {systemStatus !== "OPERATIONAL" && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AlertTriangle
                size={16}
                color={systemStatusColor}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: systemStatusColor,
                  fontSize: 12,
                  fontWeight: "600",
                  flex: 1,
                }}
              >
                {systemStatus === "FAULT"
                  ? "Grid voltage out of acceptable range"
                  : systemStatus === "OVERHEAT"
                  ? "Inverter temperature exceeds safe operating limits"
                  : "Battery charge level below minimum threshold"}
              </Text>
            </View>
          )}
        </View>

        {/* Section Header */}
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Primary Meters
        </Text>

        {/* Voltage Gauge */}
        {/* Voltage Gauge Live From Backend */}
        {isLoading ? (
          <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
            Loading live voltage...
          </Text>
        ) : isError ? (
          <Text style={{ color: colors.error, marginBottom: 20 }}>
            ⚠ Could not fetch live voltage
          </Text>
        ) : (
          <IndustrialGauge
            value={latestReading}
            max={260} 
            label="Grid Voltage"
            unit="V"
            icon={Zap}
            lowWarning={200}
            highWarning={250}
            greenZoneStart={220}
            greenZoneEnd={240}
          />
        )}

        {/* Current Gauge */}
        <IndustrialGauge
          value={data.current}
          max={5} 
          label="Panel Current"
          unit="A"
          icon={Activity}
          lowWarning={0.2}
          highWarning={2}
          greenZoneStart={0.5}
          greenZoneEnd={1.5}
        />

        {/* Battery Module */}
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            marginTop: 8,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Energy Storage
        </Text>

        <IndustrialBattery
          percentage={Math.round(data.battery)}
          isCharging={true}
          powerKW={powerKW}
        />

        {/* System Health Section */}
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            marginTop: 8,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          System Health Monitor
        </Text>

        <IndustrialStatusPanel
          label="Inverter Temperature"
          value={`${data.temp}°C`}
          icon={Thermometer}
          severity={
            data.temp >= 50 ? "critical" : data.temp >= 45 ? "warning" : "ok"
          }
        />

        <IndustrialStatusPanel
          label="Grid Supply Status"
          value={
            data.voltage < 200 || data.voltage > 250 ? "OUT OF RANGE" : "STABLE"
          }
          icon={Zap}
          severity={
            data.voltage < 200 || data.voltage > 250 ? "critical" : "ok"
          }
        />

        <IndustrialStatusPanel
          label="Solar Array Input"
          value={`${(data.solarInput / 1000).toFixed(2)} kW`}
          icon={Sun}
          severity={data.solarInput < 1000 ? "warning" : "ok"}
        />

        <IndustrialStatusPanel
          label="Battery Health"
          value={data.battery < 20 ? "LOW CHARGE" : "HEALTHY"}
          icon={Activity}
          severity={data.battery < 20 ? "warning" : "ok"}
        />

        {/* Footer Info */}
        <View
          style={{
            marginTop: 20,
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
            Industrial Solar Microgrid Controller v2.0{"\n"}
            Real-time monitoring system for electricians{"\n"}
            Data refreshes every 2 seconds
          </Text>
        </View>
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
      <RegistrationModal
        visible={registrationModalVisible}
        onClose={() => setRegistrationModalVisible(false)}
        mode="house-and-user"
      />
    </SafeAreaView>
  );
}
