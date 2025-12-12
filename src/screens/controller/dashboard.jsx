// src/screens/Dashboard.js
import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity, LayoutAnimation } from "react-native";
import {
  Zap,
  Activity,
  Sun,
  Thermometer,
  Power,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
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
import { useControlCleanerMotor } from "../../service/controller/cleanerRobotService";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  const { UIManager } = require("react-native");
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Dashboard() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  const [selectedPanelId, setSelectedPanelId] = useState("PANEL-TOTAL"); // Default to total panel
  const [isPanelDropdownOpen, setIsPanelDropdownOpen] = useState(false);
  const [motorStatus, setMotorStatus] = useState('OFF'); // Track motor status
  const lastAutoActivationRef = React.useRef(null); // Track last auto-activation to prevent loops
  
  // Cleaner robot motor control mutation
  const controlMotorMutation = useControlCleanerMotor();
  
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
  console.log(telemetry)
  // Get all panels from telemetry data
  const panels = telemetry?.panels || [];
  
  // Find Panel-1 and Panel-2
  const panel1 = panels.find(panel => panel.panelId === "PANEL-1" || panel.panelId === "Panel-1");
  const panel2 = panels.find(panel => panel.panelId === "PANEL-2" || panel.panelId === "Panel-2");
  
  // Calculate efficiency for Panel-1 and Panel-2 (capacity: 15V per panel)
  const INDIVIDUAL_PANEL_CAPACITY = 15; // 15V per individual panel
  
  const calculatePanelEfficiency = (panel) => {
    if (!panel || !panel.voltage || panel.voltage <= 0) return 100; // Default to 100% if no data
    const efficiency = (panel.voltage / INDIVIDUAL_PANEL_CAPACITY) * 100;
    return Math.min(efficiency, 100); // Cap at 100%
  };
  
  const panel1Efficiency = panel1 ? calculatePanelEfficiency(panel1) : 100;
  const panel2Efficiency = panel2 ? calculatePanelEfficiency(panel2) : 100;
  
  // Auto-activate motor if any panel efficiency < 50%
  useEffect(() => {
    const shouldActivate = (panel1Efficiency < 50 || panel2Efficiency < 50);
    const lowEfficiencyKey = `${panel1Efficiency.toFixed(1)}-${panel2Efficiency.toFixed(1)}`;
    
    // Only activate if:
    // 1. Efficiency is low
    // 2. Motor is currently OFF
    // 3. We haven't already activated for this exact efficiency state (prevent loops)
    // 4. Not already processing a mutation
    if (shouldActivate && 
        motorStatus === 'OFF' && 
        !controlMotorMutation.isPending &&
        lastAutoActivationRef.current !== lowEfficiencyKey &&
        (panel1 || panel2)) { // Only if we have panel data
      
      lastAutoActivationRef.current = lowEfficiencyKey;
      
      controlMotorMutation.mutate(
        {
          robotId: 'CLEANER-01',
          motorStatus: 'ON'
        },
        {
          onSuccess: (result) => {
            if (result?.success) {
              setMotorStatus('ON');
            }
          },
          onError: () => {
            // Reset ref on error so we can retry
            lastAutoActivationRef.current = null;
          }
        }
      );
    }
    
    // Reset auto-activation tracking if efficiency recovers (both panels >= 50%)
    if (!shouldActivate && lastAutoActivationRef.current !== null) {
      lastAutoActivationRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel1Efficiency, panel2Efficiency, motorStatus, panel1?.voltage, panel2?.voltage, controlMotorMutation.isPending]);
  
  // Create panel options for dropdown (include all panels + TOTAL option)
  const panelOptions = useMemo(() => {
    const options = [];
    
    // Add individual panels (exclude PANEL-TOTAL from individual list)
    panels.forEach(panel => {
      if (panel.panelId && panel.panelId !== "PANEL-TOTAL") {
        options.push({
          label: panel.panelId,
          value: panel.panelId,
          panel: panel
        });
      }
    });
    
    // Add TOTAL option at the end
    const panelTotal = panels.find(panel => panel.panelId === "PANEL-TOTAL");
    if (panelTotal || panels.length > 0) {
      options.push({
        label: "TOTAL",
        value: "PANEL-TOTAL",
        panel: panelTotal || null
      });
    }
    
    return options;
  }, [panels]);
  
  // Reset to PANEL-TOTAL if selected panel is no longer available
  useEffect(() => {
    if (panelOptions.length > 0 && !panelOptions.find(opt => opt.value === selectedPanelId)) {
      const totalOption = panelOptions.find(opt => opt.value === "PANEL-TOTAL");
      if (totalOption) {
        setSelectedPanelId("PANEL-TOTAL");
      } else if (panelOptions.length > 0) {
        setSelectedPanelId(panelOptions[0].value);
      }
    }
  }, [panelOptions, selectedPanelId]);
  
  // Find selected panel
  const selectedPanelOption = panelOptions.find(opt => opt.value === selectedPanelId);
  const selectedPanel = selectedPanelOption?.panel;
  const panelTotal = panels.find(panel => panel.panelId === "PANEL-TOTAL");
  
  // Map telemetry data to dashboard format with fallbacks
  // Use selected panel voltage/current if available, otherwise fall back to aggregate values
  let voltage = 0;
  let current = 0;
  
  if (selectedPanel) {
    // Use values from selected panel
    voltage = selectedPanel.voltage ?? 0;
    current = selectedPanel.current ?? 0;
  } else if (selectedPanelId === "PANEL-TOTAL" && panelTotal) {
    // Use PANEL-TOTAL panel values
    voltage = panelTotal.voltage ?? telemetry?.incomingVoltage ?? 0;
    current = panelTotal.current ?? 0;
  } else {
    // Fallback to aggregate values
    const aggregateVoltage = telemetry?.incomingVoltage ?? 0;
    voltage = aggregateVoltage;
    current = aggregateVoltage > 0 && telemetry?.generation 
      ? (telemetry.generation * 1000) / aggregateVoltage 
      : 0;
  }
  const generation = telemetry?.generation ?? 0; // kW
  const consumption = telemetry?.consumption ?? 0; // kW
  const battery = telemetry?.rawPayload?.batterySOC || 0;
  const temp = telemetry?.temperature ?? 0;
  const inverterStatus = telemetry?.inverterStatus ?? 'OFF';
  const coolingStatus = telemetry?.coolingStatus ?? false;
  const lastUpdated = telemetry?.timestamp ? new Date(telemetry.timestamp) : new Date();
  
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
    //if (inverterStatus === 'FAULT') return "FAULT";
    if (voltage < 6 || voltage > 30) return "FAULT";
    if (temp >= 70) return "OVERHEAT";
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
        onScrollBeginDrag={() => {
          // Close dropdown when user starts scrolling
          if (isPanelDropdownOpen) {
            LayoutAnimation.easeInEaseOut();
            setIsPanelDropdownOpen(false);
          }
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, zIndex: 1000 }}>
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Primary Meters
          </Text>
          
          {/* Panel Selection Dropdown */}
          {!isLoading && !error && panelOptions.length > 0 && (
            <View style={{ position: "relative", zIndex: 1000 }}>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setIsPanelDropdownOpen(!isPanelDropdownOpen);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minWidth: 120,
                  zIndex: 1001,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: "600",
                    marginRight: 6,
                  }}
                >
                  {panelOptions.find(opt => opt.value === selectedPanelId)?.label || "Select Panel"}
                </Text>
                {isPanelDropdownOpen ? (
                  <ChevronUp size={16} color={colors.textTertiary} />
                ) : (
                  <ChevronDown size={16} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
              
              {/* Dropdown Menu */}
              {isPanelDropdownOpen && (
                <View
                  style={{
                    position: "absolute",
                    top: 36, // Position below button (button height ~32px + 4px margin)
                    right: 0,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minWidth: 140,
                    maxWidth: 180,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 10,
                    zIndex: 1002,
                  }}
                >
                  {panelOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        LayoutAnimation.easeInEaseOut();
                        setSelectedPanelId(option.value);
                        setIsPanelDropdownOpen(false);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: option !== panelOptions[panelOptions.length - 1] ? 1 : 0,
                        borderBottomColor: colors.border,
                      }}
                    >
                      {selectedPanelId === option.value ? (
                        <Check size={16} color={colors.success} />
                      ) : (
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: colors.borderDark,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          marginLeft: 10,
                          color: colors.textPrimary,
                          fontSize: 13,
                          fontWeight: selectedPanelId === option.value ? "600" : "400",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

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
            max={35} 
            label="Grid Voltage"
            unit="V"
            icon={Zap}
            lowWarning={3}
            highWarning={25}
            greenZoneStart={5}
            greenZoneEnd={25}
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
              label="Cooling Status"
              value={`${telemetry?.coolingStatus ? "OFF" : "ON"}`}
              icon={Thermometer}
              severity={telemetry?.coolingStatus ? "ok" : "critical"}
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

        {/* Cleaner Robot Motor Control Button */}
        <View
          style={{
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              const newStatus = motorStatus === 'ON' ? 'OFF' : 'ON';
              try {
                // Reset auto-activation tracking when manually controlling
                lastAutoActivationRef.current = null;
                
                // Call motor control API
                // Backend automatically sets isActive=true when motorStatus='ON'
                // ESP32 checks both motorStatus='ON' AND isActive=true before turning motor on
                const result = await controlMotorMutation.mutateAsync({
                  robotId: 'CLEANER-01',
                  motorStatus: newStatus,
                  isActive: (newStatus === 'ON') ? true : false
                });
                
                if (result?.success) {
                  setMotorStatus(newStatus);
                  // Backend response includes isActive status
                  // ESP32 will poll and check both motorStatus and isActive
                  console.log('Motor control successful:', {
                    motorStatus: result.data?.motorStatus,
                    isActive: result.data?.isActive
                  });
                }
              } catch (error) {
                console.error('Motor control error:', error);
                // Error handling - could show alert here
              }
            }}
            disabled={controlMotorMutation.isPending}
            style={{
              backgroundColor: motorStatus === 'ON' ? colors.success : colors.surfaceSecondary,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: motorStatus === 'ON' ? colors.success : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              opacity: controlMotorMutation.isPending ? 0.6 : 1,
            }}
          >
            {controlMotorMutation.isPending ? (
              <ActivityIndicator 
                size="small" 
                color={motorStatus === 'ON' ? '#fff' : colors.success} 
                style={{ marginRight: 8 }}
              />
            ) : (
              <Power
                size={20}
                color={motorStatus === 'ON' ? '#fff' : colors.success}
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              style={{
                color: motorStatus === 'ON' ? '#fff' : colors.textPrimary,
                fontSize: 16,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {controlMotorMutation.isPending 
                ? 'Processing...' 
                : motorStatus === 'ON' 
                  ? 'Turn Motor OFF' 
                  : 'Turn Motor ON'
              }
            </Text>
          </TouchableOpacity>
          
          {motorStatus === 'ON' && (
            <Text
              style={{
                color: colors.success,
                fontSize: 12,
                textAlign: "center",
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              Motor is currently ON
            </Text>
          )}
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