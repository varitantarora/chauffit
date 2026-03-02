import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { useI18nStore } from '../store/i18nStore';

export default function RootLayout() {
  console.log('🏠 RootLayout rendering...');

  // Initialize language preference from AsyncStorage
  const initLanguage = useI18nStore((state) => state.initLanguage);
  useEffect(() => {
    initLanguage();
  }, []);
  
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