import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function BikerEarningsScreen() {
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
              Track your delivery income
            </ThemedText>
          </View>
          
          {/* Earnings Summary */}
          <View className="px-6 mb-6">
            <ThemedCard className="p-6">
              <ThemedText variant="secondary" className="mb-2">Total Earnings</ThemedText>
              <ThemedText variant="title" className="text-3xl mb-4">₹28,200</ThemedText>
              <View className="flex-row justify-between">
                <View>
                  <ThemedText variant="caption">This Week</ThemedText>
                  <ThemedText className="font-semibold">₹8,200</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">This Month</ThemedText>
                  <ThemedText className="font-semibold">₹28,200</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">Pending</ThemedText>
                  <ThemedText className="font-semibold">₹1,070</ThemedText>
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
                  <ThemedText variant="caption">24 deliveries completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-primary text-lg">₹6,000</ThemedText>
              </View>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="font-semibold">Yesterday</ThemedText>
                  <ThemedText variant="caption">18 deliveries completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-lg">₹4,520</ThemedText>
              </View>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="font-semibold">Dec 25</ThemedText>
                  <ThemedText variant="caption">30 deliveries completed</ThemedText>
                </View>
                <ThemedText className="font-bold text-lg">₹7,500</ThemedText>
              </View>
            </ThemedCard>
          </View>
          
          {/* Performance Metrics */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Performance Stats
            </ThemedText>
            <ThemedCard>
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Customer Rating</ThemedText>
                </View>
                <ThemedText className="font-semibold">4.8/5.0</ThemedText>
              </View>
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="speedometer" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Delivery Speed</ThemedText>
                </View>
                <ThemedText className="font-semibold">Excellent</ThemedText>
              </View>
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Completion Rate</ThemedText>
                </View>
                <ThemedText className="font-semibold">98%</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="bicycle" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Distance Covered</ThemedText>
                </View>
                <ThemedText className="font-semibold">342 km</ThemedText>
              </View>
            </ThemedCard>
          </View>
          
          {/* Bonus & Incentives */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Bonuses & Incentives
            </ThemedText>
            <ThemedCard>
              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1">
                  <ThemedText>Peak Hour Bonus</ThemedText>
                  <ThemedText className="font-semibold text-green-600">+$25.00</ThemedText>
                </View>
                <ThemedText variant="caption">Completed 10 deliveries during peak hours</ThemedText>
              </View>
              <View className="border-t border-border dark:border-darkBorder pt-3">
                <View className="flex-row justify-between items-center mb-1">
                  <ThemedText>Weekend Bonus</ThemedText>
                  <ThemedText className="font-semibold text-green-600">+$15.00</ThemedText>
                </View>
                <ThemedText variant="caption">Extra earnings for weekend availability</ThemedText>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}