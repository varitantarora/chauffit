import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { useI18nStore } from '../store/i18nStore';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '../services/NotificationService';
import { useAuthStore } from '../store/authStore';
import { LogBox } from 'react-native';

// Suppress Expo Go push notification warning on Android
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)',
  '`expo-notifications` functionality is not fully supported in Expo Go'
]);

export default function RootLayout() {
  console.log('🏠 RootLayout rendering...');

  // Initialize language preference from AsyncStorage
  const initLanguage = useI18nStore((state) => state.initLanguage);
  
  // Notification refs
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    initLanguage();

    // Register for push notifications
    registerForPushNotificationsAsync().then((token: string | undefined) => {
      console.log('Registered for push notifications, token:', token);
      if (token) {
        pushTokenRef.current = token;
        // If already authenticated, send token immediately
        if (isAuthenticated) {
          sendPushTokenToBackend(token);
        }
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification 
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Effect to send token when authentication state changes
  useEffect(() => {
    if (isAuthenticated && pushTokenRef.current) {
      console.log('[RootLayout] User authenticated, sending push token to backend...');
      sendPushTokenToBackend(pushTokenRef.current);
    }
  }, [isAuthenticated]);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'none', // Disable animations that might cause context issues
            gestureEnabled: false // Disable all gestures
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(driver)" />
          <Stack.Screen name="(biker)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}