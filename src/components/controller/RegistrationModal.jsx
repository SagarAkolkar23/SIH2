import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { X, Home, User, Mail, Lock, Hash, Building2, MapPin, Phone, Navigation } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import {
  useRegisterHouseApi,
  useRegisterUserApi,
  useRegisterHouseAndUserApi,
  useHousesQuery,
} from "../../service/controller/registrationService";

const RegistrationModal = ({ visible, onClose, mode = "house-and-user" }) => {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(mode); // "house", "user", "house-and-user"

  // House form state
  const [houseAddress, setHouseAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // User form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [selectedHouseId, setSelectedHouseId] = useState("");

  // API hooks
  const {
    data: housesData,
    refetch: refetchHouses,
    isLoading: housesLoading,
  } = useHousesQuery();

  const registerHouseMutation = useRegisterHouseApi();
  const registerUserMutation = useRegisterUserApi();
  const registerBothMutation = useRegisterHouseAndUserApi();

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setHouseAddress("");
      setLatitude("");
      setLongitude("");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setUserAddress("");
      setSelectedHouseId("");
    }
  }, [visible]);

  const handleRegisterHouse = async () => {
    if (!houseAddress || !latitude || !longitude) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert("Error", "Latitude must be a number between -90 and 90");
      return;
    }

    if (isNaN(long) || long < -180 || long > 180) {
      Alert.alert("Error", "Longitude must be a number between -180 and 180");
      return;
    }

    registerHouseMutation.mutate(
      {
        address: houseAddress.trim(),
        locationCoordinates: {
          lat: lat,
          long: long
        }
      },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "House registered successfully!", [
            {
              text: "OK",
              onPress: () => {
                refetchHouses();
                onClose();
              },
            },
          ]);
        },
        onError: (error) => {
          const errorMessage = error?.message || 
                              error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              "Failed to register house. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      }
    );
  };

  const handleRegisterUser = async () => {
    if (!name || !email || !password || !phone || !userAddress || !selectedHouseId) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Backend requires: at least 8 characters with uppercase, lowercase, and number
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      Alert.alert(
        "Error", 
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    registerUserMutation.mutate(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        address: userAddress.trim(),
        houseId: selectedHouseId,
      },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "User registered successfully!", [
            {
              text: "OK",
              onPress: () => {
                refetchHouses();
                onClose();
              },
            },
          ]);
        },
        onError: (error) => {
          const errorMessage = error?.message || 
                              error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              "Failed to register user. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      }
    );
  };

  const handleRegisterBoth = async () => {
    // Validate all required fields
    if (
      !houseAddress ||
      !latitude ||
      !longitude ||
      !name ||
      !email ||
      !password ||
      !phone ||
      !userAddress
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert("Error", "Latitude must be a number between -90 and 90");
      return;
    }

    if (isNaN(long) || long < -180 || long > 180) {
      Alert.alert("Error", "Longitude must be a number between -180 and 180");
      return;
    }

    // Backend requires: at least 8 characters with uppercase, lowercase, and number
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      Alert.alert(
        "Error", 
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    // Validate phone (basic check - at least 10 characters)
    if (phone.trim().length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    registerBothMutation.mutate(
      {
        houseAddress: houseAddress.trim(),
        latitude: lat,
        longitude: long,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        userAddress: userAddress.trim(),
      },
      {
        onSuccess: (data) => {
          Alert.alert(
            "Success", 
            "House and user registered successfully! The user can now login with their credentials.",
            [
              {
                text: "OK",
                onPress: () => {
                  refetchHouses();
                  onClose();
                },
              },
            ]
          );
        },
        onError: (error) => {
          const errorMessage = error?.message || 
                              error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              "Failed to register house and user. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      }
    );
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
          onPress={onClose}
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
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 4,
                }}
              >
                Register New Consumer
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                Add a new house and assign a consumer
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: colors.surfaceSecondary,
              }}
              activeOpacity={0.7}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("house-and-user")}
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: "center",
                borderBottomWidth: activeTab === "house-and-user" ? 3 : 0,
                borderBottomColor:
                  activeTab === "house-and-user"
                    ? colors.success
                    : "transparent",
                backgroundColor:
                  activeTab === "house-and-user"
                    ? colors.success + "08"
                    : "transparent",
                borderRadius: 8,
                marginHorizontal: 4,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color:
                    activeTab === "house-and-user"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "house-and-user" ? "700" : "600",
                  fontSize: 13,
                }}
              >
                Both
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("house")}
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: "center",
                borderBottomWidth: activeTab === "house" ? 3 : 0,
                borderBottomColor:
                  activeTab === "house" ? colors.success : "transparent",
                backgroundColor:
                  activeTab === "house"
                    ? colors.success + "08"
                    : "transparent",
                borderRadius: 8,
                marginHorizontal: 4,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color:
                    activeTab === "house"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "house" ? "700" : "600",
                  fontSize: 13,
                }}
              >
                House
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("user")}
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: "center",
                borderBottomWidth: activeTab === "user" ? 3 : 0,
                borderBottomColor:
                  activeTab === "user" ? colors.success : "transparent",
                backgroundColor:
                  activeTab === "user"
                    ? colors.success + "08"
                    : "transparent",
                borderRadius: 8,
                marginHorizontal: 4,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color:
                    activeTab === "user"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "user" ? "700" : "600",
                  fontSize: 13,
                }}
              >
                User
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* House and User Form */}
            {activeTab === "house-and-user" && (
              <>
                {/* Section Header with Icon */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.success + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Home size={20} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 2,
                      }}
                    >
                      House Information
                    </Text>
                    <Text
                      style={{
                        color: colors.textTertiary,
                        fontSize: 12,
                      }}
                    >
                      Enter the physical location details
                    </Text>
                  </View>
                </View>

                {/* House Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Address *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <MapPin size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 123 Main Street, City"
                      placeholderTextColor={colors.textTertiary}
                      value={houseAddress}
                      onChangeText={setHouseAddress}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Latitude */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Latitude * (-90 to 90)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Navigation size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 28.6139"
                      placeholderTextColor={colors.textTertiary}
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Longitude */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Longitude * (-180 to 180)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Navigation size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 77.2090"
                      placeholderTextColor={colors.textTertiary}
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Divider with Icon */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 24,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: colors.border,
                    }}
                  />
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textTertiary,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      THEN
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: colors.border,
                    }}
                  />
                </View>

                {/* User Section Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.accent + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <User size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 2,
                      }}
                    >
                      Consumer Information
                    </Text>
                    <Text
                      style={{
                        color: colors.textTertiary,
                        fontSize: 12,
                      }}
                    >
                      Create account for the house owner
                    </Text>
                  </View>
                </View>

                {/* Name */}
                <View style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Full Name <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: name ? colors.success + "40" : colors.border,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.surfaceSecondary,
                      shadowColor: colors.border,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <User size={20} color={name ? colors.success : colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., John Doe"
                      placeholderTextColor={colors.textTertiary}
                      value={name}
                      onChangeText={setName}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Email Address <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: email ? colors.success + "40" : colors.border,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.surfaceSecondary,
                      shadowColor: colors.border,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Mail size={20} color={email ? colors.success : colors.textSecondary} />
                    <TextInput
                      placeholder="john.doe@example.com"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Phone Number <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: phone ? colors.success + "40" : colors.border,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.surfaceSecondary,
                      shadowColor: colors.border,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Phone size={20} color={phone ? colors.success : colors.textSecondary} />
                    <TextInput
                      placeholder="+91 9876543210"
                      placeholderTextColor={colors.textTertiary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                </View>

                {/* User Address */}
                <View style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    User Address <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: userAddress ? colors.success + "40" : colors.border,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.surfaceSecondary,
                      shadowColor: colors.border,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <MapPin size={20} color={userAddress ? colors.success : colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 123 Main Street, New Delhi"
                      placeholderTextColor={colors.textTertiary}
                      value={userAddress}
                      onChangeText={setUserAddress}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={{ marginBottom: 28 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Password <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: password ? colors.success + "40" : colors.border,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.surfaceSecondary,
                      shadowColor: colors.border,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Lock size={20} color={password ? colors.success : colors.textSecondary} />
                    <TextInput
                      placeholder="Enter secure password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: 11,
                      marginTop: 8,
                      marginLeft: 4,
                    }}
                  >
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterBoth}
                  disabled={
                    registerBothMutation.isPending ||
                    !houseAddress ||
                    !latitude ||
                    !longitude ||
                    !name ||
                    !email ||
                    !password ||
                    !phone ||
                    !userAddress
                  }
                  style={{
                    backgroundColor:
                      registerBothMutation.isPending ||
                      !houseAddress ||
                      !latitude ||
                      !longitude ||
                      !name ||
                      !email ||
                      !password ||
                      !phone ||
                      !userAddress
                        ? colors.textTertiary
                        : colors.success,
                    paddingVertical: 18,
                    borderRadius: 14,
                    alignItems: "center",
                    marginTop: 8,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 10,
                    shadowColor: colors.success,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  activeOpacity={0.8}
                >
                  {registerBothMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color={colors.textPrimary} />
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 16,
                          fontWeight: "700",
                          marginLeft: 8,
                        }}
                      >
                        Registering...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Home size={18} color={colors.textPrimary} />
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        Register House & Consumer
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                
                {/* Info Text */}
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 16,
                    lineHeight: 18,
                  }}
                >
                  The house will be created first, then the consumer account will be automatically linked to it.
                </Text>
              </>
            )}

            {/* House Only Form */}
            {activeTab === "house" && (
              <>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 16,
                  }}
                >
                  House Information
                </Text>

                {/* House Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Address *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <MapPin size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 123 Main Street, City"
                      placeholderTextColor={colors.textTertiary}
                      value={houseAddress}
                      onChangeText={setHouseAddress}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Latitude */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Latitude * (-90 to 90)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Navigation size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 28.6139"
                      placeholderTextColor={colors.textTertiary}
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Longitude */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Longitude * (-180 to 180)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Navigation size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., 77.2090"
                      placeholderTextColor={colors.textTertiary}
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterHouse}
                  disabled={
                    registerHouseMutation.isPending ||
                    !houseAddress ||
                    !latitude ||
                    !longitude
                  }
                  style={{
                    backgroundColor:
                      registerHouseMutation.isPending ||
                      !houseAddress ||
                      !latitude ||
                      !longitude
                        ? colors.textTertiary
                        : colors.success,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 8,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  activeOpacity={0.7}
                >
                  {registerHouseMutation.isPending && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {registerHouseMutation.isPending
                      ? "Registering..."
                      : "Register House"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* User Only Form */}
            {activeTab === "user" && (
              <>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 16,
                  }}
                >
                  User Information
                </Text>

                {/* House Selection (Required) */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Assign to House *
                  </Text>
                  {housesLoading ? (
                    <View
                      style={{
                        padding: 12,
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
                        Loading houses...
                      </Text>
                    </View>
                  ) : housesData?.data?.houses && housesData.data.houses.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 8 }}
                    >
                      {housesData.data.houses
                        .filter((house) => !house.ownerId) // Only show houses without owners
                        .map((house) => (
                        <TouchableOpacity
                          key={house._id}
                          onPress={() => setSelectedHouseId(house._id)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            marginRight: 8,
                            backgroundColor:
                              selectedHouseId === house._id
                                ? colors.success
                                : colors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor:
                              selectedHouseId === house._id
                                ? colors.success
                                : colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                selectedHouseId === house._id
                                  ? colors.textPrimary
                                  : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {house.address}
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
                        marginTop: 8,
                      }}
                    >
                      No available houses found
                    </Text>
                  )}
                </View>

                {/* Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Full Name *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <User size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="Full Name"
                      placeholderTextColor={colors.textTertiary}
                      value={name}
                      onChangeText={setName}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Email *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Mail size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="user@example.com"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Phone *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Phone size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="+1234567890"
                      placeholderTextColor={colors.textTertiary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* User Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    User Address *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <MapPin size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="User's address"
                      placeholderTextColor={colors.textTertiary}
                      value={userAddress}
                      onChangeText={setUserAddress}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Password *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Lock size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="Min 8 chars: A-Z, a-z, 0-9"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterUser}
                  disabled={
                    registerUserMutation.isPending ||
                    !name ||
                    !email ||
                    !password ||
                    !phone ||
                    !userAddress ||
                    !selectedHouseId
                  }
                  style={{
                    backgroundColor:
                      registerUserMutation.isPending ||
                      !name ||
                      !email ||
                      !password ||
                      !phone ||
                      !userAddress ||
                      !selectedHouseId
                        ? colors.textTertiary
                        : colors.success,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 8,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  activeOpacity={0.7}
                >
                  {registerUserMutation.isPending && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {registerUserMutation.isPending
                      ? "Registering..."
                      : "Register User"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RegistrationModal;
