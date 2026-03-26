import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import NotificationApiService from './api/NotificationApiService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D9D1C6',
      sound: 'default'
    });

    // Special channel for jobs/priorities
    await Notifications.setNotificationChannelAsync('jobs', {
      name: 'Job Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#314B4C',
      sound: 'default'
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('[NotificationService] Failed to get push token for push notification!');
      return;
    }
    
    // First attempt: Native Device Token (Reliable in bare workflow)
    try {
      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('[NotificationService] Native Device Token acquired:', token);
    } catch (e) {
      console.log('[NotificationService] Failed to get native device token, trying Expo fallback...');
      
      // Fallback: Expo Push Token (Requires projectId)
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
        if (projectId) {
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          console.log('[NotificationService] Expo Push Token acquired:', token);
        } else {
          console.log('[NotificationService] Skipping Expo token fallback due to missing projectId.');
        }
      } catch (e2) {
        console.error('[NotificationService] Error getting fallback token:', e2);
      }
    }
  } else {
    console.log('[NotificationService] Not a physical device, skipping registration.');
  }

  return token;
}

export async function sendPushTokenToBackend(token: string) {
  try {
    const response = await NotificationApiService.registerDevice({
      device_token: token,
      device_type: (Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web') as 'ios' | 'android' | 'web',
      app_version: Constants.expoConfig?.version || '1.0.0',
      os_version: Device.osVersion || '',
      device_model: Device.modelName || '',
      is_active: true,
      last_used_at: new Date().toISOString(),
    });

    if (response.success) {
      console.log('[NotificationService] Token registered with backend');
    } else {
      console.error('[NotificationService] Failed to register token with backend:', response.error);
    }
  } catch (error) {
    console.error('[NotificationService] Error sending token to backend:', error);
  }
}
