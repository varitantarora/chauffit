import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="flex-1 justify-center">
          <View className="px-6 items-center">
            {/* Success Icon */}
            <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>

            {/* Title */}
            <ThemedText variant="title" className="text-2xl font-bold text-center mb-3">
              Congratulations!
            </ThemedText>

            <ThemedText className="text-center text-lg mb-2 font-semibold text-burgundy">
              You are now a Certified Chauffit Driver
            </ThemedText>

            <ThemedText variant="secondary" className="text-center mb-8 px-4">
              You have successfully completed all verification and training requirements. Welcome to the Chauffit family!
            </ThemedText>

            {/* What's Next Card */}
            <ThemedCard className="p-4 mb-6 w-full">
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
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
