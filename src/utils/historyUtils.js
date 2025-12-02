// src/utils/historyUtils.js

/**
 * Generate mock historical data for the solar microgrid
 * @param {number} days - Number of days of historical data to generate
 * @returns {Array} Array of data points
 */
export const generateHistoricalData = (days = 90) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate data every 2 hours
    for (let hour = 0; hour < 24; hour += 2) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);

      // Solar generation peaks during day (6 AM to 6 PM)
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

/**
 * Filter data based on date range
 * @param {Array} data - Array of data points
 * @param {string} dateFilter - Date filter type
 * @returns {Array} Filtered data
 */
export const filterDataByDate = (data, dateFilter) => {
  const now = new Date();
  let filtered = [...data];

  switch (dateFilter) {
    case "today":
      filtered = data.filter((d) => {
        const itemDate = new Date(d.timestamp);
        return itemDate.toDateString() === now.toDateString();
      });
      break;

    case "last7days":
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = data.filter((d) => d.timestamp >= sevenDaysAgo);
      break;

    case "last30days":
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = data.filter((d) => d.timestamp >= thirtyDaysAgo);
      break;

    case "thisMonth":
      filtered = data.filter((d) => {
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
      filtered = data.filter((d) => {
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
      filtered = data.filter((d) => d.timestamp >= threeMonthsAgo);
      break;

    default:
      break;
  }

  return filtered;
};

/**
 * Filter data based on area
 * @param {Array} data - Array of data points
 * @param {string} areaFilter - Area filter value
 * @returns {Array} Filtered data
 */
export const filterDataByArea = (data, areaFilter) => {
  if (areaFilter === "all") {
    return data;
  }
  return data.filter((d) => d.area === areaFilter);
};

/**
 * Prepare chart data from filtered data
 * @param {Array} data - Filtered data array
 * @param {string} dataKey - Key to extract (voltage, current, etc.)
 * @param {number} maxPoints - Maximum number of data points to show
 * @returns {Object} Object with labels and data arrays
 */
export const prepareChartData = (data, dataKey, maxPoints = 10) => {
  const groupedData = {};

  // Group data by date and calculate averages
  data.forEach((item) => {
    const dateKey = item.timestamp.toLocaleDateString();
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { sum: 0, count: 0 };
    }
    groupedData[dateKey].sum += item[dataKey];
    groupedData[dateKey].count += 1;
  });

  // Sort by date
  const sortedKeys = Object.keys(groupedData).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Reduce to maxPoints
  const step = Math.ceil(sortedKeys.length / maxPoints);
  const labels = sortedKeys.filter((_, i) => i % step === 0).slice(-maxPoints);
  const chartData = labels.map(
    (label) => groupedData[label].sum / groupedData[label].count
  );

  return { labels, data: chartData };
};

/**
 * Get human-readable label for date filter
 * @param {string} dateFilter - Date filter value
 * @returns {string} Human-readable label
 */
export const getDateFilterLabel = (dateFilter) => {
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

/**
 * Get human-readable label for area filter
 * @param {string} areaFilter - Area filter value
 * @returns {string} Human-readable label
 */
export const getAreaFilterLabel = (areaFilter) => {
  if (areaFilter === "all") return "All Areas";
  return areaFilter;
};

/**
 * Generate Excel-compatible data structure
 * @param {Array} data - Filtered data array
 * @returns {Array} Array of objects ready for Excel export
 */
export const generateExcelData = (data) => {
  return data.map((item) => ({
    Timestamp: item.timestamp.toLocaleString(),
    "Voltage (V)": item.voltage.toFixed(2),
    "Current (A)": item.current.toFixed(2),
    "Power (kW)": item.power.toFixed(2),
    "Solar Input (W)": item.solarInput.toFixed(2),
    "Battery (%)": item.battery.toFixed(2),
    Area: item.area,
  }));
};

/**
 * Create base chart configuration
 * @param {string} color - RGBA color string
 * @returns {Object} Chart configuration object
 */
export const createChartConfig = (color) => {
  // Extract RGB values from RGBA string
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const strokeColor = rgbMatch
    ? `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`
    : color;

  return {
    backgroundColor: "#1a1a1a",
    backgroundGradientFrom: "#1a1a1a",
    backgroundGradientTo: "#0a0a0a",
    decimalPlaces: 1,
    color: (opacity = 1) => color.replace(/[\d.]+\)$/, `${opacity})`),
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: strokeColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#333",
      strokeWidth: 1,
    },
  };
};
