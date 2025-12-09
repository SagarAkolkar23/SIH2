# Telemetry Service Usage Guide

Complete guide for using the telemetry service to fetch live ESP32 data every 3.4 seconds.

---

## 📦 Service File

**Location:** `src/service/controller/telemetryService.jsx`

**Main Hook:** `useLiveTelemetry()` - Polls every 3.4 seconds automatically

---

## 🚀 Quick Start

### Basic Usage

```jsx
import { useLiveTelemetry } from '../../service/controller/telemetryService';

function Dashboard() {
  // Polls every 3.4 seconds automatically
  const { data, isLoading, error } = useLiveTelemetry({ 
    deviceId: 'ESP32_001' 
  });

  // Access telemetry data
  const telemetry = data?.data?.generation;
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      <Text>Voltage: {telemetry?.incomingVoltage}V</Text>
      <Text>Generation: {telemetry?.generation}kW</Text>
      <Text>Battery: {telemetry?.batteryPercentage}%</Text>
      <Text>Temperature: {telemetry?.temperature}°C</Text>
    </View>
  );
}
```

---

## 📊 Data Structure

The telemetry data returned from the API has this structure:

```javascript
{
  success: true,
  message: "Latest generation data retrieved successfully",
  data: {
    generation: {
      _id: "generation_id",
      deviceId: "ESP32_001",
      location: "Grid_A",
      timestamp: "2024-01-15T10:30:00.000Z",
      generation: 2.5,              // kW
      incomingVoltage: 230,         // Volts
      temperature: 41,              // Celsius
      batteryPercentage: 62,        // 0-100
      consumption: 1.8,             // kW
      inverterStatus: "ON",         // ON/OFF/FAULT/STANDBY
      coolingStatus: true,          // Boolean
      rawPayload: {}                // Additional sensor data
    }
  }
}
```

---

## 🎯 Usage Examples

### Example 1: Using deviceId

```jsx
import { useLiveTelemetry } from '../../service/controller/telemetryService';

function Dashboard() {
  const { data, isLoading, error } = useLiveTelemetry({ 
    deviceId: 'ESP32_001' 
  });

  const telemetry = data?.data?.generation;
  
  return (
    <View>
      <Text>Device: {telemetry?.deviceId}</Text>
      <Text>Voltage: {telemetry?.incomingVoltage}V</Text>
      <Text>Status: {telemetry?.inverterStatus}</Text>
    </View>
  );
}
```

### Example 2: Using location

```jsx
const { data, isLoading, error } = useLiveTelemetry({ 
  location: 'Grid_A' 
});
```

### Example 3: Conditional polling

```jsx
const [enablePolling, setEnablePolling] = useState(true);

const { data } = useLiveTelemetry({ 
  deviceId: 'ESP32_001',
  enabled: enablePolling // Can disable/enable polling dynamically
});
```

### Example 4: Custom polling interval

```jsx
// Poll every 5 seconds instead of 3.4 seconds
const { data } = useLiveTelemetry({ 
  deviceId: 'ESP32_001',
  refetchInterval: 5000 
});
```

---

## 🔄 Integration with Dashboard

### Replace Dummy Data with Real Telemetry

**Before (Dummy Data):**
```jsx
const [data, setData] = useState({
  voltage: 230,
  current: 11.8,
  battery: 62,
  temp: 41,
  // ...
});

useEffect(() => {
  const interval = setInterval(() => {
    setData((prev) => ({
      voltage: 220 + Math.floor(Math.random() * 25),
      // ...
    }));
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

**After (Real Telemetry):**
```jsx
import { useLiveTelemetry } from '../../service/controller/telemetryService';

function Dashboard() {
  // Automatically polls every 3.4 seconds
  const { data: telemetryResponse, isLoading, error } = useLiveTelemetry({ 
    deviceId: 'ESP32_001', // Or use location: 'Grid_A'
    enabled: true
  });

  const telemetry = telemetryResponse?.data?.generation;

  // Use telemetry data
  const voltage = telemetry?.incomingVoltage ?? 0;
  const battery = telemetry?.batteryPercentage ?? 0;
  const temp = telemetry?.temperature ?? 0;
  const generation = telemetry?.generation ?? 0;
  const consumption = telemetry?.consumption ?? 0;
  const inverterStatus = telemetry?.inverterStatus ?? 'OFF';

  // Calculate current from voltage and generation (if needed)
  const current = voltage > 0 ? (generation * 1000) / voltage : 0;

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading telemetry: {error.message}</Text>;
  }

  return (
    <View>
      <IndustrialGauge value={voltage} label="Grid Voltage" unit="V" />
      <IndustrialBattery percentage={battery} />
      {/* ... rest of dashboard */}
    </View>
  );
}
```

---

## 📝 Complete Dashboard Integration Example

```jsx
import React from "react";
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useLiveTelemetry } from "../../service/controller/telemetryService";
import IndustrialGauge from "../../components/controller/dashboard/industrialGauge";
import IndustrialBattery from "../../components/controller/dashboard/IndustrialBattery";

export default function Dashboard() {
  // Poll telemetry every 3.4 seconds
  const { 
    data: telemetryResponse, 
    isLoading, 
    error,
    isFetching // True when refetching in background
  } = useLiveTelemetry({ 
    deviceId: 'ESP32_001', // Replace with your device ID
    enabled: true
  });

  const telemetry = telemetryResponse?.data?.generation;

  // Extract telemetry values with fallbacks
  const voltage = telemetry?.incomingVoltage ?? 0;
  const generation = telemetry?.generation ?? 0; // kW
  const battery = telemetry?.batteryPercentage ?? 0;
  const temp = telemetry?.temperature ?? 0;
  const consumption = telemetry?.consumption ?? 0;
  const inverterStatus = telemetry?.inverterStatus ?? 'OFF';
  const coolingStatus = telemetry?.coolingStatus ?? false;
  
  // Calculate current (A) from power and voltage
  const current = voltage > 0 ? (generation * 1000) / voltage : 0;
  
  // Calculate solar input (W) - generation in kW * 1000
  const solarInput = generation * 1000;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading telemetry data...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
        <Text>Check your device ID and network connection</Text>
      </SafeAreaView>
    );
  }

  // System status logic
  const systemStatus = (() => {
    if (!telemetry) return "UNKNOWN";
    if (voltage < 200 || voltage > 250) return "FAULT";
    if (temp >= 50) return "OVERHEAT";
    if (battery < 20) return "LOW BATTERY";
    if (inverterStatus === 'FAULT') return "FAULT";
    return "OPERATIONAL";
  })();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        {/* Show fetching indicator when polling in background */}
        {isFetching && (
          <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 12 }}>Updating...</Text>
          </View>
        )}

        {/* Voltage Gauge */}
        <IndustrialGauge
          value={voltage}
          max={260}
          label="Grid Voltage"
          unit="V"
          lowWarning={200}
          highWarning={250}
          greenZoneStart={220}
          greenZoneEnd={240}
        />

        {/* Battery */}
        <IndustrialBattery percentage={battery} />

        {/* Generation Display */}
        <View>
          <Text>Generation: {generation.toFixed(2)} kW</Text>
          <Text>Consumption: {consumption.toFixed(2)} kW</Text>
          <Text>Current: {current.toFixed(2)} A</Text>
          <Text>Temperature: {temp}°C</Text>
          <Text>Inverter: {inverterStatus}</Text>
          <Text>Cooling: {coolingStatus ? 'ON' : 'OFF'}</Text>
          <Text>Last Updated: {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : 'N/A'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## 🔧 Hook Parameters

### `useLiveTelemetry(options)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `deviceId` | string | - | Device ID from ESP32 |
| `location` | string | - | Location identifier |
| `enabled` | boolean | `true` | Enable/disable polling |
| `refetchInterval` | number | `3400` | Polling interval in ms (3.4 seconds) |

**Note:** You must provide either `deviceId` OR `location` (or both).

---

## 📊 Return Values

The hook returns a React Query object with:

| Property | Type | Description |
|----------|------|-------------|
| `data` | object | API response with telemetry data |
| `isLoading` | boolean | True on initial load |
| `isFetching` | boolean | True when fetching (including background polls) |
| `error` | Error | Error object if request failed |
| `refetch` | function | Manually trigger a refetch |
| `status` | string | 'loading' | 'error' | 'success' |

---

## 🎛️ Advanced Usage

### Manual Refetch

```jsx
const { data, refetch } = useLiveTelemetry({ deviceId: 'ESP32_001' });

// Manually trigger a fetch
const handleRefresh = () => {
  refetch();
};
```

### Multiple Devices

```jsx
// Fetch from multiple devices
const device1 = useLiveTelemetry({ deviceId: 'ESP32_001' });
const device2 = useLiveTelemetry({ deviceId: 'ESP32_002' });
const device3 = useLiveTelemetry({ location: 'Grid_A' });
```

### Conditional Polling

```jsx
const [isActive, setIsActive] = useState(true);

const { data } = useLiveTelemetry({ 
  deviceId: 'ESP32_001',
  enabled: isActive // Stop polling when inactive
});
```

---

## 🔄 Polling Behavior

- **Automatic:** Polls every 3.4 seconds when `enabled: true`
- **Background:** Continues polling when app is in background
- **Stale Time:** 0ms (always fetches fresh data)
- **Retry:** 2 retries on failure
- **Cache:** Data kept in cache for 10 seconds

---

## ⚠️ Error Handling

```jsx
const { data, error, isLoading } = useLiveTelemetry({ deviceId: 'ESP32_001' });

if (error) {
  // Handle different error types
  if (error.response?.status === 404) {
    console.log('Device not found');
  } else if (error.response?.status === 401) {
    console.log('Authentication failed');
  } else {
    console.log('Network error:', error.message);
  }
}
```

---

## 📱 ESP32 Post Request

Your ESP32 should POST to:

```
POST http://YOUR_SERVER_IP:5000/api/generation/telemetry
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "location": "Grid_A",
  "generation": 2.5,
  "incomingVoltage": 230,
  "temperature": 41,
  "batteryPercentage": 62,
  "consumption": 1.8,
  "inverterStatus": "ON",
  "coolingStatus": true,
  "rawPayload": {}
}
```

---

## ✅ Checklist

- [x] Telemetry service created with 3.4 second polling
- [x] Supports deviceId and location parameters
- [x] Automatic background polling
- [x] Error handling and retry logic
- [x] Ready to integrate with dashboard

---

**The service is ready to use! Just import `useLiveTelemetry` and start fetching live data every 3.4 seconds.** 🚀
