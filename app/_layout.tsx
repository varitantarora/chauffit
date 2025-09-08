import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';

export default function RootLayout() {
  console.log('🏠 RootLayout rendering...');
  
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
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}