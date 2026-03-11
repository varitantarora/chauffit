import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { TrainingCertificate } from '../../../components/driver/profile/TrainingCertificate';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService, { TrainingSession } from '../../../services/api/DriverApiService';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const storedTrainingSession = useAuthStore((state) => state.trainingSession);
  const fetchDriverOnboardingStatus = useAuthStore((state) => state.fetchDriverOnboardingStatus);

  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(
    storedTrainingSession
  );
  const [driverProfile, setDriverProfile] = useState<{ full_name: string; phone_number: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Load driver profile
      const profileRes = await DriverApiService.getProfile();
      if (profileRes.success && profileRes.data) {
        setDriverProfile({
          full_name: profileRes.data.full_name,
          phone_number: profileRes.data.phone_number,
        });
      }

      // Ensure training session is loaded
      if (!storedTrainingSession) {
        await fetchDriverOnboardingStatus();
        const freshSession = useAuthStore.getState().trainingSession;
        if (freshSession) {
          setTrainingSession(freshSession);
        } else {
          // Fall back to direct API call
          const sessionRes = await DriverApiService.getTrainingSchedule();
          if (sessionRes.success && sessionRes.data) {
            setTrainingSession(sessionRes.data);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const driverName = driverProfile?.full_name || user?.name || 'Driver';
  const phoneNumber = driverProfile?.phone_number || user?.phone || '';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
          {/* Success Icon & Title */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>

            <ThemedText variant="title" className="text-2xl font-bold text-center mb-3">
              Congratulations!
            </ThemedText>

            <ThemedText className="text-center text-lg mb-2 font-semibold text-burgundy">
              You are now a Certified Chauffit Driver
            </ThemedText>

            <ThemedText variant="secondary" className="text-center mb-4 px-4">
              You have successfully completed all verification and training requirements. Welcome to the Chauffit family!
            </ThemedText>
          </View>

          {/* Certificate Widget */}
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#BD8C5E" />
              <ThemedText className="mt-3 text-secondary">Loading your certificate...</ThemedText>
            </View>
          ) : trainingSession ? (
            <>
              <ThemedText className="font-bold text-center mb-4 text-lg">
                🎓 Your Training Certificate
              </ThemedText>
              <TrainingCertificate
                driverName={driverName}
                phoneNumber={phoneNumber}
                trainingSession={trainingSession}
                isDarkMode={isDarkMode}
              />
              <PrimaryButton
                title="View Full Certificate"
                onPress={() => router.push('/(driver)/training-certificate')}
                variant="outline"
                className="mt-4 mb-2"
              />
            </>
          ) : null}

          {/* What's Next Card */}
          <ThemedCard className="p-4 mb-6 mt-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="rocket" size={20} color="#BD8C5E" />
              <ThemedText className="font-bold ml-2">What's Next?</ThemedText>
            </View>
            <View className="space-y-2">
              <ThemedText variant="secondary">• Go online to start receiving ride requests</ThemedText>
              <ThemedText variant="secondary">• Complete your banking details for payouts</ThemedText>
              <ThemedText variant="secondary">• Explore the driver dashboard features</ThemedText>
            </View>
          </ThemedCard>

          {/* Go to Dashboard Button */}
          <PrimaryButton
            title="Go to Dashboard"
            onPress={() => router.replace('/(driver)/(tabs)')}
            className="w-full mb-6"
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

