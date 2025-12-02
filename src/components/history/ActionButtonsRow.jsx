// src/components/history/ActionButtonsRow.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RefreshCw, Share2 } from "lucide-react-native";

export default function ActionButtonsRow({ onRefresh, onShare, isRefreshing }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
      {/* Refresh Button */}
      <TouchableOpacity
        onPress={onRefresh}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: isRefreshing ? "#22c55e" : "#333",
        }}
      >
        <RefreshCw size={16} color={isRefreshing ? "#22c55e" : "#e5e7eb"} />
        <Text
          style={{
            color: "#e5e7eb",
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
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#333",
        }}
      >
        <Share2 size={16} color="#e5e7eb" />
        <Text
          style={{
            color: "#e5e7eb",
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
