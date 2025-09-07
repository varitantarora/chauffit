import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <NavigationContainer>
        <StripeProvider publishableKey="pk_test_mock">
          {children}
        </StripeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };

// Test data generators
export const mockUser = {
  id: 'test-user-123',
  phone: '+919876543210',
  name: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
};

export const mockDriver = {
  id: 'test-driver-123',
  name: 'Test Driver',
  phone: '+919876543211',
  vehicle_number: 'DL 01 AB 1234',
  vehicle_type: 'sedan',
  rating: 4.5,
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
  },
  is_online: true,
  earnings: 5000,
};

export const mockBiker = {
  id: 'test-biker-123',
  name: 'Test Biker',
  phone: '+919876543212',
  vehicle_number: 'DL 05 XY 9876',
  rating: 4.8,
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
  },
  is_available: true,
  response_time: 5,
};

export const mockBooking = {
  id: 'test-booking-123',
  customer_id: mockUser.id,
  driver_id: mockDriver.id,
  pickup_location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, New Delhi',
  },
  destination: {
    latitude: 28.5355,
    longitude: 77.3910,
    address: 'Noida Sector 62',
  },
  duration_hours: 4,
  total_amount: 2000,
  status: 'pending',
  created_at: new Date().toISOString(),
};

export const mockTask = {
  id: 'test-task-123',
  type: 'emergency',
  priority: 'high',
  customer_id: mockUser.id,
  driver_id: mockDriver.id,
  biker_id: mockBiker.id,
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Emergency Location',
  },
  description: 'Emergency assistance required',
  status: 'assigned',
  created_at: new Date().toISOString(),
};

export const mockPayment = {
  id: 'test-payment-123',
  booking_id: mockBooking.id,
  amount: 2000,
  currency: 'INR',
  method: 'upi',
  status: 'completed',
  stripe_payment_id: 'pi_test_123',
  created_at: new Date().toISOString(),
};

// Location helpers
export const mockLocation = {
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 5,
  timestamp: Date.now(),
};

export const mockDelhiLocations = {
  connaught_place: {
    latitude: 28.6304,
    longitude: 77.2177,
    address: 'Connaught Place, New Delhi, Delhi, India',
  },
  india_gate: {
    latitude: 28.6129,
    longitude: 77.2295,
    address: 'India Gate, New Delhi, Delhi, India',
  },
  noida: {
    latitude: 28.5355,
    longitude: 77.3910,
    address: 'Noida, Uttar Pradesh, India',
  },
  gurgaon: {
    latitude: 28.4595,
    longitude: 77.0266,
    address: 'Gurgaon, Haryana, India',
  },
};

// Async helpers
export const waitForAsync = (ms: number = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock navigation helpers
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  getState: jest.fn(),
  getParent: jest.fn(),
  getId: jest.fn(),
};

export const mockRoute = {
  key: 'test-route-key',
  name: 'TestScreen',
  params: {},
};

// Store helpers
export const createMockStore = (initialState: any = {}) => ({
  getState: () => initialState,
  dispatch: jest.fn(),
  subscribe: jest.fn(),
});

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

// Performance testing helpers
export const measureRenderTime = async (component: ReactElement) => {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
};

// Memory leak detection helper
export const checkForMemoryLeaks = () => {
  if (global.gc) {
    global.gc();
    const memoryUsage = process.memoryUsage();
    return memoryUsage;
  }
  return null;
};