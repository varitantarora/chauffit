import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { BrandColors } from '../../../constants/Colors';

interface DailyPerformance {
  day: string;
  earnings: number;
  pickups: number;
  barWidth: number;
}

interface EfficiencyMetrics {
  pickupAcceptance: number;
  completionRate: number;
  averageRating: number;
  responseTime: number;
  milesPerPickup: number;
  fuelEfficiency: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function PerformanceAnalyticsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { earnings } = useBikerEarningsStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Mock weekly performance data
  const weeklyPerformance: DailyPerformance[] = [
    { day: 'Mon', earnings: 985.75, pickups: 8, barWidth: 60 },
    { day: 'Tue', earnings: 1342.25, pickups: 11, barWidth: 80 },
    { day: 'Wed', earnings: 1560.00, pickups: 14, barWidth: 100 },
    { day: 'Thu', earnings: 895.50, pickups: 7, barWidth: 50 },
    { day: 'Fri', earnings: 1275.50, pickups: 12, barWidth: 75 },
    { day: 'Sat', earnings: 0.00, pickups: 0, barWidth: 0 },
    { day: 'Sun', earnings: 0.00, pickups: 0, barWidth: 0 },
  ];

  const weeklyTotals = {
    totalEarnings: 6060.00,
    averagePerDay: 1212.00,
    totalPickups: 52
  };

  const efficiencyMetrics: EfficiencyMetrics = {
    pickupAcceptance: 94,
    completionRate: 99,
    averageRating: 4.8,
    responseTime: 1.2,
    milesPerPickup: 5.1,
    fuelEfficiency: 28.3
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Speed Demon',
      description: '50+ pickups/week',
      icon: 'flash',
      unlocked: true
    },
    {
      id: '2',
      title: 'Driver Favorite',
      description: '4.8+ rating',
      icon: 'heart',
      unlocked: true
    },
    {
      id: '3',
      title: 'Reliable Rider',
      description: '99% completion',
      icon: 'shield-checkmark',
      unlocked: true
    },
    {
      id: '4',
      title: 'Efficiency Expert',
      description: 'Top 10%',
      icon: 'trophy',
      unlocked: true
    },
    {
      id: '5',
      title: 'Night Owl',
      description: '10+ night pickups',
      icon: 'moon',
      unlocked: false
    },
    {
      id: '6',
      title: 'Distance Master',
      description: '500+ miles',
      icon: 'speedometer',
      unlocked: false
    }
  ];

  const handleViewTrends = () => {
    Alert.alert(
      'Performance Trends',
      'Detailed trend analysis:\n\n• Earnings up 15% this week\n• Average rating improved\n• Pickup efficiency increased\n• Response time optimized',
      [{ text: 'OK' }]
    );
  };

  const handleSetGoals = () => {
    Alert.alert(
      'Set Performance Goals',
      'Choose your weekly targets:',
      [
        {
          text: '₹8000/week',
          onPress: () => Alert.alert('Goal Set', 'Weekly earning goal set to ₹8000')
        },
        {
          text: '60 pickups/week',
          onPress: () => Alert.alert('Goal Set', 'Weekly pickup goal set to 60')
        },
        {
          text: 'Custom Goals',
          onPress: () => Alert.alert('Custom Goals', 'Custom goal setting feature coming soon!')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Performance Data',
      'Export your performance data for tax purposes or personal records.',
      [
        {
          text: 'Email CSV',
          onPress: () => Alert.alert('Export', 'Performance data will be emailed as CSV file')
        },
        {
          text: 'PDF Report',
          onPress: () => Alert.alert('Export', 'PDF performance report will be generated')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleViewRewards = () => {
    Alert.alert(
      'Rewards Program',
      'Your achievement rewards:\n\n• Speed Demon: ₹500 bonus\n• Driver Favorite: Priority requests\n• Reliable Rider: Reduced platform fee\n• Efficiency Expert: VIP support',
      [{ text: 'OK' }]
    );
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
            Performance Analytics
          </ThemedText>
          <TouchableOpacity onPress={handleExportData}>
            <Ionicons name="download" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Period Selector */}
            <View className="flex-row mb-6 bg-surface dark:bg-darkSurface rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2 items-center rounded-md ${
                    selectedPeriod === period ? 'bg-burgundy' : ''
                  }`}
                  activeOpacity={1}
                >
                  <ThemedText className={`font-semibold capitalize ${
                    selectedPeriod === period ? 'text-white' : ''
                  }`}>
                    {period}ly
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekly Overview */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold text-lg mb-4">
                📊 WEEKLY OVERVIEW
              </ThemedText>
              
              {/* Summary Stats */}
              <View className="flex-row justify-between mb-6 p-3 bg-burgundy/10 rounded-lg">
                <View className="items-center">
                  <ThemedText className="font-bold text-burgundy text-xl">
                    ₹{weeklyTotals.totalEarnings.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption">Weekly total</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-burgundy text-xl">
                    ₹{weeklyTotals.averagePerDay.toFixed(0)}
                  </ThemedText>
                  <ThemedText variant="caption">Average per day</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-burgundy text-xl">
                    {weeklyTotals.totalPickups}
                  </ThemedText>
                  <ThemedText variant="caption">Total pickups</ThemedText>
                </View>
              </View>

              {/* Daily Performance Chart */}
              <ThemedText className="font-semibold mb-3">DAILY PERFORMANCE</ThemedText>
              <View className="space-y-3">
                {weeklyPerformance.map((day) => (
                  <View key={day.day} className="flex-row items-center">
                    <ThemedText className="w-8 text-sm font-semibold">
                      {day.day}
                    </ThemedText>
                    <View className="flex-1 mx-3 h-6 bg-surface dark:bg-darkSurface rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-burgundy rounded-full"
                        style={{ width: `${day.barWidth}%` }}
                      />
                    </View>
                    <View className="w-20 items-end">
                      <ThemedText className="font-semibold text-sm">
                        ₹{day.earnings.toFixed(0)}
                      </ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {day.pickups} pick
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </ThemedCard>

            {/* Efficiency Metrics */}
            <ThemedCard className="p-4 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="analytics" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold text-lg ml-2">
                  🎯 EFFICIENCY METRICS
                </ThemedText>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <ThemedText>Pickup acceptance:</ThemedText>
                  <View className="flex-row items-center">
                    <ThemedText className="font-bold text-lg">
                      {efficiencyMetrics.pickupAcceptance}%
                    </ThemedText>
                    <Ionicons name="trending-up" size={16} color="#10b981" className="ml-1" />
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <ThemedText>Completion rate:</ThemedText>
                  <ThemedText className="font-bold text-lg text-success">
                    {efficiencyMetrics.completionRate}%
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <ThemedText>Average rating:</ThemedText>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <ThemedText className="font-bold text-lg ml-1">
                      {efficiencyMetrics.averageRating}/5
                    </ThemedText>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <ThemedText>Response time:</ThemedText>
                  <ThemedText className="font-bold text-lg">
                    {efficiencyMetrics.responseTime} min
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <ThemedText>Miles per pickup:</ThemedText>
                  <ThemedText className="font-bold text-lg">
                    {efficiencyMetrics.milesPerPickup} mi
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <ThemedText>Fuel efficiency:</ThemedText>
                  <ThemedText className="font-bold text-lg text-success">
                    {efficiencyMetrics.fuelEfficiency} MPG
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Achievements */}
            <ThemedCard className="p-4 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="trophy" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold text-lg ml-2">
                  🏆 ACHIEVEMENTS UNLOCKED
                </ThemedText>
              </View>
              
              <View className="flex-row flex-wrap gap-3">
                {achievements.map((achievement) => (
                  <View 
                    key={achievement.id}
                    className={`flex-row items-center p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder opacity-50'
                    }`}
                  >
                    <Ionicons 
                      name={achievement.icon} 
                      size={20} 
                      color={achievement.unlocked ? "#10b981" : "#6b7280"} 
                    />
                    <View className="ml-2">
                      <ThemedText className={`font-semibold text-sm ${
                        achievement.unlocked ? 'text-success' : 'text-secondary'
                      }`}>
                        {achievement.title}
                      </ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {achievement.description}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
              
              <View className="flex-row justify-between mt-4">
                <ThemedText variant="caption" className="text-secondary">
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </ThemedText>
                <TouchableOpacity onPress={handleViewRewards}>
                  <ThemedText className="text-burgundy font-semibold text-sm">
                    View Rewards
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedCard>

            {/* Action Buttons */}
            <View className="grid grid-cols-2 gap-3 mb-6">
              <TouchableOpacity
                onPress={handleViewTrends}
                className="flex-1 bg-secondary/20 border border-secondary rounded-lg p-4 items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="trending-up" size={24} color="#bd8c5e" />
                <ThemedText className="text-secondary font-semibold mt-2">
                  Trends
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSetGoals}
                className="flex-1 bg-burgundy/20 border border-burgundy rounded-lg p-4 items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="flag" size={24} color={BrandColors.burgundy} />
                <ThemedText className="text-burgundy font-semibold mt-2">
                  Set Goals
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleExportData}
                className="flex-1 bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4 items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="download" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                <ThemedText className="font-semibold mt-2">
                  Export Data
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleViewRewards}
                className="flex-1 bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg p-4 items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="gift" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                <ThemedText className="font-semibold mt-2">
                  Rewards
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}