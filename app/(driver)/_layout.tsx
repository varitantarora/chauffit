import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/accept" />
      <Stack.Screen name="job/active" />
      <Stack.Screen name="job/navigation" />
    </Stack>
  );
}