import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { LightColors } from '../../constants/Colors';

interface NetworkStatusProps {
  className?: string;
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
  onStatusChange?: (isConnected: boolean, networkType?: string) => void;
  enableRetry?: boolean;
  style?: any;
}

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  className = '',
  showWhenOnline = false,
  position = 'top',
  onStatusChange,
  enableRetry = true,
  style,
}) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const newNetworkState: NetworkState = {
        isConnected: networkState.isConnected ?? false,
        type: networkState.type || 'unknown',
        isInternetReachable: networkState.isInternetReachable ?? false,
      };

      setNetworkState(newNetworkState);
      onStatusChange?.(newNetworkState.isConnected, newNetworkState.type);

      return newNetworkState;
    } catch (error) {
      console.error('Error checking network status:', error);
      const fallbackState: NetworkState = {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
      };
      setNetworkState(fallbackState);
      onStatusChange?.(false, 'unknown');
      return fallbackState;
    }
  }, [onStatusChange]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    
    try {
      // Wait a bit before checking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newState = await checkNetworkStatus();
      
      if (newState.isConnected && newState.isInternetReachable) {
        Alert.alert(
          'Connection Restored',
          'Your internet connection has been restored.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Still No Connection',
          'Please check your network settings and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error during retry:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [checkNetworkStatus]);

  // Initial network check
  useEffect(() => {
    checkNetworkStatus();
  }, [checkNetworkStatus]);

  // Set up network status listener
  useEffect(() => {
    const subscription = Network.addNetworkStateListener(state => {
      const newNetworkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
        isInternetReachable: state.isInternetReachable ?? false,
      };

      setNetworkState(newNetworkState);
      onStatusChange?.(newNetworkState.isConnected, newNetworkState.type);
    });

    return () => subscription?.remove?.();
  }, [onStatusChange]);

  // Animate banner appearance
  useEffect(() => {
    const shouldShow = !networkState.isConnected || 
                      !networkState.isInternetReachable || 
                      showWhenOnline;

    if (shouldShow) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [networkState, showWhenOnline, position]);

  const getNetworkTypeDisplay = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wifi':
        return 'Wi-Fi';
      case 'cellular':
        return 'Mobile Data';
      case 'ethernet':
        return 'Ethernet';
      case 'bluetooth':
        return 'Bluetooth';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (!networkState.isConnected) {
      return LightColors.danger; // Red for no connection
    } else if (!networkState.isInternetReachable) {
      return '#FF8C00'; // Orange for limited connection
    } else if (networkState.type.toLowerCase() === 'cellular') {
      return '#FFA500'; // Orange for cellular
    } else {
      return LightColors.success; // Green for good connection
    }
  };

  const getStatusIcon = () => {
    if (!networkState.isConnected) {
      return 'wifi-off';
    } else if (!networkState.isInternetReachable) {
      return 'warning';
    } else if (networkState.type.toLowerCase() === 'cellular') {
      return 'cellular';
    } else {
      return 'wifi';
    }
  };

  const getStatusMessage = () => {
    if (!networkState.isConnected) {
      return 'No Internet Connection';
    } else if (!networkState.isInternetReachable) {
      return 'Limited Connection - No Internet';
    } else if (showWhenOnline) {
      return `Connected via ${getNetworkTypeDisplay(networkState.type)}`;
    }
    return '';
  };

  const getStatusSubMessage = () => {
    if (!networkState.isConnected) {
      return 'Please check your network settings';
    } else if (!networkState.isInternetReachable) {
      return 'Connected to network but no internet access';
    }
    return '';
  };

  // Don't show banner if online and showWhenOnline is false
  if (networkState.isConnected && 
      networkState.isInternetReachable && 
      !showWhenOnline) {
    return null;
  }

  return (
    <Animated.View
      className={`absolute left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={[
        {
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View
        className="px-4 py-3 flex-row items-center"
        style={{
          backgroundColor: getStatusColor(),
        }}
      >
        <Ionicons 
          name={getStatusIcon() as any} 
          size={20} 
          color="white" 
        />
        
        <View className="flex-1 ml-3">
          <Text className="text-white font-medium text-sm">
            {getStatusMessage()}
          </Text>
          {getStatusSubMessage() && (
            <Text className="text-white/80 text-xs mt-1">
              {getStatusSubMessage()}
            </Text>
          )}
        </View>

        {/* Retry button for offline states */}
        {enableRetry && (!networkState.isConnected || !networkState.isInternetReachable) && (
          <TouchableOpacity
            className="ml-2 px-3 py-1 bg-white/20 rounded-full"
            onPress={handleRetry}
            disabled={isRetrying}
          >
            <Text className="text-white text-xs font-medium">
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close button when showing online status */}
        {showWhenOnline && networkState.isConnected && networkState.isInternetReachable && (
          <TouchableOpacity
            className="ml-2"
            onPress={() => {
              Animated.timing(slideAnim, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }}
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Hook to use network status in functional components
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });

  const checkNetworkStatus = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
        isInternetReachable: state.isInternetReachable ?? false,
      };
      setNetworkState(newState);
      return newState;
    } catch (error) {
      console.error('Error checking network status:', error);
      const fallbackState: NetworkState = {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
      };
      setNetworkState(fallbackState);
      return fallbackState;
    }
  }, []);

  useEffect(() => {
    checkNetworkStatus();
    
    const subscription = Network.addNetworkStateListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
        isInternetReachable: state.isInternetReachable ?? false,
      };
      setNetworkState(newState);
    });

    return () => subscription?.remove?.();
  }, [checkNetworkStatus]);

  return {
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    networkType: networkState.type,
    isOffline: !networkState.isConnected || !networkState.isInternetReachable,
    refreshNetworkStatus: checkNetworkStatus,
  };
};

// Component to conditionally render content based on network status
export const OfflineNotice: React.FC<{
  children?: React.ReactNode;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}> = ({ 
  children, 
  message = 'You are currently offline. Some features may not be available.',
  showRetry = true,
  onRetry 
}) => {
  const { isOffline, refreshNetworkStatus } = useNetworkStatus();

  if (!isOffline) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-50">
      <Ionicons name="cloud-offline" size={64} color={LightColors.textSecondary} />
      <Text className="text-lg font-medium text-black mt-4 text-center">
        You're Offline
      </Text>
      <Text className="text-sm text-gray-600 mt-2 text-center">
        {message}
      </Text>
      {showRetry && (
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-lg"
          style={{ backgroundColor: LightColors.secondary }}
          onPress={onRetry || refreshNetworkStatus}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NetworkStatus;