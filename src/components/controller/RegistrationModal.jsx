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
import { X, Home, User, Mail, Lock, Hash, Building2 } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import {
  useRegisterHouseApi,
  useRegisterUserApi,
  useRegisterHouseAndUserApi,
  useMicrogridsQuery,
  useHousesQuery,
} from "../../service/controller/registrationService";

const RegistrationModal = ({ visible, onClose, mode = "house-and-user" }) => {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(mode); // "house", "user", "house-and-user"

  // House form state
  const [houseCode, setHouseCode] = useState("");
  const [houseName, setHouseName] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("5");
  const [selectedMicrogridId, setSelectedMicrogridId] = useState("");

  // User form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [selectedHouseId, setSelectedHouseId] = useState("");

  // API hooks
  const {
    data: microgridsData,
    isLoading: microgridsLoading,
    error: microgridsError,
  } = useMicrogridsQuery();
  const {
    data: housesData,
    refetch: refetchHouses,
    isLoading: housesLoading,
  } = useHousesQuery(selectedMicrogridId || null);

  const registerHouseMutation = useRegisterHouseApi();
  const registerUserMutation = useRegisterUserApi();
  const registerBothMutation = useRegisterHouseAndUserApi();

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setHouseCode("");
      setHouseName("");
      setPriorityLevel("5");
      setSelectedMicrogridId("");
      setUsername("");
      setEmail("");
      setPassword("");
      setUserRole("user");
      setSelectedHouseId("");
    }
  }, [visible]);

  // Refetch houses when microgrid changes (for user tab)
  useEffect(() => {
    if (selectedMicrogridId && activeTab === "user") {
      refetchHouses();
    }
  }, [selectedMicrogridId, activeTab]);

  const handleRegisterHouse = async () => {
    if (!houseCode || !houseName || !selectedMicrogridId) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (isNaN(parseInt(priorityLevel)) || parseInt(priorityLevel) < 1 || parseInt(priorityLevel) > 10) {
      Alert.alert("Error", "Priority level must be a number between 1 and 10");
      return;
    }

    registerHouseMutation.mutate(
      {
        houseCode: houseCode.trim(),
        name: houseName.trim(),
        priorityLevel: parseInt(priorityLevel),
        microgridId: selectedMicrogridId,
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
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Failed to register house"
          );
        },
      }
    );
  };

  const handleRegisterUser = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    registerUserMutation.mutate(
      {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: userRole,
        houseId: selectedHouseId || undefined,
      },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "User registered successfully!", [
            {
              text: "OK",
              onPress: () => {
                onClose();
              },
            },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Failed to register user"
          );
        },
      }
    );
  };

  const handleRegisterBoth = async () => {
    if (
      !houseCode ||
      !houseName ||
      !selectedMicrogridId ||
      !username ||
      !email ||
      !password
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (isNaN(parseInt(priorityLevel)) || parseInt(priorityLevel) < 1 || parseInt(priorityLevel) > 10) {
      Alert.alert("Error", "Priority level must be a number between 1 and 10");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    registerBothMutation.mutate(
      {
        houseCode: houseCode.trim(),
        houseName: houseName.trim(),
        priorityLevel: parseInt(priorityLevel),
        microgridId: selectedMicrogridId,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: userRole,
      },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "House and user registered successfully!", [
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
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Failed to register house and user"
          );
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
              Register New
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ padding: 4 }}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("house-and-user")}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: activeTab === "house-and-user" ? 2 : 0,
                borderBottomColor:
                  activeTab === "house-and-user"
                    ? colors.success
                    : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === "house-and-user"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "house-and-user" ? "700" : "500",
                  fontSize: 12,
                }}
              >
                Both
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("house")}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: activeTab === "house" ? 2 : 0,
                borderBottomColor:
                  activeTab === "house" ? colors.success : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === "house"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "house" ? "700" : "500",
                  fontSize: 12,
                }}
              >
                House
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("user")}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: activeTab === "user" ? 2 : 0,
                borderBottomColor:
                  activeTab === "user" ? colors.success : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === "user"
                      ? colors.success
                      : colors.textSecondary,
                  fontWeight: activeTab === "user" ? "700" : "500",
                  fontSize: 12,
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

                {/* Microgrid Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Microgrid *
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
                  ) : microgridsError ? (
                    <View
                      style={{
                        padding: 12,
                        backgroundColor: colors.error + "20",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.error,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.error,
                          fontSize: 12,
                        }}
                      >
                        Error loading microgrids. Please try again.
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
                            paddingVertical: 10,
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
                              fontSize: 12,
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
                </View>

                {/* House Code */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Code *
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
                    <Hash size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., H001, H002"
                      placeholderTextColor={colors.textTertiary}
                      value={houseCode}
                      onChangeText={setHouseCode}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* House Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Name *
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
                    <Home size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., House 1, John's House"
                      placeholderTextColor={colors.textTertiary}
                      value={houseName}
                      onChangeText={setHouseName}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Priority Level */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Priority Level (1-10) *
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
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginRight: 12,
                        fontSize: 12,
                      }}
                    >
                      1 (Low)
                    </Text>
                    <TextInput
                      placeholder="5"
                      placeholderTextColor={colors.textTertiary}
                      value={priorityLevel}
                      onChangeText={setPriorityLevel}
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        color: colors.textPrimary,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginLeft: 12,
                        fontSize: 12,
                      }}
                    >
                      10 (High)
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    Lower priority = first to be shed during load management
                  </Text>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginVertical: 20,
                  }}
                />

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

                {/* Username */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Username *
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
                      placeholder="Username"
                      placeholderTextColor={colors.textTertiary}
                      value={username}
                      onChangeText={setUsername}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                      autoCapitalize="none"
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

                {/* Password */}
                <View style={{ marginBottom: 16 }}>
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
                      placeholder="Minimum 6 characters"
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

                {/* Role Selection */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    User Role *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {["user", "controller", "admin"].map((role) => (
                      <TouchableOpacity
                        key={role}
                        onPress={() => setUserRole(role)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor:
                            userRole === role ? colors.success : colors.border,
                          backgroundColor:
                            userRole === role
                              ? colors.success + "20"
                              : colors.surfaceSecondary,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              userRole === role
                                ? colors.success
                                : colors.textPrimary,
                            fontWeight: userRole === role ? "700" : "500",
                            textTransform: "capitalize",
                            fontSize: 12,
                          }}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterBoth}
                  disabled={
                    registerBothMutation.isPending ||
                    !houseCode ||
                    !houseName ||
                    !selectedMicrogridId ||
                    !username ||
                    !email ||
                    !password
                  }
                  style={{
                    backgroundColor:
                      registerBothMutation.isPending ||
                      !houseCode ||
                      !houseName ||
                      !selectedMicrogridId ||
                      !username ||
                      !email ||
                      !password
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
                  {registerBothMutation.isPending && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {registerBothMutation.isPending
                      ? "Registering..."
                      : "Register House & User"}
                  </Text>
                </TouchableOpacity>
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

                {/* Microgrid Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Microgrid *
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
                  ) : microgridsError ? (
                    <View
                      style={{
                        padding: 12,
                        backgroundColor: colors.error + "20",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.error,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.error,
                          fontSize: 12,
                        }}
                      >
                        Error loading microgrids. Please try again.
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
                            paddingVertical: 10,
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
                              fontSize: 12,
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
                </View>

                {/* House Code */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Code *
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
                    <Hash size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., H001, H002"
                      placeholderTextColor={colors.textTertiary}
                      value={houseCode}
                      onChangeText={setHouseCode}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* House Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    House Name *
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
                    <Home size={20} color={colors.textSecondary} />
                    <TextInput
                      placeholder="e.g., House 1, John's House"
                      placeholderTextColor={colors.textTertiary}
                      value={houseName}
                      onChangeText={setHouseName}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>

                {/* Priority Level */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Priority Level (1-10) *
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
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginRight: 12,
                        fontSize: 12,
                      }}
                    >
                      1 (Low)
                    </Text>
                    <TextInput
                      placeholder="5"
                      placeholderTextColor={colors.textTertiary}
                      value={priorityLevel}
                      onChangeText={setPriorityLevel}
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        color: colors.textPrimary,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginLeft: 12,
                        fontSize: 12,
                      }}
                    >
                      10 (High)
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    Lower priority = first to be shed during load management
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterHouse}
                  disabled={
                    registerHouseMutation.isPending ||
                    !houseCode ||
                    !houseName ||
                    !selectedMicrogridId
                  }
                  style={{
                    backgroundColor:
                      registerHouseMutation.isPending ||
                      !houseCode ||
                      !houseName ||
                      !selectedMicrogridId
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

                {/* Microgrid Selection (to filter houses) */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Microgrid (to filter houses)
                  </Text>
                  {microgridsLoading ? (
                    <View
                      style={{
                        padding: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator size="small" color={colors.success} />
                    </View>
                  ) : microgridsData?.microgrids && microgridsData.microgrids.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 8 }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMicrogridId("");
                          setSelectedHouseId("");
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          marginRight: 8,
                          backgroundColor:
                            selectedMicrogridId === ""
                              ? colors.success
                              : colors.surfaceSecondary,
                          borderWidth: 1,
                          borderColor:
                            selectedMicrogridId === ""
                              ? colors.success
                              : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              selectedMicrogridId === ""
                                ? "#fff"
                                : colors.textPrimary,
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          All
                        </Text>
                      </TouchableOpacity>
                      {microgridsData.microgrids.map((mg) => (
                        <TouchableOpacity
                          key={mg.id}
                          onPress={() => setSelectedMicrogridId(mg.id)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
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
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {mg.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>

                {/* House Selection (Optional) */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Assign to House (Optional)
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
                  ) : housesData?.houses && housesData.houses.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 8 }}
                    >
                      <TouchableOpacity
                        onPress={() => setSelectedHouseId("")}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          marginRight: 8,
                          backgroundColor:
                            selectedHouseId === ""
                              ? colors.success
                              : colors.surfaceSecondary,
                          borderWidth: 1,
                          borderColor:
                            selectedHouseId === ""
                              ? colors.success
                              : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              selectedHouseId === ""
                                ? "#fff"
                                : colors.textPrimary,
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          None
                        </Text>
                      </TouchableOpacity>
                      {housesData.houses.map((house) => (
                        <TouchableOpacity
                          key={house.id}
                          onPress={() => setSelectedHouseId(house.id)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            marginRight: 8,
                            backgroundColor:
                              selectedHouseId === house.id
                                ? colors.success
                                : colors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor:
                              selectedHouseId === house.id
                                ? colors.success
                                : colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                selectedHouseId === house.id
                                  ? "#fff"
                                  : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {house.houseCode} - {house.name}
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
                      {selectedMicrogridId
                        ? "No houses found for this microgrid"
                        : "Select a microgrid to see houses"}
                    </Text>
                  )}
                </View>

                {/* Username */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Username *
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
                      placeholder="Username"
                      placeholderTextColor={colors.textTertiary}
                      value={username}
                      onChangeText={setUsername}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.textPrimary,
                        fontSize: 14,
                      }}
                      autoCapitalize="none"
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

                {/* Password */}
                <View style={{ marginBottom: 16 }}>
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
                      placeholder="Minimum 6 characters"
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

                {/* Role Selection */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    User Role *
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {["user", "controller", "admin"].map((role) => (
                      <TouchableOpacity
                        key={role}
                        onPress={() => setUserRole(role)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor:
                            userRole === role ? colors.success : colors.border,
                          backgroundColor:
                            userRole === role
                              ? colors.success + "20"
                              : colors.surfaceSecondary,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              userRole === role
                                ? colors.success
                                : colors.textPrimary,
                            fontWeight: userRole === role ? "700" : "500",
                            textTransform: "capitalize",
                            fontSize: 12,
                          }}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegisterUser}
                  disabled={
                    registerUserMutation.isPending ||
                    !username ||
                    !email ||
                    !password
                  }
                  style={{
                    backgroundColor:
                      registerUserMutation.isPending ||
                      !username ||
                      !email ||
                      !password
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
