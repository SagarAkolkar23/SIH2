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
    let { status } = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
      ({ status } = await Notifications.requestPermissionsAsync());
    }

    return status === "granted";
  } catch (error) {
    console.log("[❌ FCM] Permission error:", error.message);
    return false;
  }
};


// ----- TOKEN GENERATION -----
export const getExpoPushToken = async () => {
  try {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) return null;

    // Auto detect project ID from app.json (required for dev build)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.expoConfig?.extra?.projectId ||
      Constants?.easConfig?.projectId ||
      process.env.EXPO_PROJECT_ID;

    console.log("[FCM] Project ID:", projectId || "❌ NOT FOUND");

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    if (!tokenData?.data) return null;

    console.log("[📍 FCM TOKEN]", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.log("[❌ FCM TOKEN ERROR]:", error.message);
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
  console.log("[⚙️ FCM INIT] Starting notification setup...");

  const token = await getExpoPushToken();

  if (token) {
    await storeFCMToken(token);
    console.log("[🚀 FCM ACTIVE] Stored token successfully");
  } else {
    console.log("[⚠️ FCM] No token generated");
  }

  return token;
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
