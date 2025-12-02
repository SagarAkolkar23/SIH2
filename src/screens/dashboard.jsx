// src/screens/Dashboard.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, Platform } from "react-native";
import {
  Zap,
  Activity,
  Sun,
  Thermometer,
  Power,
  AlertTriangle,
} from "lucide-react-native";
import IndustrialGauge from "../components/dashboard/industrialGauge";
import IndustrialBattery from "../components/dashboard/IndustrialBattery";
import IndustrialStatusPanel from "../components/dashboard/IndustrialStatusPanel";
import TopAppBar from "../components/TopAppBar";

export default function Dashboard() {
  const [data, setData] = useState({
    voltage: 230,
    current: 11.8,
    battery: 62,
    temp: 41,
    solarInput: 2650, // watts
    lastUpdated: new Date(),
  });

  // Simulated live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        voltage: 220 + Math.floor(Math.random() * 25), // 220–245 V
        current: 8 + Math.random() * 7, // 8–15 A
        battery: Math.min(prev.battery + 0.1, 100), // slowly charging
        temp: 36 + Math.floor(Math.random() * 10), // 36–45 °C
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
    if (systemStatus === "OPERATIONAL") return "#22c55e";
    if (systemStatus === "LOW BATTERY") return "#f59e0b";
    return "#ef4444";
  })();

  const handleMenuPress = () => {
    console.log("Menu Pressed");
    // TODO: open drawer navigation later
  };

  const handleNotificationPress = () => {
    console.log("Notifications Clicked");
    // TODO: navigate to notifications screen
  };

  const handleSettingsPress = () => {
    console.log("Settings Clicked");
    // TODO: navigate to settings screen
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <TopAppBar
        title="VeerGrid"
        systemStatus={systemStatus}
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onSettingsPress={handleSettingsPress}
        notificationCount={systemStatus !== "OPERATIONAL" ? 1 : 0}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 32,
        }}
      >
        {/* Header Panel */}
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#333",
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
                    color: "#9ca3af",
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
              <Text style={{ color: "#6b7280", fontSize: 10, marginTop: 4 }}>
                Last update: {data.lastUpdated.toLocaleTimeString()}
              </Text>
            </View>

            {/* Plant Power Display */}
            <View
              style={{
                alignItems: "flex-end",
                backgroundColor: "#0a0a0a",
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#333",
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
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
                    color: "#fbbf24",
                    fontSize: 28,
                    fontWeight: "800",
                    fontFamily:
                      Platform.OS === "ios" ? "Courier New" : "monospace",
                    textShadowColor: "#fbbf24",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }}
                >
                  {powerKW.toFixed(2)}
                </Text>
                <Text
                  style={{
                    color: "#f59e0b",
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
                <Sun size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                <Text style={{ color: "#9ca3af", fontSize: 10 }}>
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
                borderTopColor: "#333",
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
            color: "#6b7280",
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
        <IndustrialGauge
          value={data.voltage}
          max={260}
          label="Grid Voltage"
          unit="V"
          icon={Zap}
          lowWarning={200}
          highWarning={250}
          greenZoneStart={220}
          greenZoneEnd={240}
        />

        {/* Current Gauge */}
        <IndustrialGauge
          value={data.current}
          max={20}
          label="Load Current"
          unit="A"
          icon={Activity}
          lowWarning={0}
          highWarning={16}
          greenZoneStart={5}
          greenZoneEnd={15}
        />

        {/* Battery Module */}
        <Text
          style={{
            color: "#6b7280",
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
            color: "#6b7280",
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
            backgroundColor: "#1a1a1a",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#333",
          }}
        >
          <Text
            style={{
              color: "#6b7280",
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
    </SafeAreaView>
  );
}
