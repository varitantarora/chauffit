import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import fetchMock from 'jest-fetch-mock';
import { server } from './mocks/server';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => ({
    coords: {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
    },
  })),
  watchPositionAsync: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  presentNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sms', () => ({
  sendSMSAsync: jest.fn(() => ({ result: 'sent' })),
}));

jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getContactsAsync: jest.fn(() => ({ data: [] })),
}));

// Mock React Native modules
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockMapView = (props: any) => React.createElement(View, props);
  const MockMarker = (props: any) => React.createElement(View, props);
  const MockPolyline = (props: any) => React.createElement(View, props);
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-maps-directions', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, props),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('react-native-onesignal', () => ({
  setAppId: jest.fn(),
  requestPermissions: jest.fn(),
  addSubscriptionObserver: jest.fn(),
  getDeviceState: jest.fn(() => ({ userId: 'test-user-id' })),
}));

jest.mock('react-native-network-state', () => ({
  NetworkState: {
    isConnected: true,
    isInternetReachable: true,
  },
  addEventListener: jest.fn(),
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => ({
    type: 'WIFI',
    isConnected: true,
    isInternetReachable: true,
  })),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  })),
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: any) => children,
  useStripe: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
    confirmPayment: jest.fn(),
  }),
  usePaymentSheet: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

// Mock Google Places
jest.mock('react-native-google-places-autocomplete', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    GooglePlacesAutocomplete: (props: any) => React.createElement(View, props),
  };
});

jest.mock('react-native-geocoding', () => ({
  init: jest.fn(),
  from: jest.fn(() => ({
    then: jest.fn((callback) =>
      callback({
        results: [
          {
            formatted_address: 'New Delhi, Delhi, India',
            geometry: {
              location: { lat: 28.6139, lng: 77.2090 },
            },
          },
        ],
      })
    ),
  })),
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Enable fetch mocks
fetchMock.enableMocks();

// Global test timeout
jest.setTimeout(10000);

// Suppress console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});