import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Modal,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { LightColors } from '../../constants/Colors';

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface EmergencyButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'floating' | 'inline' | 'header';
  userType: 'customer' | 'driver' | 'biker';
  onEmergencyTriggered?: (location: Location.LocationObject) => void;
  emergencyContacts?: EmergencyContact[];
  showConfirmation?: boolean;
  autoCallPolice?: boolean;
  style?: any;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  className = '',
  size = 'medium',
  variant = 'floating',
  userType,
  onEmergencyTriggered,
  emergencyContacts = [],
  showConfirmation = true,
  autoCallPolice = false,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<NodeJS.Timeout>();

  // Indian Emergency Numbers
  const EMERGENCY_NUMBERS = {
    police: '100',
    ambulance: '108',
    fire: '101',
    women_helpline: '1091',
    child_helpline: '1098',
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 50, height: 50, iconSize: 24 };
      case 'large':
        return { width: 80, height: 80, iconSize: 40 };
      default:
        return { width: 60, height: 60, iconSize: 28 };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();
    
    switch (variant) {
      case 'floating':
        return {
          position: 'absolute' as const,
          bottom: 20,
          right: 20,
          zIndex: 1000,
          borderRadius: sizeStyles.width / 2,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        };
      case 'header':
        return {
          borderRadius: sizeStyles.width / 2,
        };
      default:
        return {
          borderRadius: sizeStyles.width / 2,
        };
    }
  };

  React.useEffect(() => {
    // Start pulsing animation
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(5);
    setIsActivating(true);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActivating(false);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownRef.current = interval;
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setCountdown(0);
    setIsActivating(false);
    setShowModal(false);
  };

  const triggerEmergency = async () => {
    try {
      // Haptic feedback for emergency activation
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let currentLocation = null;

      if (status === 'granted') {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      }

      // Trigger callback
      if (currentLocation) {
        onEmergencyTriggered?.(currentLocation);
      }

      // Send emergency SMS to contacts
      if (emergencyContacts.length > 0) {
        await sendEmergencySMS(currentLocation);
      }

      // Auto call police if enabled
      if (autoCallPolice) {
        await callEmergencyNumber('police');
      }

      // Show emergency options
      setShowModal(true);

    } catch (error) {
      console.error('Error triggering emergency:', error);
      Alert.alert('Error', 'Failed to activate emergency alert. Please try again.');
    }
  };

  const sendEmergencySMS = async (location: Location.LocationObject | null) => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        console.log('SMS not available');
        return;
      }

      let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
      message += `I need help! This is an automated emergency message from ${userType === 'customer' ? 'a Chauffit passenger' : userType === 'driver' ? 'a Chauffit driver' : 'a Chauffit biker'}.\n\n`;
      
      if (location) {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        message += `Location: ${address[0]?.name || 'Unknown'}, ${address[0]?.city || ''}\n`;
        message += `Coordinates: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}\n`;
        message += `Google Maps: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}\n\n`;
      }
      
      message += `Time: ${new Date().toLocaleString()}\n`;
      message += `Please contact me immediately or call emergency services.`;

      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber);
      
      await SMS.sendSMSAsync(phoneNumbers, message);
      console.log('Emergency SMS sent to contacts');
      
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
    }
  };

  const callEmergencyNumber = async (serviceType: keyof typeof EMERGENCY_NUMBERS) => {
    try {
      const number = EMERGENCY_NUMBERS[serviceType];
      const url = `tel:${number}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
    }
  };

  const handlePress = async () => {
    // Immediate haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    if (showConfirmation) {
      Alert.alert(
        '🚨 Emergency Alert',
        'This will immediately notify emergency contacts and services. Are you sure you want to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes, Emergency!',
            style: 'destructive',
            onPress: startCountdown,
          },
        ],
        { cancelable: true }
      );
    } else {
      startCountdown();
    }
  };

  const handleLongPress = () => {
    // Long press for immediate activation without countdown
    Alert.alert(
      '🚨 Instant Emergency',
      'This will immediately activate emergency alert without countdown. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate Now', 
          style: 'destructive',
          onPress: () => {
            setShowModal(false);
            triggerEmergency();
          }
        },
      ]
    );
  };

  const EmergencyModal = () => (
    <Modal
      visible={showModal || isActivating}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white rounded-lg p-6 w-full max-w-sm">
          {isActivating ? (
            // Countdown screen
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600 mb-4">
                Emergency Activating
              </Text>
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl font-bold text-red-600">
                  {countdown}
                </Text>
              </View>
              <Text className="text-center text-gray-600 mb-6">
                Emergency alert will be sent in {countdown} seconds
              </Text>
              <TouchableOpacity
                className="bg-gray-600 px-6 py-3 rounded-lg"
                onPress={cancelCountdown}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Emergency actions screen
            <View>
              <Text className="text-xl font-bold text-red-600 mb-4 text-center">
                Emergency Activated
              </Text>
              <Text className="text-center text-gray-600 mb-6">
                Your emergency contacts have been notified. Choose an action:
              </Text>
              
              <View className="space-y-3">
                <TouchableOpacity
                  className="bg-red-600 p-4 rounded-lg flex-row items-center justify-center"
                  onPress={() => callEmergencyNumber('police')}
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Call Police (100)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-blue-600 p-4 rounded-lg flex-row items-center justify-center"
                  onPress={() => callEmergencyNumber('ambulance')}
                >
                  <Ionicons name="medical" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Call Ambulance (108)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-orange-600 p-4 rounded-lg flex-row items-center justify-center"
                  onPress={() => callEmergencyNumber('fire')}
                >
                  <Ionicons name="flame" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Call Fire Service (101)
                  </Text>
                </TouchableOpacity>

                {userType === 'customer' && (
                  <TouchableOpacity
                    className="bg-purple-600 p-4 rounded-lg flex-row items-center justify-center"
                    onPress={() => callEmergencyNumber('women_helpline')}
                  >
                    <Ionicons name="shield-checkmark" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">
                      Women Helpline (1091)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                className="bg-gray-300 p-3 rounded-lg mt-4"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          className={`items-center justify-center ${className}`}
          style={[
            {
              width: sizeStyles.width,
              height: sizeStyles.height,
              backgroundColor: isPressed ? '#b91c1c' : LightColors.danger,
              ...variantStyles,
            },
            style,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="warning" 
            size={sizeStyles.iconSize} 
            color="white"
          />
          {size === 'large' && (
            <Text className="text-white text-xs font-bold mt-1">SOS</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <EmergencyModal />
    </>
  );
};

export default EmergencyButton;