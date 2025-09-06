import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="history" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="tracking" />
    </Stack>
  );
}