import React, { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  type: 'booking' | 'job' | 'emergency' | 'payment' | 'general';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  userType?: 'customer' | 'driver' | 'biker';
  userId?: string;
  timestamp: number;
}

interface PushNotificationHandlerProps {
  onNotificationReceived?: (notification: NotificationData) => void;
  onNotificationPressed?: (notification: NotificationData) => void;
  userType: 'customer' | 'driver' | 'biker';
  userId: string;
  oneSignalAppId?: string;
  children?: React.ReactNode;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notificationData = notification.request.content.data as any;
    const priority = notificationData?.priority || 'normal';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: priority === 'emergency' || priority === 'high',
      shouldSetBadge: true,
      priority: priority === 'emergency' ? 
        Notifications.AndroidNotificationPriority.MAX : 
        Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

const PushNotificationHandler: React.FC<PushNotificationHandlerProps> = ({
  onNotificationReceived,
  onNotificationPressed,
  userType,
  userId,
  oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = React.useState<string>();
  const [isRegistered, setIsRegistered] = React.useState(false);

  // Register for push notifications
  const registerForPushNotificationsAsync = useCallback(async () => {
    try {
      let token;

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Emergency channel for high-priority notifications
        Notifications.setNotificationChannelAsync('emergency', {
          name: 'Emergency Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });

        // Job notifications channel
        Notifications.setNotificationChannelAsync('jobs', {
          name: 'Job Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250],
          lightColor: '#00FF00',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Push notifications are required for important updates about your rides and emergencies.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Get the Expo push token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;

      setExpoPushToken(token);

      // Store token and user info
      await AsyncStorage.setItem('expoPushToken', token);
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('userId', userId);

      // In a real implementation, send this token to your backend
      await registerTokenWithBackend(token, userType, userId);
      
      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }, [userType, userId]);

  // Register token with backend service
  const registerTokenWithBackend = async (token: string, type: string, id: string) => {
    try {
      // In a real implementation, you would call your backend API
      console.log('Registering token with backend:', { token, type, id });
      
      // Example API call:
      // await fetch('/api/notifications/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userType: type, userId: id })
      // });
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  };

  // Handle notification received while app is in foreground
  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    const content = notification.request.content;
    const notificationData: NotificationData = {
      type: content.data?.type || 'general',
      title: content.title || '',
      message: content.body || '',
      data: content.data,
      priority: content.data?.priority || 'normal',
      userType: content.data?.userType,
      userId: content.data?.userId,
      timestamp: Date.now(),
    };

    onNotificationReceived?.(notificationData);

    // Handle emergency notifications specially
    if (notificationData.priority === 'emergency') {
      Alert.alert(
        'Emergency Alert',
        notificationData.message,
        [
          { text: 'Dismiss', style: 'cancel' },
          { text: 'View', onPress: () => onNotificationPressed?.(notificationData) }
        ],
        { cancelable: false }
      );
    }
  }, [onNotificationReceived, onNotificationPressed]);

  // Handle notification pressed/tapped
  const handleNotificationPressed = useCallback((response: Notifications.NotificationResponse) => {
    const content = response.notification.request.content;
    const notificationData: NotificationData = {
      type: content.data?.type || 'general',
      title: content.title || '',
      message: content.body || '',
      data: content.data,
      priority: content.data?.priority || 'normal',
      userType: content.data?.userType,
      userId: content.data?.userId,
      timestamp: Date.now(),
    };

    onNotificationPressed?.(notificationData);
  }, [onNotificationPressed]);

  // Send local notification
  const sendLocalNotification = useCallback(async (notificationData: NotificationData) => {
    try {
      const channelId = notificationData.priority === 'emergency' ? 'emergency' : 
                       notificationData.type === 'job' ? 'jobs' : 'default';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
            priority: notificationData.priority,
            userType: notificationData.userType,
            userId: notificationData.userId,
          },
          sound: notificationData.priority === 'emergency' ? 'default' : undefined,
          priority: notificationData.priority === 'emergency' ? 
            Notifications.AndroidNotificationPriority.MAX :
            Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // Send immediately
        identifier: `local_${Date.now()}`,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }, []);

  // Send notification to specific user
  const sendNotificationToUser = useCallback(async (
    targetUserId: string, 
    targetUserType: string,
    notificationData: NotificationData
  ) => {
    try {
      // In a real implementation, this would call your backend API
      console.log('Sending notification to user:', { targetUserId, targetUserType, notificationData });
      
      // Example API call:
      // await fetch('/api/notifications/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     targetUserId,
      //     targetUserType,
      //     ...notificationData
      //   })
      // });
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }, []);

  // Emergency broadcast
  const sendEmergencyBroadcast = useCallback(async (
    location: { latitude: number; longitude: number },
    radius: number, // in kilometers
    message: string
  ) => {
    try {
      const notificationData: NotificationData = {
        type: 'emergency',
        title: 'Emergency Alert',
        message,
        priority: 'emergency',
        data: {
          location,
          radius,
          senderId: userId,
          senderType: userType,
        },
        timestamp: Date.now(),
      };

      // In a real implementation, this would call your backend API to broadcast to nearby users
      console.log('Sending emergency broadcast:', { location, radius, notificationData });
      
      // For demo, send local notification
      await sendLocalNotification(notificationData);
    } catch (error) {
      console.error('Error sending emergency broadcast:', error);
    }
  }, [userId, userType, sendLocalNotification]);

  // Initialize notifications
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, [registerForPushNotificationsAsync]);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationPressed);

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [handleNotificationReceived, handleNotificationPressed]);

  // Update user tags when userType or userId changes
  useEffect(() => {
    if (isRegistered && expoPushToken) {
      registerTokenWithBackend(expoPushToken, userType, userId);
    }
  }, [userType, userId, isRegistered, expoPushToken]);

  // Expose notification functions through context or props
  React.useLayoutEffect(() => {
    if (children && React.isValidElement(children)) {
      // You could use React Context to provide these functions to child components
      (children as any).notificationFunctions = {
        sendLocalNotification,
        sendNotificationToUser,
        sendEmergencyBroadcast,
        expoPushToken,
        isRegistered,
      };
    }
  }, [sendLocalNotification, sendNotificationToUser, sendEmergencyBroadcast, expoPushToken, isRegistered]);

  return <>{children}</>;
};

// Helper functions for creating common notifications
export const createBookingNotification = (
  bookingId: string,
  driverName?: string,
  status?: string
): NotificationData => ({
  type: 'booking',
  title: 'Booking Update',
  message: status === 'accepted' 
    ? `Your booking has been accepted by ${driverName}`
    : status === 'completed'
    ? 'Your trip has been completed'
    : 'Booking status updated',
  priority: 'high',
  data: { bookingId, driverName, status },
  timestamp: Date.now(),
});

export const createJobNotification = (
  jobId: string,
  customerName: string,
  pickup: string
): NotificationData => ({
  type: 'job',
  title: 'New Job Request',
  message: `New ride request from ${customerName} at ${pickup}`,
  priority: 'high',
  data: { jobId, customerName, pickup },
  timestamp: Date.now(),
});

export const createEmergencyNotification = (
  emergencyId: string,
  location: string,
  requesterName?: string
): NotificationData => ({
  type: 'emergency',
  title: 'Emergency Alert',
  message: `Emergency assistance needed at ${location}${requesterName ? ` by ${requesterName}` : ''}`,
  priority: 'emergency',
  data: { emergencyId, location, requesterName },
  timestamp: Date.now(),
});

export default PushNotificationHandler;