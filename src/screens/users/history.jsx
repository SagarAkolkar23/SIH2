import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { BarChart2, Calendar } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";

export default function UserHistory() {
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
            Usage History
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
            }}
          >
            View your energy consumption over time
          </Text>
        </View>

        {/* Placeholder Card */}
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
          <BarChart2 size={48} color={colors.textTertiary} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No History Data
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Your usage history will appear here once data is available.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


