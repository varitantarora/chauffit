import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="user-detail" />
      <Stack.Screen name="driver-verification" />
      <Stack.Screen name="biker-verification" />
      <Stack.Screen name="ride-detail" />
      <Stack.Screen name="task-detail" />
      <Stack.Screen name="payment-detail" />
      <Stack.Screen name="disputes" />
      <Stack.Screen name="dispute-detail" />
      <Stack.Screen name="drivers-pending" />
      <Stack.Screen name="bikers-pending" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="insurance-management" />
      <Stack.Screen name="amenities-management" />
      <Stack.Screen name="revenue" />
      <Stack.Screen name="training-batches" />
      <Stack.Screen name="training-batch-detail" />
      <Stack.Screen name="all-drivers" />
      <Stack.Screen name="all-bikers" />
    </Stack>
  );
}
