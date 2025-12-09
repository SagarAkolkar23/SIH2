// ----- IMPORTS -----
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const NOTIFICATION_TOKEN_KEY = "@fcm_token";
const { AndroidImportance } = Notifications;


// ----- SETUP NOTIFICATION HANDLER -----
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (err) {
  console.log("[⚠️ FCM] Notification handler failed:", err.message);
}


// ----- PERMISSIONS -----
export const requestNotificationPermissions = async () => {
  try {
    console.log("[🔐 FCM PERMISSIONS] Checking notification permissions...");
    let { status } = await Notifications.getPermissionsAsync();
    console.log("[🔐 FCM PERMISSIONS] Current permission status:", status);

    if (status !== "granted") {
      console.log("[🔐 FCM PERMISSIONS] Permissions not granted, requesting...");
      const permissionResult = await Notifications.requestPermissionsAsync();
      status = permissionResult.status;
      console.log("[🔐 FCM PERMISSIONS] Permission request result:", status);
      console.log("[🔐 FCM PERMISSIONS] Permission details:", JSON.stringify(permissionResult, null, 2));
    } else {
      console.log("[🔐 FCM PERMISSIONS] ✅ Permissions already granted");
    }

    const granted = status === "granted";
    console.log("[🔐 FCM PERMISSIONS] Final permission status:", granted ? "✅ GRANTED" : "❌ DENIED");
    return granted;
  } catch (error) {
    console.log("[❌ FCM] Permission error:", error.message);
    console.log("[❌ FCM] Permission error stack:", error.stack);
    return false;
  }
};


// ----- TOKEN GENERATION -----
export const getExpoPushToken = async () => {
  try {
    console.log("[🔑 FCM TOKEN] Starting token generation process...");
    
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      console.log("[🔑 FCM TOKEN] ❌ Permissions not granted, cannot generate token");
      return null;
    }

    console.log("[🔑 FCM TOKEN] ✅ Permissions granted, proceeding with token generation");

    // Auto detect project ID from app.json (required for dev build)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.expoConfig?.extra?.projectId ||
      Constants?.easConfig?.projectId ||
      process.env.EXPO_PROJECT_ID;

    console.log("[🔑 FCM TOKEN] Project ID check:");
    console.log("  - Constants.expoConfig?.extra?.eas?.projectId:", Constants?.expoConfig?.extra?.eas?.projectId || "Not found");
    console.log("  - Constants.expoConfig?.extra?.projectId:", Constants?.expoConfig?.extra?.projectId || "Not found");
    console.log("  - Constants.easConfig?.projectId:", Constants?.easConfig?.projectId || "Not found");
    console.log("  - process.env.EXPO_PROJECT_ID:", process.env.EXPO_PROJECT_ID || "Not found");
    console.log("[🔑 FCM TOKEN] Final Project ID:", projectId || "❌ NOT FOUND");

    if (!projectId) {
      console.log("[🔑 FCM TOKEN] ⚠️ No projectId found - attempting without it (may fail in dev build)");
    }

    console.log("[🔑 FCM TOKEN] Requesting Expo push token...");
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    console.log("[🔑 FCM TOKEN] Token data received:", tokenData ? "Yes" : "No");
    if (tokenData) {
      console.log("[🔑 FCM TOKEN] Token data structure:", JSON.stringify(tokenData, null, 2));
    }

    if (!tokenData?.data) {
      console.log("[🔑 FCM TOKEN] ❌ No token data in response");
      return null;
    }

    const token = tokenData.data;
    console.log("[🔑 FCM TOKEN] ✅ Token generated successfully");
    console.log("[🔑 FCM TOKEN] Token length:", token.length);
    console.log("[🔑 FCM TOKEN] Token (first 50 chars):", token.substring(0, 50) + "...");
    console.log("[🔑 FCM TOKEN] Token (last 20 chars):", "..." + token.substring(token.length - 20));
    
    return token;
  } catch (error) {
    console.log("[❌ FCM TOKEN ERROR]:", error.message);
    console.log("[❌ FCM TOKEN ERROR] Error code:", error.code);
    console.log("[❌ FCM TOKEN ERROR] Error name:", error.name);
    console.log("[❌ FCM TOKEN ERROR] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return null;
  }
};


// ----- STORAGE HELPERS -----
export const storeFCMToken = async (token) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
  } catch {}
};

export const getStoredFCMToken = async () => {
  try {
    return await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const removeFCMToken = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
  } catch {}
};


// ----- MAIN INITIALIZER -----
export const initializeNotifications = async () => {
  console.log("[⚙️ FCM INIT] ========================================");
  console.log("[⚙️ FCM INIT] Starting notification setup...");
  console.log("[⚙️ FCM INIT] Platform:", Platform.OS);
  console.log("[⚙️ FCM INIT] ========================================");

  try {
    const token = await getExpoPushToken();

    if (token) {
      console.log("[⚙️ FCM INIT] Token obtained, storing in AsyncStorage...");
      await storeFCMToken(token);
      console.log("[⚙️ FCM INIT] ✅ Token stored in AsyncStorage successfully");
      console.log("[⚙️ FCM INIT] Token key:", NOTIFICATION_TOKEN_KEY);
    } else {
      console.log("[⚙️ FCM INIT] ❌ No token generated - check permissions and projectId");
      console.log("[⚙️ FCM INIT] Possible issues:");
      console.log("  1. Notification permissions not granted");
      console.log("  2. Project ID not configured");
      console.log("  3. Expo notifications not properly initialized");
    }

    console.log("[⚙️ FCM INIT] ========================================");
    return token;
  } catch (error) {
    console.log("[⚙️ FCM INIT] ❌ Error during initialization:", error.message);
    console.log("[⚙️ FCM INIT] Error stack:", error.stack);
    console.log("[⚙️ FCM INIT] ========================================");
    return null;
  }
};


// ----- LISTENERS -----
export const addNotificationReceivedListener = (callback) => {
  try {
    return Notifications.addNotificationReceivedListener(callback);
  } catch {
    return { remove: () => {} };
  }
};

export const addNotificationResponseListener = (callback) => {
  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch {
    return { remove: () => {} };
  }
};


// ----- ANDROID CHANNELS (REQUIRED for sound + alerts) -----
export const createNotificationChannel = async (
  channelId = "default",
  name = "Default Channel",
  description = "General Notifications",
  options = {}
) => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    description,
    importance: options.importance || AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    ...options,
  });

  console.log(`[📡 FCM] Notification channel "${channelId}" ready`);
};


// ----- OPTIONAL DEBUG -----
export const scheduleLocalNotification = async (
  title,
  body,
  data = {},
  seconds = 2
) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: { seconds },
  });
};
