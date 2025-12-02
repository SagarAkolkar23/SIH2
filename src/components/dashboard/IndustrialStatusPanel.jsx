// src/components/dashboard/IndustrialStatusPanel.js
import React from "react";
import { View, Text } from "react-native";

const IndustrialStatusPanel = ({
  label,
  value,
  icon: Icon,
  severity = "ok",
}) => {
  const colors = {
    ok: {
      bg: "#134e4a",
      border: "#14b8a6",
      text: "#5eead4",
      led: "#14b8a6",
      label: "#e5e7eb",
    },
    warning: {
      bg: "#713f12",
      border: "#f59e0b",
      text: "#fde047",
      led: "#f59e0b",
      label: "#e5e7eb",
    },
    critical: {
      bg: "#7f1d1d",
      border: "#ef4444",
      text: "#fca5a5",
      led: "#ef4444",
      label: "#e5e7eb",
    },
  };

  const c = colors[severity] || colors.ok;

  return (
    <View
      style={{
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 5,
        borderLeftColor: c.border,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#333",
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
              color: c.label,
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
            color: "#6b7280",
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
