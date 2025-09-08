import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'none', // Disable animations that might conflict
        gestureEnabled: false // Disable gestures that might conflict
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="email-login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="car-details" />
    </Stack>
  );
}