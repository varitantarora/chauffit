// Shared Components Index
// This file exports all shared components for easy importing throughout the app

// Map Components
export { default as MapView } from './MapView';
export type { MapMarker, MapRoute, MapViewRef } from './MapView';

// Location Components
export { default as LocationPicker } from './LocationPicker';
export type { LocationData } from './LocationPicker';

// Payment Components
export { default as PaymentSelector } from './PaymentSelector';
export type { PaymentMethod } from './PaymentSelector';

// Notification Components
export { default as PushNotificationHandler } from './PushNotificationHandler';
export type { NotificationData } from './PushNotificationHandler';
export { 
  createBookingNotification,
  createJobNotification,
  createEmergencyNotification 
} from './PushNotificationHandler';

// Emergency Components
export { default as EmergencyButton } from './EmergencyButton';

// UI State Components
export { default as LoadingOverlay, InlineLoader } from './LoadingOverlay';
export { 
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  getStoredErrors,
  clearStoredErrors 
} from './ErrorBoundary';

// Network Components
export { 
  default as NetworkStatus, 
  useNetworkStatus, 
  OfflineNotice 
} from './NetworkStatus';

// Re-export common types
export interface SharedComponentProps {
  className?: string;
  style?: any;
}

// Utility type for component refs
export type ComponentRef<T = any> = React.RefObject<T>;

// Common event handlers
export interface SharedEventHandlers {
  onPress?: () => void;
  onLongPress?: () => void;
  onError?: (error: Error) => void;
}

// Export helper functions
export const SharedComponentsUtils = {
  // Check if component is mounted
  isComponentMounted: (ref: React.RefObject<any>): boolean => {
    return ref.current !== null;
  },

  // Safe component update
  safeUpdate: <T>(ref: React.RefObject<T>, updateFn: (component: T) => void): void => {
    if (ref.current) {
      try {
        updateFn(ref.current);
      } catch (error) {
        console.error('Error updating component:', error);
      }
    }
  },

  // Generate unique ID for components
  generateId: (): string => {
    return `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};