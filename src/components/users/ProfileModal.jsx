import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { X, User, Mail, LogOut, Shield, Settings as SettingsIcon } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { useLogoutApi } from "../../service/authService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ProfileModal = ({ visible, onClose }) => {
  const { colors, theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation();
  const logoutApi = useLogoutApi();

  const handleLogout = async () => {
    // Use logout API which removes FCM token from backend and clears auth
    await logoutApi.mutateAsync();
    onClose();
    navigation.replace("Login");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: theme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
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
          onPress={onClose}
        />
        
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: SCREEN_HEIGHT * 0.85,
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
              Profile
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                padding: 4,
              }}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View
              style={{
                alignSelf: "center",
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surfaceSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 2,
                borderColor: colors.border,
              }}
            >
              <User size={40} color={colors.accent} />
            </View>

            {/* User Details */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <User size={18} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                    fontWeight: "600",
                  }}
                >
                  Username
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                  marginLeft: 26,
                }}
              >
                {user?.name || "N/A"}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                  marginBottom: 12,
                }}
              >
                <Mail size={18} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                    fontWeight: "600",
                  }}
                >
                  Email
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                  marginLeft: 26,
                }}
              >
                {user?.email || "N/A"}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                  marginBottom: 12,
                }}
              >
                <Shield size={18} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                    fontWeight: "600",
                  }}
                >
                  Role
                </Text>
              </View>
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 16,
                  fontWeight: "700",
                  marginLeft: 26,
                  textTransform: "capitalize",
                }}
              >
                {user?.role || "User"}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <SettingsIcon size={20} color={colors.textPrimary} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 12,
                }}
              >
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: colors.error + "20",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.error,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <LogOut size={20} color={colors.error} />
              <Text
                style={{
                  color: colors.error,
                  fontSize: 16,
                  fontWeight: "700",
                  marginLeft: 12,
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileModal;