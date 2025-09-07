// Mock Supabase Service
export const mockSupabaseService = {
  // Auth methods
  signInWithOTP: jest.fn(() => 
    Promise.resolve({ data: { user: null, session: null }, error: null })
  ),
  verifyOTP: jest.fn(() => 
    Promise.resolve({
      data: { 
        user: { id: 'test-user-123', phone: '+919876543210' },
        session: { access_token: 'mock_token' }
      },
      error: null
    })
  ),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  getCurrentUser: jest.fn(() => Promise.resolve({ id: 'test-user-123' })),

  // Database methods
  getUsers: jest.fn(() => Promise.resolve({ data: [], error: null })),
  getDrivers: jest.fn(() => Promise.resolve({ data: [], error: null })),
  getBikers: jest.fn(() => Promise.resolve({ data: [], error: null })),
  getBookings: jest.fn(() => Promise.resolve({ data: [], error: null })),
  getTasks: jest.fn(() => Promise.resolve({ data: [], error: null })),
  
  insertBooking: jest.fn(() => Promise.resolve({ 
    data: { id: 'new-booking-123' }, 
    error: null 
  })),
  updateBooking: jest.fn(() => Promise.resolve({ data: null, error: null })),
  deleteBooking: jest.fn(() => Promise.resolve({ data: null, error: null })),

  // Real-time subscriptions
  subscribeToBookings: jest.fn(() => ({
    unsubscribe: jest.fn()
  })),
  subscribeToTasks: jest.fn(() => ({
    unsubscribe: jest.fn()
  })),
  subscribeToDriverLocations: jest.fn(() => ({
    unsubscribe: jest.fn()
  })),

  // Location tracking
  updateDriverLocation: jest.fn(() => Promise.resolve({ data: null, error: null })),
  updateBikerLocation: jest.fn(() => Promise.resolve({ data: null, error: null })),
};

// Mock Stripe Service
export const mockStripeService = {
  initPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
  presentPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
  confirmPayment: jest.fn(() => Promise.resolve({ 
    paymentIntent: { 
      id: 'pi_test_123',
      status: 'succeeded' 
    }, 
    error: null 
  })),
  createPaymentIntent: jest.fn(() => Promise.resolve({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    amount: 200000,
    currency: 'inr'
  })),
  createSetupIntent: jest.fn(() => Promise.resolve({
    id: 'seti_test_123',
    client_secret: 'seti_test_123_secret'
  })),
  attachPaymentMethod: jest.fn(() => Promise.resolve({ error: null })),
  detachPaymentMethod: jest.fn(() => Promise.resolve({ error: null })),
  listPaymentMethods: jest.fn(() => Promise.resolve({ data: [] })),
  
  // Indian payment methods
  createUPIPayment: jest.fn(() => Promise.resolve({
    id: 'upi_test_123',
    status: 'requires_confirmation'
  })),
  confirmUPIPayment: jest.fn(() => Promise.resolve({
    id: 'upi_test_123',
    status: 'succeeded'
  })),
};

// Mock Location Service
export const mockLocationService = {
  getCurrentLocation: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
    },
    timestamp: Date.now(),
  })),
  watchPosition: jest.fn(() => ({
    remove: jest.fn(),
  })),
  requestPermissions: jest.fn(() => Promise.resolve({ status: 'granted' })),
  geocodeAddress: jest.fn(() => Promise.resolve({
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'New Delhi, Delhi, India',
  })),
  reverseGeocode: jest.fn(() => Promise.resolve({
    address: 'Connaught Place, New Delhi, Delhi, India',
  })),
  calculateDistance: jest.fn(() => 25.5), // km
  calculateETA: jest.fn(() => 45), // minutes
  isLocationEnabled: jest.fn(() => Promise.resolve(true)),
  
  // Geofencing
  startGeofencing: jest.fn(),
  stopGeofencing: jest.fn(),
  isInsideGeofence: jest.fn(() => true),
};

// Mock Notification Service
export const mockNotificationService = {
  requestPermissions: jest.fn(() => Promise.resolve({ status: 'granted' })),
  sendNotification: jest.fn(() => Promise.resolve({ id: 'test_notification_123' })),
  scheduleNotification: jest.fn(() => Promise.resolve({ id: 'scheduled_123' })),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  
  // OneSignal specific
  setUserId: jest.fn(),
  addSubscriptionObserver: jest.fn(),
  removeSubscriptionObserver: jest.fn(),
  getDeviceState: jest.fn(() => Promise.resolve({ userId: 'test_onesignal_id' })),
  
  // Push notification handling
  onNotificationReceived: jest.fn(),
  onNotificationOpened: jest.fn(),
  setBadgeCount: jest.fn(),
  clearBadge: jest.fn(),
};

// Mock SMS Service
export const mockSMSService = {
  sendOTP: jest.fn(() => Promise.resolve({ 
    status: 'sent',
    messageId: 'sms_test_123'
  })),
  sendEmergencyAlert: jest.fn(() => Promise.resolve({ 
    status: 'sent',
    messageId: 'emergency_sms_123'
  })),
  sendBookingConfirmation: jest.fn(() => Promise.resolve({ 
    status: 'sent',
    messageId: 'booking_sms_123'
  })),
  sendDriverAssignment: jest.fn(() => Promise.resolve({ 
    status: 'sent',
    messageId: 'driver_sms_123'
  })),
};

// Mock Maps Service
export const mockMapsService = {
  getDirections: jest.fn(() => Promise.resolve({
    routes: [{
      overview_polyline: { points: 'test_polyline' },
      legs: [{
        duration: { text: '45 mins', value: 2700 },
        distance: { text: '25 km', value: 25000 }
      }]
    }],
    status: 'OK'
  })),
  getPlaceAutocomplete: jest.fn(() => Promise.resolve({
    predictions: [{
      description: 'Test Location, New Delhi',
      place_id: 'test_place_id'
    }],
    status: 'OK'
  })),
  getPlaceDetails: jest.fn(() => Promise.resolve({
    result: {
      geometry: {
        location: { lat: 28.6139, lng: 77.2090 }
      },
      formatted_address: 'Test Address, New Delhi, India'
    },
    status: 'OK'
  })),
  reverseGeocode: jest.fn(() => Promise.resolve({
    results: [{
      formatted_address: 'Test Address, New Delhi, India',
      place_id: 'test_place_id'
    }],
    status: 'OK'
  })),
};

// Mock Emergency Service
export const mockEmergencyService = {
  triggerSOS: jest.fn(() => Promise.resolve({
    alertId: 'sos_alert_123',
    status: 'dispatched',
    estimatedArrival: 300 // 5 minutes
  })),
  notifyEmergencyContacts: jest.fn(() => Promise.resolve({
    contactsNotified: 3,
    status: 'sent'
  })),
  dispatchBiker: jest.fn(() => Promise.resolve({
    bikerId: 'test-biker-123',
    estimatedArrival: 300
  })),
  callPolice: jest.fn(() => Promise.resolve({ status: 'connected' })),
  callAmbulance: jest.fn(() => Promise.resolve({ status: 'connected' })),
  
  // Emergency tracking
  startEmergencyTracking: jest.fn(),
  stopEmergencyTracking: jest.fn(),
  updateEmergencyLocation: jest.fn(),
};

// Mock Storage Service
export const mockStorageService = {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  
  // Secure storage
  setSecureItem: jest.fn(() => Promise.resolve()),
  getSecureItem: jest.fn(() => Promise.resolve(null)),
  removeSecureItem: jest.fn(() => Promise.resolve()),
  
  // Token management
  storeAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('mock_token')),
  removeAuthToken: jest.fn(() => Promise.resolve()),
  
  // User preferences
  storeUserPreferences: jest.fn(() => Promise.resolve()),
  getUserPreferences: jest.fn(() => Promise.resolve({})),
};

// Mock Analytics Service
export const mockAnalyticsService = {
  trackEvent: jest.fn(),
  trackScreen: jest.fn(),
  setUserId: jest.fn(),
  setUserProperty: jest.fn(),
  
  // Booking analytics
  trackBookingStarted: jest.fn(),
  trackBookingCompleted: jest.fn(),
  trackBookingCancelled: jest.fn(),
  
  // Driver analytics
  trackDriverOnline: jest.fn(),
  trackJobAccepted: jest.fn(),
  trackJobCompleted: jest.fn(),
  
  // Emergency analytics
  trackSOSTriggered: jest.fn(),
  trackEmergencyResolved: jest.fn(),
  
  // Performance analytics
  trackAppLaunch: jest.fn(),
  trackScreenLoadTime: jest.fn(),
  trackAPIResponseTime: jest.fn(),
};

// Export all mocks
export const mockServices = {
  supabase: mockSupabaseService,
  stripe: mockStripeService,
  location: mockLocationService,
  notification: mockNotificationService,
  sms: mockSMSService,
  maps: mockMapsService,
  emergency: mockEmergencyService,
  storage: mockStorageService,
  analytics: mockAnalyticsService,
};