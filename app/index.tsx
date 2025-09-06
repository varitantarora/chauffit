import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeRole = useAuthStore((state) => state.activeRole);
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (activeRole === 'driver') {
    return <Redirect href="/(driver)" />;
  }
  
  if (activeRole === 'biker') {
    return <Redirect href="/(biker)" />;
  }
  
  return <Redirect href="/(customer)" />;
}