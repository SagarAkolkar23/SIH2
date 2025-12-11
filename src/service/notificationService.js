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
  // Failed to set notification handler
}


// ----- PERMISSIONS -----
export const requestNotificationPermissions = async () => {
  try {
    let { status } = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
      const permissionResult = await Notifications.requestPermissionsAsync();
      status = permissionResult.status;
    }

    const granted = status === "granted";
    return granted;
  } catch (error) {
    return false;
  }
};


// ----- TOKEN GENERATION -----
// Generate native FCM token (compatible with Firebase Admin SDK)
export const getExpoPushToken = async () => {
  try {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      return null;
    }

    // USE NATIVE FCM TOKEN (compatible with Firebase Admin SDK)
    const tokenData = await Notifications.getDevicePushTokenAsync();

    if (!tokenData?.data) {
      return null;
    }

    const token = tokenData.data;
    
    return token;
  } catch (error) {
    return null;
  }
};


// ----- STORAGE HELPERS -----
export const storeFCMToken = async (token) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
  } catch (error) {
    // Failed to store token
  }
};

export const getStoredFCMToken = async () => {
  try {
    const token = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    return token;
  } catch (error) {
    return null;
  }
};

export const removeFCMToken = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
  } catch (error) {
    // Failed to remove token
  }
};


// ----- MAIN INITIALIZER -----
export const initializeNotifications = async () => {
  try {
    const token = await getExpoPushToken();

    if (token) {
      await storeFCMToken(token);
      return token;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};


// ----- LISTENERS -----
export const addNotificationReceivedListener = (callback) => {
  try {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  } catch (error) {
    return { remove: () => {} };
  }
};

export const addNotificationResponseListener = (callback) => {
  try {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  } catch (error) {
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
  if (Platform.OS !== "android") {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(channelId, {
      name,
      description,
      importance: options.importance || AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      ...options,
    });
  } catch (error) {
    // Failed to create Android notification channel
  }
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
