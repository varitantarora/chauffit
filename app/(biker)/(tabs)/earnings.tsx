import React, { useState, useEffect } from 'react';
import { ScrollView, View, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { IncentiveTracker } from '../../../components/biker/earnings/IncentiveTracker';
import BikerApiService from '../../../services/api/BikerApiService';

const toAmount = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export default function BikerEarningsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';
  
  // Earnings store
  const earnings = useBikerEarningsStore((state) => state.earnings);
  const currentShift = useBikerEarningsStore((state) => state.currentShift);
  const activeIncentives = useBikerEarningsStore((state) => state.activeIncentives);
  const completedIncentives = useBikerEarningsStore((state) => state.completedIncentives);
  const performanceMetrics = useBikerEarningsStore((state) => state.performanceMetrics);
  const setEarnings = useBikerEarningsStore((state) => state.setEarnings);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalPickups: number;
    completionRate: number;
    distanceCovered: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState<Array<{
    date: string;
    pickups: number;
    earnings: number;
  }>>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [bonuses, setBonuses] = useState<Array<{
    title: string;
    description: string;
    amount: number;
  }>>([]);
  const [loadingBonuses, setLoadingBonuses] = useState(false);

  // Use earnings directly from store (populated from API)
  const todayEarnings = earnings.todayEarnings ?? 0;
  const weekEarnings = earnings.weeklyEarnings ?? 0;
  const monthEarnings = earnings.monthlyEarnings ?? 0;
  const totalEarnings = earnings.totalEarnings ?? 0;

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await BikerApiService.getEarnings();
      
      if (response.success && response.data) {
        // API returns earnings data in snake_case format
        const earningsData = response.data as any;
        
        // Map API response (snake_case) to store format (camelCase)
        const mappedEarnings = {
          totalEarnings: toAmount(earningsData.total_earnings),
          weeklyEarnings: toAmount(earningsData.week_earnings),
          monthlyEarnings: toAmount(earningsData.month_earnings),
          todayEarnings: toAmount(earningsData.today_earnings),
          pendingAmount: toAmount(earningsData.pending_amount),
          baseTaskEarnings: toAmount(earningsData.base_task_earnings),
          emergencyBonuses: toAmount(earningsData.emergency_bonuses),
          peakTimeBonuses: toAmount(earningsData.peak_time_bonuses),
          distanceBonuses: toAmount(earningsData.distance_bonuses),
          incentives: toAmount(earningsData.incentives),
          lastPayout: earningsData.last_payout ? new Date(earningsData.last_payout) : undefined,
        };
        console.log('Mapped earnings:', mappedEarnings);
        
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
      const response = await BikerApiService.getStats();
      
      if (response.success && response.data) {
        const statsData = response.data as any;
        const lifetime = statsData.lifetime || statsData;
        const today = statsData.today || {};
        const week = statsData.week || {};
        const month = statsData.month || {};
        
        setStats({
          averageRating: lifetime.average_rating || 0,
          totalPickups: lifetime.pickups || 0,
          completionRate: lifetime.completion_rate || 0,
          distanceCovered: lifetime.distance_covered_km || 0,
        });

        // Fallback: if earnings summary endpoint is still zero but stats has completed pickup earnings,
        // use stats-derived values to keep earnings UI accurate.
        const currentEarnings = useBikerEarningsStore.getState().earnings;
        const fallbackFromStats: Partial<typeof currentEarnings> = {};
        const lifetimeEarned = toAmount(lifetime.earned);
        const todayEarned = toAmount(today.earned);
        const weekEarned = toAmount(week.earned);
        const monthEarned = toAmount(month.earned);

        if (currentEarnings.totalEarnings <= 0 && lifetimeEarned > 0) {
          fallbackFromStats.totalEarnings = lifetimeEarned;
        }
        if (currentEarnings.todayEarnings <= 0 && todayEarned > 0) {
          fallbackFromStats.todayEarnings = todayEarned;
        }
        if (currentEarnings.weeklyEarnings <= 0 && weekEarned > 0) {
          fallbackFromStats.weeklyEarnings = weekEarned;
        }
        if (currentEarnings.monthlyEarnings <= 0 && monthEarned > 0) {
          fallbackFromStats.monthlyEarnings = monthEarned;
        }

        if (Object.keys(fallbackFromStats).length > 0) {
          setEarnings(fallbackFromStats);
        }

        console.log('Stats fetched:', statsData);
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
      const response = await BikerApiService.getDailyEarnings();
      
      if (response.success && response.data) {
        const dailyData = response.data as any[];
        // Map API response to component format
        const mappedDaily = dailyData.map((item: any) => ({
          date: item.date || item.created_at || '',
          pickups: item.pickups || item.pickups_completed || 0,
          earnings: parseFloat(item.earnings || item.total_earnings || '0'),
        }));
        setDailyEarnings(mappedDaily);
        console.log('Daily earnings fetched:', mappedDaily);
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
      const response = await BikerApiService.getBonuses();
      
      if (response.success && response.data) {
        const bonusesData = response.data as any[];
        // Map API response to component format
        const mappedBonuses = bonusesData.map((item: any) => ({
          title: item.title || item.name || item.bonus_type || 'Bonus',
          description: item.description || `Bonus earned on ${item.earned_at || item.date || item.created_at || 'recent date'}`,
          amount: parseFloat(item.amount || item.reward || item.bonus_amount || '0'),
        }));
        setBonuses(mappedBonuses);
        console.log('Bonuses fetched:', mappedBonuses);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEarnings(), fetchStats(), fetchDailyEarnings(), fetchBonuses()]);
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#BD8C5E" />
            <ThemedText className="mt-4">Loading earnings...</ThemedText>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#BD8C5E"
              />
            }
          >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title">Earnings</ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Driver pickup & transport income
            </ThemedText>
          </View>
          
          {/* Current Shift */}
          {/* {currentShift && (
            <View className="px-6 mb-6">
              <ThemedCard className="p-4 bg-blue-50 dark:bg-blue-900/20">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-blue-500 p-2 rounded-full mr-3">
                      <Ionicons name="time" size={20} color="white" />
                    </View>
                    <View>
                      <ThemedText className="font-bold text-blue-700 dark:text-blue-300">
                        Current Shift Active
                      </ThemedText>
                      <ThemedText variant="caption" className="text-blue-600 dark:text-blue-400">
                        Started at {new Date(currentShift.startTime).toLocaleTimeString('en-IN')}
                      </ThemedText>
                    </View>
                  </View>
                  <View className="items-end">
                    <ThemedText className="font-bold text-blue-700 dark:text-blue-300">
                      ₹{currentShift.earnings}
                    </ThemedText>
                    <ThemedText variant="caption" className="text-blue-600 dark:text-blue-400">
                      This shift
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>
          )} */}

          {/* Earnings Summary */}
          <View className="px-6 mb-6">
            <ThemedCard className="p-6">
              <ThemedText variant="secondary" className="mb-2">Total Earnings</ThemedText>
              <ThemedText variant="title" className="text-3xl mb-4">₹{totalEarnings}</ThemedText>
              <View className="flex-row justify-between">
                <View>
                  <ThemedText variant="caption">Today</ThemedText>
                  <ThemedText className="font-semibold">₹{todayEarnings}</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">This Week</ThemedText>
                  <ThemedText className="font-semibold">₹{weekEarnings}</ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption">Pending</ThemedText>
                  <ThemedText className="font-semibold">₹{earnings.pendingAmount ?? 0}</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Incentives Section */}
          <View className="px-6 mb-6">
            <IncentiveTracker 
              incentives={[...activeIncentives, ...completedIncentives.slice(0, 3)]} 
              showCompleted={true}
            />
          </View>
          
          {/* Daily Breakdown */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Daily Breakdown
            </ThemedText>
            
            {loadingDaily ? (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ActivityIndicator size="small" color="#BD8C5E" />
                  <ThemedText variant="caption" className="mt-2 text-textSecondary">
                    Loading daily breakdown...
                  </ThemedText>
                </View>
              </ThemedCard>
            ) : dailyEarnings.length > 0 ? (
              dailyEarnings.map((day, index) => {
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
                          {day.pickups} pickup{day.pickups !== 1 ? 's' : ''} completed
                        </ThemedText>
                      </View>
                      <ThemedText className={`font-bold text-lg ${isToday ? 'text-primary' : ''}`}>
                        ₹{day.earnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </ThemedText>
                    </View>
                  </ThemedCard>
                );
              })
            ) : (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ThemedText className="text-center text-textSecondary">
                    No daily earnings data available
                  </ThemedText>
                </View>
              </ThemedCard>
            )}
          </View>
          
          {/* Performance Metrics */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Performance Stats
            </ThemedText>
            <ThemedCard>
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
                      <ThemedText className="ml-2">Customer Rating</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5.0` : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="bicycle" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Total Pickups</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.totalPickups > 0 ? stats.totalPickups.toLocaleString('en-IN') : 'N/A'}
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
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={20} color="#bd8c5e" />
                      <ThemedText className="ml-2">Distance Covered</ThemedText>
                    </View>
                    <ThemedText className="font-semibold">
                      {stats.distanceCovered > 0 ? `${stats.distanceCovered.toFixed(1)} km` : 'N/A'}
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
          
          {/* Bonus & Incentives */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Bonuses & Incentives
            </ThemedText>
            {loadingBonuses ? (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ActivityIndicator size="small" color="#BD8C5E" />
                  <ThemedText variant="caption" className="mt-2 text-textSecondary">
                    Loading bonuses...
                  </ThemedText>
                </View>
              </ThemedCard>
            ) : bonuses.length > 0 ? (
              <ThemedCard>
                {bonuses.map((bonus, index) => (
                  <View 
                    key={index}
                    className={index > 0 ? 'border-t border-border dark:border-darkBorder pt-3 mt-3' : 'mb-3'}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <ThemedText>{bonus.title}</ThemedText>
                      <ThemedText className="font-semibold text-green-600">
                        +₹{bonus.amount.toFixed(2)}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption">{bonus.description}</ThemedText>
                  </View>
                ))}
              </ThemedCard>
            ) : (
              <ThemedCard className="p-4">
                <View className="items-center py-2">
                  <ThemedText className="text-center text-textSecondary">
                    No bonuses or incentives available
                  </ThemedText>
                </View>
              </ThemedCard>
            )}
          </View>
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
