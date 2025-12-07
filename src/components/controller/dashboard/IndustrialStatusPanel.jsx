// src/components/dashboard/IndustrialStatusPanel.js
import React from "react";
import { View, Text } from "react-native";
import { useThemeStore } from "../../../store/themeStore";

const IndustrialStatusPanel = ({
  label,
  value,
  icon: Icon,
  severity = "ok",
}) => {
  const { colors } = useThemeStore();

  const statusColors = {
    ok: colors.statusOk,
    warning: colors.statusWarning,
    critical: colors.statusCritical,
  };

  const c = statusColors[severity] || statusColors.ok;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderLeftWidth: 5,
        borderLeftColor: c.border,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Left Side: Icon and Info */}
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {/* Icon Container */}
        {Icon && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: c.bg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Icon size={20} color={c.text} />
          </View>
        )}

        {/* Text Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              color: c.text,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {value}
          </Text>
        </View>
      </View>

      {/* Right Side: LED Indicator */}
      <View style={{ alignItems: "center" }}>
        {/* LED with glow effect */}
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: c.led,
            borderWidth: 2,
            borderColor: c.border,
            shadowColor: c.led,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 10,
          }}
        />
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 9,
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          {severity}
        </Text>
      </View>
    </View>
  );
};

export default IndustrialStatusPanel;
