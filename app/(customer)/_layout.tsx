import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book-ride" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="ride" />
    </Stack>
  );
}