import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { BrandColors } from '../constants/Colors';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeRole = useAuthStore((state) => state.activeRole);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const driverOnboardingStatus = useAuthStore((state) => state.driverOnboardingStatus);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={BrandColors.secondary} />
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

  if (activeRole === 'admin' || activeRole === 'super_admin') {
    return <Redirect href="/(admin)/(tabs)" />;
  }

  if (activeRole === 'driver') {
    return <Redirect href={getDriverRoute(driverOnboardingStatus)} />;
  }

  if (activeRole === 'biker') {
    return <Redirect href="/(biker)/(tabs)" />;
  }

  return <Redirect href="/(customer)/(tabs)" />;
}

function getDriverRoute(status: string | null): string {
  switch (status) {
    case null:
    case undefined:
      // No profile yet
      return '/(driver)/onboarding/registration';

    case 'registered':
      // Profile created, documents need to be uploaded
      return '/(driver)/onboarding/documents';

    case 'verification_in_progress':
    case 'verification_failed':
    case 'verified_ready_for_training':
      return '/(driver)/onboarding/background-check';

    case 'training_scheduled':
      return '/(driver)/onboarding/training-scheduled';

    case 'training_failed':
      return '/(driver)/onboarding/training-failed';

    case 'certified':
      return '/(driver)/onboarding/onboarding-complete';

    case 'active':
      return '/(driver)/(tabs)';

    case 'suspended':
    case 'rejected':
      return '/(driver)/onboarding/background-check';

    default:
      return '/(driver)/(tabs)';
  }
}
