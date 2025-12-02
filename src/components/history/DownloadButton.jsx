// src/components/history/DownloadButton.js
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Download } from "lucide-react-native";

const DownloadButton = ({ onPress, recordCount, dateLabel, areaLabel }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#22c55e",
        borderRadius: 14,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 20,
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
      activeOpacity={0.8}
    >
      <Download size={22} color="#000" />
      <Text
        style={{
          color: "#000",
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
