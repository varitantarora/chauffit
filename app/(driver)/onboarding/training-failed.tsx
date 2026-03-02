import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';

export default function TrainingFailedScreen() {
  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="flex-1 justify-center">
          <View className="px-6 items-center">
            {/* Icon */}
            <View className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-6">
              <Ionicons name="close-circle" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <ThemedText variant="title" className="text-2xl font-bold text-center mb-3">
              Training Not Passed
            </ThemedText>

            <ThemedText variant="secondary" className="text-center mb-8 px-4">
              Unfortunately, you did not pass the training session. Don't worry — you can retake the training.
            </ThemedText>

            {/* Info Card */}
            <ThemedCard className="p-4 mb-6 w-full">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#BD8C5E" />
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
                <Ionicons name="bulb" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold ml-2">Tips for Next Time</ThemedText>
              </View>
              <View className="space-y-2">
                <ThemedText variant="secondary">• Review the training materials beforehand</ThemedText>
                <ThemedText variant="secondary">• Bring all required original documents</ThemedText>
                <ThemedText variant="secondary">• Arrive 15 minutes early</ThemedText>
                <ThemedText variant="secondary">• Practice professional etiquette</ThemedText>
              </View>
            </ThemedCard>

            {/* Retake Button - disabled for now */}
            <PrimaryButton
              title="Retake Training (Available After 1 Week)"
              onPress={() => {}}
              disabled={true}
              className="w-full mb-6"
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
