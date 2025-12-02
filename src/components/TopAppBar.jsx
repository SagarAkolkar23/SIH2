// src/components/common/TopAppBar.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Menu, Bell, Settings, Power } from "lucide-react-native";

const TopAppBar = ({
  title = "Solar Controller",
  onMenuPress,
  onNotificationPress,
  onSettingsPress,
  showNotifications = true,
  showSettings = true,
  showMenu = true,
  systemStatus = "OPERATIONAL",
  notificationCount = 0,
}) => {
  const statusColor =
    systemStatus === "OPERATIONAL"
      ? "#22c55e"
      : systemStatus === "LOW BATTERY"
      ? "#f59e0b"
      : "#ef4444";

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
          borderBottomWidth: 2,
          borderBottomColor: "#333",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          {/* Left Side - Menu Button */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {showMenu && (
              <TouchableOpacity
                onPress={onMenuPress}
                style={{
                  padding: 8,
                  marginRight: 12,
                  backgroundColor: "#0a0a0a",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#333",
                }}
                activeOpacity={0.7}
              >
                <Menu size={20} color="#e5e7eb" />
              </TouchableOpacity>
            )}

            {/* Title and Status */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#e5e7eb",
                  fontSize: 18,
                  fontWeight: "800",
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: statusColor,
                    marginRight: 6,
                    shadowColor: statusColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                />
                <Text
                  style={{
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {systemStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Side - Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Notifications */}
            {showNotifications && (
              <TouchableOpacity
                onPress={onNotificationPress}
                style={{
                  padding: 8,
                  backgroundColor: "#0a0a0a",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#333",
                  position: "relative",
                }}
                activeOpacity={0.7}
              >
                <Bell size={20} color="#e5e7eb" />
                {notificationCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "#ef4444",
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                      borderWidth: 2,
                      borderColor: "#1a1a1a",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: "700",
                      }}
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Settings */}
            {showSettings && (
              <TouchableOpacity
                onPress={onSettingsPress}
                style={{
                  padding: 8,
                  backgroundColor: "#0a0a0a",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#333",
                }}
                activeOpacity={0.7}
              >
                <Settings size={20} color="#e5e7eb" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default TopAppBar;
