import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  createNotificationChannel,
} from '../service/notificationService';
import { useNavigation, CommonActions } from '@react-navigation/native';

/**
 * Component to handle incoming notifications
 * Should be rendered once at the root level (inside NavigationContainer)
 */
export default function NotificationHandler() {
  const navigation = useNavigation();
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    console.log('[FCM NOTIFICATION LOGS] ========================================');
    console.log('[FCM NOTIFICATION LOGS] Setting up notification handlers...');
    console.log('[FCM NOTIFICATION LOGS] Platform:', Platform.OS);
    
    try {
      // Create notification channel for Android
      if (Platform.OS === 'android') {
        console.log('[FCM NOTIFICATION LOGS] Creating Android notification channels...');
        createNotificationChannel(
          'default',
          'Default',
          'Default notification channel',
          {
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          }
        ).catch((error) => {
          console.log('[FCM NOTIFICATION LOGS] ⚠️ Failed to create default channel:', error.message);
        });

        // Create channel for alerts
        createNotificationChannel(
          'alerts',
          'Alerts',
          'Important alerts and notifications',
          {
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          }
        ).catch((error) => {
          console.log('[FCM NOTIFICATION LOGS] ⚠️ Failed to create alerts channel:', error.message);
        });
        console.log('[FCM NOTIFICATION LOGS] ✅ Android notification channels setup completed');
      }

      // Handle notifications received while app is in foreground
      notificationListener.current = addNotificationReceivedListener((notification) => {
        console.log('[FCM NOTIFICATION LOGS] ========================================');
        console.log('[FCM NOTIFICATION LOGS] 📬 Notification received (app in foreground)');
        console.log('[FCM NOTIFICATION LOGS] Title:', notification.request.content.title || 'N/A');
        console.log('[FCM NOTIFICATION LOGS] Body:', notification.request.content.body || 'N/A');
        console.log('[FCM NOTIFICATION LOGS] Data:', JSON.stringify(notification.request.content.data || {}));
        console.log('[FCM NOTIFICATION LOGS] Identifier:', notification.request.identifier || 'N/A');
        console.log('[FCM NOTIFICATION LOGS] ========================================');
        // You can show a custom in-app notification here if needed
        // For now, expo-notifications will show it automatically
      });

      // Handle notification taps (when user taps on notification)
      responseListener.current = addNotificationResponseListener((response) => {
        console.log('[FCM NOTIFICATION LOGS] ========================================');
        console.log('[FCM NOTIFICATION LOGS] 👆 Notification tapped/opened');
        console.log('[FCM NOTIFICATION LOGS] Title:', response.notification.request.content.title || 'N/A');
        console.log('[FCM NOTIFICATION LOGS] Body:', response.notification.request.content.body || 'N/A');
        console.log('[FCM NOTIFICATION LOGS] Data:', JSON.stringify(response.notification.request.content.data || {}));
        console.log('[FCM NOTIFICATION LOGS] Action Identifier:', response.actionIdentifier || 'DEFAULT');
        console.log('[FCM NOTIFICATION LOGS] ========================================');
        const data = response.notification.request.content.data;

        // Navigate based on notification data
        if (data?.screen) {
          // If notification has a screen property, navigate to it
          console.log('[FCM NOTIFICATION LOGS] Navigating to screen:', data.screen);
          try {
            navigation.dispatch(
              CommonActions.navigate({
                name: data.screen,
                params: data.params || {},
              })
            );
            console.log('[FCM NOTIFICATION LOGS] ✅ Navigation successful to:', data.screen);
          } catch (error) {
            console.log('[FCM NOTIFICATION LOGS] ❌ Navigation failed:', error.message);
            // Navigation error - screen might not exist
          }
        } else if (data?.type) {
          // Navigate based on notification type
          console.log('[FCM NOTIFICATION LOGS] Navigating based on notification type:', data.type);
          try {
            let targetScreen = 'UserNotifications'; // Default
            switch (data.type) {
              case 'ALERT':
                // Navigate to alerts screen
                targetScreen = 'UserAlerts';
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'UserAlerts',
                  })
                );
                break;
              case 'MAINTENANCE':
              case 'NOTIFICATION':
              case 'WARNING':
              case 'SUCCESS':
                // Navigate to notifications screen
                targetScreen = 'UserNotifications';
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'UserNotifications',
                  })
                );
                break;
              default:
                // Default behavior - navigate to notifications
                targetScreen = 'UserNotifications';
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'UserNotifications',
                  })
                );
                break;
            }
            console.log('[FCM NOTIFICATION LOGS] ✅ Navigation successful to:', targetScreen);
          } catch (error) {
            console.log('[FCM NOTIFICATION LOGS] ❌ Navigation failed:', error.message);
            // Navigation error - screen might not exist in current navigation state
          }
        } else {
          console.log('[FCM NOTIFICATION LOGS] No navigation data in notification');
        }
      });
      console.log('[FCM NOTIFICATION LOGS] ✅ Notification listeners setup completed');
      console.log('[FCM NOTIFICATION LOGS] ========================================');
    } catch (error) {
      console.log('[FCM NOTIFICATION LOGS] ❌ Failed to setup notification listeners:', error.message);
      console.log('[FCM NOTIFICATION LOGS] Error stack:', error.stack);
      console.log('[FCM NOTIFICATION LOGS] ========================================');
      // Silent fail - notification listeners might not be available
    }

    // Cleanup listeners on unmount
    return () => {
      console.log('[FCM NOTIFICATION LOGS] Cleaning up notification listeners...');
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
          console.log('[FCM NOTIFICATION LOGS] ✅ Notification received listener removed');
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
          console.log('[FCM NOTIFICATION LOGS] ✅ Notification response listener removed');
        }
        console.log('[FCM NOTIFICATION LOGS] Cleanup completed');
      } catch (error) {
        console.log('[FCM NOTIFICATION LOGS] ⚠️ Error during cleanup:', error.message);
        // Silent fail during cleanup
      }
    };
  }, [navigation]);

  // This component doesn't render anything
  return null;
}
