// src/components/history/DownloadButton.js
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Download } from "lucide-react-native";
import { useThemeStore } from "../../../store/themeStore";

const DownloadButton = ({ onPress, recordCount, dateLabel, areaLabel }) => {
  const { colors, theme } = useThemeStore();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.success,
        borderRadius: 14,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 20,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
      activeOpacity={0.8}
    >
      <Download size={22} color={theme === "dark" ? colors.textPrimary : "#000"} />
      <Text
        style={{
          color: theme === "dark" ? colors.textPrimary : "#000",
          fontSize: 16,
          fontWeight: "700",
          marginLeft: 10,
        }}
      >
        Download Excel Report
      </Text>
    </TouchableOpacity>
  );
};

export default DownloadButton;
