// src/components/history/ActionButtonsRow.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RefreshCw, Share2 } from "lucide-react-native";
import { useThemeStore } from "../../../store/themeStore";

export default function ActionButtonsRow({ onRefresh, onShare, isRefreshing }) {
  const { colors } = useThemeStore();
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
      {/* Refresh Button */}
      <TouchableOpacity
        onPress={onRefresh}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: isRefreshing ? colors.success : colors.border,
        }}
      >
        <RefreshCw size={16} color={isRefreshing ? colors.success : colors.textPrimary} />
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          Refresh
        </Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        onPress={onShare}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Share2 size={16} color={colors.textPrimary} />
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          Share
        </Text>
      </TouchableOpacity>
    </View>
  );
}
