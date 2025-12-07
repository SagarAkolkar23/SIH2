import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useLoginApi } from "../service/authService";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { testApiConnection } from "../api/useQuery";

export default function MicrogridLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLoginApi();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);

  const handleLogin = () => {
    console.log('🔘 [FRONTEND AUTH SCREEN] Login button clicked');
    
    setError("");

    if (!email || !password) {
      console.log('❌ [FRONTEND AUTH SCREEN] Validation failed: Missing email or password');
      setError("Please enter both email and password");
      return;
    }

    console.log('✅ [FRONTEND AUTH SCREEN] Validation passed, initiating login mutation');
    console.log('📧 [FRONTEND AUTH SCREEN] Email:', email.substring(0, 3) + '***');

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log('✅ [FRONTEND AUTH SCREEN] Login mutation onSuccess callback triggered');
          console.log('📦 [FRONTEND AUTH SCREEN] Success data:', {
            hasUser: !!data?.user,
            userRole: data?.user?.role,
          });
          
          // Wait a bit for the store to update, then navigate
          setTimeout(() => {
            const currentUser = useAuthStore.getState().user;
            const userRole = currentUser?.role || currentUser?.userType;
            
            console.log('👤 [FRONTEND AUTH SCREEN] Current user from store:', {
              email: currentUser?.email,
              role: userRole,
            });
            
            if (userRole === "controller" || userRole === "admin") {
              console.log('🧭 [FRONTEND AUTH SCREEN] Navigating to ControllerMain');
              navigation.replace("ControllerMain");
            } else {
              console.log('🧭 [FRONTEND AUTH SCREEN] Navigating to UserMain');
              navigation.replace("UserMain");
            }
          }, 100);
        },
        onError: (err) => {
          console.error('❌ [FRONTEND AUTH SCREEN] Login mutation error');
          console.error('📦 [FRONTEND AUTH SCREEN] Error object:', {
            message: err?.message,
            status: err?.response?.status,
            error: err?.response?.data?.error,
          });
          
          const errorMessage = err?.response?.data?.error || 
                              err?.message || 
                              "Login failed";
          console.log('📝 [FRONTEND AUTH SCREEN] Setting error message:', errorMessage);
          setError(errorMessage);
        },
      }
    );
  };

  const handleTestConnection = async () => {
    console.log('🧪 Testing API connection...');
    const isConnected = await testApiConnection();
    if (isConnected) {
      Alert.alert('Success', 'Backend is reachable!');
    } else {
      Alert.alert('Failed', 'Cannot reach backend. Check console for details.');
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <View className="w-full max-w-md bg-neutral-900 p-6 rounded-2xl border border-neutral-700">
        {/* Icon */}
        <View className="items-center mb-6">
          <Zap size={56} color="#22c55e" />
        </View>

        <Text className="text-white text-3xl font-bold text-center">
          Welcome Back
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          Solar Microgrid Control Panel
        </Text>

        {/* Error Message */}
        {error ? (
          <View className="flex-row gap-2 bg-red-500/20 border border-red-500/40 p-3 rounded-xl mb-4">
            <AlertCircle size={18} color="#fb4747" />
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View className="flex-row items-center border border-neutral-700 rounded-xl px-3 py-3 mb-4">
          <Mail size={20} color="#aaa" className="mr-2" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="flex-1 text-white"
          />
        </View>

        {/* Password Input */}
        <View className="flex-row items-center border border-neutral-700 rounded-xl px-3 py-3 mb-6">
          <Lock size={20} color="#aaa" className="mr-2" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="flex-1 text-white"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#ccc" />
            ) : (
              <Eye size={20} color="#ccc" />
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          disabled={loginMutation.isPending}
          onPress={handleLogin}
          className={`bg-green-500 py-4 rounded-xl items-center ${
            loginMutation.isPending ? "opacity-50" : "active:bg-green-600"
          }`}
        >
          <Text className="font-bold text-black text-lg">
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTestConnection}
          style={{ marginTop: 10, padding: 10, backgroundColor: 'blue' }}
        >
          <Text style={{ color: 'white' }}>Test Connection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
