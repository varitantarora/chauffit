import React, { useState } from 'react';
import { TouchableOpacity, View, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useCarStore } from '../../../store/carStore';
import { useRouter } from 'expo-router';
import { PaymentMethod } from '../../../types/navigation';

export default function ConfirmBooking() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>({
    id: 'card_1',
    type: 'card',
    last4: '4532',
    cardType: 'Visa',
    isDefault: true,
  });
  const [loading, setLoading] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const {
    currentBooking,
    selectedDuration,
    selectedChauffeur,
    createBooking,
    resetBookingFlow,
  } = useBookingStore();
  
  const defaultCar = useCarStore((state) => state.defaultCar);
  const router = useRouter();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card_1',
      type: 'card',
      last4: '4532',
      cardType: 'Visa',
      isDefault: true,
    },
    {
      id: 'upi_1',
      type: 'upi',
      upiId: 'user@paytm',
      isDefault: false,
    },
    {
      id: 'cash_1',
      type: 'cash',
      isDefault: false,
    },
  ];

  const handleConfirmBooking = async () => {
    if (!currentBooking || !selectedChauffeur || !defaultCar) {
      Alert.alert('Error', 'Missing booking information');
      return;
    }

    setLoading(true);

    try {
      const bookingDetails = {
        ...currentBooking,
        chauffeurId: selectedChauffeur.id,
        carId: defaultCar.id,
        customerId: user?.id || '1',
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        createdAt: new Date(),
      };

      const newBooking = await createBooking(bookingDetails as any);
      
      setLoading(false);
      resetBookingFlow();
      
      // Navigate to tracking screen
      router.replace({
        pathname: '/(customer)/ride/tracking',
        params: { bookingId: newBooking.id }
      });
      
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return 'card';
      case 'upi':
        return 'logo-google';
      case 'cash':
        return 'cash';
      default:
        return 'wallet';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.cardType} ****${method.last4}`;
      case 'upi':
        return method.upiId;
      case 'cash':
        return 'Cash Payment';
      default:
        return 'Payment Method';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={14}
        color="#BD8C5E"
      />
    ));
  };

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 mt-4 mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="flex-1">
            <ThemedText variant="h2">Confirm Booking</ThemedText>
            <ThemedText variant="small" className="text-textSecondary">
              Review your booking details
            </ThemedText>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Chauffeur Details */}
          {selectedChauffeur && (
            <View className={`p-4 rounded-2xl mb-6 ${
              isDarkMode ? 'bg-darkSurface' : 'bg-white'
            } border border-border`}>
              <ThemedText variant="h3" className="font-bold mb-4">
                Selected Chauffeur
              </ThemedText>
              
              <View className="flex-row items-center">
                <Image
                  source={{ uri: selectedChauffeur.photo }}
                  className="w-16 h-16 rounded-full mr-4"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                
                <View className="flex-1">
                  <ThemedText variant="h3" className="font-bold">
                    {selectedChauffeur.name}
                  </ThemedText>
                  
                  <View className="flex-row items-center mt-1 mb-2">
                    <View className="flex-row mr-3">
                      {renderStars(selectedChauffeur.rating)}
                    </View>
                    <ThemedText variant="small" className="text-textSecondary">
                      {selectedChauffeur.rating} • {selectedChauffeur.experience}y exp
                    </ThemedText>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={14} color="#BD8C5E" />
                    <ThemedText variant="small" className="ml-1 font-semibold text-secondary">
                      ETA: {selectedChauffeur.eta}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View className="flex-row flex-wrap mt-4">
                {selectedChauffeur.certifications.map((cert, index) => (
                  <View
                    key={index}
                    className="bg-primary/20 px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    <ThemedText variant="tiny" className="text-burgundy font-medium">
                      {cert}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Vehicle Details */}
          {defaultCar && (
            <View className={`p-4 rounded-2xl mb-6 ${
              isDarkMode ? 'bg-darkSurface' : 'bg-white'
            } border border-border`}>
              <ThemedText variant="h3" className="font-bold mb-4">
                Your Vehicle
              </ThemedText>
              
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="car-sport" size={24} color="#BD8C5E" />
                </View>
                <View className="flex-1">
                  <ThemedText variant="body" className="font-semibold">
                    {defaultCar.make} {defaultCar.model}
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary">
                    {defaultCar.color} • {defaultCar.registrationNumber}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Service Details */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Service Details
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Duration
                </ThemedText>
                <ThemedText variant="body" className="font-semibold">
                  {selectedDuration}
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Start Time
                </ThemedText>
                <ThemedText variant="body" className="font-semibold">
                  Now
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Pickup Location
                </ThemedText>
                <ThemedText variant="body" className="font-semibold text-right flex-1 ml-4">
                  Current Location
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Payment Method
            </ThemedText>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedPaymentMethod(method)}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${
                  selectedPaymentMethod.id === method.id
                    ? 'bg-secondary/10 border border-secondary'
                    : 'border border-border'
                }`}
              >
                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name={getPaymentMethodIcon(method) as any} size={20} color="#BD8C5E" />
                </View>
                
                <View className="flex-1">
                  <ThemedText variant="body" className="font-semibold">
                    {getPaymentMethodLabel(method)}
                  </ThemedText>
                </View>
                
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedPaymentMethod.id === method.id
                    ? 'border-secondary bg-secondary'
                    : 'border-textSecondary'
                }`}>
                  {selectedPaymentMethod.id === method.id && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Breakdown */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Price Details
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Service ({selectedDuration})
                </ThemedText>
                <ThemedText variant="body">
                  ₹{(currentBooking?.totalAmount || 0).toLocaleString()}
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Taxes & Fees
                </ThemedText>
                <ThemedText variant="body">
                  ₹{Math.floor((currentBooking?.totalAmount || 0) * 0.18).toLocaleString()}
                </ThemedText>
              </View>
              
              <View className="border-t border-border pt-3">
                <View className="flex-row justify-between">
                  <ThemedText variant="h3" className="font-bold">
                    Total Amount
                  </ThemedText>
                  <ThemedText variant="h3" className="font-bold text-burgundy">
                    ₹{((currentBooking?.totalAmount || 0) * 1.18).toLocaleString()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 pb-6 pt-4 border-t border-border">
          <PrimaryButton
            title={`Confirm Booking • ₹${((currentBooking?.totalAmount || 0) * 1.18).toLocaleString()}`}
            onPress={handleConfirmBooking}
            loading={loading}
          />
          
          <View className="mt-4">
            <ThemedText variant="tiny" className="text-center text-textSecondary leading-4">
              By confirming, you agree to our Terms of Service and Privacy Policy. 
              Cancellation charges may apply.
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}