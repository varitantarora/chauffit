import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface InsuranceOption {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export default function TripInsuranceScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('card');
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';

  const insuranceOptions: InsuranceOption[] = [
    {
      id: 'scratch',
      title: 'Scratch Coverage',
      price: 79,
      description: 'Basic protection for minor scratches',
      features: [
        'Minor scratch repairs',
        'Paint touch-ups',
        'No deductible',
        '24/7 claim support'
      ]
    },
    {
      id: 'scratch_dent',
      title: 'Scratch & Dent Coverage',
      price: 99,
      description: 'Enhanced protection for common damages',
      features: [
        'Scratch & dent repairs',
        'Paint & bodywork',
        'Minor collision coverage',
        '24/7 claim support',
        'Priority service'
      ],
      recommended: true
    },
    {
      id: 'full',
      title: 'Full Coverage',
      price: 129,
      description: 'Complete protection for maximum peace of mind',
      features: [
        'Complete damage coverage',
        'Theft & vandalism',
        'Emergency roadside assistance',
        'Replacement vehicle',
        '24/7 claim support',
        'Zero deductible'
      ]
    }
  ];

  const paymentModes = [
    { id: 'card', title: 'Credit/Debit Card', icon: 'card' },
    { id: 'upi', title: 'UPI Payment', icon: 'phone-portrait' },
    { id: 'wallet', title: 'Digital Wallet', icon: 'wallet' }
  ];

  const handleInsuranceSelect = (insuranceId: string) => {
    setSelectedInsurance(insuranceId);
  };

  const handleContinue = () => {
    if (!selectedInsurance) {
      Alert.alert('Select Insurance', 'Please select an insurance option to continue.');
      return;
    }
    
    const selectedOption = insuranceOptions.find(option => option.id === selectedInsurance);
    Alert.alert(
      'Insurance Added',
      `${selectedOption?.title} (₹${selectedOption?.price}) has been added to your booking.`
    );
    router.push('/(customer)/ride-confirmation');
  };

  const handleSkip = () => {
    router.push('/(customer)/ride-confirmation');
  };

  const handleTermsAndConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'Trip Insurance Terms:\n\n• Coverage valid only during the booked trip duration\n• Claims must be reported within 24 hours\n• Valid ID and trip booking required for claims\n• Coverage excludes pre-existing damage\n• Emergency support available 24/7\n\nFor detailed terms, visit our website or contact support.'
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Trip Insurance</ThemedText>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-4">
            {/* Header Info */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="shield-checkmark" size={32} color="#3B82F6" />
              </View>
              <ThemedText variant="h3" className="text-center mb-2">
                Protect Your Journey
              </ThemedText>
              <ThemedText variant="small" className="text-center text-gray-600">
                Choose insurance coverage for your trip and travel worry-free
              </ThemedText>
            </View>

            {/* Insurance Options */}
            <ThemedText variant="h3" className="mb-4">Choose Coverage</ThemedText>
            
            {insuranceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleInsuranceSelect(option.id)}
                className="mb-4"
                activeOpacity={1}
              >
                <ThemedCard 
                  className={`p-4 ${
                    selectedInsurance === option.id 
                      ? 'border-2 border-blue-500' 
                      : 'border border-gray-200'
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <ThemedText variant="h3" className="mr-2">{option.title}</ThemedText>
                        {option.recommended && (
                          <View className="bg-green-100 px-2 py-1 rounded-full">
                            <ThemedText variant="tiny" className="text-green-700 font-semibold">
                              Recommended
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText variant="small" className="text-gray-600 mt-1">
                        {option.description}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText variant="h3" className="text-blue-600 font-bold">
                        ₹{option.price}
                      </ThemedText>
                      <View className={`w-6 h-6 rounded-full border-2 mt-2 items-center justify-center ${
                        selectedInsurance === option.id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedInsurance === option.id && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Features */}
                  <View className="border-t border-gray-200 pt-3">
                    {option.features.map((feature, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <Ionicons name="checkmark-circle" size={16} color="#720C17" />
                        <ThemedText variant="small" className="ml-2 text-gray-700">
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            ))}

            {/* Payment Modes */}
            {selectedInsurance && (
              <View className="mt-6">
                <ThemedText variant="h3" className="mb-4">Payment Mode</ThemedText>
                <View className="flex-row justify-between">
                  {paymentModes.map((mode) => (
                    <TouchableOpacity
                      key={mode.id}
                      onPress={() => setSelectedPaymentMode(mode.id)}
                      className={`flex-1 mx-1 p-3 rounded-xl border ${
                        selectedPaymentMode === mode.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                      activeOpacity={1}
                    >
                      <View className="items-center">
                        <Ionicons 
                          name={mode.icon as any} 
                          size={24} 
                          color={selectedPaymentMode === mode.id ? '#3B82F6' : '#6B7280'} 
                        />
                        <ThemedText 
                          variant="tiny" 
                          className={`mt-2 text-center ${
                            selectedPaymentMode === mode.id ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        >
                          {mode.title}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Terms & Conditions */}
            <TouchableOpacity 
              onPress={handleTermsAndConditions}
              className="flex-row items-center justify-center py-4 mt-6"
            >
              <Ionicons name="document-text" size={20} color={iconColor} />
              <ThemedText className="ml-2 text-burgundy underline">
                Terms & Conditions
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-gray-200">
          {selectedInsurance ? (
            <PrimaryButton
              title={`Continue with ${insuranceOptions.find(o => o.id === selectedInsurance)?.title} - ₹${insuranceOptions.find(o => o.id === selectedInsurance)?.price}`}
              onPress={handleContinue}
              className="mb-3"
            />
          ) : (
            <View className="mb-3 py-4 bg-gray-200 rounded-xl">
              <ThemedText className="text-center text-gray-600">
                Select an insurance option to continue
              </ThemedText>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={handleSkip}
            className="py-3"
          >
            <ThemedText className="text-center text-gray-600">
              Skip for now
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}