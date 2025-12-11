// src/screens/controller/Panels.jsx
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Sun, RefreshCw, ChevronLeft, ChevronRight, Calendar, ArrowUpDown } from "lucide-react-native";
import TopAppBar from "../../components/controller/TopAppBar";
import FilterModal from "../../components/controller/history/FilterModal";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { useAllGenerationData } from "../../service/controller/historyService";
import { useLiveTelemetry } from "../../service/controller/telemetryService";

const ITEMS_PER_PAGE = 10;

export default function Panels() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [dateFilter, setDateFilter] = useState(null); // null = show most recent 10
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByEfficiency, setSortByEfficiency] = useState(false); // false = no sort, true = sort by efficiency
  const [efficiencySortOrder, setEfficiencySortOrder] = useState('desc'); // 'asc' = increasing, 'desc' = decreasing
  
  // Get gridId from user (controller's assigned grid)
  const gridIdRaw = user?.gridId;
  const gridId = gridIdRaw 
    ? (typeof gridIdRaw === 'object' && gridIdRaw._id 
        ? String(gridIdRaw._id) 
        : String(gridIdRaw))
    : null;

  // Get deviceId/location from latest telemetry
  const { data: telemetryResponse } = useLiveTelemetry({ 
    deviceId: gridId || undefined,
    enabled: !!gridId,
    refetchInterval: false // Just get it once for the deviceId/location
  });
  
  const deviceId = telemetryResponse?.data?.generation?.deviceId;
  const location = telemetryResponse?.data?.generation?.location;

  // Calculate date range from filter
  // If no filter, fetch last 24 hours to get recent data (will be limited to 10 rows client-side)
  const getDateRange = useMemo(() => {
    const now = new Date();
    let startDate = null;
    let endDate = now.toISOString();

    if (!dateFilter) {
      // Default: last 24 hours for most recent data
      startDate = new Date(now);
      startDate.setHours(startDate.getHours() - 24);
      return {
        start: startDate.toISOString(),
        end: endDate
      };
    }

    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "last30days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        break;
      case "last3months":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        // Fallback to last 24 hours
        startDate = new Date(now);
        startDate.setHours(startDate.getHours() - 24);
    }

    return {
      start: startDate ? startDate.toISOString() : null,
      end: endDate
    };
  }, [dateFilter]);

  // Fetch all generation data with panels
  const { 
    data: generationDataResponse, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useAllGenerationData({
    deviceId: deviceId || null,
    location: location || null,
    start: getDateRange.start,
    end: getDateRange.end,
    enabled: !!(deviceId || location)
  });

  // Group panel data by timestamp (one row per timestamp with all panels)
  const panelData = useMemo(() => {
    if (!generationDataResponse?.data?.generation) return [];
    
    const groupedByTimestamp = new Map();
    const generationRecords = Array.isArray(generationDataResponse.data.generation) 
      ? generationDataResponse.data.generation 
      : [];

    generationRecords.forEach(record => {
      if (record.panels && Array.isArray(record.panels)) {
        const timestamp = new Date(record.timestamp).getTime();
        
        if (!groupedByTimestamp.has(timestamp)) {
          groupedByTimestamp.set(timestamp, {
            timestamp: record.timestamp,
            date: new Date(record.timestamp).toLocaleDateString(),
            time: new Date(record.timestamp).toLocaleTimeString(),
            recordId: record._id,
            deviceId: record.deviceId,
            location: record.location,
            panels: {}
          });
        }
        
        const groupedRecord = groupedByTimestamp.get(timestamp);
        
        // Organize panels by panelId (normalize to uppercase for consistency)
        record.panels.forEach(panel => {
          const panelId = panel.panelId ? String(panel.panelId).toUpperCase() : null;
          // Only include panels that match our expected format
          if (panelId && (panelId.startsWith('PANEL-') || panelId === 'PANEL-TOTAL')) {
            groupedRecord.panels[panelId] = {
              voltage: panel.voltage || 0,
              current: panel.current || 0,
              generation: panel.generation || 0,
              ratio: panel.ratio !== null && panel.ratio !== undefined ? panel.ratio : null
            };
          }
        });
      }
    });

    // Convert map to array and sort by timestamp descending (newest first)
    return Array.from(groupedByTimestamp.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [generationDataResponse]);

  // Calculate efficiency for sorting (based on Panel-TOTAL efficiency)
  const INDIVIDUAL_PANEL_CAPACITY = 18;
  const TOTAL_PANEL_CAPACITY = 36;
  
  const calculateEfficiencyForSort = (record) => {
    const panelTotal = record.panels['PANEL-TOTAL'] || null;
    if (!panelTotal || !panelTotal.voltage || panelTotal.voltage <= 0) return 0;
    const efficiency = (panelTotal.voltage / TOTAL_PANEL_CAPACITY) * 100;
    return Math.min(efficiency, 100);
  };

  // Filter and sort panels
  const filteredPanels = useMemo(() => {
    let filtered = panelData;
    
    // If no date filter, show only most recent 10 rows (before sorting)
    if (!dateFilter) {
      filtered = panelData.slice(0, ITEMS_PER_PAGE);
    }
    
    // Sort by efficiency if enabled
    if (sortByEfficiency) {
      filtered = [...filtered].sort((a, b) => {
        const efficiencyA = calculateEfficiencyForSort(a);
        const efficiencyB = calculateEfficiencyForSort(b);
        if (efficiencySortOrder === 'asc') {
          return efficiencyA - efficiencyB; // Increasing
        } else {
          return efficiencyB - efficiencyA; // Decreasing
        }
      });
    }
    
    return filtered;
  }, [panelData, dateFilter, sortByEfficiency, efficiencySortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPanels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = filteredPanels.slice(startIndex, endIndex);

  // Reset to page 1 when filter or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, filteredPanels.length, sortByEfficiency, efficiencySortOrder]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterApply = (selectedDate, selectedArea) => {
    setDateFilter(selectedDate);
    setShowFilterModal(false);
  };

  const getDateFilterLabel = () => {
    if (!dateFilter) return "Most Recent 10";
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopAppBar title="Panels" />
      
      {/* Date Filter Bar */}
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

        {/* Efficiency Sort Button */}
        <TouchableOpacity
          onPress={() => {
            if (!sortByEfficiency) {
              setSortByEfficiency(true);
              setEfficiencySortOrder('desc'); // Default to decreasing
            } else if (efficiencySortOrder === 'desc') {
              setEfficiencySortOrder('asc'); // Switch to increasing
            } else {
              setSortByEfficiency(false); // Disable sort
            }
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: sortByEfficiency ? colors.success : colors.surfaceSecondary,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: sortByEfficiency ? colors.success : colors.border,
            marginRight: 12,
          }}
        >
          <ArrowUpDown 
            size={18} 
            color={sortByEfficiency ? '#fff' : colors.success} 
            style={{ marginRight: 6 }} 
          />
          <Text
            style={{
              color: sortByEfficiency ? '#fff' : colors.textPrimary,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {sortByEfficiency 
              ? (efficiencySortOrder === 'desc' ? 'Eff. ↓' : 'Eff. ↑')
              : 'Sort Eff.'
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefetching}
          style={{
            backgroundColor: colors.surfaceSecondary,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <RefreshCw 
            size={20} 
            color={colors.success} 
            style={{ transform: [{ rotate: isRefetching ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
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
              Loading panel data...
            </Text>
          </View>
        ) : error ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.error, fontSize: 16, marginBottom: 8 }}>
              Error loading data
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center" }}>
              {error?.message || "Failed to fetch panel data"}
            </Text>
            {(!deviceId && !location) && (
              <Text style={{ color: colors.warning, marginTop: 8, fontSize: 12, textAlign: "center" }}>
                No device or location information available
              </Text>
            )}
          </View>
        ) : currentPageData.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Sun size={48} color={colors.textTertiary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 16 }}>
              No panel data available
            </Text>
            <Text style={{ color: colors.textTertiary, marginTop: 8, fontSize: 14, textAlign: "center" }}>
              {dateFilter 
                ? "No data found for the selected date range"
                : "No recent panel data available"}
            </Text>
          </View>
        ) : (
          <>
            {/* Table Container - Scrollable horizontally on mobile */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={{ marginBottom: 16 }}
            >
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  minWidth: Platform.OS === 'web' ? '100%' : 700, // Minimum width for table (2 columns per panel: Voltage + Efficiency)
                }}
              >
                {/* Table Header */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: colors.surfaceSecondary,
                    borderBottomWidth: 2,
                    borderBottomColor: colors.border,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={[styles.headerText, { width: 140, color: colors.textPrimary }]}>
                    Timestamp
                  </Text>
                  
                  {/* Panel-1 Columns */}
                  <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8 }}>
                    <Text style={[styles.headerText, { color: colors.textPrimary, marginBottom: 4 }]}>
                      Panel-1
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Voltage (V)
                      </Text>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Efficiency (%)
                      </Text>
                    </View>
                  </View>
                  
                  {/* Panel-2 Columns */}
                  <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8 }}>
                    <Text style={[styles.headerText, { color: colors.textPrimary, marginBottom: 4 }]}>
                      Panel-2
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Voltage (V)
                      </Text>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Efficiency (%)
                      </Text>
                    </View>
                  </View>
                  
                  {/* Panel-TOTAL Columns */}
                  <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8 }}>
                    <Text style={[styles.headerText, { color: colors.textPrimary, marginBottom: 4 }]}>
                      Panel-TOTAL
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Voltage (V)
                      </Text>
                      <Text style={[styles.headerText, { flex: 1, fontSize: 10, color: colors.textTertiary }]}>
                        Efficiency (%)
                      </Text>
                    </View>
                  </View>
                </View>

              {/* Table Rows */}
              {currentPageData.map((record, index) => {
                // Panel IDs are normalized to uppercase in data processing
                const panel1 = record.panels['PANEL-1'] || null;
                const panel2 = record.panels['PANEL-2'] || null;
                const panelTotal = record.panels['PANEL-TOTAL'] || null;
                
                // Calculate efficiency based on panel type
                // Individual panels: 18V capacity, Panel-TOTAL: 36V capacity
                const INDIVIDUAL_PANEL_CAPACITY = 15; // 18V per individual panel
                const TOTAL_PANEL_CAPACITY = 30; // 36V for Panel-TOTAL (sum of 2 panels)
                
                const calculateEfficiency = (voltage, isTotalPanel = false) => {
                  if (!voltage || voltage <= 0) return 0;
                  const capacity = isTotalPanel ? TOTAL_PANEL_CAPACITY : INDIVIDUAL_PANEL_CAPACITY;
                  const efficiency = (voltage / capacity) * 100;
                  return Math.min(efficiency, 100); // Cap at 100%
                };
                
                // Get efficiency color based on efficiency percentage
                const getEfficiencyColor = (efficiency) => {
                  if (efficiency > 90) {
                    return '#22c55e'; // Green
                  } else if (efficiency < 30) {
                    return '#fca5a5'; // Light red
                  } else {
                    return '#fbbf24'; // Yellow 
                  }
                };
                
                const renderPanelData = (panel, isTotalPanel = false) => {
                  if (!panel) {
                    return (
                      <>
                        <Text style={[styles.cellText, { flex: 1, color: colors.textTertiary }]}>-</Text>
                        <Text style={[styles.cellText, { flex: 1, color: colors.textTertiary }]}>-</Text>
                      </>
                    );
                  }
                  
                  const voltage = panel.voltage || 0;
                  const efficiency = calculateEfficiency(voltage, isTotalPanel);
                  const efficiencyColor = getEfficiencyColor(efficiency);
                  
                  return (
                    <>
                      <Text style={[styles.cellText, { flex: 1, color: colors.textPrimary }]}>
                        {voltage.toFixed(2)}
                      </Text>
                      <View style={{ 
                        flex: 1, 
                        backgroundColor: efficiencyColor, 
                        paddingVertical: 4, 
                        paddingHorizontal: 8, 
                        borderRadius: 4,
                        alignItems: 'center',
                      }}>
                        <Text style={[styles.cellText, { color: '#000', fontWeight: '600' }]}>
                          {efficiency.toFixed(1)}%
                        </Text>
                      </View>
                    </>
                  );
                };
                
                return (
                  <View
                    key={`${record.recordId}-${index}`}
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: index < currentPageData.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceSecondary,
                    }}
                  >
                    {/* Timestamp */}
                    <View style={{ width: 140 }}>
                      <Text style={[styles.cellText, { color: colors.textPrimary }]}>
                        {record.date}
                      </Text>
                      <Text style={[styles.cellText, { color: colors.textTertiary, fontSize: 11 }]}>
                        {record.time}
                      </Text>
                    </View>
                    
                    {/* Panel-1 Data */}
                    <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8, flexDirection: "row" }}>
                      {renderPanelData(panel1, false)}
                    </View>
                    
                    {/* Panel-2 Data */}
                    <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8, flexDirection: "row" }}>
                      {renderPanelData(panel2, false)}
                    </View>
                    
                    {/* Panel-TOTAL Data */}
                    <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 8, flexDirection: "row" }}>
                      {renderPanelData(panelTotal, true)}
                    </View>
                  </View>
                );
              })}
              </View>
            </ScrollView>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <TouchableOpacity
                  onPress={handlePreviousPage}
                  disabled={currentPage === 1}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: currentPage === 1 
                      ? colors.surfaceSecondary 
                      : colors.success,
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft 
                    size={18} 
                    color={currentPage === 1 ? colors.textTertiary : "#fff"} 
                  />
                  <Text
                    style={{
                      color: currentPage === 1 ? colors.textTertiary : "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                      marginLeft: 4,
                    }}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: currentPage === totalPages 
                      ? colors.surfaceSecondary 
                      : colors.success,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: currentPage === totalPages ? colors.textTertiary : "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                      marginRight: 4,
                    }}
                  >
                    Next
                  </Text>
                  <ChevronRight 
                    size={18} 
                    color={currentPage === totalPages ? colors.textTertiary : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Info Text */}
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Showing {currentPageData.length} of {filteredPanels.length} timestamp records
                {dateFilter ? ` (Filtered: ${getDateFilterLabel()})` : " (Most Recent 10)"}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        currentDateFilter={dateFilter || "last7days"}
        currentAreaFilter="all"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 13,
    fontWeight: "400",
  },
});

