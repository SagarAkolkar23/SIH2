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
    try {
      // Create notification channel for Android
      if (Platform.OS === 'android') {
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
          // Silent fail - channel creation might fail
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
          // Silent fail - channel creation might fail
        });
      }

      // Handle notifications received while app is in foreground
      notificationListener.current = addNotificationReceivedListener((notification) => {
        // You can show a custom in-app notification here if needed
        // For now, expo-notifications will show it automatically
      });

      // Handle notification taps (when user taps on notification)
      responseListener.current = addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;

        // Navigate based on notification data
        if (data?.screen) {
          // If notification has a screen property, navigate to it
          try {
            navigation.dispatch(
              CommonActions.navigate({
                name: data.screen,
                params: data.params || {},
              })
            );
          } catch (error) {
            // Navigation error - screen might not exist
          }
        } else if (data?.type) {
          // Navigate based on notification type
          try {
            switch (data.type) {
              case 'ALERT':
                // Navigate to alerts screen
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
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'UserNotifications',
                  })
                );
                break;
              default:
                // Default behavior - navigate to notifications
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'UserNotifications',
                  })
                );
                break;
            }
          } catch (error) {
            // Navigation error - screen might not exist in current navigation state
          }
        }
      });
    } catch (error) {
      // Silent fail - notification listeners might not be available
    }

    // Cleanup listeners on unmount
    return () => {
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (error) {
        // Silent fail during cleanup
      }
    };
  }, [navigation]);

  // This component doesn't render anything
  return null;
}
