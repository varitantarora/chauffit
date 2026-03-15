import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Alert, ActivityIndicator, LayoutAnimation } from 'react-native';
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
import { useConfigStore } from '../../store/configStore';
import { BrandColors, useThemeColors } from '../../constants/Colors';

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
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const insuranceEnabled = getConfigValue('insurance_enabled') === 'true';

  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const returnTo = (params.returnTo as string) || '/(customer)/book-ride-new';

  // Redirect back if insurance feature is disabled
  useEffect(() => {
    if (!insuranceEnabled) {
      router.back();
    }
  }, [insuranceEnabled]);

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
      'Trip Insurance Terms:\n\n• Coverage valid only during the active Chauffit trip\n• Must notify Chauffit within 3 days of trip completion\n• Must upload repair invoices within 7 days\n• Repairs must be done at GST-authorized service centers\n• Claims subject to deductibles, sub-limits, and coverage availability\n\nEXCLUSIONS:\n• Normal wear & tear (brake pads, spark plugs, tires, etc.)\n• Mechanical or electrical failure\n• Rust, aging, or weather damage\n• Third-party liabilities\n• Vehicles without valid motor insurance\n• Fraud, intentional overloading, war-like operations\n• Manufacturing defects\n\nChauffit complies with IRDAI regulations. Governed under Indian law with arbitration in Delhi NCR.'
    );
  };

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color={BrandColors.secondary} />
      <ThemedText className="mt-4 text-textSecondary dark:text-darkTextSecondary">
        Loading insurance plans...
      </ThemedText>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={32} color={BrandColors.danger} />
      </View>
      <ThemedText variant="h3" className="text-center mb-2">
        Unable to Load Plans
      </ThemedText>
      <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary mb-6">
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
      <View className="w-16 h-16 bg-gray-100 dark:bg-darkSurface rounded-full items-center justify-center mb-4">
        <Ionicons name="shield-outline" size={32} color={BrandColors.secondary} />
      </View>
      <ThemedText variant="h3" className="text-center mb-2">
        No Insurance Plans
      </ThemedText>
      <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary">
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
      radio: 'border-border dark:border-darkBorder',
    };
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
            <ThemedText variant="h2">Trip Insurance</ThemedText>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-4">
            {/* Header Info */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="shield-checkmark" size={32} color={BrandColors.info} />
              </View>
              <ThemedText variant="h3" className="text-center mb-2">
                Protect Your Journey
              </ThemedText>
              <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary">
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
                            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mt-1">
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
                          <Ionicons name="cash-outline" size={16} color={BrandColors.info} />
                          <ThemedText variant="small" className="ml-2 text-blue-700 dark:text-blue-400">
                            Coverage up to {InsuranceApiService.formatCoverageAmount(option.coverageAmount)}
                          </ThemedText>
                        </View>

                        {/* Features */}
                        <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <View className="flex-row flex-wrap">
                            {option.features.map((feature, index) => (
                              <View key={index} className="w-1/2 flex-row items-start mb-2 pr-2">
                                <Ionicons name="checkmark-circle" size={16} color={BrandColors.burgundy} className="flex-shrink-0 mt-0.5" />
                                <ThemedText variant="small" className="ml-2 text-gray-700 dark:text-gray-300 flex-1">
                                  {feature}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </View>
                      </ThemedCard>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* How It Works */}
            {!isLoading && (
              <View className="mt-6">
                <ThemedText variant="h3" className="mb-3">How It Works</ThemedText>
                <ThemedCard className="p-4">
                  {[
                    { step: '1', text: 'Book a chauffeur in the app' },
                    { step: '2', text: 'Select your preferred insurance coverage' },
                    { step: '3', text: 'Insurance fee is added to your booking total' },
                    { step: '4', text: 'Coverage starts when the chauffeur boards your car' },
                    { step: '5', text: 'Coverage ends when the trip is completed' },
                  ].map(({ step, text }) => (
                    <View key={step} className="flex-row items-start mb-3 last:mb-0">
                      <View className="w-7 h-7 rounded-full items-center justify-center mr-3 flex-shrink-0" style={{ backgroundColor: BrandColors.burgundy }}>
                        <ThemedText variant="tiny" className="text-white font-bold">{step}</ThemedText>
                      </View>
                      <ThemedText variant="small" className="text-gray-700 dark:text-gray-300 flex-1 pt-1">{text}</ThemedText>
                    </View>
                  ))}
                </ThemedCard>
              </View>
            )}

            {/* Claims Process */}
            {!isLoading && (
              <View className="mt-5">
                <ThemedText variant="h3" className="mb-3">Claims Process</ThemedText>
                <ThemedCard className="p-4">
                  {[
                    { icon: 'time-outline' as const, text: 'Notify Chauffit within 3 days of trip completion' },
                    { icon: 'document-attach-outline' as const, text: 'Upload repair invoices within 7 days' },
                    { icon: 'business-outline' as const, text: 'Repairs at GST-authorized service centers only' },
                    { icon: 'information-circle-outline' as const, text: 'Claims subject to deductibles and sub-limits' },
                  ].map(({ icon, text }, i) => (
                    <View key={i} className="flex-row items-start mb-3 last:mb-0">
                      <Ionicons name={icon} size={18} color={iconColor} className="mr-3 mt-0.5 flex-shrink-0" />
                      <ThemedText variant="small" className="text-gray-700 dark:text-gray-300 flex-1 ml-2">{text}</ThemedText>
                    </View>
                  ))}
                </ThemedCard>
              </View>
            )}

            {/* Benefits */}
            {!isLoading && (
              <View className="mt-5">
                <ThemedText variant="h3" className="mb-3">Benefits</ThemedText>
                <ThemedCard className="p-4">
                  {[
                    'Affordable add-on to your booking',
                    'Flexible protection levels to choose from',
                    'Peace of mind during every trip',
                    'Simple claims process',
                  ].map((benefit, i) => (
                    <View key={i} className="flex-row items-center mb-2 last:mb-0">
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                      <ThemedText variant="small" className="ml-2 text-gray-700 dark:text-gray-300">{benefit}</ThemedText>
                    </View>
                  ))}
                </ThemedCard>
              </View>
            )}

            {/* Coverage Exclusions */}
            {!isLoading && (
              <View className="mt-5">
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowExclusions(prev => !prev);
                  }}
                  className="flex-row items-center justify-between mb-3"
                  activeOpacity={0.7}
                >
                  <ThemedText variant="h3">What's Not Covered</ThemedText>
                  <Ionicons name={showExclusions ? 'chevron-up' : 'chevron-down'} size={20} color={iconColor} />
                </TouchableOpacity>

                {showExclusions && (
                  <ThemedCard className="p-4">
                    <ThemedText variant="small" className="text-gray-500 dark:text-darkTextSecondary mb-3 font-semibold uppercase tracking-wide">Exclusions</ThemedText>
                    {[
                      'Normal wear & tear (brake pads, spark plugs, tires)',
                      'Mechanical or electrical failure',
                      'Rust, aging, or weather damage',
                      'Accessories & electrical equipment',
                      'Third-party liabilities',
                      'Vehicles without valid motor insurance',
                      'Commercial / yellow-board vehicles',
                    ].map((item, i) => (
                      <View key={i} className="flex-row items-start mb-2">
                        <Ionicons name="close-circle" size={16} color={BrandColors.danger} />
                        <ThemedText variant="small" className="ml-2 text-gray-700 dark:text-gray-300 flex-1">{item}</ThemedText>
                      </View>
                    ))}

                    <ThemedText variant="small" className="text-gray-500 dark:text-darkTextSecondary mt-4 mb-3 font-semibold uppercase tracking-wide">Excluded Incidents</ThemedText>
                    {[
                      'Fraud or unlawful activity',
                      'Intentional overloading',
                      'Damage caused by third parties',
                      'War-like operations',
                      'Manufacturing defects',
                      'Dealer warranty-covered damages',
                    ].map((item, i) => (
                      <View key={i} className="flex-row items-start mb-2">
                        <Ionicons name="close-circle" size={16} color={BrandColors.danger} />
                        <ThemedText variant="small" className="ml-2 text-gray-700 dark:text-gray-300 flex-1">{item}</ThemedText>
                      </View>
                    ))}
                  </ThemedCard>
                )}
              </View>
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
        <View className="px-6 py-4 border-t border-border dark:border-darkBorder">
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
            <View className="mb-3 py-4 bg-gray-100 dark:bg-darkSurface rounded-xl">
              <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">
                Select an insurance option to continue
              </ThemedText>
            </View>
          )}

          {/* Skip Button - always available */}
          <TouchableOpacity
            onPress={handleSkip}
            className="py-3"
          >
            <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">
              {selectedInsurance ? 'Cancel Insurance' : 'Skip for now'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
