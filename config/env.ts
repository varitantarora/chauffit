// Environment Configuration for Chauffit Platform
// This file manages all environment variables and API keys for the application

export interface AppConfig {
  // Google Services
  googleMapsApiKey: string;
  googlePlacesApiKey: string;
  
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Stripe Payment Configuration
  stripePublishableKey: string;
  stripeSecretKey: string; // Only for server-side operations
  
  // OneSignal Push Notifications
  oneSignalAppId: string;
  oneSignalApiKey: string;
  
  // App Configuration
  appEnvironment: 'development' | 'staging' | 'production';
  appVersion: string;
  apiBaseUrl: string;
  
  // Indian Market Specific
  upiEnabled: boolean;
  gstCalculationEnabled: boolean;
  indianPhoneValidation: boolean;
  
  // Emergency Services
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
    womenHelpline: string;
    childHelpline: string;
  };
  
  // Feature Flags
  features: {
    realTimeTracking: boolean;
    biometricAuth: boolean;
    voiceCalling: boolean;
    chatMessaging: boolean;
    emergencyAlerts: boolean;
    scheduledBookings: boolean;
    multiplePaymentMethods: boolean;
    loyaltyProgram: boolean;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  // Google Services
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  
  // Supabase Configuration
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Stripe Payment Configuration
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  
  // OneSignal Push Notifications
  oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
  oneSignalApiKey: process.env.ONESIGNAL_API_KEY || '',
  
  // App Configuration
  appEnvironment: (process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production') || 'development',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://16.112.161.95',
  
  // Indian Market Specific
  upiEnabled: process.env.EXPO_PUBLIC_UPI_ENABLED === 'true',
  gstCalculationEnabled: process.env.EXPO_PUBLIC_GST_ENABLED === 'true',
  indianPhoneValidation: process.env.EXPO_PUBLIC_INDIAN_PHONE_VALIDATION === 'true',
  
  // Emergency Services (Indian numbers)
  emergencyNumbers: {
    police: '100',
    ambulance: '108',
    fire: '101',
    womenHelpline: '1091',
    childHelpline: '1098',
  },
  
  // Feature Flags
  features: {
    realTimeTracking: process.env.EXPO_PUBLIC_REAL_TIME_TRACKING !== 'false',
    biometricAuth: process.env.EXPO_PUBLIC_BIOMETRIC_AUTH !== 'false',
    voiceCalling: process.env.EXPO_PUBLIC_VOICE_CALLING !== 'false',
    chatMessaging: process.env.EXPO_PUBLIC_CHAT_MESSAGING !== 'false',
    emergencyAlerts: process.env.EXPO_PUBLIC_EMERGENCY_ALERTS !== 'false',
    scheduledBookings: process.env.EXPO_PUBLIC_SCHEDULED_BOOKINGS !== 'false',
    multiplePaymentMethods: process.env.EXPO_PUBLIC_MULTIPLE_PAYMENTS !== 'false',
    loyaltyProgram: process.env.EXPO_PUBLIC_LOYALTY_PROGRAM === 'true',
  },
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    apiBaseUrl: 'http://16.112.161.95/api/v1',
    features: {
      ...defaultConfig.features,
      // Enable all features in development
    },
  },
  staging: {
    apiBaseUrl: 'https://staging-api.chauffit.com/api/v1',
    features: {
      ...defaultConfig.features,
      loyaltyProgram: false, // Disable in staging
    },
  },
  production: {
    apiBaseUrl: 'https://api.chauffit.com/api/v1',
    features: {
      ...defaultConfig.features,
    },
  },
};

// Get configuration for current environment
export const getAppConfig = (): AppConfig => {
  const envConfig = environmentConfigs[defaultConfig.appEnvironment] || {};
  
  return {
    ...defaultConfig,
    ...envConfig,
    features: {
      ...defaultConfig.features,
      ...envConfig.features,
    },
  };
};

// Export the current configuration
export const appConfig = getAppConfig();

// Validation function to check if all required configs are present
export const validateConfiguration = (): { isValid: boolean; missingKeys: string[] } => {
  const config = getAppConfig();
  const missingKeys: string[] = [];
  
  // Check required keys
  const requiredKeys = [
    { key: 'googleMapsApiKey', value: config.googleMapsApiKey },
    { key: 'supabaseUrl', value: config.supabaseUrl },
    { key: 'supabaseAnonKey', value: config.supabaseAnonKey },
    { key: 'stripePublishableKey', value: config.stripePublishableKey },
    { key: 'oneSignalAppId', value: config.oneSignalAppId },
  ];
  
  requiredKeys.forEach(({ key, value }) => {
    if (!value || value.trim() === '') {
      missingKeys.push(key);
    }
  });
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
};

// Utility functions
export const isProduction = () => appConfig.appEnvironment === 'production';
export const isDevelopment = () => appConfig.appEnvironment === 'development';
export const isStaging = () => appConfig.appEnvironment === 'staging';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return appConfig.features[feature];
};

// Indian market helpers
export const getEmergencyNumber = (service: keyof AppConfig['emergencyNumbers']): string => {
  return appConfig.emergencyNumbers[service];
};

export const isUPIEnabled = (): boolean => appConfig.upiEnabled;
export const isGSTEnabled = (): boolean => appConfig.gstCalculationEnabled;

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  SIGNUP: '/auth/register/',
  VERIFY_OTP: '/auth/otp-login/verify/',
  REFRESH_TOKEN: '/auth/refresh/',
  SEND_OTP: '/auth/send-otp/',
  LOGOUT: '/auth/logout/',
  CHANGE_PASSWORD: '/auth/change-password/',
  AUTH_PROFILE: '/auth/profile/',
  
  // User Management
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/update',
  UPLOAD_AVATAR: '/user/avatar',
  
  // Bookings
  CREATE_BOOKING: '/bookings',
  GET_BOOKINGS: '/bookings',
  UPDATE_BOOKING: '/bookings/:id',
  CANCEL_BOOKING: '/bookings/:id/cancel',
  
  // Payments
  CREATE_PAYMENT_INTENT: '/payments/intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  GET_PAYMENT_METHODS: '/payments/methods',
  ADD_PAYMENT_METHOD: '/payments/methods',
  
  // Emergency
  CREATE_EMERGENCY: '/emergency/alert',
  GET_EMERGENCY_CONTACTS: '/emergency/contacts',
  UPDATE_EMERGENCY_CONTACTS: '/emergency/contacts',
  
  // Location
  UPDATE_LOCATION: '/location/update',
  GET_NEARBY_DRIVERS: '/location/nearby-drivers',
  
  // Notifications
  REGISTER_DEVICE: '/notifications/register',
  UPDATE_SETTINGS: '/notifications/settings',
} as const;

// Get full API URL
export const getApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Build URL - apiBaseUrl already includes /api/v1
  let url = `${appConfig.apiBaseUrl}${cleanEndpoint}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

// Console configuration warnings in development
if (isDevelopment()) {
  const validation = validateConfiguration();
  if (!validation.isValid) {
    console.warn(
      '⚠️ Missing environment configuration:',
      validation.missingKeys.join(', ')
    );
    console.warn(
      'Please check your .env file and ensure all required environment variables are set.'
    );
  }
}

export default appConfig;