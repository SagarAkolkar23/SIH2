// src/screens/History.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";

// Conditionally import native modules (they may not be available in all builds)
let FileSystem = null;
let FileSystemNew = null; // New API
let Sharing = null;

try {
  // Try legacy API first (for writeAsStringAsync)
  FileSystem = require('expo-file-system/legacy');
} catch (error) {
  // Legacy API not available
}

try {
  // Try new API as well (for File/Directory classes)
  FileSystemNew = require('expo-file-system/next');
} catch (error) {
  // New API not available
}

try {
  Sharing = require('expo-sharing');
} catch (error) {
  // Sharing module not available
}
import {
  TrendingUp,
  Zap,
  Activity,
  BatteryCharging,
  Sun,
} from "lucide-react-native";
import TopAppBar from "../../components/controller/TopAppBar";
import FilterModal from "../../components/controller/history/FilterModal";
import FilterSummaryCard from "../../components/controller/history/FilterSummaryCard";
import ActionButtonsRow from "../../components/controller/history/ActionButtonsRow";
import HistoryChartCard from "../../components/controller/history/HistoryChartCard";
import DownloadButton from "../../components/controller/history/DownloadButton";
import { useThemeStore } from "../../store/themeStore";
import { useGridHistoricalData, useGenerationHistoryCharts, downloadGridHistoricalData, downloadGenerationHistoryCharts } from "../../service/controller/historyService";
import { useAuthStore } from "../../store/authStore";

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
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [dateFilter, setDateFilter] = useState("last7days");
  const [areaFilter, setAreaFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // For Generation model data - can be set based on selected device/location
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  // Use Generation data if deviceId/location is available, otherwise use grid-based data
  const useGenerationData = !!(selectedDeviceId || selectedLocation);

  // Calculate date range from filter
  const getDateRange = useMemo(() => {
    const now = new Date();
    let startDate = null;
    let endDate = now.toISOString();
    let granularity = 'day';

    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        granularity = 'hour';
        break;
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        granularity = 'day';
        break;
      case "last30days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        granularity = 'day';
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        granularity = 'day';
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        granularity = 'day';
        break;
      case "last3months":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        granularity = 'week';
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    return {
      start: startDate ? startDate.toISOString() : null,
      end: endDate,
      granularity
    };
  }, [dateFilter]);

  // Fetch Generation history data (if deviceId/location is set)
  const { 
    data: generationHistoryResponse, 
    isLoading: isLoadingGenerationHistory, 
    error: generationHistoryError 
  } = useGenerationHistoryCharts({
    deviceId: selectedDeviceId,
    location: selectedLocation,
    start: getDateRange.start,
    end: getDateRange.end,
    granularity: getDateRange.granularity,
    enabled: useGenerationData
  });

  // Fetch grid-based historical data (fallback or when not using Generation data)
  const { data: historyResponse, isLoading: isLoadingHistory, error: historyError, refetch } = useGridHistoricalData({
    start: getDateRange.start,
    end: getDateRange.end,
    granularity: getDateRange.granularity,
    enabled: !useGenerationData
  });

  // Use Generation data if available, otherwise use grid-based data
  const activeHistoryResponse = useGenerationData ? generationHistoryResponse : historyResponse;
  const isLoadingActiveHistory = useGenerationData ? isLoadingGenerationHistory : isLoadingHistory;
  const activeHistoryError = useGenerationData ? generationHistoryError : historyError;

  // Fallback mock data
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

  // Filter mock data for fallback
  const filteredMockData = useMemo(() => {
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

  // Prepare mock chart data
  const prepareMockChartData = (dataKey) => {
    const groupedData = {};

    filteredMockData.forEach((item) => {
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

  // Get chart data from backend or fallback to mock
  // This will automatically update when date filter changes because:
  // 1. dateFilter changes → getDateRange recalculates
  // 2. getDateRange changes → query key changes (includes start/end/granularity)
  // 3. Query key changes → React Query refetches with new date range
  // 4. activeHistoryResponse updates → getChartData recalculates
  const getChartData = useMemo(() => {
    // Use backend data if available (from either Generation or Grid-based endpoint)
    if (activeHistoryResponse?.data?.aggregatedData) {
      const backendData = activeHistoryResponse.data.aggregatedData;
      return {
        voltage: backendData.voltage || { labels: [], data: [] },
        current: backendData.current || { labels: [], data: [] },
        power: backendData.power || { labels: [], data: [] },
        battery: backendData.battery || { labels: [], data: [] },
        solarInput: backendData.solarInput || { labels: [], data: [] },
        isUsingLiveData: true,
        recordCount: activeHistoryResponse.data.count || 0
      };
    }

    // Fallback to mock data (filtered by dateFilter)
    return {
      voltage: prepareMockChartData("voltage"),
      current: prepareMockChartData("current"),
      power: prepareMockChartData("power"),
      battery: prepareMockChartData("battery"),
      solarInput: prepareMockChartData("solarInput"),
      isUsingLiveData: false,
      recordCount: filteredMockData.length
    };
  }, [activeHistoryResponse, filteredMockData, dateFilter]); // Added dateFilter to dependencies for clarity

  const voltageData = getChartData.voltage;
  const currentData = getChartData.current;
  const powerData = getChartData.power;
  const batteryData = getChartData.battery;
  const solarData = getChartData.solarInput;

  // Handlers
  const handleApplyFilters = (date, area) => {
    setDateFilter(date);
    setAreaFilter(area);
  };

  const handleDownload = async () => {
    Alert.alert(
      "Download Report",
      `Ready to download ${
        getChartData.recordCount
      } records\n\nFormat: Excel (.xlsx)\nDate Range: ${getDateFilterLabel()}\nLocation: ${getAreaFilterLabel()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: async () => {
            try {
              // Download the file using the appropriate service based on data source
              const arrayBuffer = useGenerationData
                ? await downloadGenerationHistoryCharts({
                    deviceId: selectedDeviceId,
                    location: selectedLocation,
                    start: getDateRange.start,
                    end: getDateRange.end,
                    granularity: getDateRange.granularity,
                  })
                : await downloadGridHistoricalData({
                    start: getDateRange.start,
                    end: getDateRange.end,
                    granularity: getDateRange.granularity,
                  });

              // Generate filename
              const fromDate = getDateRange.start ? new Date(getDateRange.start).toISOString().split('T')[0] : 'start';
              const toDate = getDateRange.end ? new Date(getDateRange.end).toISOString().split('T')[0] : 'end';
              const filename = `grid_history_${fromDate}_to_${toDate}.xlsx`;
              const fileSize = Math.round((arrayBuffer.byteLength || arrayBuffer.length) / 1024);

              if (Platform.OS === 'web') {
                // For web, create a blob URL and trigger download
                const blob = new Blob([arrayBuffer], { 
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                Alert.alert(
                  "Download Complete",
                  `Report downloaded successfully!\n\n` +
                  `File: ${filename}\n` +
                  `Records: ${getChartData.recordCount}\n` +
                  `Date Range: ${getDateFilterLabel()}\n` +
                  `Size: ${fileSize} KB`
                );
              } else {
                // For React Native, save file to device storage and allow sharing
                // Check if native modules are available
                if (!FileSystem || !Sharing) {
                  // Fallback: Show success message and suggest rebuilding
                  Alert.alert(
                    "Download Complete",
                    `Report downloaded successfully!\n\n` +
                    `File: ${filename}\n` +
                    `Records: ${getChartData.recordCount}\n` +
                    `Date Range: ${getDateFilterLabel()}\n` +
                    `Size: ${fileSize} KB\n\n` +
                    `Note: To save files to device storage, please rebuild your development build with:\n` +
                    `npx expo install expo-file-system expo-sharing\n` +
                    `Then rebuild: npx expo run:android or npx expo run:ios`
                  );
                  return;
                }

                try {
                  // Convert ArrayBuffer to base64
                  const bytes = new Uint8Array(arrayBuffer);
                  
                  // Use a more efficient base64 encoding
                  let base64 = '';
                  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                  
                  for (let i = 0; i < bytes.length; i += 3) {
                    const a = bytes[i];
                    const b = bytes[i + 1] || 0;
                    const c = bytes[i + 2] || 0;
                    const bitmap = (a << 16) | (b << 8) | c;
                    base64 += chars.charAt((bitmap >> 18) & 63);
                    base64 += chars.charAt((bitmap >> 12) & 63);
                    base64 += i + 1 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
                    base64 += i + 2 < bytes.length ? chars.charAt(bitmap & 63) : '=';
                  }

                  // Save file to device storage
                  // Try new API first, fallback to legacy
                  let fileUri;
                  let saved = false;
                  
                  // Get document directory from whichever API is available
                  const documentDir = FileSystem?.documentDirectory || FileSystemNew?.documentDirectory;
                  
                  if (!documentDir) {
                    throw new Error('Document directory not available');
                  }
                  
                  if (FileSystemNew) {
                    // Use new API (expo-file-system/next)
                    try {
                      const { File, EncodingType } = FileSystemNew;
                      fileUri = `${documentDir}${filename}`;
                      
                      // Ensure file:// protocol
                      if (!fileUri.startsWith('file://')) {
                        fileUri = `file://${fileUri}`;
                      }
                      
                      const file = new File(fileUri);
                      await file.write(base64, { encoding: EncodingType.Base64 });
                      saved = true;
                    } catch (newApiError) {
                      // New API failed, trying legacy
                    }
                  }
                  
                  if (!saved && FileSystem) {
                    // Fallback to legacy API (expo-file-system/legacy)
                    fileUri = `${documentDir}${filename}`;
                    
                    // Use legacy API's writeAsStringAsync with Base64 encoding
                    await FileSystem.writeAsStringAsync(fileUri, base64, {
                      encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    saved = true;
                  }
                  
                  if (!saved) {
                    throw new Error('Neither new nor legacy FileSystem API is available');
                  }

                  // Check if sharing is available
                  const isAvailable = await Sharing.isAvailableAsync();
                  
                  if (isAvailable) {
                    // Show options: Share or just save
                    Alert.alert(
                      "Download Complete",
                      `Report saved successfully!\n\n` +
                      `File: ${filename}\n` +
                      `Records: ${getChartData.recordCount}\n` +
                      `Date Range: ${getDateFilterLabel()}\n` +
                      `Size: ${fileSize} KB\n\n` +
                      `Would you like to share this file?`,
                      [
                        {
                          text: "Keep Only",
                          style: "cancel",
                        },
                        {
                          text: "Share",
                          onPress: async () => {
                            try {
                              await Sharing.shareAsync(fileUri, {
                                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                dialogTitle: 'Share Grid History Report',
                              });
                            } catch (shareError) {
                              Alert.alert("Error", "Failed to share file");
                            }
                          },
                        },
                      ]
                    );
                  } else {
                    // Sharing not available, just confirm save
                    Alert.alert(
                      "Download Complete",
                      `Report saved successfully!\n\n` +
                      `File: ${filename}\n` +
                      `Records: ${getChartData.recordCount}\n` +
                      `Date Range: ${getDateFilterLabel()}\n` +
                      `Size: ${fileSize} KB\n\n` +
                      `File saved to: ${fileUri}`
                    );
                  }
                } catch (saveError) {
                  Alert.alert(
                    "Save Failed",
                    `Failed to save file to device storage.\n\n${saveError.message}`
                  );
                }
              }
            } catch (error) {
              Alert.alert(
                "Download Failed",
                error.response?.data?.message || error.message || "Failed to download the report. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Solar Microgrid Report\n\nDate Range: ${getDateFilterLabel()}\nLocation: ${getAreaFilterLabel()}\nRecords: ${
          getChartData.recordCount
        }\n\nGenerated on ${new Date().toLocaleString()}`,
        title: "Solar Microgrid Report",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share report");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().then(() => {
      setIsRefreshing(false);
      Alert.alert("Refreshed", "Data updated successfully");
    }).catch(() => {
      setIsRefreshing(false);
      Alert.alert("Error", "Failed to refresh data");
    });
  };

  // Chart configurations for different colors
  const baseChartConfig = {
    backgroundColor: colors.chartBackground,
    backgroundGradientFrom: colors.chartGradientFrom,
    backgroundGradientTo: colors.chartGradientTo,
    decimalPlaces: 1,
    labelColor: (opacity = 1) => {
      // Convert hex to rgba for label color
      const hex = colors.textTertiary.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colors.border,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopAppBar
        title="Data History"
        systemStatus="OPERATIONAL"
        onMenuPress={() => Alert.alert("Menu", "Menu pressed")}
        onNotificationPress={() =>
          Alert.alert("Notifications", "Notifications pressed")
        }
        onSettingsPress={() => Alert.alert("Settings", "Settings pressed")}
      />

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Filter Summary Card */}
        <FilterSummaryCard
          dateLabel={getDateFilterLabel()}
          areaLabel={getAreaFilterLabel()}
          recordCount={getChartData.recordCount}
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
            color: colors.textTertiary,
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

        {/* Loading Indicator */}
        {isLoadingHistory && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 12 }}>
              Loading historical data...
            </Text>
          </View>
        )}

        {/* Error Message */}
        {historyError && !isLoadingHistory && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.error || '#ef4444',
          }}>
            <Text style={{ color: colors.error || '#ef4444', fontSize: 12, textAlign: 'center' }}>
              Failed to load historical data. Using fallback data.
            </Text>
          </View>
        )}

        {/* Data Source Indicator */}
        {!isLoadingHistory && !historyError && getChartData.isUsingLiveData && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.success || '#22c55e',
          }}>
            <Text style={{ color: colors.success || '#22c55e', fontSize: 11, textAlign: 'center' }}>
              ✓ Showing live historical data from backend
            </Text>
          </View>
        )}

        {/* Download Button */}
        <DownloadButton
          onPress={handleDownload}
          recordCount={getChartData.recordCount}
          dateLabel={getDateFilterLabel()}
          areaLabel={getAreaFilterLabel()}
        />

        {/* Info Footer */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: colors.textTertiary,
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
