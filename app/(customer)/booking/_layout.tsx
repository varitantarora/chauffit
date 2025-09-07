import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="select-duration" />
      <Stack.Screen name="select-chauffeur" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}