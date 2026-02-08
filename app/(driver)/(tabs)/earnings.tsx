import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { EarningsCard, EarningsSummaryCard, WeeklyProgressCard } from '../../../components/driver/earnings/EarningsCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useEarningsStore } from '../../../store/earningsStore';
import DriverApiService, { DriverStats, DriverDailyEarning, DriverBonus } from '../../../services/api/DriverApiService';
import { useEffect } from 'react';

export default function EarningsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { 
    earnings, 
    dailyBreakdown, 
    activeIncentives,
    getWeeklyEarnings,
    getMonthlyEarnings,
    getAveragePerRide, 
    getAveragePerHour,
    setEarnings
  } = useEarningsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [stats, setStats] = useState<{
    averageRating: number;
    totalRides: number;
    completionRate: number;
    distanceCovered: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState<DriverDailyEarning[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [bonuses, setBonuses] = useState<DriverBonus[]>([]);
  const [loadingBonuses, setLoadingBonuses] = useState(false);
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await DriverApiService.getEarnings();
      
      if (response.success && response.data) {
        // API returns earnings data in snake_case format
        const earningsData = response.data as any;
        
        // Map API response (snake_case) to store format (camelCase)
        const mappedEarnings = {
          totalEarnings: earningsData.total_earnings ?? earningsData.totalEarnings ?? 0,
          weeklyEarnings: earningsData.week_earnings ?? earningsData.weekly_earnings ?? earningsData.weeklyEarnings ?? 0,
          monthlyEarnings: earningsData.month_earnings ?? earningsData.monthly_earnings ?? earningsData.monthlyEarnings ?? 0,
          todayEarnings: earningsData.today_earnings ?? earningsData.todayEarnings ?? 0,
          pendingAmount: earningsData.pending_amount ?? earningsData.pendingAmount ?? 0,
          lastPayout: earningsData.last_payout ? new Date(earningsData.last_payout) : undefined,
        };
        
        // Update store with fetched earnings
        setEarnings(mappedEarnings);
        console.log('Earnings fetched and updated in store:', mappedEarnings);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch earnings');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch earnings');
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await DriverApiService.getStats();
      
      if (response.success && response.data) {
        const statsData = response.data as any;
        const lifetime = statsData.lifetime || statsData;
        
        setStats({
          averageRating: lifetime.average_rating || 0,
          totalRides: lifetime.pickups || 0,
          completionRate: lifetime.completion_rate || 0,
          distanceCovered: lifetime.distance_covered_km || 0,
        });
      } else {
        console.error('Failed to fetch stats:', response.error);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDailyEarnings = async () => {
    try {
      setLoadingDaily(true);
      const response = await DriverApiService.getDailyEarnings();
      
      if (response.success && response.data) {
        const dailyData = response.data as any[];
        // Map API response to component format
        const mappedDaily: DriverDailyEarning[] = dailyData.map((item: any) => ({
          date: item.date || item.created_at || '',
          trips: item.trips || item.trips_completed || 0,
          earnings: (item.earnings || item.total_earnings || '0').toString(),
        }));
        setDailyEarnings(mappedDaily);
      } else {
        console.error('Failed to fetch daily earnings:', response.error);
        setDailyEarnings([]);
      }
    } catch (error) {
      console.error('Error fetching daily earnings:', error);
      setDailyEarnings([]);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchBonuses = async () => {
    try {
      setLoadingBonuses(true);
      const response = await DriverApiService.getBonuses();
      
      if (response.success && response.data) {
        setBonuses(response.data);
      } else {
        console.error('Failed to fetch bonuses:', response.error);
        setBonuses([]);
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      setBonuses([]);
    } finally {
      setLoadingBonuses(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
    fetchStats();
    fetchDailyEarnings();
    fetchBonuses();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEarnings(), fetchStats(), fetchDailyEarnings(), fetchBonuses()]);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {loading && !refreshing && (
          <View className="absolute inset-0 items-center justify-center bg-black/10 z-10">
            <ActivityIndicator size="large" color="#BD8C5E" />
          </View>
        )}
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
          
          {/* Daily Breakdown */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg font-bold">
                Daily Breakdown
              </ThemedText>
            </View>
            
            {loadingDaily ? (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ActivityIndicator size="small" color="#BD8C5E" />
                  <ThemedText variant="caption" className="mt-2 text-secondary">
                    Loading daily breakdown...
                  </ThemedText>
                </View>
              </ThemedCard>
            ) : dailyEarnings.length > 0 ? (
              dailyEarnings.slice(0, 7).map((day, index) => {
                const date = new Date(day.date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
                
                let dateLabel = '';
                if (isToday) {
                  dateLabel = 'Today';
                } else if (isYesterday) {
                  dateLabel = 'Yesterday';
                } else {
                  dateLabel = date.toLocaleDateString('en-IN', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  });
                }
                
                return (
                  <ThemedCard key={index} className="mb-3">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <ThemedText className="font-semibold">{dateLabel}</ThemedText>
                        <ThemedText variant="caption">
                          {day.trips} trip{day.trips !== 1 ? 's' : ''} completed
                        </ThemedText>
                      </View>
                      <ThemedText className={`font-bold text-lg ${isToday ? 'text-burgundy' : ''}`}>
                        ₹{parseFloat(day.earnings).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </ThemedText>
                    </View>
                  </ThemedCard>
                );
              })
            ) : (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ThemedText className="text-center text-secondary">
                    No daily earnings data available
                  </ThemedText>
                </View>
              </ThemedCard>
            )}
          </View>

          {/* Bonuses & Incentives */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg font-bold mb-4">
              Bonuses & Incentives
            </ThemedText>
            
            {loadingBonuses ? (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ActivityIndicator size="small" color="#BD8C5E" />
                  <ThemedText variant="caption" className="mt-2 text-secondary">
                    Loading bonuses...
                  </ThemedText>
                </View>
              </ThemedCard>
            ) : bonuses.length > 0 ? (
              bonuses.map((bonus) => (
                <ThemedCard key={bonus.id} className="mb-3 p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <ThemedText className="font-bold">{bonus.title}</ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {bonus.description}
                      </ThemedText>
                      {bonus.earnedAt && (
                        <ThemedText variant="caption" className="text-secondary mt-1">
                          Earned: {new Date(bonus.earnedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </ThemedText>
                      )}
                    </View>
                    <View className="bg-success/10 px-2 py-1 rounded">
                      <ThemedText variant="caption" className="text-success font-bold">
                        +₹{bonus.amount.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                  </View>
                </ThemedCard>
              ))
            ) : (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ThemedText className="text-center text-secondary">
                    No bonuses or incentives available
                  </ThemedText>
                </View>
              </ThemedCard>
            )}
          </View>
          
          {/* Performance Metrics */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg font-bold mb-4">
              Performance Metrics
            </ThemedText>
            <ThemedCard className="p-4">
              {loadingStats ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#BD8C5E" />
                  <ThemedText variant="caption" className="mt-2 text-textSecondary">
                    Loading stats...
                  </ThemedText>
                </View>
              ) : stats ? (
                <>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Average Rating</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Completion Rate</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.completionRate > 0 ? `${stats.completionRate.toFixed(1)}%` : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Distance Covered</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.distanceCovered > 0 ? `${stats.distanceCovered.toFixed(1)} km` : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="car" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Total Rides</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.totalRides > 0 ? stats.totalRides.toLocaleString('en-IN') : 'N/A'}
                    </ThemedText>
                  </View>
                </>
              ) : (
                <View className="py-4">
                  <ThemedText className="text-center text-textSecondary">
                    No stats available
                  </ThemedText>
                </View>
              )}
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}