import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { AndroidImportance } = Notifications;

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_TOKEN_KEY = '@fcm_token';

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - True if permissions granted
 */
export const requestNotificationPermissions = async () => {
  try {
    console.log('[FCM PERMISSIONS] Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('[FCM PERMISSIONS] Current permission status:', existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('[FCM PERMISSIONS] Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[FCM PERMISSIONS] Permission request result:', status);
    } else {
      console.log('[FCM PERMISSIONS] ✅ Permissions already granted');
    }

    const granted = finalStatus === 'granted';
    console.log('[FCM PERMISSIONS] Final permission status:', granted ? 'Granted' : 'Denied');
    return granted;
  } catch (error) {
    console.log('[FCM PERMISSIONS] ❌ Error requesting permissions:', error.message);
    return false;
  }
};

/**
 * Get Expo push token
 * @returns {Promise<string|null>} - Expo push token or null
 */
export const getExpoPushToken = async () => {
  try {
    console.log('[FCM TOKEN] Getting Expo push token...');
    
    // Check if permissions are granted
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[FCM TOKEN] ❌ Permissions not granted, cannot get token');
      return null;
    }

    console.log('[FCM TOKEN] Permissions granted, requesting token from Expo...');
    
    // Debug: Log available Constants data
    console.log('[FCM TOKEN] Constants.executionEnvironment:', Constants.executionEnvironment);
    console.log('[FCM TOKEN] Constants.appOwnership:', Constants.appOwnership);
    console.log('[FCM TOKEN] Constants.expoConfig?.slug:', Constants.expoConfig?.slug);
    console.log('[FCM TOKEN] Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
    console.log('[FCM TOKEN] Constants.expoConfig?.projectId:', Constants.expoConfig?.projectId);
    
    // Get projectId from various sources
    const projectId = 
      Constants.expoConfig?.extra?.projectId ||
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      Constants.expoConfig?.projectId ||
      process.env.EXPO_PROJECT_ID ||
      undefined;
    
    console.log('[FCM TOKEN] ProjectId found:', projectId ? 'Yes' : 'No');
    if (projectId) {
      console.log('[FCM TOKEN] ProjectId:', projectId);
    } else {
      console.log('[FCM TOKEN] ⚠️ No projectId found');
      console.log('[FCM TOKEN] Execution environment:', Constants.executionEnvironment);
      console.log('[FCM TOKEN] App ownership:', Constants.appOwnership);
      
      // For Expo Go, projectId should be auto-detected
      if (Constants.executionEnvironment === 'storeClient') {
        console.log('[FCM TOKEN] Running in Expo Go - attempting auto-detect');
      } else {
        console.log('[FCM TOKEN] ⚠️ Not running in Expo Go - projectId is required');
        console.log('[FCM TOKEN] 💡 Solution:');
        console.log('[FCM TOKEN] 1. Run: npx eas init (if not already done)');
        console.log('[FCM TOKEN] 2. Or add projectId to app.json under expo.extra.eas.projectId');
        console.log('[FCM TOKEN] 3. Or set EXPO_PROJECT_ID environment variable');
      }
    }
    
    // Get the Expo push token
    // In Expo Go, projectId should be auto-detected
    // In development/production builds, it needs to be provided
    let tokenData;
    try {
      if (projectId) {
        console.log('[FCM TOKEN] Using provided projectId');
        tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      } else {
        // Try without projectId first (for Expo Go)
        console.log('[FCM TOKEN] Attempting without projectId (Expo Go auto-detect)');
        tokenData = await Notifications.getExpoPushTokenAsync();
      }
    } catch (error) {
      console.log('[FCM TOKEN] ❌ Error getting token:', error.message);
      console.log('[FCM TOKEN] Error code:', error.code);
      console.log('[FCM TOKEN] Full error:', error);
      
      // If we're not in Expo Go and projectId is missing, provide helpful error
      if (error.message?.includes('projectId')) {
        console.log('[FCM TOKEN] 💡 Solution to fix projectId issue:');
        console.log('[FCM TOKEN] Option 1: Link to EAS project');
        console.log('[FCM TOKEN]   Run: npx eas init');
        console.log('[FCM TOKEN]   This will create/link an EAS project and add projectId to app.json');
        console.log('[FCM TOKEN] Option 2: Add manually to app.json');
        console.log('[FCM TOKEN]   Add to app.json: "expo": { "extra": { "eas": { "projectId": "your-project-id" } } }');
        console.log('[FCM TOKEN] Option 3: Use environment variable');
        console.log('[FCM TOKEN]   Set EXPO_PROJECT_ID=your-project-id');
      }
      throw error;
    }

    const token = tokenData.data;
    console.log('[FCM TOKEN] ✅ Expo push token obtained');
    console.log('[FCM TOKEN] Token (first 30 chars):', token.substring(0, 30) + '...');
    
    return token;
  } catch (error) {
    console.log('[FCM TOKEN] ❌ Error getting Expo push token:', error.message);
    return null;
  }
};

/**
 * Store FCM token in AsyncStorage
 * @param {string} token - FCM token
 */
export const storeFCMToken = async (token) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
  } catch (error) {
    // Silent fail
  }
};

/**
 * Get stored FCM token from AsyncStorage
 * @returns {Promise<string|null>} - Stored token or null
 */
export const getStoredFCMToken = async () => {
  try {
    return await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

/**
 * Remove FCM token from AsyncStorage
 */
export const removeFCMToken = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
  } catch (error) {
    // Silent fail
  }
};

/**
 * Initialize notifications and get token
 * This should be called on app startup or after login
 * @returns {Promise<string|null>} - FCM token or null
 */
export const initializeNotifications = async () => {
  try {
    console.log('[FCM INIT] Initializing notifications...');
    
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[FCM INIT] ❌ Permissions denied, cannot initialize');
      return null;
    }

    // Get Expo push token
    const token = await getExpoPushToken();
    if (token) {
      // Store token locally
      console.log('[FCM INIT] Storing token in AsyncStorage...');
      await storeFCMToken(token);
      console.log('[FCM INIT] ✅ Token stored locally');
      return token;
    }

    console.log('[FCM INIT] ⚠️ No token obtained');
    return null;
  } catch (error) {
    console.log('[FCM INIT] ❌ Error initializing notifications:', error.message);
    return null;
  }
};

/**
 * Set up notification received listener (foreground)
 * @param {Function} callback - Callback function to handle notification
 * @returns {Function} - Unsubscribe function
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Set up notification response listener (when user taps notification)
 * @param {Function} callback - Callback function to handle notification tap
 * @returns {Function} - Unsubscribe function
 */
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Get all notification channels (Android)
 * @returns {Promise<Array>} - Array of notification channels
 */
export const getNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    return await Notifications.getNotificationChannelsAsync();
  }
  return [];
};

/**
 * Create notification channel (Android)
 * @param {string} channelId - Channel ID
 * @param {string} name - Channel name
 * @param {string} description - Channel description
 * @param {object} options - Additional channel options
 */
export const createNotificationChannel = async (channelId, name, description, options = {}) => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name,
      description,
      importance: options.importance || AndroidImportance.HIGH,
      vibrationPattern: options.vibrationPattern || [0, 250, 250, 250],
      lightColor: options.lightColor || '#FF231F7C',
      ...options,
    });
  }
};

/**
 * Schedule a local notification (for testing)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data
 * @param {number} seconds - Delay in seconds
 */
export const scheduleLocalNotification = async (title, body, data = {}, seconds = 0) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get badge count
 * @returns {Promise<number>} - Badge count
 */
export const getBadgeCount = async () => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 * @param {number} count - Badge count
 */
export const setBadgeCount = async (count) => {
  await Notifications.setBadgeCountAsync(count);
};
