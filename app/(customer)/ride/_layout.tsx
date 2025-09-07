import { Stack } from 'expo-router';

export default function RideLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="tracking" />
      <Stack.Screen name="completed" />
    </Stack>
  );
}