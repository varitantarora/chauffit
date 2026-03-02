import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { EarningsSummaryCard } from '../../../components/driver/earnings/EarningsCard';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';
import { useEarningsStore } from '../../../store/earningsStore';
import { useRouter } from 'expo-router';
import DriverApiService, { DriverStats } from '../../../services/api/DriverApiService';
import { useI18nStore } from '../../../store/i18nStore';

export default function DriverHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const t = useI18nStore((state) => state.t);
  const router = useRouter();

  const {
    isOnline,
    setOnlineStatus,
    pendingRequests,
    activeJob,
    jobHistory,
    getPendingCount,
    fetchPendingRequests,
  } = useJobStore();

  const { earnings, getTodayHistory, setEarnings, fetchEarnings, fetchDailyEarnings, weeklyTarget } = useEarningsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [todayEarningsValue, setTodayEarningsValue] = useState<number>(0);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await DriverApiService.getStats();

      if (response.success && response.data) {
        setStats(response.data);
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

  const fetchEarningsData = async () => {
    await Promise.all([fetchEarnings(), fetchDailyEarnings()]);
  };

  useEffect(() => {
    fetchStats();
    fetchEarningsData();
    fetchPendingRequestsFromAPI();
  }, []);

  // Fetch pending requests from API
  const fetchPendingRequestsFromAPI = async () => {
    await fetchPendingRequests();
    setPendingCount(getPendingCount());
  };

  // Get today's stats
  const todayHistory = getTodayHistory();
  const todayStats = {
    earnings: todayEarningsValue || earnings.todayEarnings || 0,
    trips: todayHistory?.totalRides || 0,
    hours: todayHistory?.onlineHours || 0,
    rating: stats?.lifetime?.average_rating || stats?.today?.average_rating || todayHistory?.averageRating || 0
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchEarningsData(),
      fetchPendingRequestsFromAPI()
    ]);
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Weekly goals - using real data from API
  const weeklyGoals = [
    {
      title: t('weeklyEarnings'),
      current: earnings.weeklyEarnings || 0,
      target: weeklyTarget || 67000,
      unit: '₹'
    },
    {
      title: t('totalTrips'),
      current: stats?.week?.trips || stats?.today?.trips || 0,
      target: 80,
      unit: ''
    },
    {
      title: t('onlineHours'),
      current: 0, // TODO: Add online hours tracking from API
      target: 50,
      unit: 'h'
    },
    {
      title: t('drivingScore'),
      current: stats?.week?.average_rating || stats?.lifetime?.average_rating || 0,
      target: 4.8,
      unit: '/5'
    }
  ];

  const quickActions = [
    {
      title: t('viewRequests'),
      icon: 'car',
      color: '#10b981',
      action: () => router.push('/(driver)/(tabs)/requests')
    },
    {
      title: t('earnings'),
      icon: 'cash',
      color: '#3b82f6',
      action: () => router.push('/(driver)/(tabs)/earnings')
    },
    {
      title: t('vehicle'),
      icon: 'car-sport',
      color: '#f59e0b',
      action: () => console.log('Vehicle details')
    },
    {
      title: t('navigation'),
      icon: 'navigate',
      color: '#8b5cf6',
      action: () => console.log('Open navigation')
    }
  ];

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
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText variant="title" className="text-2xl font-bold">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Driver'}
                </ThemedText>
                <ThemedText variant="secondary" className="mt-1">
                  {isOnline ? t('youAreOnline') : t('youAreOffline')}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/profile')}>
                <View className="w-12 h-12 bg-burgundy rounded-full items-center justify-center">
                  <ThemedText className="text-white text-xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Job Alert */}
          {activeJob && (
            <View className="px-6 mb-4">
              <TouchableOpacity
                onPress={() => {
                  if (activeJob.status === 'accepted') {
                    router.push(`/(driver)/job/navigation?jobId=${activeJob.id}`);
                  } else {
                    router.push(`/(driver)/job/active?jobId=${activeJob.id}`);
                  }
                }}
                activeOpacity={1}
              >
                <ThemedCard className="p-4 border-2 border-success">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-success rounded-full mr-3" />
                    <View className="flex-1">
                      <ThemedText className="font-bold text-lg">{t('activeRide')}</ThemedText>
                      <ThemedText variant="secondary">
                        {activeJob.customerName} • {activeJob.status.replace('_', ' ')}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="font-bold text-burgundy text-xl">
                        ₹{activeJob.fare.toLocaleString('en-IN')}
                      </ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {t('tapToManage')}
                      </ThemedText>
                    </View>
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending Requests Alert */}
          {pendingCount > 0 && !activeJob && (
            <View className="px-6 mb-4">
              <TouchableOpacity
                onPress={() => router.push('/(driver)/(tabs)/requests')}
                activeOpacity={1}
              >
                <ThemedCard className="p-4 border-2 border-warning">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 bg-warning rounded-full mr-3" />
                      <View>
                        <ThemedText className="font-bold text-lg">
                          {pendingCount} New Request{pendingCount > 1 ? 's' : ''}
                        </ThemedText>
                        <ThemedText variant="secondary">
                          {t('tapToViewRides')}
                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            </View>
          )}

          {/* Large Bold Online/Offline Toggle */}
          <View className="px-6 mb-4">
            <TouchableOpacity
              onPress={() => setOnlineStatus(!isOnline)}
              activeOpacity={0.85}
              style={{
                backgroundColor: isOnline ? '#10B981' : '#EF4444',
                paddingVertical: 20,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isOnline ? '#10B981' : '#EF4444',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <ThemedText style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 }}>
                {isOnline ? `● ${t('online').toUpperCase()}` : `○ ${t('offline').toUpperCase()}`}
              </ThemedText>
              <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
                {isOnline ? t('tapToGoOffline') : t('tapToGoOnline')}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Payout Section */}
          <View className="px-6 mb-4">
            <ThemedCard className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <ThemedText variant="caption" className="text-textSecondary">{t('availableBalance')}</ThemedText>
                  <ThemedText variant="title" className="text-2xl font-bold text-success">
                    ₹{(earnings?.totalEarnings ?? 0).toLocaleString('en-IN')}
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText variant="caption" className="text-textSecondary">{t('lastPayout')}</ThemedText>
                  <ThemedText variant="body" className="font-semibold text-burgundy">{t('processed')}</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Earnings Summary */}
          <View className="px-6 mb-4">
            <EarningsSummaryCard onViewDetails={() => router.push('/(driver)/(tabs)/earnings')} />
          </View>

          {/* Performance Dashboard */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg font-bold mb-4">
              {t('todaysPerformance')}
            </ThemedText>
            <ThemedCard className="p-6">
              <View className="flex-row justify-around items-center">
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold text-burgundy">
                    ₹{todayStats.earnings.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption">{t('earnings')}</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold">
                    {todayStats.trips}
                  </ThemedText>
                  <ThemedText variant="caption">{t('trips')}</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold">
                    {todayStats.hours}h
                  </ThemedText>
                  <ThemedText variant="caption">Online</ThemedText>
                </View>
                {/* Driving Score - Circular UI */}
                <View className="items-center">
                  <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width={56} height={56} style={{ position: 'absolute' }}>
                      {/* Background circle */}
                      <Circle
                        cx={28}
                        cy={28}
                        r={24}
                        stroke={isDarkMode ? '#4A4A4A' : '#E5E5E5'}
                        strokeWidth={4}
                        fill="none"
                      />
                      {/* Progress circle */}
                      <Circle
                        cx={28}
                        cy={28}
                        r={24}
                        stroke={todayStats.rating >= 4.5 ? '#10B981' : todayStats.rating >= 3.5 ? '#F59E0B' : '#EF4444'}
                        strokeWidth={4}
                        fill="none"
                        strokeDasharray={`${(todayStats.rating / 5) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        transform="rotate(-90 28 28)"
                      />
                    </Svg>
                    <ThemedText style={{ fontSize: 14, fontWeight: '800' }}>
                      {todayStats.rating.toFixed(1)}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" style={{ marginTop: 2 }}>{t('drivingScore')}</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              {t('quickActions')}
            </ThemedText>
            <View className="flex-row flex-wrap">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.action}
                  className="w-[48%] mb-3"
                  style={{ marginRight: index % 2 === 0 ? 8 : 0 }}
                >
                  <ThemedCard className="items-center py-4">
                    <View
                      className="p-3 rounded-full mb-2"
                      style={{ backgroundColor: action.color + '20' }}
                    >
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <ThemedText variant="caption" className="text-center">
                      {action.title}
                    </ThemedText>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Goals */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg">
                {t('weeklyGoals')}
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-secondary">{t('viewAll')}</ThemedText>
              </TouchableOpacity>
            </View>

            {weeklyGoals.slice(0, 2).map((goal, index) => (
              <ThemedCard key={index} className="mb-3 p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <ThemedText className="font-semibold">{goal.title}</ThemedText>
                  <ThemedText className="font-bold">
                    {goal.unit === '₹' ? '₹' : ''}{goal.current.toLocaleString('en-IN')}{goal.unit === '₹' ? '' : goal.unit}
                    <ThemedText variant="secondary"> / {goal.unit === '₹' ? '₹' : ''}{goal.target.toLocaleString('en-IN')}{goal.unit === '₹' ? '' : goal.unit}</ThemedText>
                  </ThemedText>
                </View>
                <View className="bg-surface dark:bg-darkSurface rounded-full h-2">
                  <View
                    className="bg-burgundy rounded-full h-2"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <ThemedText variant="caption">
                    {Math.round((goal.current / goal.target) * 100)}% {t('complete')}
                  </ThemedText>
                  <ThemedText variant="caption">
                    {goal.target - goal.current > 0
                      ? `${goal.unit === '₹' ? '₹' : ''}${(goal.target - goal.current).toLocaleString('en-IN')}${goal.unit === '₹' ? '' : goal.unit} ${t('toGo')}`
                      : t('goalAchieved')
                    }
                  </ThemedText>
                </View>
              </ThemedCard>
            ))}
          </View>

          {/* Recent Activity */}
          <View className="px-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg font-bold">
                {t('recentActivity')}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(driver)/(tabs)/earnings')}>
                <ThemedText className="text-burgundy">{t('viewAll')}</ThemedText>
              </TouchableOpacity>
            </View>

            {jobHistory.length > 0 ? (
              jobHistory.slice(0, 3).map((job) => (
                <ThemedCard key={job.id} className="mb-3 p-4">
                  <View className="flex-row items-center">
                    <View className="bg-success/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">{job.customerName}</ThemedText>
                      <ThemedText variant="caption">
                        Completed • {new Date(job.date).toLocaleString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </ThemedText>
                      <ThemedText variant="caption">
                        {job.pickupLocation.name || job.pickupLocation.address} to {job.dropoffLocation?.name || job.dropoffLocation?.address || 'Destination'}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="font-bold text-burgundy">
                        ₹{((job.fare || 0) + (job.tips || 0)).toLocaleString('en-IN')}
                      </ThemedText>
                      {job.rating && (
                        <View className="flex-row items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= job.rating! ? "star" : "star-outline"}
                              size={12}
                              color="#fbbf24"
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </ThemedCard>
              ))
            ) : (
              <ThemedCard className="p-8 items-center">
                <Ionicons name="time" size={48} color="#bd8c5e" />
                <ThemedText variant="title" className="mt-4 mb-2">
                  {t('noRecentActivity')}
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  {t('completeFirstRide')}
                </ThemedText>
              </ThemedCard>
            )}

            {!isOnline && (
              <View className="mt-6 p-4 bg-secondary/10 border border-secondary rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#720c17" />
                  <ThemedText className="ml-2 font-semibold text-secondary">
                    You're currently offline
                  </ThemedText>
                </View>
                <ThemedText variant="secondary" className="mt-1">
                  Turn on your online status to start receiving ride requests and earning money.
                </ThemedText>
              </View>
            )}
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}