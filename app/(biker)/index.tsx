import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useBikerEarningsStore } from '../../store/bikerEarningsStore';
import { TaskCard } from '../../components/biker/task/TaskCard';
import { ResponseTimer } from '../../components/biker/emergency/ResponseTimer';
import { IncentiveTracker } from '../../components/biker/earnings/IncentiveTracker';
import { BikerTask, TaskPriority, TaskType } from '../../types/navigation';
import { router } from 'expo-router';

export default function BikerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
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
  
  // Earnings store state
  const currentShift = useBikerEarningsStore((state) => state.currentShift);
  const earnings = useBikerEarningsStore((state) => state.earnings);
  const activeIncentives = useBikerEarningsStore((state) => state.activeIncentives);
  const startShift = useBikerEarningsStore((state) => state.startShift);
  const endShift = useBikerEarningsStore((state) => state.endShift);
  const getTodayEarnings = useBikerEarningsStore((state) => state.getTodayEarnings);
  
  const [isOnline, setIsOnline] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'emergency' | 'urgent'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  useEffect(() => {
    // Load sample tasks for demo
    const sampleTasks: BikerTask[] = [
      {
        id: '1',
        type: 'customer_emergency',
        priority: 'emergency',
        title: 'Customer Stranded - Car Breakdown',
        description: 'Customer needs immediate pickup after car breakdown on highway',
        customerId: '123',
        customerName: 'Raj Kumar',
        customerPhone: '+91 98765 43210',
        pickupLocation: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Connaught Place, New Delhi'
        },
        dropoffLocation: {
          latitude: 28.5355,
          longitude: 77.3910,
          address: 'Noida Sector 18'
        },
        estimatedDistance: 25.5,
        estimatedDuration: 45,
        fare: 350,
        emergencyBonus: 150,
        specialInstructions: 'Customer is on busy highway. Use caution.',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        responseTimeLimit: 10
      },
      {
        id: '2',
        type: 'document_delivery',
        priority: 'urgent',
        title: 'Emergency Document Delivery',
        description: 'Deliver passport to customer urgently for flight',
        customerId: '124',
        customerName: 'Priya Singh',
        customerPhone: '+91 98765 43211',
        pickupLocation: {
          latitude: 28.7041,
          longitude: 77.1025,
          address: 'Karol Bagh, New Delhi'
        },
        dropoffLocation: {
          latitude: 28.5562,
          longitude: 77.1000,
          address: 'IGI Airport Terminal 3'
        },
        estimatedDistance: 18.2,
        estimatedDuration: 35,
        fare: 280,
        items: [
          {
            id: 'doc1',
            name: 'Passport',
            quantity: 1,
            description: 'Indian Passport',
            confidential: true
          }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        expiresAt: new Date(Date.now() + 25 * 60 * 1000)
      },
      {
        id: '3',
        type: 'regular_delivery',
        priority: 'high',
        title: 'Medicine Delivery',
        description: 'Urgent medicine delivery to elderly patient',
        customerId: '125',
        customerName: 'Dr. Mehta Clinic',
        customerPhone: '+91 98765 43212',
        pickupLocation: {
          latitude: 28.6304,
          longitude: 77.2177,
          address: 'Paharganj, New Delhi'
        },
        dropoffLocation: {
          latitude: 28.6508,
          longitude: 77.2311,
          address: 'Civil Lines, Delhi'
        },
        estimatedDistance: 8.5,
        estimatedDuration: 20,
        fare: 180,
        items: [
          {
            id: 'med1',
            name: 'Heart Medication',
            quantity: 2,
            description: 'Prescribed medicines',
            fragile: true
          }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    ];
    
    setAvailableTasks(sampleTasks);
  }, []);

  const handleToggleOnline = (value: boolean) => {
    setIsOnline(value);
    if (value && !currentShift) {
      startShift();
    } else if (!value && currentShift) {
      Alert.alert(
        'End Shift',
        'Are you sure you want to go offline and end your current shift?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'End Shift', 
            style: 'destructive',
            onPress: endShift 
          }
        ]
      );
    }
  };

  const handleAcceptTask = (taskId: string) => {
    acceptTask(taskId);
    const task = availableTasks.find(t => t.id === taskId);
    if (task) {
      Alert.alert(
        'Task Accepted!',
        `You've accepted "${task.title}". Navigate to task details to continue.`,
        [
          { text: 'OK', onPress: () => router.push(`/(biker)/task/${taskId}`) }
        ]
      );
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getFilteredAndSortedTasks = () => {
    let tasks = availableTasks;
    
    if (selectedFilter === 'emergency') {
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

  const priorityTasks = getPriorityTasks();
  const filteredTasks = getFilteredAndSortedTasks();
  const todayEarnings = getTodayEarnings();

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
                  Hello, {user?.name || 'Biker'}
                </ThemedText>
                <ThemedText variant="secondary" className="mt-1">
                  {isOnline ? 'Ready for emergency tasks' : 'You are offline'}
                </ThemedText>
              </View>
              <View className="items-end">
                <Switch
                  value={isOnline}
                  onValueChange={handleToggleOnline}
                  trackColor={{ false: '#767577', true: '#bd8c5e' }}
                  thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
                />
                <ThemedText variant="caption" className="mt-1 text-gray-500">
                  {currentShift ? 'On Shift' : 'Off Shift'}
                </ThemedText>
              </View>
            </View>
          </View>
          
          {/* Emergency Alert */}
          {emergencyAlerts.length > 0 && (
            <View className="px-6 mb-4">
              <ThemedCard className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <View className="flex-row items-center">
                  <View className="bg-red-500 p-2 rounded-full mr-3">
                    <Ionicons name="warning" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-red-600">EMERGENCY ALERT</ThemedText>
                    <ThemedText className="text-red-500 text-sm">
                      {emergencyAlerts.length} emergency request{emergencyAlerts.length > 1 ? 's' : ''} available
                    </ThemedText>
                  </View>
                  <TouchableOpacity className="bg-red-500 px-4 py-2 rounded-lg">
                    <ThemedText className="text-white font-semibold text-sm">RESPOND</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Quick Stats */}
          <View className="px-6 mb-6">
            <ThemedCard>
              <View className="flex-row justify-around py-2">
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">
                    {acceptedTasks.length + activeTasks.length}
                  </ThemedText>
                  <ThemedText variant="caption">Active Tasks</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">
                    ₹{todayEarnings}
                  </ThemedText>
                  <ThemedText variant="caption">Today's Earnings</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">4.8</ThemedText>
                  <ThemedText variant="caption">Rating</ThemedText>
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
                Available Tasks ({filteredTasks.length})
              </ThemedText>
              <TouchableOpacity 
                onPress={() => setShowFilters(!showFilters)}
                className="bg-primary/10 p-2 rounded-lg"
              >
                <Ionicons name="filter" size={16} color="#bd8c5e" />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View className="flex-row space-x-2 mb-4">
                {(['all', 'emergency', 'urgent'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    className={`px-3 py-2 rounded-full ${
                      selectedFilter === filter 
                        ? 'bg-primary' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <ThemedText className={`text-sm font-semibold ${
                      selectedFilter === filter 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Emergency Tasks First */}
          {priorityTasks.length > 0 && selectedFilter === 'all' && (
            <View className="px-6 mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={20} color="#ef4444" />
                <ThemedText className="font-bold text-red-600 ml-2">
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
                    <Ionicons name="bicycle" size={32} color="#6b7280" />
                  </View>
                  <ThemedText className="font-semibold text-center">
                    {isOnline ? 'No Tasks Available' : 'Go Online to See Tasks'}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-center mt-1">
                    {isOnline 
                      ? 'New emergency and delivery tasks will appear here' 
                      : 'Turn on your availability to start receiving tasks'
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
                Your Active Tasks
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