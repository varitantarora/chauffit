import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/accept" />
      <Stack.Screen name="job/active" />
      <Stack.Screen name="job/navigation" />
      <Stack.Screen name="banking-details" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="support" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="user-guides" />
      <Stack.Screen name="submit-request" />
      <Stack.Screen name="request-status" />
    </Stack>
  );
}