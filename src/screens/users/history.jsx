import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { BarChart2, Calendar, Zap, Activity, Battery, TrendingUp, X, Check } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import UserTopAppBar from "../../components/users/TopAppBar";
import HistoryChartCard from "../../components/controller/history/HistoryChartCard";
import { useUserConsumptionHistory, useUserTelemetryHistory } from "../../service/user/historyService";

export default function UserHistory() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [dateFilter, setDateFilter] = useState("last7days");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date range from filter
  const getDateRange = useMemo(() => {
    const now = new Date();
    let startDate = null;
    let endDate = now.toISOString();
    let granularity = 'hour';

    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        granularity = 'hour';
        break;
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        granularity = 'hour';
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

  // Fetch consumption history
  const { 
    data: consumptionResponse, 
    isLoading: isLoadingConsumption, 
    error: consumptionError,
    refetch: refetchConsumption
  } = useUserConsumptionHistory({
    start: getDateRange.start,
    end: getDateRange.end,
    granularity: getDateRange.granularity,
    enabled: !!user?.houseId
  });

  // Fetch telemetry history for voltage, current, battery
  const { 
    data: telemetryResponse, 
    isLoading: isLoadingTelemetry, 
    error: telemetryError,
    refetch: refetchTelemetry
  } = useUserTelemetryHistory({
    start: getDateRange.start,
    end: getDateRange.end,
    limit: 200,
    enabled: !!user?.houseId
  });

  const isLoading = isLoadingConsumption || isLoadingTelemetry;
  const hasError = consumptionError || telemetryError;

  // Prepare chart data from consumption history
  const prepareConsumptionChartData = useMemo(() => {
    if (!consumptionResponse?.data?.consumption || !Array.isArray(consumptionResponse.data.consumption)) {
      return { labels: [], data: [] };
    }

    const consumptionData = consumptionResponse.data.consumption;
    const maxPoints = 20; // Limit to 20 points for readability
    
    // If we have more points than max, sample evenly
    const step = Math.max(1, Math.floor(consumptionData.length / maxPoints));
    const sampledData = [];
    
    for (let i = 0; i < consumptionData.length; i += step) {
      sampledData.push(consumptionData[i]);
      if (sampledData.length >= maxPoints) break;
    }

    const labels = sampledData.map(item => {
      // Consumption data has period field (timestamp or date string)
      const date = new Date(item.period || item.timestamp || item.date);
      if (getDateRange.granularity === 'hour') {
        return `${String(date.getHours()).padStart(2, '0')}:00`;
      } else if (getDateRange.granularity === 'day') {
        return `${String(date.getDate()).padStart(2, '0')}/${date.getMonth() + 1}`;
      } else {
        return `${String(date.getDate()).padStart(2, '0')}/${date.getMonth() + 1}`;
      }
    });

    // Consumption data has avgConsumption or consumption field (in kW)
    const data = sampledData.map(item => {
      const value = item.avgConsumption || item.consumption || 0;
      return parseFloat(value);
    });

    return { labels, data };
  }, [consumptionResponse, getDateRange.granularity]);

  // Prepare chart data from telemetry history
  const prepareTelemetryChartData = useMemo(() => {
    if (!telemetryResponse?.data?.telemetry || !Array.isArray(telemetryResponse.data.telemetry)) {
      return {
        voltage: { labels: [], data: [] },
        current: { labels: [], data: [] },
        battery: { labels: [], data: [] }
      };
    }

    const telemetryData = telemetryResponse.data.telemetry;
    const maxPoints = 20;
    const step = Math.max(1, Math.floor(telemetryData.length / maxPoints));
    const sampledData = [];

    for (let i = 0; i < telemetryData.length; i += step) {
      sampledData.push(telemetryData[i]);
      if (sampledData.length >= maxPoints) break;
    }

    const labels = sampledData.map(item => {
      const date = new Date(item.timestamp);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    return {
      voltage: {
        labels,
        data: sampledData.map(item => parseFloat(item.voltage || 0))
      },
      current: {
        labels,
        data: sampledData.map(item => parseFloat(item.current || 0))
      },
      battery: {
        labels,
        data: sampledData.map(item => parseFloat(item.batteryPercentage || 0))
      }
    };
  }, [telemetryResponse]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchConsumption(), refetchTelemetry()]);
    setIsRefreshing(false);
  };

  const getDateFilterLabel = () => {
    const labels = {
      today: "Today",
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
    };
    return labels[dateFilter] || "Last 7 Days";
  };

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
  ];

  // Chart configurations
  const baseChartConfig = {
    backgroundColor: colors.chartBackground,
    backgroundGradientFrom: colors.chartGradientFrom,
    backgroundGradientTo: colors.chartGradientTo,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#fff",
    },
  };

  const createChartConfig = (color) => ({
    ...baseChartConfig,
    color: (opacity = 1) => color.replace('1)', `${opacity})`),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <UserTopAppBar title="Usage History" />
      
      {/* Filter Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceSecondary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            flex: 1,
            marginRight: 12,
          }}
        >
          <Calendar size={18} color={colors.success} style={{ marginRight: 8 }} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}
          >
            {getDateFilterLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.success}
            colors={[colors.success]}
          />
        }
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.success} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading history data...
            </Text>
          </View>
        ) : hasError ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.error, fontSize: 16, marginBottom: 8 }}>
              Error loading data
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center" }}>
              {consumptionError?.message || telemetryError?.message || "Failed to fetch history data"}
            </Text>
            {!user?.houseId && (
              <Text style={{ color: colors.warning, marginTop: 8, fontSize: 12, textAlign: "center" }}>
                No House ID assigned. Please contact administrator.
              </Text>
            )}
          </View>
        ) : (
          <>
            {/* Consumption Chart */}
            <HistoryChartCard
              title="Energy Consumption"
              data={prepareConsumptionChartData}
              unit="kW"
              icon={TrendingUp}
              color="rgba(59, 130, 246, 1)"
              chartConfig={createChartConfig("rgba(59, 130, 246, 1)")}
            />

            {/* Voltage Chart */}
            <HistoryChartCard
              title="Voltage"
              data={prepareTelemetryChartData.voltage}
              unit="V"
              icon={Zap}
              color="rgba(34, 197, 94, 1)"
              chartConfig={createChartConfig("rgba(34, 197, 94, 1)")}
            />

            {/* Current Chart */}
            <HistoryChartCard
              title="Current"
              data={prepareTelemetryChartData.current}
              unit="A"
              icon={Activity}
              color="rgba(251, 191, 36, 1)"
              chartConfig={createChartConfig("rgba(251, 191, 36, 1)")}
            />

            {/* Battery Chart */}
            <HistoryChartCard
              title="Battery Level"
              data={prepareTelemetryChartData.battery}
              unit="%"
              icon={Battery}
              color="rgba(168, 85, 247, 1)"
              chartConfig={createChartConfig("rgba(168, 85, 247, 1)")}
            />

            {/* Summary Info */}
            {consumptionResponse?.data?.summary && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 12,
                  }}
                >
                  Summary
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Total Consumption</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
                      {consumptionResponse.data.summary.totalConsumption?.toFixed(2) || 0} kW
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Average</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
                      {consumptionResponse.data.summary.averageConsumption?.toFixed(2) || 0} kW
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Peak</Text>
                    <Text style={{ color: colors.success, fontSize: 18, fontWeight: "700" }}>
                      {consumptionResponse.data.summary.maxConsumption?.toFixed(2) || 0} kW
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: "70%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Select Date Range
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Date Options */}
            <ScrollView>
              {dateOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setDateFilter(option.value);
                    setShowFilterModal(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor:
                      dateFilter === option.value
                        ? colors.surfaceSecondary
                        : "transparent",
                    marginBottom: 8,
                    borderWidth: dateFilter === option.value ? 1 : 0,
                    borderColor: colors.success,
                  }}
                >
                  {dateFilter === option.value && (
                    <Check size={20} color={colors.success} style={{ marginRight: 12 }} />
                  )}
                  <Text
                    style={{
                      color:
                        dateFilter === option.value
                          ? colors.textPrimary
                          : colors.textSecondary,
                      fontSize: 16,
                      fontWeight: dateFilter === option.value ? "600" : "400",
                      flex: 1,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


