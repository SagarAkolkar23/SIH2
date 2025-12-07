import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { Bell } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";

export default function UserNotifications() {
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
            Notifications
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
            }}
          >
            Stay updated with system updates
          </Text>
        </View>

        {/* No Notifications Card */}
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
          <Bell size={48} color={colors.textTertiary} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No Notifications
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            You're all caught up! New notifications will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
