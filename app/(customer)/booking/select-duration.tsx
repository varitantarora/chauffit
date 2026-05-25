import React, { useState } from 'react';
import { TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useCarStore } from '../../../store/carStore';
import { useRouter } from 'expo-router';
import { BrandColors } from '../../../constants/Colors';
import { HOURLY_PACKAGES, OVERTIME_RATES, type ServiceTier } from '../../../utils/fareCalculator';

interface DurationOption {
  id: string;
  hours: number;
  label: string;
  price: number;
  description: string;
  popular?: boolean;
}

function getPackagesForTier(tier: ServiceTier): DurationOption[] {
  const packages = HOURLY_PACKAGES[tier];
  const descriptions = [
    'Perfect for airport transfers or short trips',
    'Ideal for business meetings or shopping',
    'Great for half-day events',
    'Full day service for tours and events',
  ];
  return packages.map((pkg, idx) => ({
    id: `${pkg.hours}hr`,
    hours: pkg.hours,
    label: `${pkg.hours} Hours`,
    price: pkg.price,
    description: descriptions[idx] || '',
    popular: pkg.hours === 4,
  }));
}

export default function SelectDuration() {
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const setBookingDuration = useBookingStore((state) => state.setSelectedDuration);
  const updateBookingDetails = useBookingStore((state) => state.updateBookingDetails);
  const selectedServiceTier = useBookingStore((state) => state.selectedServiceTier) || 'STANDARD';
  const defaultCar = useCarStore((state) => state.defaultCar);
  const router = useRouter();

  const durationOptions = getPackagesForTier(selectedServiceTier as ServiceTier);
  const overtimeRate = OVERTIME_RATES[selectedServiceTier as ServiceTier];

  const handleDurationSelect = (option: DurationOption) => {
    setSelectedDuration(option.id);
  };

  const handleContinue = () => {
    if (!defaultCar) {
      Alert.alert(
        'No Car Added',
        'Please add your car details first to continue booking.',
        [
          {
            text: 'Add Car',
            onPress: () => router.push('/(customer)/(tabs)/profile'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    if (!selectedDuration) {
      Alert.alert('Error', 'Please select a duration');
      return;
    }

    const option = durationOptions.find(opt => opt.id === selectedDuration);
    const totalAmount = option?.price || 0;
    const duration = selectedDuration;

    setBookingDuration(duration);
    updateBookingDetails({
      duration,
      carId: defaultCar.id,
      customerId: '1', // This would come from auth store in real app
      totalAmount,
      startTime: new Date(),
      pickupLocation: {
        latitude: 28.4595,
        longitude: 77.0266,
        address: 'Current Location', // This would be actual user location
      },
    });

    router.push('/(customer)/booking/select-chauffeur');
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
            <ThemedText variant="h2">Select Duration</ThemedText>
            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
              Choose how long you need our service
            </ThemedText>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Duration Options */}
          <View className="mb-8">
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleDurationSelect(option)}
                className={`mb-4 p-4 rounded-2xl border-2 ${
                  selectedDuration === option.id
                    ? 'border-secondary bg-secondary/10'
                    : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <ThemedText variant="h3" className="font-bold">
                        {option.label}
                      </ThemedText>
                      {option.popular && (
                        <View className="bg-secondary px-2 py-1 rounded-full ml-2">
                          <ThemedText variant="tiny" className="text-white font-semibold">
                            POPULAR
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mb-2">
                      {option.description}
                    </ThemedText>
                    <ThemedText variant="h3" className="text-burgundy font-bold">
                      ₹{option.price.toLocaleString()}
                    </ThemedText>
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedDuration === option.id
                      ? 'border-secondary bg-secondary'
                      : 'border-textSecondary'
                  }`}>
                    {selectedDuration === option.id && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                </View>

              </TouchableOpacity>
            ))}
          </View>

          {/* Overtime Info */}
          <View className={`p-3 rounded-xl mb-6 ${isDarkMode ? 'bg-darkSurface' : 'bg-amber-50'}`}>
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color={BrandColors.secondary} />
              <ThemedText variant="small" className="ml-2 flex-1">
                Beyond booked duration: ₹{overtimeRate}/min overtime
              </ThemedText>
            </View>
          </View>

          {/* Selected Car Info */}
          {defaultCar && (
            <View className={`p-4 rounded-xl mb-6 ${
              isDarkMode ? 'bg-darkSurface' : 'bg-surface'
            }`}>
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="car-sport" size={24} color={BrandColors.secondary} />
                </View>
                <View className="flex-1">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    Selected Vehicle
                  </ThemedText>
                  <ThemedText variant="body" className="font-semibold">
                    {defaultCar.make} {defaultCar.model}
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    {defaultCar.color} • {defaultCar.registrationNumber}
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/(customer)/(tabs)/profile')}
                  className="p-2"
                >
                  <ThemedText variant="small" className="text-secondary">
                    Change
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!defaultCar && (
            <View className="p-4 rounded-xl mb-6 bg-danger/10 border border-danger/20">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={24} color={BrandColors.danger} />
                <View className="flex-1 ml-3">
                  <ThemedText variant="body" className="font-semibold text-danger">
                    No Car Added
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    Please add your car details to continue
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/(customer)/(tabs)/profile')}
                  className="px-3 py-1 bg-danger rounded-lg"
                >
                  <ThemedText variant="tiny" className="text-white font-semibold">
                    Add Car
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 pb-6 pt-4 border-t border-border">
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedDuration || !defaultCar}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}