import React from "react";
import { View, Text, Platform } from "react-native";
import { BatteryCharging, AlertTriangle } from "lucide-react-native";
import { useThemeStore } from "../../../store/themeStore";

const IndustrialBattery = ({ percentage, isCharging, powerKW = 0 }) => {
  const { colors } = useThemeStore();
  const isLow = percentage <= 20;
  const isCritical = percentage <= 10;

  const segments = 10;
  const filledSegments = Math.ceil((percentage / 100) * segments);

  const statusColor = isCritical ? colors.error : isLow ? colors.warning : colors.success;

  const statusText = (() => {
    if (isCritical) return "CRITICAL";
    if (isCharging) return "CHARGING";
    if (!isCharging && powerKW > 0) return "DISCHARGING";
    return "STANDBY";
  })();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        {isCritical ? (
          <AlertTriangle
            size={20}
            color={statusColor}
            style={{ marginRight: 8 }}
          />
        ) : (
          <BatteryCharging
            size={20}
            color={statusColor}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Battery State of Charge
        </Text>
      </View>

      {/* Battery Visual Container */}
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 16,
          padding: 20,
          borderWidth: 2,
          borderColor: colors.borderLight,
          marginBottom: 16,
        }}
      >
        {/* Battery Graphic */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {/* Battery Body */}
          <View
            style={{
              width: 220,
              height: 90,
              borderWidth: 4,
              borderColor: colors.borderDark,
              borderRadius: 10,
              padding: 8,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            {/* Battery Segments */}
            <View style={{ flexDirection: "row", height: "100%", gap: 3 }}>
              {Array.from({ length: segments }).map((_, i) => {
                const isFilled = i < filledSegments;
                const segmentColor = isFilled ? statusColor : colors.surface;
                const opacity = isFilled ? 0.5 + (i / segments) * 0.5 : 1;

                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: segmentColor,
                      borderRadius: 3,
                      opacity: opacity,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                );
              })}
            </View>
          </View>

          {/* Battery Terminal */}
          <View
            style={{
              width: 10,
              height: 36,
              backgroundColor: colors.borderDark,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              marginLeft: -2,
            }}
          />
        </View>

        {/* Large Percentage Display */}
        <View
          style={{
            backgroundColor: colors.surfaceTertiary,
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 28,
            borderWidth: 2,
            borderColor: statusColor,
          }}
        >
          <Text
            style={{
              color: statusColor,
              fontSize: 48,
              fontWeight: "700",
              fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
              textAlign: "center",
            }}
          >
            {percentage}%
          </Text>
        </View>
      </View>

      {/* Status Information Panel */}
      <View
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 10,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Status Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View>
            <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 1 }}>
              STATUS
            </Text>
            <Text
              style={{
                color: statusColor,
                fontSize: 16,
                fontWeight: "700",
                marginTop: 2,
              }}
            >
              {statusText}
            </Text>
          </View>

          {/* LED Indicator */}
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: statusColor,
              shadowColor: statusColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 8,
            }}
          />
        </View>

        {/* Power Flow Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textTertiary, fontSize: 11 }}>POWER FLOW</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                fontWeight: "700",
                fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
              }}
            >
              {isCharging ? "+" : "-"}
              {powerKW.toFixed(2)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
              kW
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 10,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {isCharging
            ? "Battery receiving power from solar/grid"
            : powerKW > 0
            ? "Battery supplying power to load"
            : "No significant power transfer"}
        </Text>
      </View>

      {/* Warning Message for Low Battery */}
      {isLow && (
        <View
          style={{
            marginTop: 12,
            backgroundColor: isCritical ? colors.statusCriticalBg : colors.statusWarningBg,
            borderRadius: 8,
            padding: 10,
            borderWidth: 1,
            borderColor: isCritical ? colors.statusCritical.border : colors.statusWarning.border,
          }}
        >
          <Text
            style={{
              color: isCritical ? colors.statusCritical.text : colors.statusWarning.text,
              fontSize: 11,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {isCritical
              ? "⚠️ CRITICAL: Battery level critically low"
              : "⚠️ WARNING: Battery level below recommended threshold"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default IndustrialBattery;
