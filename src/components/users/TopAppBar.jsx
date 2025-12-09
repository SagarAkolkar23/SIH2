import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Menu, Bell, User, Settings } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";

const UserTopAppBar = ({
  title = "Microgrid",
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  onSettingsPress,
  showNotifications = true,
  showProfile = true,
  showSettings = true,
  showMenu = true,
  notificationCount = 0,
}) => {
  const { colors, theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      <View
        style={{
          backgroundColor: colors.surface,
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
          borderBottomWidth: 2,
          borderBottomColor: colors.border,
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
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <Menu size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Title and User Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
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
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.success,
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 10,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {user?.username || user?.email || "User"}
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
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  position: "relative",
                }}
                activeOpacity={0.7}
              >
                <Bell size={20} color={colors.textPrimary} />
                {notificationCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: colors.error,
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                      borderWidth: 2,
                      borderColor: colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textPrimary,
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

            {/* Profile */}
            {showProfile && (
              <TouchableOpacity
                onPress={onProfilePress}
                style={{
                  padding: 8,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <User size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Settings */}
            {showSettings && (
              <TouchableOpacity
                onPress={onSettingsPress}
                style={{
                  padding: 8,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <Settings size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default UserTopAppBar;
