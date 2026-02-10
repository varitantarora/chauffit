import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/accept" />
      <Stack.Screen name="job/active" />
      <Stack.Screen name="job/navigation" />
      <Stack.Screen name="job/otp-start" />
      <Stack.Screen name="onboarding/registration" />
      <Stack.Screen name="onboarding/documents" />
      <Stack.Screen name="onboarding/background-check" />
      <Stack.Screen name="notifications-center" />
      <Stack.Screen name="earnings/detailed" />
      <Stack.Screen name="earnings/withdraw" />
      <Stack.Screen name="earnings/advance" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="banking-details" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="support" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="user-guides" />
      <Stack.Screen name="submit-request" />
      <Stack.Screen name="request-status" />
    </Stack>
  );
}
