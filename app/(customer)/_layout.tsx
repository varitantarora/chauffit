import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book-ride-new" />
      <Stack.Screen name="trip-insurance" />
      <Stack.Screen name="ride-confirmation" />
      <Stack.Screen name="ride-tracking" />
      <Stack.Screen name="trip-completion" />
      <Stack.Screen name="rating-feedback" />
      <Stack.Screen name="scheduled-rides" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="ride" />
      <Stack.Screen name="support" />
      <Stack.Screen name="searching-drivers" />
      <Stack.Screen name="ride-search" />
      <Stack.Screen name="ride-details" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="user-guides" />
      <Stack.Screen name="submit-request" />
      <Stack.Screen name="request-status" />
      <Stack.Screen name="blog-list" />
      <Stack.Screen name="blog-detail" />
    </Stack>
  );
}