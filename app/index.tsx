import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeRole = useAuthStore((state) => state.activeRole);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#BD8C5E" />
        <ThemedText className="mt-4 text-secondary">Loading...</ThemedText>
      </ThemedView>
    );
  }

  // if (!hasSeenOnboarding) {
  //   return <Redirect href="/onboarding" />;
  // }
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (activeRole === 'driver') {
    return <Redirect href="/(driver)/(tabs)" />;
  }
  
  if (activeRole === 'biker') {
    return <Redirect href="/(biker)/(tabs)" />;
  }
  
  return <Redirect href="/(customer)/(tabs)" />;
}