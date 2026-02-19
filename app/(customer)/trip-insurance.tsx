import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import InsuranceApiService, { InsurancePlan, InsuranceTier } from '../../services/api/InsuranceApiService';

interface InsuranceOption {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
  coverageAmount: string;
  tier: InsuranceTier;
}

export default function TripInsuranceScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedInsurancePlan, setSelectedInsurancePlan } = useBookingStore();

  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const returnTo = (params.returnTo as string) || '/(customer)/book-ride-new';

  // Fetch insurance plans on mount
  useEffect(() => {
    fetchInsurancePlans();
  }, []);

  // Set selected insurance if it was previously selected
  useEffect(() => {
    if (selectedInsurancePlan) {
      setSelectedInsurance(selectedInsurancePlan.id);
    }
  }, [selectedInsurancePlan]);

  const fetchInsurancePlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await InsuranceApiService.listPlans();

      if (response.success && response.data && response.data.length > 0) {
        setInsurancePlans(response.data);
      } else {
        setError('No insurance plans available at the moment.');
        // Fall back to empty state - allow skip
      }
    } catch (err) {
      setError('Failed to load insurance plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiPlanToOption = (plan: InsurancePlan, allPlans: InsurancePlan[]): InsuranceOption => {
    return {
      id: plan.id,
      title: plan.name,
      price: InsuranceApiService.parseAmount(plan.premium_amount),
      description: plan.description || InsuranceApiService.getTierDescription(plan.tier),
      features: plan.coverage_details || [],
      recommended: InsuranceApiService.isRecommendedPlan(plan, allPlans),
      coverageAmount: plan.max_coverage_amount,
      tier: plan.tier,
    };
  };

  const insuranceOptions: InsuranceOption[] = insurancePlans.map(plan =>
    mapApiPlanToOption(plan, insurancePlans)
  );

  const handleInsuranceSelect = (insuranceId: string) => {
    setSelectedInsurance(insuranceId);
  };

  const handleContinue = () => {
    if (!selectedInsurance) {
      Alert.alert('Select Insurance', 'Please select an insurance option to continue.');
      return;
    }

    const selectedPlan = insurancePlans.find(plan => plan.id === selectedInsurance);
    if (selectedPlan) {
      setSelectedInsurancePlan(selectedPlan);
    }

    // Return to the booking screen with the selected insurance
    router.push({
      pathname: returnTo as any,
      params: {
        insurancePlanId: selectedInsurance,
        insurancePremium: String(mapApiPlanToOption(selectedPlan!, insurancePlans).price),
      },
    });
  };

  const handleSkip = () => {
    // Clear any selected insurance
    setSelectedInsurancePlan(null);
    setSelectedInsurance('');

    // Return to the booking screen without insurance
    router.push({
      pathname: returnTo as any,
      params: {
        insurancePlanId: '',
        insurancePremium: '0',
      },
    });
  };

  const handleTermsAndConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'Trip Insurance Terms:\n\n• Coverage valid only during the booked trip duration\n• Claims must be reported within 24 hours\n• Valid ID and trip booking required for claims\n• Coverage excludes pre-existing damage\n• Emergency support available 24/7\n• Coverage amount as specified in the selected plan\n\nFor detailed terms, visit our website or contact support.'
    );
  };

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color="#BD8C5E" />
      <ThemedText className="mt-4 text-gray-500">
        Loading insurance plans...
      </ThemedText>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={32} color="#EF4444" />
      </View>
      <ThemedText variant="h3" className="text-center mb-2">
        Unable to Load Plans
      </ThemedText>
      <ThemedText variant="small" className="text-center text-gray-600 mb-6">
        {error}
      </ThemedText>
      <TouchableOpacity
        onPress={fetchInsurancePlans}
        className="flex-row items-center bg-burgundy/10 px-6 py-3 rounded-xl"
      >
        <Ionicons name="refresh" size={20} color={iconColor} />
        <ThemedText className="ml-2 text-burgundy font-semibold">
          Try Again
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="shield-outline" size={32} color="#9CA3AF" />
      </View>
      <ThemedText variant="h3" className="text-center mb-2">
        No Insurance Plans
      </ThemedText>
      <ThemedText variant="small" className="text-center text-gray-600">
        Insurance plans are not available at the moment. You can proceed without insurance.
      </ThemedText>
    </View>
  );

  const getTierColors = (tier: InsuranceTier, isSelected: boolean) => {
    const colors = InsuranceApiService.getTierColor(tier);
    if (isSelected) {
      return {
        border: 'border-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        radio: 'border-blue-500 bg-blue-500',
      };
    }
    return {
      border: 'border-gray-200 dark:border-gray-700',
      bg: '',
      radio: 'border-gray-300',
    };
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

            {/* Loading State */}
            {isLoading && renderLoadingState()}

            {/* Error State */}
            {!isLoading && error && renderErrorState()}

            {/* Empty State */}
            {!isLoading && !error && insuranceOptions.length === 0 && renderEmptyState()}

            {/* Insurance Options */}
            {!isLoading && !error && insuranceOptions.length > 0 && (
              <>
                <ThemedText variant="h3" className="mb-4">Choose Coverage</ThemedText>

                {insuranceOptions.map((option) => {
                  const isSelected = selectedInsurance === option.id;
                  const colors = getTierColors(option.tier, isSelected);

                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleInsuranceSelect(option.id)}
                      className="mb-4"
                      activeOpacity={1}
                    >
                      <ThemedCard
                        className={`p-4 border-2 ${colors.border} ${colors.bg}`}
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
                            <View className={`w-6 h-6 rounded-full border-2 mt-2 items-center justify-center ${colors.radio}`}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={16} color="white" />
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Coverage Amount */}
                        <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 mb-3">
                          <Ionicons name="cash-outline" size={16} color="#3B82F6" />
                          <ThemedText variant="small" className="ml-2 text-blue-700 dark:text-blue-400">
                            Coverage up to {InsuranceApiService.formatCoverageAmount(option.coverageAmount)}
                          </ThemedText>
                        </View>

                        {/* Features */}
                        <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          {option.features.map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-1">
                              <Ionicons name="checkmark-circle" size={16} color="#720C17" />
                              <ThemedText variant="small" className="ml-2 text-gray-700 dark:text-gray-300">
                                {feature}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </ThemedCard>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Terms & Conditions */}
            {!isLoading && (
              <TouchableOpacity
                onPress={handleTermsAndConditions}
                className="flex-row items-center justify-center py-4 mt-6"
              >
                <Ionicons name="document-text" size={20} color={iconColor} />
                <ThemedText className="ml-2 text-burgundy underline">
                  Terms & Conditions
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-gray-200">
          {/* Continue Button - only show if plans are available */}
          {!isLoading && !error && insuranceOptions.length > 0 && selectedInsurance && (
            <PrimaryButton
              title={`Continue with ${insuranceOptions.find(o => o.id === selectedInsurance)?.title} - ₹${insuranceOptions.find(o => o.id === selectedInsurance)?.price}`}
              onPress={handleContinue}
              className="mb-3"
            />
          )}

          {/* No Insurance Selected State */}
          {!isLoading && !error && insuranceOptions.length > 0 && !selectedInsurance && (
            <View className="mb-3 py-4 bg-gray-200 rounded-xl">
              <ThemedText className="text-center text-gray-600">
                Select an insurance option to continue
              </ThemedText>
            </View>
          )}

          {/* Skip Button - always available */}
          <TouchableOpacity
            onPress={handleSkip}
            className="py-3"
          >
            <ThemedText className="text-center text-gray-600">
              {selectedInsurance ? 'Cancel Insurance' : 'Skip for now'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
