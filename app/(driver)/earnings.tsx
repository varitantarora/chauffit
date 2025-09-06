import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function EarningsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title">Earnings</ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Track your income and performance
            </ThemedText>
          </View>
          
          {/* Earnings Summary */}
          <View className="px-6 mb-6">
            <ThemedCard className="p-6">
              <ThemedText variant="secondary" className="mb-2">Total Earnings</ThemedText>
              <ThemedText variant="title" className="text-3xl mb-4">₹82,000</ThemedText>
              <View className="flex-row justify-between">
                <View>
                  <ThemedText variant="caption">This Week</ThemedText>
                  <ThemedText className="font-semibold">₹15,000</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">This Month</ThemedText>
                  <ThemedText className="font-semibold">₹82,000</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">Pending</ThemedText>
                  <ThemedText className="font-semibold">₹4,200</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>
          
          {/* Daily Breakdown */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Daily Breakdown
            </ThemedText>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="font-semibold">Today</ThemedText>
                  <ThemedText variant="caption">8 rides completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-primary text-lg">₹10,700</ThemedText>
              </View>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="font-semibold">Yesterday</ThemedText>
                  <ThemedText variant="caption">6 rides completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-lg">₹8,200</ThemedText>
              </View>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="font-semibold">Dec 25</ThemedText>
                  <ThemedText variant="caption">10 rides completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-lg">₹16,000</ThemedText>
              </View>
            </ThemedCard>
          </View>
          
          {/* Performance Metrics */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Performance
            </ThemedText>
            <ThemedCard>
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Rating</ThemedText>
                </View>
                <ThemedText className="font-semibold">4.9/5.0</ThemedText>
              </View>
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Acceptance Rate</ThemedText>
                </View>
                <ThemedText className="font-semibold">95%</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Online Hours</ThemedText>
                </View>
                <ThemedText className="font-semibold">42 hrs</ThemedText>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}