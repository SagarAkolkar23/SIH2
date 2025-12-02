// src/screens/History.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import {
  TrendingUp,
  Zap,
  Activity,
  BatteryCharging,
  Sun,
} from "lucide-react-native";
import TopAppBar from "../components/TopAppBar";
import FilterModal from "../components/history/FilterModal";
import FilterSummaryCard from "../components/history/FilterSummaryCard";
import ActionButtonsRow from "../components/history/ActionButtonsRow";
import HistoryChartCard from "../components/history/HistoryChartCard";
import DownloadButton from "../components/history/DownloadButton";

// Generate mock historical data
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (let hour = 0; hour < 24; hour += 2) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);

      const solarFactor =
        hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;

      const baseVoltage = 220 + Math.random() * 20;
      const baseCurrent = 8 + Math.random() * 6 + solarFactor * 3;

      data.push({
        timestamp,
        voltage: baseVoltage + Math.random() * 5,
        current: baseCurrent,
        power: (baseVoltage * baseCurrent) / 1000,
        solarInput: 1000 + solarFactor * 2500 + Math.random() * 500,
        battery: 60 + Math.random() * 30,
        area: ["Area A", "Area B", "Area C"][Math.floor(Math.random() * 3)],
      });
    }
  }

  return data;
};

export default function History() {
  const [dateFilter, setDateFilter] = useState("last7days");
  const [areaFilter, setAreaFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const historicalData = useMemo(() => generateHistoricalData(), []);

  // Get filter labels
  const getDateFilterLabel = () => {
    const labels = {
      today: "Today",
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      last3months: "Last 3 Months",
    };
    return labels[dateFilter] || "Select Date";
  };

  const getAreaFilterLabel = () => {
    if (areaFilter === "all") return "All Areas";
    return areaFilter;
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = [...historicalData];

    const now = new Date();
    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((d) => {
          const itemDate = new Date(d.timestamp);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case "last7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter((d) => d.timestamp >= sevenDaysAgo);
        break;
      case "last30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter((d) => d.timestamp >= thirtyDaysAgo);
        break;
      case "thisMonth":
        filtered = filtered.filter((d) => {
          const itemDate = new Date(d.timestamp);
          return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "lastMonth":
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filtered = filtered.filter((d) => {
          const itemDate = new Date(d.timestamp);
          return (
            itemDate.getMonth() === lastMonth.getMonth() &&
            itemDate.getFullYear() === lastMonth.getFullYear()
          );
        });
        break;
      case "last3months":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter((d) => d.timestamp >= threeMonthsAgo);
        break;
    }

    if (areaFilter !== "all") {
      filtered = filtered.filter((d) => d.area === areaFilter);
    }

    return filtered;
  }, [historicalData, dateFilter, areaFilter]);

  // Prepare chart data
  const prepareChartData = (dataKey) => {
    const groupedData = {};

    filteredData.forEach((item) => {
      const dateKey = item.timestamp.toLocaleDateString();
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { sum: 0, count: 0 };
      }
      groupedData[dateKey].sum += item[dataKey];
      groupedData[dateKey].count += 1;
    });

    const sortedKeys = Object.keys(groupedData).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const maxPoints = 10;
    const step = Math.ceil(sortedKeys.length / maxPoints);
    const labels = sortedKeys
      .filter((_, i) => i % step === 0)
      .slice(-maxPoints);
    const data = labels.map(
      (label) => groupedData[label].sum / groupedData[label].count
    );

    return { labels, data };
  };

  const voltageData = prepareChartData("voltage");
  const currentData = prepareChartData("current");
  const powerData = prepareChartData("power");
  const batteryData = prepareChartData("battery");
  const solarData = prepareChartData("solarInput");

  // Handlers
  const handleApplyFilters = (date, area) => {
    setDateFilter(date);
    setAreaFilter(area);
  };

  const handleDownload = () => {
    Alert.alert(
      "Download Report",
      `Ready to download ${
        filteredData.length
      } records\n\nFormat: Excel (.xlsx)\nDate Range: ${getDateFilterLabel()}\nLocation: ${getAreaFilterLabel()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: () => {
            setTimeout(() => {
              Alert.alert(
                "Success",
                "Report downloaded successfully!\n\nSaved to: Downloads/solar_report.xlsx"
              );
            }, 1000);
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Solar Microgrid Report\n\nDate Range: ${getDateFilterLabel()}\nLocation: ${getAreaFilterLabel()}\nRecords: ${
          filteredData.length
        }\n\nGenerated on ${new Date().toLocaleString()}`,
        title: "Solar Microgrid Report",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share report");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert("Refreshed", "Data updated successfully");
    }, 1500);
  };

  // Chart configurations for different colors
  const baseChartConfig = {
    backgroundColor: "#1a1a1a",
    backgroundGradientFrom: "#1a1a1a",
    backgroundGradientTo: "#0a0a0a",
    decimalPlaces: 1,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#333",
      strokeWidth: 1,
    },
  };

  const createChartConfig = (color) => ({
    ...baseChartConfig,
    color: (opacity = 1) => color.replace("1)", `${opacity})`),
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: color.replace("rgba(", "rgb(").replace(/,\s*[\d.]+\)/, ")"),
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <TopAppBar
        title="Data History"
        systemStatus="OPERATIONAL"
        onMenuPress={() => Alert.alert("Menu", "Menu pressed")}
        onNotificationPress={() =>
          Alert.alert("Notifications", "Notifications pressed")
        }
        onSettingsPress={() => Alert.alert("Settings", "Settings pressed")}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Filter Summary Card */}
        <FilterSummaryCard
          dateLabel={getDateFilterLabel()}
          areaLabel={getAreaFilterLabel()}
          recordCount={filteredData.length}
          onPress={() => setShowFilterModal(true)}
        />

        {/* Action Buttons */}
        <ActionButtonsRow
          onRefresh={handleRefresh}
          onShare={handleShare}
          isRefreshing={isRefreshing}
        />

        {/* Section Header */}
        <Text
          style={{
            color: "#6b7280",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Historical Performance
        </Text>

        {/* Power Generation Chart */}
        <HistoryChartCard
          title="Power Generation"
          data={powerData}
          unit="kW"
          icon={TrendingUp}
          color="#fbbf24"
          chartConfig={createChartConfig("rgba(251, 191, 36, 1)")}
        />

        {/* Grid Voltage Chart */}
        <HistoryChartCard
          title="Grid Voltage"
          data={voltageData}
          unit="V"
          icon={Zap}
          color="#22c55e"
          chartConfig={createChartConfig("rgba(34, 197, 94, 1)")}
        />

        {/* Load Current Chart */}
        <HistoryChartCard
          title="Load Current"
          data={currentData}
          unit="A"
          icon={Activity}
          color="#3b82f6"
          chartConfig={createChartConfig("rgba(59, 130, 246, 1)")}
        />

        {/* Battery SOC Chart */}
        <HistoryChartCard
          title="Battery State of Charge"
          data={batteryData}
          unit="%"
          icon={BatteryCharging}
          color="#a855f7"
          chartConfig={createChartConfig("rgba(168, 85, 247, 1)")}
        />

        {/* Solar Input Chart */}
        <HistoryChartCard
          title="Solar Array Input"
          data={solarData}
          unit="W"
          icon={Sun}
          color="#f59e0b"
          chartConfig={createChartConfig("rgba(245, 158, 11, 1)")}
        />

        {/* Download Button */}
        <DownloadButton
          onPress={handleDownload}
          recordCount={filteredData.length}
          dateLabel={getDateFilterLabel()}
          areaLabel={getAreaFilterLabel()}
        />

        {/* Info Footer */}
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "#333",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: "#6b7280",
              fontSize: 11,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            📊 Historical data updated every 2 hours{"\n"}
            📁 Excel report includes all parameters{"\n"}
            🔄 Last refresh: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentDateFilter={dateFilter}
        currentAreaFilter={areaFilter}
      />
    </SafeAreaView>
  );
}
