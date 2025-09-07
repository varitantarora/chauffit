# Chauffit Platform Integration Guide

This guide explains how to integrate and use all the shared components and services in the Chauffit chauffeur platform.

## 📁 Project Structure

```
chauffit-main/
├── components/
│   └── shared/           # Universal components for all apps
│       ├── MapView.tsx
│       ├── LocationPicker.tsx
│       ├── PaymentSelector.tsx
│       ├── PushNotificationHandler.tsx
│       ├── EmergencyButton.tsx
│       ├── LoadingOverlay.tsx
│       ├── ErrorBoundary.tsx
│       ├── NetworkStatus.tsx
│       └── index.ts
├── services/
│   ├── SupabaseRealTimeService.ts
│   └── StripeService.ts
├── config/
│   ├── supabase.ts
│   └── env.ts
└── utils/               # Additional utilities
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

### 2. Initialize Services

```typescript
// In your main App component
import { useEffect } from 'react';
import SupabaseRealTimeService from './services/SupabaseRealTimeService';
import StripeService from './services/StripeService';
import { StripeProvider } from '@stripe/stripe-react-native';
import { appConfig } from './config/env';

export default function App() {
  useEffect(() => {
    // Initialize services
    StripeService.initialize();
    
    // Initialize Supabase when user logs in
    // SupabaseRealTimeService.initialize(userId, userType);
  }, []);

  return (
    <StripeProvider publishableKey={appConfig.stripePublishableKey}>
      {/* Your app content */}
    </StripeProvider>
  );
}
```

## 📱 Component Usage

### MapView Component

Universal map component with real-time tracking for all three apps.

```typescript
import { MapView, MapMarker, MapRoute } from '../components/shared';

function RideTrackingScreen() {
  const mapRef = useRef<MapViewRef>(null);
  
  const markers: MapMarker[] = [
    {
      id: 'pickup',
      coordinate: { latitude: 28.6139, longitude: 77.2090 },
      title: 'Pickup Location',
      type: 'pickup'
    },
    {
      id: 'dropoff',
      coordinate: { latitude: 28.6500, longitude: 77.2500 },
      title: 'Dropoff Location',
      type: 'dropoff'
    }
  ];

  const route: MapRoute = {
    origin: { latitude: 28.6139, longitude: 77.2090 },
    destination: { latitude: 28.6500, longitude: 77.2500 },
    strokeColor: '#BD8C5E'
  };

  return (
    <MapView
      ref={mapRef}
      markers={markers}
      route={route}
      showUserLocation
      followUserLocation
      onMarkerPress={(marker) => console.log('Marker pressed:', marker)}
      onRouteReady={(result) => console.log('Route ready:', result)}
      className="flex-1"
    />
  );
}
```

### LocationPicker Component

Address selection with Indian market support.

```typescript
import { LocationPicker, LocationData } from '../components/shared';

function BookingScreen() {
  const handleLocationSelect = (location: LocationData) => {
    console.log('Selected location:', location);
    // Update booking form
  };

  return (
    <LocationPicker
      placeholder="Where would you like to go?"
      onLocationSelect={handleLocationSelect}
      showCurrentLocation
      indianAddressFormat
      className="mx-4"
    />
  );
}
```

### PaymentSelector Component

Enhanced payment component with Stripe and Indian payment methods.

```typescript
import { PaymentSelector, PaymentMethod } from '../components/shared';

function CheckoutScreen() {
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      displayName: '**** 1234',
      lastFour: '1234',
      cardBrand: 'visa',
      isDefault: true,
      isEnabled: true
    },
    {
      id: '2',
      type: 'upi',
      displayName: 'user@upi',
      upiId: 'user@paytm',
      isDefault: false,
      isEnabled: true
    }
  ]);

  return (
    <PaymentSelector
      paymentMethods={paymentMethods}
      onPaymentMethodSelect={(method) => console.log('Selected:', method)}
      onAddPaymentMethod={() => console.log('Add new payment method')}
      indianPayments
      allowUPI
      allowCards
      className="p-4"
    />
  );
}
```

### EmergencyButton Component

Universal SOS button for all apps.

```typescript
import { EmergencyButton } from '../components/shared';

function MainScreen() {
  const emergencyContacts = [
    { id: '1', name: 'Emergency Contact', phoneNumber: '+919876543210', relationship: 'Family' }
  ];

  return (
    <View className="flex-1">
      {/* Your screen content */}
      
      <EmergencyButton
        variant="floating"
        size="large"
        userType="customer" // or 'driver' or 'biker'
        emergencyContacts={emergencyContacts}
        onEmergencyTriggered={(location) => {
          console.log('Emergency at:', location);
          // Handle emergency alert
        }}
        showConfirmation
        autoCallPolice={false}
      />
    </View>
  );
}
```

### PushNotificationHandler

Manage notifications across all apps.

```typescript
import { PushNotificationHandler, createBookingNotification } from '../components/shared';

function App() {
  const handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    
    if (notification.type === 'emergency') {
      // Handle emergency notification
      Alert.alert('Emergency Alert', notification.message);
    }
  };

  return (
    <PushNotificationHandler
      userType="customer"
      userId="user123"
      onNotificationReceived={handleNotificationReceived}
      onNotificationPressed={(notification) => {
        // Navigate to relevant screen
      }}
    >
      {/* Your app components */}
    </PushNotificationHandler>
  );
}
```

### LoadingOverlay

App-wide loading states.

```typescript
import { LoadingOverlay, InlineLoader } from '../components/shared';

function BookingScreen() {
  const [isBooking, setIsBooking] = useState(false);

  return (
    <View className="flex-1">
      {/* Screen content */}
      
      {/* For inline loading */}
      {isBooking && <InlineLoader type="dots" message="Booking your ride..." />}
      
      {/* For full screen loading */}
      <LoadingOverlay
        visible={isBooking}
        message="Booking your chauffeur..."
        subMessage="Please wait while we find the best driver for you"
        type="pulse"
        showProgress
        progress={75}
      />
    </View>
  );
}
```

### ErrorBoundary

Error handling and crash reporting.

```typescript
import { ErrorBoundary, withErrorBoundary } from '../components/shared';

// Wrap your entire app
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App error:', error);
        // Send to error reporting service
      }}
      enableErrorReporting
      showErrorDetails={__DEV__}
    >
      <YourAppContent />
    </ErrorBoundary>
  );
}

// Or use as HOC
const SafeComponent = withErrorBoundary(YourComponent, {
  onError: (error) => console.error('Component error:', error)
});
```

### NetworkStatus

Online/offline status management.

```typescript
import { NetworkStatus, useNetworkStatus, OfflineNotice } from '../components/shared';

function App() {
  return (
    <View className="flex-1">
      <NetworkStatus
        position="top"
        showWhenOnline={false}
        enableRetry
        onStatusChange={(isConnected) => {
          console.log('Network status:', isConnected);
        }}
      />
      <YourAppContent />
    </View>
  );
}

// Using the hook
function SomeComponent() {
  const { isConnected, isOffline, networkType, refreshNetworkStatus } = useNetworkStatus();
  
  if (isOffline) {
    return <OfflineNotice onRetry={refreshNetworkStatus} />;
  }
  
  return <YourContent />;
}
```

## 🔗 Real-time Integration

### Supabase Real-time Service

```typescript
import SupabaseRealTimeService from '../services/SupabaseRealTimeService';

// Initialize when user logs in
await SupabaseRealTimeService.initialize('user123', 'customer');

// Start location tracking
SupabaseRealTimeService.startLocationTracking((locationUpdate) => {
  console.log('Location update:', locationUpdate);
  // Update UI with new location
});

// Subscribe to booking updates
SupabaseRealTimeService.subscribeToBookingUpdates('booking123', (update) => {
  console.log('Booking update:', update);
  // Update booking status in UI
});

// Subscribe to emergency alerts
SupabaseRealTimeService.subscribeToEmergencyAlerts(
  5, // 5km radius
  { lat: 28.6139, lng: 77.2090 },
  (alert) => {
    console.log('Emergency alert:', alert);
    // Show emergency notification
  }
);

// Send emergency alert
await SupabaseRealTimeService.sendEmergencyAlert(
  { lat: 28.6139, lng: 77.2090 },
  'Connaught Place, New Delhi',
  'general',
  'Need immediate assistance'
);

// Cleanup when user logs out
await SupabaseRealTimeService.cleanup();
```

## 💳 Payment Integration

### Stripe Service

```typescript
import StripeService from '../services/StripeService';

// Process payment
async function processRidePayment(amount: number) {
  try {
    const result = await StripeService.processPayment(
      amount * 100, // Convert to paise
      'inr',
      'customer123',
      { bookingId: 'booking123', rideType: 'chauffeur' }
    );
    
    if (result.success) {
      console.log('Payment successful:', result.paymentIntentId);
      // Navigate to success screen
    } else {
      Alert.alert('Payment Failed', result.error);
    }
  } catch (error) {
    console.error('Payment error:', error);
    Alert.alert('Error', 'Payment processing failed');
  }
}

// Calculate GST
const { amount, gst, total } = StripeService.calculateGST(500); // ₹500
console.log(`Amount: ₹${amount}, GST: ₹${gst}, Total: ₹${total}`);

// Format currency
const formattedAmount = StripeService.formatCurrency(50000); // ₹500.00
```

## 🌐 Cross-App Communication

### Customer App → Driver App
```typescript
// Customer books a ride
const booking = await createBooking({
  pickupLocation: { lat: 28.6139, lng: 77.2090 },
  dropoffLocation: { lat: 28.6500, lng: 77.2500 },
  customerId: 'customer123'
});

// Real-time updates to nearby drivers
SupabaseRealTimeService.subscribeToBookingUpdates(booking.id, (update) => {
  if (update.status === 'accepted') {
    // Show driver details to customer
    showDriverDetails(update.driverId);
  }
});
```

### Emergency Flow: Customer → Biker
```typescript
// Customer triggers emergency
const alert = await SupabaseRealTimeService.sendEmergencyAlert(
  currentLocation,
  locationDescription,
  'medical'
);

// Nearby bikers receive alert
SupabaseRealTimeService.subscribeToEmergencyAlerts(
  10, // 10km radius for bikers
  bikerLocation,
  (alert) => {
    // Show emergency alert to biker
    showEmergencyAlert(alert);
  }
);
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Essential for all features
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_id

# Indian market features
EXPO_PUBLIC_UPI_ENABLED=true
EXPO_PUBLIC_GST_ENABLED=true
EXPO_PUBLIC_INDIAN_PHONE_VALIDATION=true
```

### Feature Flags
```bash
# Enable/disable features per environment
EXPO_PUBLIC_REAL_TIME_TRACKING=true
EXPO_PUBLIC_EMERGENCY_ALERTS=true
EXPO_PUBLIC_VOICE_CALLING=true
EXPO_PUBLIC_MULTIPLE_PAYMENTS=true
```

## 📊 Performance Optimization

### Best Practices

1. **Lazy Loading**: Components are optimized for lazy loading
2. **Memory Management**: Proper cleanup in all services
3. **Background Tasks**: Location tracking optimized for battery
4. **Caching**: Local storage for offline functionality
5. **Image Optimization**: All images are properly compressed

### Real-time Optimization

```typescript
// Limit location updates
const locationConfig = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 10000, // 10 seconds
  distanceInterval: 50, // 50 meters
};

// Throttle real-time subscriptions
const throttledLocationUpdate = throttle((location) => {
  updateLocationOnServer(location);
}, 5000);
```

## 🛡️ Security Features

### Data Protection
- Secure token storage with Expo SecureStore
- Biometric authentication ready
- Payment data handled by Stripe (PCI compliant)
- Real-time data encrypted in transit

### Privacy Controls
- Location permissions properly requested
- Emergency contacts stored securely
- User data anonymization options
- GDPR compliance ready

## 🚨 Error Handling

### Global Error Boundary
```typescript
// Catches all React component errors
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Service Error Handling
```typescript
// All services include proper error handling
try {
  await SupabaseRealTimeService.sendMessage();
} catch (error) {
  handleServiceError(error);
}
```

## 📈 Monitoring & Analytics

### Built-in Logging
- Component usage tracking
- Error reporting with stack traces
- Performance monitoring
- User interaction analytics

### Real-time Metrics
- Active users tracking
- Location accuracy monitoring
- Payment success rates
- Emergency response times

## 🎯 Indian Market Features

### Payment Methods
- UPI integration ready
- Indian bank support
- GST calculation
- Regional payment gateways

### Emergency Services
- Indian emergency numbers (100, 108, 101)
- Multi-language support infrastructure
- Local emergency contact integration
- Regional service provider network

### Compliance
- Indian phone number validation
- Regional address formatting
- Local tax calculations
- Data localization ready

## 🔄 Updates & Maintenance

### Over-the-Air Updates
- Critical bug fixes
- Feature flag updates
- Configuration changes
- Emergency patches

### Version Control
- Component versioning
- API version management
- Backward compatibility
- Migration guides

---

## 🆘 Support & Troubleshooting

### Common Issues

1. **Maps not loading**: Check Google Maps API key
2. **Payments failing**: Verify Stripe configuration
3. **Notifications not working**: Check OneSignal setup
4. **Real-time not connecting**: Verify Supabase credentials

### Debug Mode
Enable debug mode in development:
```bash
EXPO_PUBLIC_DEBUG_MODE=true
```

### Contact Support
- GitHub Issues: [Repository Issues](https://github.com/chauffit/app/issues)
- Email: support@chauffit.com
- Documentation: [docs.chauffit.com](https://docs.chauffit.com)

This integration guide provides everything you need to implement the complete Chauffit platform with all shared components and real-time integrations working seamlessly across Customer, Driver, and Biker apps.