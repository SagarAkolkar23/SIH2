import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Pressable,
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
  Send,
  Building2,
  Users,
} from "lucide-react-native";
import TopAppBar from "../../components/controller/TopAppBar";
import { useThemeStore } from "../../store/themeStore";
import { useMicrogridsQuery } from "../../service/controller/registrationService";
import { useSendNotificationApi, useNotificationStatsQuery, useNotificationHistoryQuery } from "../../service/controller/notificationService";

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Notification composer state
  const [showComposer, setShowComposer] = useState(false);
  const [selectedMicrogridId, setSelectedMicrogridId] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  // API hooks
  const { data: microgridsData, isLoading: microgridsLoading } = useMicrogridsQuery();
  const { data: statsData, refetch: refetchStats } = useNotificationStatsQuery(selectedMicrogridId);
  const sendNotificationMutation = useSendNotificationApi();

  // Fetch notification history
  const { 
    data: historyData, 
    isLoading: historyLoading, 
    refetch: refetchHistory 
  } = useNotificationHistoryQuery(null, 1, 50);

  // Refetch history after sending notification
  useEffect(() => {
    if (sendNotificationMutation.isSuccess) {
      refetchHistory();
    }
  }, [sendNotificationMutation.isSuccess]);

  // Refetch stats when microgrid changes
  useEffect(() => {
    if (selectedMicrogridId) {
      refetchStats();
    }
  }, [selectedMicrogridId]);

  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    heading: "",
    message: "",
    type: "info",
  });

  // Map notification types to icons and colors
  const getNotificationType = (type, priority) => {
    const types = {
      maintenance: { icon: AlertTriangle, color: "#f59e0b", category: "MAINTENANCE" },
      alert: { icon: AlertTriangle, color: "#ef4444", category: "ALERT" },
      success: { icon: CheckCircle, color: "#22c55e", category: "SUCCESS" },
      warning: { icon: AlertTriangle, color: "#f59e0b", category: "WARNING" },
      info: { icon: Zap, color: "#3b82f6", category: "NOTIFICATION" },
    };

    return types[type] || types.info;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Convert API notifications to display format
  const notifications = historyData?.notifications?.map(notif => {
    const typeConfig = getNotificationType(notif.notificationType, notif.priority);
    return {
      id: notif.id,
      type: notif.notificationType,
      category: typeConfig.category,
      icon: typeConfig.icon,
      heading: notif.title,
      message: notif.message,
      date: formatDate(notif.createdAt),
      time: formatTime(notif.createdAt),
      priority: notif.priority,
      read: true, // You can add read status later if needed
      microgridName: notif.microgridName,
      stats: notif.stats,
    };
  }) || [];

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notif) => {
    const date = notif.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notif);
    return acc;
  }, {});

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

  const handleSendNotification = () => {
    if (!selectedMicrogridId || !notificationTitle || !notificationMessage) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    sendNotificationMutation.mutate(
      {
        microgridId: selectedMicrogridId,
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
      },
      {
        onSuccess: (data) => {
          Alert.alert(
            "Success",
            `Notification sent successfully to ${data.stats.usersCount} users!`,
            [
              {
                text: "OK",
                onPress: () => {
                  setShowComposer(false);
                  setSelectedMicrogridId("");
                  setNotificationTitle("");
                  setNotificationMessage("");
                },
              },
            ]
          );
        },
        onError: (error) => {
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Failed to send notification"
          );
        },
      }
    );
  };

  const NotificationCard = ({ item }) => {
    const theme = getTheme(item.type);
    const Icon = item.icon;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedNotif(item)}
        style={{
          backgroundColor: colors.surface,
          marginBottom: 14,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
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
                backgroundColor: colors.success,
              }}
            />
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 42,
              height: 42,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Icon size={20} color={theme.main} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}
              numberOfLines={1}
            >
              {item.heading}
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>

          <ChevronRight
            size={16}
            color={colors.textTertiary}
            style={{ alignSelf: "center" }}
          />
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderColor: colors.border,
            marginTop: 10,
            paddingTop: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            {item.date} • {item.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

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
        {historyLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.success} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Send size={48} color={colors.textTertiary} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No notifications sent yet
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Send your first notification using the button below
            </Text>
          </View>
        ) : (
          Object.keys(groupedNotifications).map((date) => (
            <View key={date}>
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 12,
                  fontWeight: "bold",
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                {date.toUpperCase()}
              </Text>
              {groupedNotifications[date].map((item) => (
                <NotificationCard key={item.id} item={item} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB - Send Push Notification */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowComposer(true)}
        style={{
          position: "absolute",
          right: 22,
          bottom: Platform.OS === "android" ? 26 : 40,
          width: 58,
          height: 58,
          borderRadius: 50,
          backgroundColor: colors.success,
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
      >
        <Send size={28} color="#fff" />
      </TouchableOpacity>

      {/* NOTIFICATION COMPOSER MODAL */}
      <Modal
        visible={showComposer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComposer(false)}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setShowComposer(false)}
          />

          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "90%",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "800",
                }}
              >
                Send Push Notification
              </Text>
              <TouchableOpacity
                onPress={() => setShowComposer(false)}
                style={{ padding: 4 }}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Microgrid Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Select Area (Microgrid) *
                </Text>
                {microgridsLoading ? (
                  <View
                    style={{
                      padding: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color={colors.success} />
                    <Text
                      style={{
                        color: colors.textTertiary,
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      Loading microgrids...
                    </Text>
                  </View>
                ) : microgridsData?.microgrids && microgridsData.microgrids.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                  >
                    {microgridsData.microgrids.map((mg) => (
                      <TouchableOpacity
                        key={mg.id}
                        onPress={() => setSelectedMicrogridId(mg.id)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          marginRight: 8,
                          backgroundColor:
                            selectedMicrogridId === mg.id
                              ? colors.success
                              : colors.surfaceSecondary,
                          borderWidth: 1,
                          borderColor:
                            selectedMicrogridId === mg.id
                              ? colors.success
                              : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              selectedMicrogridId === mg.id
                                ? "#fff"
                                : colors.textPrimary,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {mg.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    No microgrids available
                  </Text>
                )}

                {/* Stats Preview */}
                {statsData && selectedMicrogridId && (
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
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Users size={16} color={colors.success} />
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: "600",
                          marginLeft: 8,
                        }}
                      >
                        Recipients Preview
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        marginLeft: 24,
                      }}
                    >
                      {statsData.stats.housesCount} houses •{" "}
                      {statsData.stats.usersWithTokens} users will receive this
                      notification
                    </Text>
                    {statsData.stats.usersWithoutTokens > 0 && (
                      <Text
                        style={{
                          color: colors.warning,
                          fontSize: 10,
                          marginLeft: 24,
                          marginTop: 4,
                        }}
                      >
                        ⚠️ {statsData.stats.usersWithoutTokens} users don't have
                        push notifications enabled
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Title Input */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Notification Title *
                </Text>
                <TextInput
                  placeholder="e.g., Maintenance Notice, Power Outage Alert"
                  placeholderTextColor={colors.textTertiary}
                  value={notificationTitle}
                  onChangeText={setNotificationTitle}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: colors.textPrimary,
                    fontSize: 14,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                  maxLength={100}
                />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {notificationTitle.length}/100
                </Text>
              </View>

              {/* Message Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Message *
                </Text>
                <TextInput
                  placeholder="Enter your notification message..."
                  placeholderTextColor={colors.textTertiary}
                  value={notificationMessage}
                  onChangeText={setNotificationMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: colors.textPrimary,
                    fontSize: 14,
                    backgroundColor: colors.surfaceSecondary,
                    minHeight: 120,
                  }}
                  maxLength={500}
                />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {notificationMessage.length}/500
                </Text>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendNotification}
                disabled={
                  sendNotificationMutation.isPending ||
                  !selectedMicrogridId ||
                  !notificationTitle ||
                  !notificationMessage
                }
                style={{
                  backgroundColor:
                    sendNotificationMutation.isPending ||
                    !selectedMicrogridId ||
                    !notificationTitle ||
                    !notificationMessage
                      ? colors.textTertiary
                      : colors.success,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
                activeOpacity={0.7}
              >
                {sendNotificationMutation.isPending && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
                <Send size={18} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {sendNotificationMutation.isPending
                    ? "Sending..."
                    : "Send Notification"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
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
                    color: colors.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  {selectedNotif.heading}
                </Text>
                <TouchableOpacity onPress={() => setSelectedNotif(null)}>
                  <X size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
                {selectedNotif.date} — {selectedNotif.time}
              </Text>

              <Text style={{ color: colors.textPrimary, lineHeight: 22 }}>
                {selectedNotif.message}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectedNotif(null)}
                style={{
                  backgroundColor: colors.success,
                  padding: 14,
                  borderRadius: 14,
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#fff",
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
