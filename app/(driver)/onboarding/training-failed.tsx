import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService from '../../../services/api/DriverApiService';
import { BrandColors } from '../../../constants/Colors';

export default function TrainingFailedScreen() {
  const router = useRouter();
  const driverOnboardingStatus = useAuthStore((state) => state.driverOnboardingStatus);
  const fetchDriverOnboardingStatus = useAuthStore((state) => state.fetchDriverOnboardingStatus);
  const [trainingSession, setTrainingSession] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  // On mount, fetch latest training session and calculate eligibility
  useEffect(() => {
    const initializeScreen = async () => {
      // Get onboarding status which includes training_session
      const authState = useAuthStore.getState();
      const session = authState.trainingSession;

      if (session) {
        setTrainingSession(session);
        calculateEligibility(session);
      } else {
        // Fallback: refresh the onboarding status
        await fetchDriverOnboardingStatus();
        const updatedState = useAuthStore.getState();
        if (updatedState.trainingSession) {
          setTrainingSession(updatedState.trainingSession);
          calculateEligibility(updatedState.trainingSession);
        }
      }
    };

    initializeScreen();
  }, [fetchDriverOnboardingStatus]);

  const calculateEligibility = (session: any) => {
    if (!session || !session.batch || !session.batch.date) return;

    const batchDate = new Date(session.batch.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    batchDate.setHours(0, 0, 0, 0);

    const daysPassed = Math.floor((today.getTime() - batchDate.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 7 - daysPassed);

    setDaysRemaining(remaining);
    setIsEligible(remaining === 0);
  };

  const handleRetakeTraining = useCallback(async () => {
    if (!isEligible) return;

    setIsLoading(true);
    try {
      const response = await DriverApiService.requestRetakeTraining();

      if (response.success) {
        Alert.alert(
          'Success',
          'You are eligible to retake training. You will be assigned to the next available batch.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Refresh onboarding status
                await fetchDriverOnboardingStatus();
                // Navigate back to background check
                router.replace('/(driver)/onboarding/background-check');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to request training retake');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isEligible, fetchDriverOnboardingStatus, router]);

  const getButtonTitle = (): string => {
    if (isEligible) {
      return 'Retake Training Now';
    }
    if (daysRemaining !== null) {
      const dayWord = daysRemaining === 1 ? 'day' : 'days';
      return `Available in ${daysRemaining} ${dayWord}`;
    }
    return 'Retake Training';
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="flex-1 justify-center">
          <View className="px-6 items-center">
            {/* Icon */}
            <View className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-6">
              <Ionicons name="close-circle" size={48} color={BrandColors.danger} />
            </View>

            {/* Title */}
            <ThemedText variant="title" className="text-2xl font-bold text-center mb-3">
              Training Not Passed
            </ThemedText>

            <ThemedText variant="secondary" className="text-center mb-8 px-4">
              Unfortunately, you did not pass the training session. Don't worry — you can retake the training.
            </ThemedText>

            {/* Days Remaining Card */}
            {daysRemaining !== null && !isEligible && (
              <ThemedCard className="p-4 mb-6 w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="time" size={24} color={BrandColors.warning} />
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-bold text-amber-700 dark:text-amber-300">
                        Come Back Soon
                      </ThemedText>
                      <ThemedText variant="secondary" className="text-sm">
                        {daysRemaining === 1
                          ? 'You can retake in 1 day'
                          : `You can retake in ${daysRemaining} days`}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ThemedCard>
            )}

            {/* Info Card */}
            <ThemedCard className="p-4 mb-6 w-full">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color={BrandColors.secondary} />
                <View className="ml-3 flex-1">
                  <ThemedText className="font-bold mb-1">Retake Policy</ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    You can retake the training after 1 week from your last session. You will be automatically assigned to the next available batch.
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Tips Card */}
            <ThemedCard className="p-4 mb-8 w-full">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bulb" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold ml-2">Tips for Next Time</ThemedText>
              </View>
              <View className="space-y-2">
                <ThemedText variant="secondary">• Review the training materials beforehand</ThemedText>
                <ThemedText variant="secondary">• Bring all required original documents</ThemedText>
                <ThemedText variant="secondary">• Arrive 15 minutes early</ThemedText>
                <ThemedText variant="secondary">• Practice professional etiquette</ThemedText>
              </View>
            </ThemedCard>

            {/* Retake Button */}
            <PrimaryButton
              title={getButtonTitle()}
              onPress={handleRetakeTraining}
              disabled={!isEligible || isLoading}
              className="w-full mb-6"
            >
              {isLoading && <ActivityIndicator color="white" size="small" />}
            </PrimaryButton>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
