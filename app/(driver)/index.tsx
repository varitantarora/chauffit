import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Switch, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { EnhancedOnlineToggle } from '../../components/driver/status/OnlineToggle';
import { EarningsSummaryCard } from '../../components/driver/earnings/EarningsCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useJobStore } from '../../store/jobStore';
import { useEarningsStore } from '../../store/earningsStore';
import { useRouter } from 'expo-router';

export default function DriverHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const { 
    isOnline, 
    setOnlineStatus, 
    pendingRequests, 
    activeJob, 
    jobHistory 
  } = useJobStore();
  
  const { earnings, getTodayHistory } = useEarningsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Get today's stats
  const todayHistory = getTodayHistory();
  const todayStats = {
    earnings: earnings.todayEarnings,
    trips: todayHistory.length,
    hours: 8.5, // This could be calculated from job history
    rating: todayHistory.length > 0 
      ? todayHistory.reduce((sum, job) => sum + (job.rating || 0), 0) / todayHistory.length
      : 4.9
  };
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStats = {
    earnings: 15000,
    trips: 12,
    hours: 8.5,
    rating: 4.9
  };

  const weeklyGoals = [
    { title: 'Weekly Earnings', current: 62000, target: 67000, unit: '₹' },
    { title: 'Total Trips', current: 68, target: 80, unit: '' },
    { title: 'Online Hours', current: 42, target: 50, unit: 'h' },
    { title: 'Rating', current: 4.9, target: 4.8, unit: '/5' }
  ];

  const quickActions = [
    { 
      title: 'View Requests', 
      icon: 'car', 
      color: '#10b981',
      action: () => router.push('/(driver)/requests') 
    },
    { 
      title: 'Earnings', 
      icon: 'cash', 
      color: '#3b82f6',
      action: () => router.push('/(driver)/earnings') 
    },
    { 
      title: 'Vehicle', 
      icon: 'car-sport', 
      color: '#f59e0b',
      action: () => console.log('Vehicle details') 
    },
    { 
      title: 'Navigation', 
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
                  {isOnline ? 'You are online and available' : 'You are offline'}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => router.push('/(driver)/profile')}>
                <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
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
                activeOpacity={0.8}
              >
                <ThemedCard className="p-4 border-2 border-success">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-success rounded-full mr-3" />
                    <View className="flex-1">
                      <ThemedText className="font-bold text-lg">Active Ride</ThemedText>
                      <ThemedText variant="secondary">
                        {activeJob.customerName} • {activeJob.status.replace('_', ' ')}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="font-bold text-success text-xl">
                        ₹{activeJob.fare.toLocaleString('en-IN')}
                      </ThemedText>
                      <ThemedText variant="caption" className="text-success">
                        Tap to manage
                      </ThemedText>
                    </View>
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending Requests Alert */}
          {pendingRequests.length > 0 && !activeJob && (
            <View className="px-6 mb-4">
              <TouchableOpacity
                onPress={() => router.push('/(driver)/requests')}
                activeOpacity={0.8}
              >
                <ThemedCard className="p-4 border-2 border-warning">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 bg-warning rounded-full mr-3 animate-pulse" />
                      <View>
                        <ThemedText className="font-bold text-lg">
                          {pendingRequests.length} New Request{pendingRequests.length > 1 ? 's' : ''}
                        </ThemedText>
                        <ThemedText variant="secondary">
                          Tap to view and accept rides
                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            </View>
          )}

          {/* Online Status Toggle */}
          <View className="px-6 mb-4">
            <EnhancedOnlineToggle />
          </View>
          
          {/* Earnings Summary */}
          <View className="px-6 mb-4">
            <EarningsSummaryCard onViewDetails={() => router.push('/(driver)/earnings')} />
          </View>

          {/* Performance Dashboard */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg font-bold mb-4">
              Today's Performance
            </ThemedText>
            <ThemedCard className="p-6">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold text-primary">
                    ₹{todayStats.earnings.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption">Earnings</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold">
                    {todayStats.trips}
                  </ThemedText>
                  <ThemedText variant="caption">Trips</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold">
                    {todayStats.hours}h
                  </ThemedText>
                  <ThemedText variant="caption">Online</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl font-bold">
                    {todayStats.rating.toFixed(1)}
                  </ThemedText>
                  <ThemedText variant="caption">Rating</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>
          
          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Quick Actions
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
                Weekly Goals
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-secondary">View All</ThemedText>
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
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <ThemedText variant="caption">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </ThemedText>
                  <ThemedText variant="caption">
                    {goal.target - goal.current > 0 
                      ? `${goal.unit === '₹' ? '₹' : ''}${(goal.target - goal.current).toLocaleString('en-IN')}${goal.unit === '₹' ? '' : goal.unit} to go`
                      : 'Goal achieved!'
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
                Recent Activity
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(driver)/earnings')}>
                <ThemedText className="text-primary">View All</ThemedText>
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
                        {job.pickupLocation.name || job.pickupLocation.address} → {job.dropoffLocation?.name || job.dropoffLocation?.address || 'Destination'}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="font-bold text-primary">
                        ₹{(job.fare + job.tips).toLocaleString('en-IN')}
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
                  No Recent Activity
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  Complete your first ride to see activity here.
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