import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeRole = useAuthStore((state) => state.activeRole);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  
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