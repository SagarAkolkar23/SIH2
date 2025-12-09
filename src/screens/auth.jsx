import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useLoginApi } from "../service/authService";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { testApiConnection } from "../api/useQuery";

export default function MicrogridLogin() {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLoginApi();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // Backend returns: { success: true, data: { user, token } }
          // Auth service already saves to store, so we can get it directly
          setTimeout(() => {
            const currentUser = useAuthStore.getState().user;
            const userRole = currentUser?.role;
            
            // Backend roles: SUPER_ADMIN, CONTROLLER, CONSUMER
            if (userRole === "CONTROLLER" || userRole === "SUPER_ADMIN") {
              navigation.replace("ControllerMain");
            } else if (userRole === "CONSUMER") {
              navigation.replace("UserMain");
            } else {
              setError("Unknown user role. Please contact administrator.");
            }
          }, 100);
        },
        onError: (err) => {
          // Backend returns: { success: false, message: "..." }
          const errorMessage = err?.response?.data?.message || 
                              err?.response?.data?.error || 
                              err?.message || 
                              "Login failed. Please check your credentials.";
          setError(errorMessage);
        },
      }
    );
  };

  const handleTestConnection = async () => {
    const isConnected = await testApiConnection();
    if (isConnected) {
      Alert.alert('Success', 'Backend is reachable!');
    } else {
      Alert.alert('Failed', 'Cannot reach backend. Check console for details.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      <View style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Zap size={56} color={colors.success} />
        </View>

        <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          Welcome Back
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          Solar Microgrid Control Panel
        </Text>

        {/* Error Message */}
        {error ? (
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.error + '20', borderWidth: 1, borderColor: colors.error + '40', padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <AlertCircle size={18} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 16 }}>
          <Mail size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ flex: 1, color: colors.textPrimary }}
          />
        </View>

        {/* Password Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 24 }}>
          <Lock size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{ flex: 1, color: colors.textPrimary }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          disabled={loginMutation.isPending}
          onPress={handleLogin}
          style={{
            backgroundColor: loginMutation.isPending ? colors.textTertiary : colors.success,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: loginMutation.isPending ? 0.5 : 1,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTestConnection}
          style={{ marginTop: 10, padding: 10, backgroundColor: colors.accent, borderRadius: 8 }}
        >
          <Text style={{ color: colors.textPrimary, textAlign: 'center' }}>Test Connection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
