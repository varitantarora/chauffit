import React, { useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, Alert, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BrandColors } from '../../constants/Colors';
import { TaxesAndFeesRow } from '../../components/customer/TaxesAndFeesRow';

export default function RideConfirmationScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const amenitiesEnabled = getConfigValue('amenities_enabled') !== 'false';
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [selectedPayment, setSelectedPayment] = useState('visa-1234');
  const [driverPreference, setDriverPreference] = useState<'luxury' | 'standard'>('standard');
  const slideValue = useRef(new Animated.Value(0)).current;
  
  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const screenWidth = Dimensions.get('window').width;

  const creditsApplied = parseFloat(params.creditsApplied as string || '0');
  const loyaltyDiscountPct = parseFloat(params.loyaltyDiscountPct as string || '0');

  const tripDetails = {
    pickup: params.pickup || 'Home - 123 Main St, Palo Alto',
    destination: params.destination || 'Downtown Office - 456 Market St, SF',
    stops: ['Coffee Shop - 789 Broadway'],
    when: 'Today, 2:30 PM',
    type: params.rideType || 'One-way',
    duration: '~45 minutes',
    distance: '~56 km',
  };

  const driverDetails = {
    name: 'Rajesh Kumar',
    rating: 4.9,
    experience: '8 years experience',
    type: 'Professional Chauffeur',
    vehicle: 'Your BMW X5 (2022)',
    vehicleDetails: 'Black • License: ABC123',
  };

  const fareBreakdown = {
    baseFare: 650,
    distanceCharge: 120,
    timeCharge: 45,
    stopFee: 25,
    surge: 252,
    amenities: parseInt(params.fare as string) || 15,
    serviceFee: 35,
  };

  const totals = (() => {
    const subtotal = Object.values(fareBreakdown).reduce((a, b) => a + b, 0);
    const taxes = subtotal * 0.18;
    return {
      subtotal,
      taxes,
      total: subtotal + taxes,
    };
  })();

  const handleConfirmBooking = () => {
    // Navigate to searching drivers screen with trip details
    router.push({
      pathname: '/(customer)/searching-drivers',
      params: {
        pickup: tripDetails.pickup,
        destination: tripDetails.destination,
        vehicle: driverDetails.vehicle,
        fare: totals.total.toFixed(2)
      }
    });
  };

  const handleSlideComplete = () => {
    Animated.spring(slideValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start(() => {
      handleConfirmBooking();
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Confirm Booking</ThemedText>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Trip Details Card */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-4">Trip Details</ThemedText>
              
              {/* From */}
              <View className="flex-row mb-3">
                <Ionicons name="location" size={20} color={iconColor} className="mt-1" />
                <View className="ml-3 flex-1">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">From</ThemedText>
                  <ThemedText>{tripDetails.pickup}</ThemedText>
                </View>
              </View>

              {/* Stops */}
              {tripDetails.stops.map((stop, index) => (
                <View key={index} className="flex-row mb-3">
                  <Ionicons name="flag" size={20} color={iconColor} className="mt-1" />
                  <View className="ml-3 flex-1">
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Stop {index + 1}</ThemedText>
                    <ThemedText>{stop}</ThemedText>
                  </View>
                </View>
              ))}

              {/* To */}
              <View className="flex-row mb-3">
                <Ionicons name="navigate" size={20} color={iconColor} className="mt-1" />
                <View className="ml-3 flex-1">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">To</ThemedText>
                  <ThemedText>{tripDetails.destination}</ThemedText>
                </View>
              </View>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">When</ThemedText>
                  <ThemedText variant="small">{tripDetails.when}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Type</ThemedText>
                  <ThemedText variant="small">{tripDetails.type}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Duration</ThemedText>
                  <ThemedText variant="small">{tripDetails.duration}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Distance</ThemedText>
                  <ThemedText variant="small">{tripDetails.distance}</ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Driver & Vehicle Card */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-4">Driver & Vehicle</ThemedText>
              
              <View className="flex-row items-center mb-4">
                <View className="w-16 h-16 bg-gray-100 dark:bg-darkSurface rounded-full mr-3 items-center justify-center">
                  <Ionicons name="person" size={32} color={iconColor} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <ThemedText variant="h3">{driverDetails.name}</ThemedText>
                    <View className="flex-row items-center ml-2">
                      <Ionicons name="star" size={16} color={BrandColors.warning} />
                      <ThemedText variant="small" className="ml-1">{driverDetails.rating}</ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">{driverDetails.type}</ThemedText>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">{driverDetails.experience}</ThemedText>
                </View>
              </View>

              <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color={iconColor} />
                  <View className="ml-3">
                    <ThemedText>{driverDetails.vehicle}</ThemedText>
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">{driverDetails.vehicleDetails}</ThemedText>
                  </View>
                </View>
              </View>

              <View>
                <ThemedText variant="small" className="mb-2">Driver Preference</ThemedText>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setDriverPreference('luxury')}
                    className={`flex-1 p-3 rounded-xl border mr-2 ${
                      driverPreference === 'luxury' 
                        ? 'bg-burgundy border-burgundy' 
                        : 'border-border dark:border-darkBorder'
                    }`}
                  >
                    <ThemedText 
                      variant="small" 
                      className={`text-center ${driverPreference === 'luxury' ? 'text-white' : ''}`}
                    >
                      Luxury
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDriverPreference('standard')}
                    className={`flex-1 p-3 rounded-xl border ${
                      driverPreference === 'standard' 
                        ? 'bg-burgundy border-burgundy' 
                        : 'border-border dark:border-darkBorder'
                    }`}
                  >
                    <ThemedText 
                      variant="small" 
                      className={`text-center ${driverPreference === 'standard' ? 'text-white' : ''}`}
                    >
                      Standard
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>

            {/* Payment Summary Card */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-4">Payment Summary</ThemedText>
              
              <View className="space-y-2">
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Base fare</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.baseFare}.00</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Distance charge</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.distanceCharge}.00</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Time charge</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.timeCharge}.00</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Stop fee</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.stopFee}.00</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Surge (1.3x)</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.surge}.00</ThemedText>
                </View>
                {amenitiesEnabled && (
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Amenities</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.amenities}.00</ThemedText>
                </View>
                )}
                <View className="flex-row justify-between mb-3">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Service fee</ThemedText>
                  <ThemedText variant="small">₹{fareBreakdown.serviceFee}.00</ThemedText>
                </View>
                
                <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <View className="flex-row justify-between mb-2">
                    <ThemedText>Subtotal</ThemedText>
                    <ThemedText>₹{totals.subtotal.toFixed(2)}</ThemedText>
                  </View>
                  <TaxesAndFeesRow
                    gstAmount={totals.taxes}
                    formatAmount={(v) => `₹${v.toFixed(2)}`}
                    variant="nativewind-small"
                  />
                  {loyaltyDiscountPct > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <ThemedText variant="small" className="text-green-600">
                        Loyalty Discount ({loyaltyDiscountPct}%)
                      </ThemedText>
                      <ThemedText variant="small" className="text-green-600">Applied</ThemedText>
                    </View>
                  )}
                  {creditsApplied > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <ThemedText variant="small" className="text-green-600">Credits Applied</ThemedText>
                      <ThemedText variant="small" className="text-green-600">
                        -₹{creditsApplied.toFixed(2)}
                      </ThemedText>
                    </View>
                  )}
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <View className="flex-row justify-between">
                      <ThemedText variant="h3">Total</ThemedText>
                      <ThemedText variant="h3" className="text-burgundy">₹{totals.total.toFixed(2)}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="flex-row items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={20} color={iconColor} />
                  <ThemedText className="ml-3">Visa ****1234</ThemedText>
                </View>
                <ThemedText variant="small" className="text-burgundy">Change</ThemedText>
              </TouchableOpacity>

              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mt-2">
                Estimated arrival time: 15 min
              </ThemedText>
            </ThemedCard>

            {/* Slide to Book Button */}
            <SlideToBookButton onSlideComplete={handleSlideComplete} />
            
            <TouchableOpacity onPress={() => router.back()} className="py-3">
              <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

// Slide to Book Button Component
const SlideToBookButton = ({ onSlideComplete }: { onSlideComplete: () => void }) => {
  const slideValue = useRef(new Animated.Value(0)).current;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const progressValue = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const backgroundColor = useRef(new Animated.Value(0)).current;
  
  const screenWidth = Dimensions.get('window').width - 48;
  const BUTTON_WIDTH = screenWidth;
  const KNOB_SIZE = 50;
  const PADDING = 6;
  const SLIDE_THRESHOLD = BUTTON_WIDTH - KNOB_SIZE - PADDING * 2;
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideValue } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const translationX = Math.max(0, Math.min(event.nativeEvent.translationX, SLIDE_THRESHOLD));
        const progress = translationX / SLIDE_THRESHOLD;
        
        // Update progress bar
        progressValue.setValue(translationX + KNOB_SIZE);
        
        // Fade out text as user slides
        textOpacity.setValue(Math.max(1 - progress * 2.5, 0));
        
        // Change background color
        backgroundColor.setValue(progress);
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX >= SLIDE_THRESHOLD * 0.8) {
        // Slide completed - animate to end
        Animated.parallel([
          Animated.spring(slideValue, {
            toValue: SLIDE_THRESHOLD,
            useNativeDriver: false,
            tension: 400,
            friction: 50,
          }),
          Animated.timing(backgroundColor, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(progressValue, {
            toValue: BUTTON_WIDTH,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start(() => {
          setIsUnlocked(true);
          setTimeout(() => {
            onSlideComplete();
          }, 300);
        });
      } else {
        // Reset slide
        Animated.parallel([
          Animated.spring(slideValue, {
            toValue: 0,
            useNativeDriver: false,
            tension: 400,
            friction: 50,
          }),
          Animated.timing(backgroundColor, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(progressValue, {
            toValue: KNOB_SIZE,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      }
    }
  };

  const animatedBackgroundColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [BrandColors.secondary, BrandColors.burgundy]
  });

  return (
    <View className="mb-3">
      <Animated.View 
        className="relative rounded-full justify-center flex items-center"
        style={{
          backgroundColor: animatedBackgroundColor,
          width: BUTTON_WIDTH,
          height: 62,
          padding: PADDING,
        }}
      >
        {/* Background progress */}
        <Animated.View
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: progressValue,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* "Slide to..." text */}
        <Animated.View
          className="absolute flex-row items-center justify-center"
          style={{ opacity: textOpacity }}
        >
          <ThemedText className="text-white font-bold text-base">
            {isUnlocked ? 'BOOKING CONFIRMED' : 'SLIDE TO BOOK'}
          </ThemedText>
        </Animated.View>

        {/* Sliding Knob */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            className="absolute bg-white rounded-full items-center justify-center"
            style={{
              left: PADDING,
              top: PADDING,
              height: KNOB_SIZE,
              width: KNOB_SIZE,
              transform: [{ translateX: slideValue }],
              elevation: 4, // Android shadow
              shadowColor: '#000', // iOS shadow
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            {isUnlocked ? (
              <Ionicons name="checkmark" size={24} color={BrandColors.burgundy} />
            ) : (
              <Ionicons name="chevron-forward" size={24} color={BrandColors.burgundy} />
            )}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
};

// Booking Confirmation Modal Component
const BookingConfirmationModal = ({ 
  isVisible, 
  onClose, 
  onTrackRide, 
  isDarkMode 
}: {
  isVisible: boolean;
  onClose: () => void;
  onTrackRide: () => void;
  isDarkMode: boolean;
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      className="absolute inset-0 bg-black/50 flex-1 justify-center items-center px-8"
      style={{ opacity: fadeValue }}
    >
      <Animated.View 
        className={`${isDarkMode ? 'bg-darkBackground' : 'bg-white'} rounded-3xl p-8 w-full max-w-sm`}
        style={{ transform: [{ scale: scaleValue }] }}
      >
        {/* Success Icon */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color={BrandColors.success} />
          </View>
          
          <ThemedText variant="h2" className="text-center mb-2">
            Booking Confirmed!
          </ThemedText>
          
          <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary mb-4">
            Your chauffeur will arrive in 15-20 minutes. You'll receive updates via SMS.
          </ThemedText>
        </View>

        {/* Booking Details */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Driver</ThemedText>
            <ThemedText variant="small">Rajesh Kumar</ThemedText>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Vehicle</ThemedText>
            <ThemedText variant="small">BMW X5 (ABC123)</ThemedText>
          </View>
          <View className="flex-row justify-between items-center">
            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">ETA</ThemedText>
            <ThemedText variant="small" className="text-burgundy font-semibold">15-20 mins</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <PrimaryButton
          title="TRACK YOUR RIDE"
          onPress={onTrackRide}
          className="mb-3"
        />
        
        <TouchableOpacity onPress={handleClose} className="py-3">
          <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">Close</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};