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
  console.log('[FCM TOKEN LOGS] ✅ Notification handler configured successfully');
} catch (err) {
  console.log('[FCM TOKEN LOGS] ❌ Failed to set notification handler:', err.message);
}


// ----- PERMISSIONS -----
export const requestNotificationPermissions = async () => {
  try {
    console.log('[FCM TOKEN LOGS] ========================================');
    console.log('[FCM TOKEN LOGS] Checking notification permissions...');
    console.log('[FCM TOKEN LOGS] Platform:', Platform.OS);
    
    let { status } = await Notifications.getPermissionsAsync();
    console.log('[FCM TOKEN LOGS] Current permission status:', status);

    if (status !== "granted") {
      console.log('[FCM TOKEN LOGS] Permission not granted, requesting...');
      const permissionResult = await Notifications.requestPermissionsAsync();
      status = permissionResult.status;
      console.log('[FCM TOKEN LOGS] Permission request result:', status);
    }

    const granted = status === "granted";
    console.log('[FCM TOKEN LOGS] Permission granted:', granted);
    console.log('[FCM TOKEN LOGS] ========================================');
    return granted;
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Error requesting permissions:', error.message);
    console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
    return false;
  }
};


// ----- TOKEN GENERATION -----
// Generate native FCM token (compatible with Firebase Admin SDK)
export const getExpoPushToken = async () => {
  console.log('[FCM TOKEN LOGS] ========================================');
  console.log('[FCM TOKEN LOGS] Starting FCM token generation...');
  console.log('[FCM TOKEN LOGS] Platform:', Platform.OS);
  console.log('[FCM TOKEN LOGS] Project ID:', Constants?.expoConfig?.extra?.eas?.projectId || 'Not found');
  
  try {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      console.log('[FCM TOKEN LOGS] ❌ Token generation failed: Permissions not granted');
      console.log('[FCM TOKEN LOGS] ========================================');
      return null;
    }

    console.log('[FCM TOKEN LOGS] ✅ Permissions granted, generating native FCM token...');
    console.log('[FCM TOKEN LOGS] Using getDevicePushTokenAsync() for native token...');
    
    // USE NATIVE FCM TOKEN (compatible with Firebase Admin SDK)
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('[FCM TOKEN LOGS] Token data received:', {
      hasData: !!tokenData?.data,
      type: tokenData?.type || 'unknown',
      dataLength: tokenData?.data?.length || 0,
      dataPrefix: tokenData?.data?.substring(0, 20) || 'N/A'
    });

    if (!tokenData?.data) {
      console.log('[FCM TOKEN LOGS] ❌ Token generation failed: No token data received');
      console.log('[FCM TOKEN LOGS] Token data object:', JSON.stringify(tokenData));
      console.log('[FCM TOKEN LOGS] ========================================');
      return null;
    }

    const token = tokenData.data;
    console.log('[FCM TOKEN LOGS] ✅ FCM token generated successfully');
    console.log('[FCM TOKEN LOGS] Token type:', tokenData.type || 'FCM');
    console.log('[FCM TOKEN LOGS] Token length:', token.length);
    console.log('[FCM TOKEN LOGS] Token preview:', token.substring(0, 30) + '...');
    console.log('[FCM TOKEN LOGS] ========================================');
    
    return token;
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Exception during token generation:');
    console.log('[FCM TOKEN LOGS] Error message:', error.message);
    console.log('[FCM TOKEN LOGS] Error code:', error.code || 'N/A');
    console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
    console.log('[FCM TOKEN LOGS] ========================================');
    return null;
  }
};


// ----- STORAGE HELPERS -----
export const storeFCMToken = async (token) => {
  try {
    console.log('[FCM TOKEN LOGS] Storing FCM token in AsyncStorage...');
    await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
    console.log('[FCM TOKEN LOGS] ✅ Token stored successfully');
    console.log('[FCM TOKEN LOGS] Storage key:', NOTIFICATION_TOKEN_KEY);
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Failed to store token:', error.message);
  }
};

export const getStoredFCMToken = async () => {
  try {
    console.log('[FCM TOKEN LOGS] Retrieving stored FCM token from AsyncStorage...');
    const token = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    if (token) {
      console.log('[FCM TOKEN LOGS] ✅ Stored token found');
      console.log('[FCM TOKEN LOGS] Token length:', token.length);
      console.log('[FCM TOKEN LOGS] Token preview:', token.substring(0, 30) + '...');
    } else {
      console.log('[FCM TOKEN LOGS] ⚠️ No stored token found');
    }
    return token;
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Error retrieving stored token:', error.message);
    return null;
  }
};

export const removeFCMToken = async () => {
  try {
    console.log('[FCM TOKEN LOGS] Removing FCM token from AsyncStorage...');
    await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
    console.log('[FCM TOKEN LOGS] ✅ Token removed successfully');
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Failed to remove token:', error.message);
  }
};


// ----- MAIN INITIALIZER -----
export const initializeNotifications = async () => {
  console.log('[FCM TOKEN LOGS] ========================================');
  console.log('[FCM TOKEN LOGS] Initializing notifications...');
  const startTime = Date.now();
  
  try {
    const token = await getExpoPushToken();

    if (token) {
      await storeFCMToken(token);
      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ✅ Notification initialization completed');
      console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
      return token;
    } else {
      const duration = Date.now() - startTime;
      console.log('[FCM TOKEN LOGS] ❌ Notification initialization failed: No token generated');
      console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
      console.log('[FCM TOKEN LOGS] ========================================');
      return null;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log('[FCM TOKEN LOGS] ❌ Exception during notification initialization:');
    console.log('[FCM TOKEN LOGS] Error message:', error.message);
    console.log('[FCM TOKEN LOGS] Error stack:', error.stack);
    console.log('[FCM TOKEN LOGS] Duration:', duration, 'ms');
    console.log('[FCM TOKEN LOGS] ========================================');
    return null;
  }
};


// ----- LISTENERS -----
export const addNotificationReceivedListener = (callback) => {
  try {
    console.log('[FCM TOKEN LOGS] Adding notification received listener...');
    const subscription = Notifications.addNotificationReceivedListener(callback);
    console.log('[FCM TOKEN LOGS] ✅ Notification received listener added');
    return subscription;
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Failed to add notification received listener:', error.message);
    return { remove: () => {} };
  }
};

export const addNotificationResponseListener = (callback) => {
  try {
    console.log('[FCM TOKEN LOGS] Adding notification response listener...');
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    console.log('[FCM TOKEN LOGS] ✅ Notification response listener added');
    return subscription;
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Failed to add notification response listener:', error.message);
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
    console.log('[FCM TOKEN LOGS] Skipping Android channel creation - not Android platform');
    return;
  }

  try {
    console.log('[FCM TOKEN LOGS] Creating Android notification channel...');
    console.log('[FCM TOKEN LOGS] Channel ID:', channelId);
    console.log('[FCM TOKEN LOGS] Channel Name:', name);
    
    await Notifications.setNotificationChannelAsync(channelId, {
      name,
      description,
      importance: options.importance || AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      ...options,
    });
    
    console.log('[FCM TOKEN LOGS] ✅ Android notification channel created successfully');
  } catch (error) {
    console.log('[FCM TOKEN LOGS] ❌ Failed to create Android notification channel:', error.message);
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
