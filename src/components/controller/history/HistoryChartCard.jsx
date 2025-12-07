// src/components/history/HistoryChartCard.js
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function HistoryChartCard({
  title,
  data,
  unit,
  icon: Icon,
  color,
  chartConfig,
}) {
  const screenWidth = Dimensions.get("window").width;

  const avg =
    data.data.length > 0
      ? (data.data.reduce((a, b) => a + b, 0) / data.data.length).toFixed(2)
      : "0.00";

  const peak =
    data.data.length > 0 ? Math.max(...data.data).toFixed(2) : "0.00";

  const low = data.data.length > 0 ? Math.min(...data.data).toFixed(2) : "0.00";

  return (
    <View
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#333",
      }}
    >
      {/* Card Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${color}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: `${color}40`,
          }}
        >
          <Icon size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#e5e7eb",
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
            {data.labels.length} data points • {unit}
          </Text>
        </View>
      </View>

      {/* Chart or Empty State */}
      {data.data.length > 0 ? (
        <View>
          <LineChart
            data={{
              labels: data.labels.map((l) => {
                const date = new Date(l);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }),
              datasets: [{ data: data.data }],
            }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 12,
            }}
          />

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#333",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>AVG</Text>
              <Text style={{ color: color, fontSize: 18, fontWeight: "700" }}>
                {avg}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>{unit}</Text>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>PEAK</Text>
              <Text
                style={{ color: "#22c55e", fontSize: 18, fontWeight: "700" }}
              >
                {peak}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>{unit}</Text>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>LOW</Text>
              <Text
                style={{ color: "#f59e0b", fontSize: 18, fontWeight: "700" }}
              >
                {low}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>{unit}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#333",
          }}
        >
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            No data available
          </Text>
        </View>
      )}
    </View>
  );
}
