import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  ChevronRight,
} from "lucide-react-native";
import TopAppBar from "../components/TopAppBar";

export default function NotificationsScreen() {
  const [showForm, setShowForm] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    heading: "",
    message: "",
    type: "info",
  });

  const notifications = [
    {
      id: 1,
      type: "maintenance",
      category: "SYSTEM ALERT",
      icon: AlertTriangle,
      heading: "Scheduled Maintenance",
      message:
        "Battery bank servicing scheduled. Diesel generator backup available during the downtime.",
      date: "2024-12-05",
      time: "09:00 AM",
      priority: "high",
      read: false,
    },
    {
      id: 2,
      type: "success",
      category: "OPTIMIZATION",
      icon: CheckCircle,
      heading: "Panel Cleaning Complete",
      message: "Efficiency boost of 15–20% detected across Array B.",
      date: "2024-12-02",
      time: "02:30 PM",
      priority: "normal",
      read: true,
    },
    {
      id: 3,
      type: "power",
      category: "GRID EVENT",
      icon: Zap,
      heading: "Voltage Spike Detected",
      message:
        "Minor surge detected on Input Line 3. Surge protectors engaged.",
      date: "2024-12-01",
      time: "11:15 AM",
      priority: "medium",
      read: true,
    },
  ];

  const getTheme = (type) => {
    switch (type) {
      case "maintenance":
        return { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
      case "success":
        return { main: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
      case "power":
        return { main: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
      default:
        return { main: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" };
    }
  };

  const handleSubmit = () => {
    if (!formData.heading || !formData.message) return;
    console.log("Posted:", formData);
    setShowForm(false);
  };

  const NotificationCard = ({ item }) => {
    const theme = getTheme(item.type);
    const Icon = item.icon;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedNotif(item)}
        style={{
          backgroundColor: "#121212",
          marginBottom: 14,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#27272a",
          borderLeftWidth: 4,
          borderLeftColor: theme.main,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              backgroundColor: theme.bg,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{ fontSize: 10, fontWeight: "bold", color: theme.main }}
            >
              {item.category}
            </Text>
          </View>
          {!item.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: "#22c55e",
              }}
            />
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 42,
              height: 42,
              backgroundColor: "#18181b",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#333",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Icon size={20} color={theme.main} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "600" }}
              numberOfLines={1}
            >
              {item.heading}
            </Text>
            <Text
              style={{ color: "#9ca3af", fontSize: 13, marginTop: 3 }}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>

          <ChevronRight
            size={16}
            color="#555"
            style={{ alignSelf: "center" }}
          />
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#1f1f22",
            marginTop: 10,
            paddingTop: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: "#6b7280" }}>
            {item.date} • {item.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <StatusBar barStyle="light-content" />

      {/* FIXED APP BAR */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: Platform.OS === "android" ? 8 : 0,
        }}
      >
        <TopAppBar title="Notifications" />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text
          style={{
            color: "#6b7280",
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          TODAY
        </Text>
        {notifications.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowForm(true)}
        style={{
          position: "absolute",
          right: 22,
          bottom: Platform.OS === "android" ? 26 : 40,
          width: 58,
          height: 58,
          borderRadius: 50,
          backgroundColor: "#22c55e",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
        }}
      >
        <Plus size={28} color="black" />
      </TouchableOpacity>

      {/* DETAIL MODAL */}
      {selectedNotif && (
        <Modal transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#121212",
                padding: 20,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#444",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: 12,
                  }}
                >
                  {selectedNotif.heading}
                </Text>
                <TouchableOpacity onPress={() => setSelectedNotif(null)}>
                  <X size={22} color="white" />
                </TouchableOpacity>
              </View>

              <Text style={{ color: "#9ca3af", marginBottom: 12 }}>
                {selectedNotif.date} — {selectedNotif.time}
              </Text>

              <Text style={{ color: "#d1d5db", lineHeight: 22 }}>
                {selectedNotif.message}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectedNotif(null)}
                style={{
                  backgroundColor: "#22c55e",
                  padding: 14,
                  borderRadius: 14,
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* PICKERS */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) setFormData({ ...formData, date: d });
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          onChange={(e, t) => {
            setShowTimePicker(false);
            if (t) setFormData({ ...formData, time: t });
          }}
        />
      )}
    </SafeAreaView>
  );
}
