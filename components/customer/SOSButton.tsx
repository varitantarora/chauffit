import React, { useState } from 'react';
import { TouchableOpacity, View, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { BrandColors } from '../../constants/Colors';

interface SOSButtonProps {
  onEmergencyCall?: () => void;
  emergencyNumber?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'small' | 'medium' | 'large';
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onEmergencyCall,
  emergencyNumber = '112',
  position = 'bottom-left',
  size = 'medium',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const handlePress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately contact emergency services and notify your emergency contacts. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            if (onEmergencyCall) {
              onEmergencyCall();
            } else {
              Linking.openURL(`tel:${emergencyNumber}`);
            }
          },
        },
      ]
    );
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12';
      case 'large':
        return 'w-20 h-20';
      default:
        return 'w-16 h-16';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'absolute bottom-4 right-4';
      case 'top-left':
        return 'absolute top-4 left-4';
      case 'top-right':
        return 'absolute top-4 right-4';
      default:
        return 'absolute bottom-4 left-4';
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`${getSizeClasses()} bg-danger rounded-full items-center justify-center shadow-lg ${getPositionClasses()}`}
      style={{
        transform: [{ scale: isPressed ? 0.95 : 1 }],
        shadowColor: BrandColors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="warning" size={getIconSize()} color="white" />
      
      {/* Pulse Animation Ring */}
      <View 
        className="absolute inset-0 rounded-full border-2 border-danger"
        style={{
          opacity: isPressed ? 1 : 0.7,
          transform: [{ scale: isPressed ? 1.2 : 1.1 }],
        }}
      />
    </TouchableOpacity>
  );
};