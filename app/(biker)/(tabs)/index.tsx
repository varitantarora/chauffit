import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { useConfigStore } from '../../../store/configStore';
import { TaskCard } from '../../../components/biker/task/TaskCard';
import { ResponseTimer } from '../../../components/biker/emergency/ResponseTimer';
import { IncentiveTracker } from '../../../components/biker/earnings/IncentiveTracker';
import { BikerTask, TaskPriority, TaskType } from '../../../types/navigation';
import { router } from 'expo-router';
import BikerApiService from '../../../services/api/BikerApiService';
import BikerTaskApiService, { BikerTaskDetail } from '../../../services/api/BikerTaskApiService';
import { useI18nStore } from '../../../store/i18nStore';
import { BrandColors } from '../../../constants/Colors';

export default function BikerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const t = useI18nStore((state) => state.t);
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);

  // Task store state
  const availableTasks = useTaskStore((state) => state.availableTasks);
  const acceptedTasks = useTaskStore((state) => state.acceptedTasks);
  const activeTasks = useTaskStore((state) => state.activeTasks);
  const emergencyAlerts = useTaskStore((state) => state.emergencyAlerts);
  const priorityFilter = useTaskStore((state) => state.priorityFilter);
  const typeFilter = useTaskStore((state) => state.typeFilter);
  const sortBy = useTaskStore((state) => state.sortBy);
  const getFilteredTasks = useTaskStore((state) => state.getFilteredTasks);
  const getPriorityTasks = useTaskStore((state) => state.getPriorityTasks);
  const acceptTask = useTaskStore((state) => state.acceptTask);
  const setPriorityFilter = useTaskStore((state) => state.setPriorityFilter);
  const setTypeFilter = useTaskStore((state) => state.setTypeFilter);
  const setSortBy = useTaskStore((state) => state.setSortBy);
  const setAvailableTasks = useTaskStore((state) => state.setAvailableTasks);
  const setEmergencyAlerts = useTaskStore((state) => state.setEmergencyAlerts);

  // Auth store state (biker online status)
  const isOnline = useAuthStore((state) => state.bikerIsOnline);
  const setIsOnline = useAuthStore((state) => state.setBikerIsOnline);

  // Earnings store state
  const currentShift = useBikerEarningsStore((state) => state.currentShift);
  const earnings = useBikerEarningsStore((state) => state.earnings);
  const activeIncentives = useBikerEarningsStore((state) => state.activeIncentives);
  const startShift = useBikerEarningsStore((state) => state.startShift);
  const endShift = useBikerEarningsStore((state) => state.endShift);
  const getTodayEarnings = useBikerEarningsStore((state) => state.getTodayEarnings);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'emergency' | 'urgent'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [requestedTasks, setRequestedTasks] = useState<BikerTaskDetail[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [stats, setStats] = useState<{
    averageRating: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [todayEarningsValue, setTodayEarningsValue] = useState<number>(0);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const fetchRequestedTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await BikerTaskApiService.getPendingTasks();

      if (response.success && response.data) {
        const tasks = response.data || [];
        setRequestedTasks(tasks);

        // Convert API tasks to BikerTask format for TaskCard component
        const convertedTasks: BikerTask[] = tasks.map((task) => ({
          id: task.id,
          type: 'driver_pickup' as TaskType,
          priority: task.priority === 'urgent' ? 'emergency' : task.priority === 'high' ? 'high' : 'normal' as TaskPriority,
          title: `Driver Pickup ${task.task_reference}`,
          description: task.special_instructions || `Pick up driver ${task.driver_name || task.driver_details?.name || 'Driver'}`,
          driverId: task.driver,
          driverName: task.driver_name || task.driver_details?.name || 'Driver',
          driverPhone: task.driver_phone || task.driver_details?.mobile || '',
          pickupLocation: {
            latitude: parseFloat(task.pickup_location_lat),
            longitude: parseFloat(task.pickup_location_long),
            address: task.pickup_address,
          },
          dropoffLocation: {
            latitude: parseFloat(task.dropoff_location_lat),
            longitude: parseFloat(task.dropoff_location_long),
            address: task.dropoff_address,
          },
          estimatedDistance: task.estimated_distance_km ? parseFloat(task.estimated_distance_km) : 0,
          estimatedDuration: task.estimated_duration_minutes || 0,
          fare: parseFloat(task.biker_earnings),
          specialInstructions: task.special_instructions || undefined,
          status: 'pending',
          createdAt: new Date(task.created_at),
          expiresAt: task.assigned_at ? new Date(new Date(task.assigned_at).getTime() + 30 * 60 * 1000) : new Date(Date.now() + 30 * 60 * 1000),
          responseTimeLimit: 15,
        }));

        setAvailableTasks(convertedTasks);
      } else {
        console.error('Failed to fetch requested tasks:', response.error);
        setRequestedTasks([]);
        setAvailableTasks([]);
      }
    } catch (error) {
      console.error('Error fetching requested tasks:', error);
      setRequestedTasks([]);
      setAvailableTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchRequestedTasks();
    } else {
      setAvailableTasks([]);
      setRequestedTasks([]);
    }
  }, [isOnline]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await BikerApiService.getStats();

      if (response.success && response.data) {
        const statsData = response.data as any;
        const lifetime = statsData.lifetime || statsData;

        setStats({
          averageRating: lifetime.average_rating || 0,
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

  const fetchEarnings = async () => {
    try {
      setLoadingEarnings(true);
      const response = await BikerApiService.getEarnings();

      if (response.success && response.data) {
        const earningsData = response.data as any;
        setTodayEarningsValue(earningsData.today_earnings ?? 0);
      } else {
        console.error('Failed to fetch earnings:', response.error);
        setTodayEarningsValue(0);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setTodayEarningsValue(0);
    } finally {
      setLoadingEarnings(false);
    }
  };

  useEffect(() => {
    // Clear any existing emergency alerts to avoid duplicates
    setEmergencyAlerts([]);

    // Initialize online status from API
    const initializeOnlineStatus = async () => {
      try {
        const response = await BikerApiService.getProfile();
        if (response.success && response.data) {
          setIsOnline(response.data.is_online);
        }
      } catch (error) {
        console.error('Error fetching online status:', error);
      }
    };

    initializeOnlineStatus();
    fetchStats();
    fetchEarnings();
    // TODO: fetchConfigs() disabled - backend /meta/configs/ returns 404
    // fetchConfigs();
  }, []);

  const handleToggleOnline = async (value: boolean) => {
    try {
      if (value && !currentShift) {
        // Going online - start shift
        // Call API to update status to online
        const response = await BikerApiService.updateStatus({
          is_online: true,
        });

        if (response.success) {
          setIsOnline(true);
          startShift();
        } else {
          Alert.alert('Error', response.error || 'Failed to go online. Please try again.');
          setIsOnline(false); // Revert toggle on error
        }
      } else if (!value && currentShift) {
        // Going offline - end shift

        Alert.alert(
          'End Shift',
          'Are you sure you want to go offline and end your current shift?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              // Toggle already reverted, no action needed
            },
            {
              text: 'End Shift',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Call API to update status to offline
                  const response = await BikerApiService.updateStatus({
                    is_online: false,
                  });

                  if (response.success) {
                    endShift();
                    setIsOnline(false); // Set offline when ending shift
                  } else {
                    Alert.alert('Error', response.error || 'Failed to go offline. Please try again.');
                    setIsOnline(true); // Revert toggle on error
                  }
                } catch (error) {
                  console.error('Error ending shift:', error);
                  Alert.alert('Error', 'Failed to go offline. Please try again.');
                  setIsOnline(true); // Revert toggle on error
                }
              }
            }
          ]
        );
      } else {
        // Just update toggle state if no shift change
        const response = await BikerApiService.updateStatus({
          is_online: value,
        });

        if (response.success) {
          setIsOnline(value);
        } else {
          Alert.alert('Error', response.error || 'Failed to update status. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      // Revert toggle state
      setIsOnline(!value);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    const task = availableTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await BikerTaskApiService.acceptTask(taskId);
      if (response.success && response.data) {
        // Update local store
        acceptTask(taskId);

        Alert.alert(
          'Task Accepted!',
          `You've accepted "${task.title}". Navigate to task details to continue.`,
          [
            { text: 'OK', onPress: () => router.push(`/(biker)/task/${taskId}`) }
          ]
        );

        // Refresh available tasks
        fetchRequestedTasks();
      } else {
        Alert.alert('Error', response.error || 'Failed to accept task. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      Alert.alert('Error', 'Failed to accept task. Please try again.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const promises = [
      fetchStats(),
      fetchEarnings(),
    ];
    if (isOnline) {
      promises.push(fetchRequestedTasks());
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [isOnline]);

  const priorityTasks = getPriorityTasks();

  const getFilteredAndSortedTasks = () => {
    let tasks = availableTasks;

    // If showing 'all' and there are priority tasks, exclude them from the main list to avoid duplication
    if (selectedFilter === 'all' && priorityTasks.length > 0) {
      const priorityTaskIds = priorityTasks.map(t => t.id);
      tasks = tasks.filter(t => !priorityTaskIds.includes(t.id));
    } else if (selectedFilter === 'emergency') {
      tasks = tasks.filter(t => t.priority === 'emergency');
    } else if (selectedFilter === 'urgent') {
      tasks = tasks.filter(t => t.priority === 'urgent');
    }

    return tasks.sort((a, b) => {
      // Emergency tasks first
      if (a.priority === 'emergency' && b.priority !== 'emergency') return -1;
      if (b.priority === 'emergency' && a.priority !== 'emergency') return 1;

      // Then by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const filteredTasks = getFilteredAndSortedTasks();
  // Use today's earnings from API (fetched via fetchEarnings)
  const todayEarnings = todayEarningsValue;

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
                <ThemedText variant="title">
                  {t('hello')}, {user?.name || 'Biker'}
                </ThemedText>
                <ThemedText variant="secondary" className="mt-1">
                  {isOnline ? t('readyForPickups') : t('youAreOffline')}
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText variant="caption" className="mt-1 text-textSecondary dark:text-darkTextSecondary">
                  {currentShift ? t('onShift') : t('offShift')}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Large Bold Online/Offline Toggle */}
          <View className="px-6 mb-4">
            <TouchableOpacity
              onPress={() => handleToggleOnline(!isOnline)}
              activeOpacity={0.85}
              style={{
                backgroundColor: isOnline ? BrandColors.success : BrandColors.danger,
                paddingVertical: 20,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isOnline ? BrandColors.success : BrandColors.danger,
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

          {/* Emergency Alert */}
          {emergencyAlerts.length > 0 && (
            <View className="px-6 mb-4">
              <ThemedCard className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <View className="flex-row items-center">
                  <View className="bg-danger p-2 rounded-full mr-3">
                    <Ionicons name="warning" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-danger">PICKUP EMERGENCY</ThemedText>
                    <ThemedText className="text-danger text-sm">
                      {emergencyAlerts.length} driver{emergencyAlerts.length > 1 ? 's' : ''} need{emergencyAlerts.length === 1 ? 's' : ''} immediate pickup
                    </ThemedText>
                  </View>
                  <TouchableOpacity className="bg-danger px-4 py-2 rounded-lg">
                    <ThemedText className="text-white font-semibold text-sm">RESPOND</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Quick Stats — expanded with Total Earnings & Completed Trips */}
          <View className="px-6 mb-6">
            <ThemedCard>
              <View className="flex-row flex-wrap justify-around py-2">
                <View className="items-center w-1/3 mb-2">
                  <ThemedText variant="title" className="text-2xl">
                    {acceptedTasks.length + activeTasks.length}
                  </ThemedText>
                  <ThemedText variant="caption">{t('activePickups')}</ThemedText>
                </View>
                <View className="items-center w-1/3 mb-2">
                  <ThemedText variant="title" className="text-2xl">
                    {loadingEarnings ? '...' : `₹${todayEarnings.toFixed(0)}`}
                  </ThemedText>
                  <ThemedText variant="caption">{t('todaysEarnings')}</ThemedText>
                </View>
                <View className="items-center w-1/3 mb-2">
                  <ThemedText variant="title" className="text-2xl">
                    {loadingStats ? '...' : (stats?.averageRating ? stats.averageRating.toFixed(1) : 'N/A')}
                  </ThemedText>
                  <ThemedText variant="caption">{t('rating')}</ThemedText>
                </View>
                <View className="items-center w-1/2">
                  <ThemedText variant="title" className="text-2xl text-success">
                    {loadingEarnings ? '...' : `₹${(todayEarningsValue ?? 0).toFixed(0)}`}
                  </ThemedText>
                  <ThemedText variant="caption">{t('totalEarnings')}</ThemedText>
                </View>
                <View className="items-center w-1/2">
                  <ThemedText variant="title" className="text-2xl">
                    {loadingStats ? '...' : ((stats as any)?.totalTrips ?? 0)}
                  </ThemedText>
                  <ThemedText variant="caption">{t('completedTrips')}</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Active Incentives */}
          {activeIncentives.length > 0 && (
            <View className="px-6 mb-6">
              <IncentiveTracker incentives={activeIncentives} compact={true} />
            </View>
          )}

          {/* Task Filters */}
          <View className="px-6 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <ThemedText variant="title" className="text-lg">
                {t('driverPickups')} ({filteredTasks.length})
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className="bg-secondary/10 p-2 rounded-lg"
              >
                <Ionicons name="filter" size={16} color={BrandColors.secondary} />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View className="flex-row space-x-2 mb-4">
                {(['all', 'emergency', 'urgent'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    className={`px-3 py-2 rounded-full ${selectedFilter === filter
                      ? 'bg-burgundy'
                      : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                  >
                    <ThemedText className={`text-sm font-semibold ${selectedFilter === filter
                      ? 'text-white'
                      : 'text-textSecondary dark:text-darkTextSecondary'
                      }`}>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {loadingTasks && (
            <View className="px-6 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">
                  Loading driver pickups...
                </ThemedText>
              </ThemedCard>
            </View>
          )}

          {/* Emergency Tasks First */}
          {priorityTasks.length > 0 && selectedFilter === 'all' && (
            <View className="px-6 mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={20} color={BrandColors.danger} />
                <ThemedText className="font-bold text-danger ml-2">
                  Priority Tasks - Respond Quickly!
                </ThemedText>
              </View>
              {priorityTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAccept={() => handleAcceptTask(task.id)}
                  showActions={isOnline}
                />
              ))}
            </View>
          )}

          {/* Available Tasks */}
          <View className="px-6 mb-6">
            {filteredTasks.length > 0 ? (
              <>
                {selectedFilter !== 'all' && (
                  <ThemedText className="font-bold text-lg mb-4">
                    {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Tasks
                  </ThemedText>
                )}
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={() => handleAcceptTask(task.id)}
                    showActions={isOnline}
                    compact={selectedFilter === 'all' && task.priority !== 'emergency'}
                  />
                ))}
              </>
            ) : (
              <ThemedCard className="p-6">
                <View className="items-center">
                  <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                    <Ionicons name="bicycle" size={32} color="#6B7280" />
                  </View>
                  <ThemedText className="font-semibold text-center">
                    {isOnline ? t('noDriverPickups') : t('goOnlineToSee')}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-center mt-1">
                    {isOnline
                      ? t('newPickupsWillAppear')
                      : t('turnOnAvailability')
                    }
                  </ThemedText>
                </View>
              </ThemedCard>
            )}
          </View>

          {/* Current Tasks */}
          {(acceptedTasks.length > 0 || activeTasks.length > 0) && (
            <View className="px-6 mb-6">
              <ThemedText variant="title" className="text-lg mb-4">
                {t('yourActiveTasks')}
              </ThemedText>

              {acceptedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showActions={false}
                  compact={true}
                />
              ))}

              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showActions={false}
                  compact={true}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
