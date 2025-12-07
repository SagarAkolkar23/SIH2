// src/components/common/TopAppBar.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Menu, UserPlus, Cloud, User, Sun, Moon } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";

const TopAppBar = ({
  title = "Solar Controller",
  onMenuPress,
  onRegisterPress,
  onWeatherPress,
  onProfilePress,
  showRegister = true,
  showWeather = true,
  showProfile = true,
  showMenu = true,
  systemStatus = "OPERATIONAL",
  isWeatherExpanded = false,
}) => {
  const { colors, theme, toggleTheme } = useThemeStore();
  
  const statusColor =
    systemStatus === "OPERATIONAL"
      ? colors.success
      : systemStatus === "LOW BATTERY"
      ? colors.warning
      : colors.error;

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

            {/* Title and Status */}
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
            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                padding: 8,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              {theme === "dark" ? (
                <Sun size={18} color={colors.accent} />
              ) : (
                <Moon size={18} color={colors.accent} />
              )}
            </TouchableOpacity>

            {/* Register User Button */}
            {showRegister && (
              <TouchableOpacity
                onPress={onRegisterPress}
                style={{
                  padding: 8,
                  backgroundColor: colors.success,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <UserPlus size={20} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Weather Button */}
            {showWeather && (
              <TouchableOpacity
                onPress={onWeatherPress}
                style={{
                  padding: 8,
                  backgroundColor: isWeatherExpanded ? colors.accent : colors.surfaceSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isWeatherExpanded ? colors.accent : colors.border,
                }}
                activeOpacity={0.7}
              >
                <Cloud size={20} color={isWeatherExpanded ? "#fff" : colors.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Profile - Rightmost */}
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
          </View>
        </View>
      </View>
    </>
  );
};

export default TopAppBar;
