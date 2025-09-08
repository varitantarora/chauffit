import { Stack } from 'expo-router';

export default function BikerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="task/delivery" />
      <Stack.Screen name="task/driver-pickup" />
      <Stack.Screen name="task/emergency" />
    </Stack>
  );
}