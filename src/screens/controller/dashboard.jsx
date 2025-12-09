// src/screens/Dashboard.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, Platform, ActivityIndicator } from "react-native";
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
import { useAuthStore } from "../../store/authStore";
import ProfileModal from "../../components/users/ProfileModal";
import RegistrationModal from "../../components/controller/RegistrationModal";
import { useLiveTelemetry } from "../../service/controller/telemetryService";
import { useFocusEffect } from "@react-navigation/native";
import WeatherWidget from "../../components/controller/dashboard/WeatherWidget";

export default function Dashboard() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  
  // Get gridId from user (controller's assigned grid)
  // gridId can be either a string (ObjectId) or an object (populated from backend)
  const gridIdRaw = user?.gridId;
  const gridId = gridIdRaw 
    ? (typeof gridIdRaw === 'object' && gridIdRaw._id 
        ? String(gridIdRaw._id) 
        : String(gridIdRaw))
    : null;
  
  // Fetch live telemetry data every 3.9 seconds
  const { 
    data: telemetryResponse, 
    isLoading, 
    error,
    isFetching 
  } = useLiveTelemetry({ 
    deviceId: gridId || undefined, // Use extracted gridId string
    enabled: !!gridId // Only fetch if gridId is available
  });

  // Extract telemetry data
  const telemetry = telemetryResponse?.data?.generation;
  
  // Map telemetry data to dashboard format with fallbacks
  const voltage = telemetry?.incomingVoltage ?? 0;
  const generation = telemetry?.generation ?? 0; // kW
  const consumption = telemetry?.consumption ?? 0; // kW
  const battery = telemetry?.batteryPercentage ?? 0;
  const temp = telemetry?.temperature ?? 0;
  const inverterStatus = telemetry?.inverterStatus ?? 'OFF';
  const coolingStatus = telemetry?.coolingStatus ?? false;
  const lastUpdated = telemetry?.timestamp ? new Date(telemetry.timestamp) : new Date();
  
  // Calculate current from voltage and generation (if voltage > 0)
  // Current (A) = Power (W) / Voltage (V)
  // Generation is in kW, so multiply by 1000 to get Watts
  const current = voltage > 0 ? (generation * 1000) / voltage : 0;
  
  // Solar input is generation in kW converted to Watts
  const solarInput = generation * 1000; // Convert kW to W
  
  // Total power (generation - consumption for net power)
  const powerKW = generation; // Use generation as plant power
  
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
  

  // System status logic based on telemetry data
  const systemStatus = (() => {
    if (!telemetry) return "CONNECTING";
    if (inverterStatus === 'FAULT') return "FAULT";
    if (voltage < 6 || voltage > 18) return "FAULT";
    if (temp >= 50) return "OVERHEAT";
    if (battery < 20) return "LOW BATTERY";
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
                Last update: {lastUpdated.toLocaleTimeString()}
                {isFetching && " (updating...)"}
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
                  Solar: {generation.toFixed(2)} kW
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

        {/* Voltage Gauge - Live Data */}
        {isLoading ? (
          <View style={{ 
            height: 200, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 16
          }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading telemetry data...
            </Text>
          </View>
        ) : error ? (
          <View style={{ 
            height: 200, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 16,
            padding: 20
          }}>
            <AlertTriangle size={32} color={colors.error} />
            <Text style={{ color: colors.error, marginTop: 12, textAlign: 'center' }}>
              Error loading data
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
              {error?.message || 'Failed to fetch telemetry data'}
            </Text>
            {!gridId && (
              <Text style={{ color: colors.warning, marginTop: 8, fontSize: 11, textAlign: 'center' }}>
                No Grid ID assigned. Please contact administrator.
              </Text>
            )}
          </View>
        ) : (
          <IndustrialGauge
            value={voltage}
            max={18} 
            label="Grid Voltage"
            unit="V"
            icon={Zap}
            lowWarning={3}
            highWarning={15}
            greenZoneStart={5}
            greenZoneEnd={14}
          />
        )}

        {/* Current Gauge - Live Data */}
        {!isLoading && !error && (
          <IndustrialGauge
            value={current}
            max={20} 
            label="Panel Current"
            unit="A"
            icon={Activity}
            lowWarning={0.2}
            highWarning={15}
            greenZoneStart={1}
            greenZoneEnd={12}
          />
        )}

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

        {!isLoading && !error && (
          <IndustrialBattery
            percentage={Math.round(battery)}
            isCharging={generation > 0}
            powerKW={powerKW}
          />
        )}

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

        {!isLoading && !error && (
          <>
            <IndustrialStatusPanel
              label="Inverter Temperature"
              value={`${temp.toFixed(1)}°C`}
              icon={Thermometer}
              severity={
                temp >= 50 ? "critical" : temp >= 45 ? "warning" : "ok"
              }
            />

            <IndustrialStatusPanel
              label="Grid Supply Status"
              value={
                voltage < 200 || voltage > 250 ? "OUT OF RANGE" : "STABLE"
              }
              icon={Zap}
              severity={
                voltage < 200 || voltage > 250 ? "critical" : "ok"
              }
            />

            

            <IndustrialStatusPanel
              label="Battery Health"
              value={battery < 20 ? "LOW CHARGE" : "HEALTHY"}
              icon={Activity}
              severity={battery < 20 ? "warning" : "ok"}
            />

            <IndustrialStatusPanel
              label="Inverter Status"
              value={inverterStatus}
              icon={Power}
              severity={
                inverterStatus === 'FAULT' ? "critical" : 
                inverterStatus === 'STANDBY' ? "warning" : "ok"
              }
            />

            {consumption > 0 && (
              <IndustrialStatusPanel
                label="Consumption"
                value={`${consumption.toFixed(2)} kW`}
                icon={Activity}
                severity="ok"
              />
            )}
          </>
        )}

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
            Data refreshes every 3.9 seconds
            {telemetry && `\nDevice: ${telemetry.deviceId || 'N/A'}`}
            {telemetry && `\nLocation: ${telemetry.location || 'N/A'}`}
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