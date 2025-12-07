import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { AlertTriangle, CheckCircle } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";

export default function UserAlerts() {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
        }}
      >
        {/* Header */}
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
            Alerts
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
            }}
          >
            Important notifications about your system
          </Text>
        </View>

        {/* No Alerts Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <CheckCircle size={48} color={colors.success} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            All Clear!
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            No active alerts. Your system is running smoothly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


