import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { BrandColors } from '../../../constants/Colors';

interface AdvanceOption {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  maxAmount: number;
  interest: number;
  interestType: 'per_day' | 'per_week';
  repayPeriod: string;
  amount: string;
}

export default function RequestAdvanceScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [selectedOption, setSelectedOption] = useState<string>('daily');
  const [isProcessing, setIsProcessing] = useState(false);

  const driverEligibility = {
    rating: 4.9,
    completionRate: 98,
    activeDays: 45,
    status: 'approved'
  };

  const [advanceOptions, setAdvanceOptions] = useState<AdvanceOption[]>([
    {
      id: 'daily',
      type: 'daily',
      title: 'Daily Advance',
      maxAmount: 1500,
      interest: 2,
      interestType: 'per_day',
      repayPeriod: '7 days max',
      amount: '1000'
    },
    {
      id: 'weekly',
      type: 'weekly',
      title: 'Weekly Advance',
      maxAmount: 7500,
      interest: 5,
      interestType: 'per_week',
      repayPeriod: 'Next Friday',
      amount: '5000'
    }
  ]);

  const updateAmount = (optionId: string, newAmount: string) => {
    setAdvanceOptions(options =>
      options.map(option =>
        option.id === optionId ? { ...option, amount: newAmount } : option
      )
    );
  };

  const calculateInterest = (option: AdvanceOption) => {
    const amount = parseFloat(option.amount) || 0;
    if (option.interestType === 'per_day') {
      return (amount * option.interest / 100);
    } else {
      return (amount * option.interest / 100);
    }
  };

  const handleRequestAdvance = async () => {
    const option = advanceOptions.find(opt => opt.id === selectedOption);
    if (!option) return;

    const amount = parseFloat(option.amount);
    if (amount <= 0 || amount > option.maxAmount) {
      Alert.alert('Invalid Amount', `Please enter an amount between ₹1 and ₹${option.maxAmount.toLocaleString('en-IN')}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const interest = calculateInterest(option);
      
      Alert.alert(
        'Advance Requested',
        `Your ${option.title.toLowerCase()} advance of ₹${amount.toLocaleString('en-IN')} has been approved!\n\nInterest: ₹${interest.toFixed(2)}\nRepayment: ${option.repayPeriod}\n\nAmount will be credited to your account within 15 minutes.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process advance request. Please try again.');
    }
    
    setIsProcessing(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Request Advance
          </ThemedText>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6">
            <ThemedText variant="secondary" className="text-center mb-6">
              Get your earnings in advance
            </ThemedText>

            {/* Eligibility Status */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="shield-checkmark" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold ml-2">ADVANCE ELIGIBILITY</ThemedText>
              </View>

              <ThemedCard className="p-4">
                <View className="space-y-3 mb-4">
                  <View className="flex-row justify-between">
                    <ThemedText>Current rating:</ThemedText>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#fbbf24" />
                      <ThemedText className="font-semibold ml-1">
                        {driverEligibility.rating}/5
                      </ThemedText>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Completion rate:</ThemedText>
                    <ThemedText className="font-semibold">
                      {driverEligibility.completionRate}%
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Active days:</ThemedText>
                    <ThemedText className="font-semibold">
                      {driverEligibility.activeDays} (Good)
                    </ThemedText>
                  </View>
                </View>
                
                <View className="border-t border-border dark:border-darkBorder pt-4">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <ThemedText className="font-bold text-success ml-2">
                      Eligibility: APPROVED
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>

            {/* Advance Options */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="cash" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold ml-2">ADVANCE OPTIONS</ThemedText>
              </View>

              <View className="space-y-4">
                {advanceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedOption(option.id)}
                    className={`border-2 rounded-lg ${
                      selectedOption === option.id 
                        ? 'border-burgundy bg-burgundy/5' 
                        : 'border-border dark:border-darkBorder bg-surface dark:bg-darkSurface'
                    }`}
                  >
                    <ThemedCard className="p-4 bg-transparent">
                      <View className="flex-row items-center justify-between mb-3">
                        <ThemedText className={`font-bold ${selectedOption === option.id ? 'text-burgundy' : ''}`}>
                          Option {option.id === 'daily' ? '1' : '2'}: {option.title}
                        </ThemedText>
                        {selectedOption === option.id && (
                          <Ionicons name="checkmark-circle" size={20} color={BrandColors.burgundy} />
                        )}
                      </View>
                      
                      <View className="space-y-2 mb-4">
                        <View className="flex-row justify-between">
                          <ThemedText>Max amount:</ThemedText>
                          <ThemedText className="font-semibold">
                            ₹{option.maxAmount.toLocaleString('en-IN')} per {option.type}
                          </ThemedText>
                        </View>
                        <View className="flex-row justify-between">
                          <ThemedText>Interest:</ThemedText>
                          <ThemedText className="font-semibold">
                            {option.interest}% per {option.type}
                          </ThemedText>
                        </View>
                        <View className="flex-row justify-between">
                          <ThemedText>Auto-deduct:</ThemedText>
                          <ThemedText className="font-semibold">
                            From {option.type === 'daily' ? 'next earnings' : 'weekly earnings'}
                          </ThemedText>
                        </View>
                      </View>

                      {selectedOption === option.id && (
                        <View className="border-t border-burgundy/20 pt-4">
                          <View className="space-y-3">
                            <View>
                              <ThemedText className="mb-2">Amount: ₹</ThemedText>
                              <TextInput
                                value={option.amount}
                                onChangeText={(value) => updateAmount(option.id, value)}
                                placeholder="Enter amount"
                                keyboardType="numeric"
                                className="border border-burgundy rounded-lg px-3 py-2 text-lg font-bold"
                                style={{ color: isDarkMode ? '#d9d1c6' : BrandColors.burgundy }}
                              />
                            </View>
                            
                            <View className="bg-burgundy/10 p-3 rounded-lg">
                              <View className="flex-row justify-between mb-1">
                                <ThemedText>Interest:</ThemedText>
                                <ThemedText className="font-semibold text-burgundy">
                                  ₹{calculateInterest(option).toFixed(2)} per {option.type}
                                </ThemedText>
                              </View>
                              <View className="flex-row justify-between">
                                <ThemedText>Repay by:</ThemedText>
                                <ThemedText className="font-semibold text-burgundy">
                                  {option.repayPeriod}
                                </ThemedText>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                    </ThemedCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Important Terms */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <ThemedText className="font-bold ml-2 text-warning">IMPORTANT TERMS</ThemedText>
              </View>

              <ThemedCard className="p-4 bg-warning/10 border border-warning/20">
                <View className="space-y-2">
                  <ThemedText>• Advances auto-deducted first</ThemedText>
                  <ThemedText>• Late fees: 5% per day</ThemedText>
                  <ThemedText>• Max 3 active advances</ThemedText>
                </View>
              </ThemedCard>
            </View>

            {/* Action Buttons */}
            <View className="pb-6">
              <PrimaryButton
                title={isProcessing ? "Processing..." : "Request This Advance"}
                onPress={handleRequestAdvance}
                disabled={isProcessing}
                className="mb-4"
              />
              
              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1 bg-surface dark:bg-darkSurface py-3 rounded-lg border border-border dark:border-darkBorder">
                  <ThemedText className="text-center font-semibold">Terms & Conditions</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-1 bg-surface dark:bg-darkSurface py-3 rounded-lg border border-border dark:border-darkBorder">
                  <ThemedText className="text-center font-semibold">FAQ</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}