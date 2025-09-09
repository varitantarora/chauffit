import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { EarningsCard, EarningsSummaryCard, WeeklyProgressCard } from '../../../components/driver/earnings/EarningsCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useEarningsStore } from '../../../store/earningsStore';

export default function EarningsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { 
    earnings, 
    dailyBreakdown, 
    activeIncentives,
    getWeeklyEarnings,
    getMonthlyEarnings,
    getAveragePerRide,
    getAveragePerHour
  } = useEarningsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call to refresh earnings data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title" className="text-2xl font-bold">
              Earnings
            </ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Track your income and performance
            </ThemedText>
          </View>
          
          {/* Earnings Summary */}
          <View className="px-6 mb-6">
            <EarningsSummaryCard />
          </View>

          {/* Period Selector */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className={`flex-1 py-3 rounded-lg ${
                    selectedPeriod === period ? 'bg-burgundy' : ''
                  }`}
                >
                  <ThemedText 
                    className={`text-center capitalize ${
                      selectedPeriod === period ? 'text-white font-semibold' : ''
                    }`}
                  >
                    {period}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Weekly Progress */}
          {selectedPeriod === 'weekly' && (
            <View className="px-6 mb-6">
              <WeeklyProgressCard />
            </View>
          )}

          {/* Quick Stats */}
          <View className="px-6 mb-6">
            <View className="flex-row flex-wrap -mx-2">
              <View className="w-1/2 px-2 mb-4">
                <EarningsCard
                  title="Today's Earnings"
                  amount={earnings.todayEarnings}
                  icon="today"
                  iconColor="#10b981"
                  showTrend
                  trendValue={12}
                  trendDirection="up"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <EarningsCard
                  title="Pending Amount"
                  amount={earnings.pendingAmount}
                  subtitle="Ready for payout"
                  icon="time"
                  iconColor="#f59e0b"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <EarningsCard
                  title="Avg per Ride"
                  amount={Math.round(getAveragePerRide())}
                  icon="car"
                  iconColor="#3b82f6"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <EarningsCard
                  title="Avg per Hour"
                  amount={Math.round(getAveragePerHour())}
                  icon="speedometer"
                  iconColor="#8b5cf6"
                />
              </View>
            </View>
          </View>
          
          {/* Recent Earnings Breakdown */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg font-bold">
                Recent Breakdown
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-burgundy">View All</ThemedText>
              </TouchableOpacity>
            </View>
            
            {dailyBreakdown.slice(0, 5).map((day, index) => (
              <ThemedCard key={index} className="mb-3 p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <View>
                    <ThemedText className="font-semibold">
                      {day.date.toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {day.totalRides} rides • {day.onlineHours}h online
                    </ThemedText>
                  </View>
                  <View className="items-end">
                    <ThemedText className="font-bold text-burgundy text-lg">
                      ₹{day.totalEarnings.toLocaleString('en-IN')}
                    </ThemedText>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <ThemedText variant="caption" className="ml-1">
                        {day.averageRating.toFixed(1)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                
                {/* Earnings breakdown */}
                <View className="flex-row justify-between text-xs">
                  <ThemedText variant="caption" className="text-secondary">
                    Base: ₹{day.baseFare.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-secondary">
                    Tips: ₹{day.tips.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-secondary">
                    Bonus: ₹{day.incentives.toLocaleString('en-IN')}
                  </ThemedText>
                </View>
              </ThemedCard>
            ))}
          </View>

          {/* Active Incentives */}
          {activeIncentives.length > 0 && (
            <View className="px-6 mb-6">
              <ThemedText variant="title" className="text-lg font-bold mb-4">
                Active Incentives
              </ThemedText>
              
              {activeIncentives.map((incentive) => (
                <ThemedCard key={incentive.id} className="mb-3 p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <ThemedText className="font-bold">{incentive.title}</ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {incentive.description}
                      </ThemedText>
                    </View>
                    <View className="bg-success/10 px-2 py-1 rounded">
                      <ThemedText variant="caption" className="text-success font-bold">
                        +₹{incentive.reward}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View className="bg-surface dark:bg-darkSurface rounded-full h-2 mb-2">
                    <View 
                      className="bg-burgundy rounded-full h-2"
                      style={{ 
                        width: `${Math.min((incentive.current / incentive.target) * 100, 100)}%` 
                      }}
                    />
                  </View>
                  
                  <View className="flex-row justify-between">
                    <ThemedText variant="caption">
                      {incentive.current} / {incentive.target} {incentive.type}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {Math.round((incentive.current / incentive.target) * 100)}% complete
                    </ThemedText>
                  </View>
                </ThemedCard>
              ))}
            </View>
          )}
          
          {/* Performance Metrics */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg font-bold mb-4">
              Performance Metrics
            </ThemedText>
            <ThemedCard className="p-4">
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Average Rating</ThemedText>
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
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Weekly Online Hours</ThemedText>
                </View>
                <ThemedText className="font-semibold">42h / 50h</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="#bd8c5e" />
                  <ThemedText className="ml-2">Total Rides</ThemedText>
                </View>
                <ThemedText className="font-semibold">1,247</ThemedText>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}