import { Stack } from 'expo-router';

export default function BikerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      
      {/* Onboarding screens */}
      <Stack.Screen name="onboarding/login" />
      <Stack.Screen name="onboarding/vehicle-registration" />
      <Stack.Screen name="onboarding/documents" />
      <Stack.Screen name="onboarding/background-check" />
      
      {/* Pickup request screens */}
      <Stack.Screen name="request/single-pickup" />
      <Stack.Screen name="request/batch-pickup" />
      
      {/* Navigation screens */}
      <Stack.Screen name="navigation/en-route" />
      <Stack.Screen name="navigation/pickup-confirmation" />
      <Stack.Screen name="navigation/transporting" />
      <Stack.Screen name="navigation/batch-progress" />
      
      {/* Completion screens */}
      <Stack.Screen name="completion/dropoff-complete" />
      
      {/* Analytics screens */}
      <Stack.Screen name="analytics/performance" />
      <Stack.Screen name="edit-profile" />
      
      {/* Legacy task screens */}
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="task/delivery" />
      <Stack.Screen name="task/driver-pickup" />
      <Stack.Screen name="task/emergency" />
    </Stack>
  );
}
