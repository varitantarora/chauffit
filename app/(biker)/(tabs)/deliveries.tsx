import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import BikerTaskApiService, { BikerTaskDetail } from '../../../services/api/BikerTaskApiService';

export default function DriverPickupsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [tasks, setTasks] = useState<BikerTaskDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const fetchTasks = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      
      const taskStatus = activeTab === 'active' ? 'active' : 'completed';
      const response = await BikerTaskApiService.getTasks({
        task_status: taskStatus,
      });

      if (response.success && response.data) {
        setTasks(response.data.results || []);
      } else {
        console.error('Failed to fetch tasks:', response.error);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks(true);
  }, [activeTab]);

  const formatTimeAgo = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      'requested': 'REQUESTED',
      'assigned': 'ASSIGNED',
      'accepted': 'ACCEPTED',
      'en_route_to_driver': 'EN ROUTE',
      'arrived_at_driver': 'ARRIVED',
      'driver_picked_up': 'PICKED UP',
      'en_route_to_customer': 'EN ROUTE',
      'arrived_at_customer': 'ARRIVED',
      'completed': 'COMPLETED',
      'cancelled_by_biker': 'CANCELLED',
      'cancelled_by_driver': 'CANCELLED',
      'cancelled_by_system': 'CANCELLED',
    };
    return statusMap[status] || status.toUpperCase();
  };

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
            <ThemedText variant="title">Driver Pickups</ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Manage your driver pickup tasks
            </ThemedText>
          </View>
          
          {/* Tabs */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setActiveTab('active')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'active' ? 'bg-burgundy' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'active' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Active
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('completed')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'completed' ? 'bg-burgundy' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'completed' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Completed
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Pickups List */}
          <View className="px-6">
            {loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#BD8C5E" />
                <ThemedText className="mt-4 text-textSecondary">Loading tasks...</ThemedText>
              </View>
            ) : tasks.length === 0 ? (
              <ThemedCard className="p-6">
                <View className="items-center">
                  <Ionicons name="car-sport-outline" size={48} color={iconColor} />
                  <ThemedText className="mt-4 font-semibold text-center">
                    No {activeTab === 'active' ? 'active' : 'completed'} pickups
                  </ThemedText>
                  <ThemedText variant="caption" className="mt-2 text-center">
                    {activeTab === 'active' 
                      ? 'You don\'t have any active pickup tasks at the moment'
                      : 'You haven\'t completed any pickup tasks yet'}
                  </ThemedText>
                </View>
              </ThemedCard>
            ) : (
              tasks.map((task) => (
                <ThemedCard key={task.id} className="mb-4">
                  {activeTab === 'active' ? (
                    <>
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="bg-secondary/10 px-3 py-1 rounded-full">
                          <ThemedText className="text-secondary text-xs font-semibold">
                            {getStatusDisplay(task.task_status)}
                          </ThemedText>
                        </View>
                        <ThemedText className="font-bold text-burgundy">
                          ₹{parseFloat(task.biker_earnings).toFixed(2)}
                        </ThemedText>
                      </View>
                      
                      <ThemedText className="font-bold text-lg mb-2">
                        Driver Pickup {task.task_reference}
                      </ThemedText>
                      
                      <View className="space-y-2 mb-3">
                        <View className="flex-row items-start">
                          <Ionicons name="location" size={16} color="#BD8C5E" />
                          <View className="ml-2 flex-1">
                            <ThemedText variant="caption">PICKUP LOCATION</ThemedText>
                            <ThemedText>{task.pickup_address}</ThemedText>
                          </View>
                        </View>
                        <View className="flex-row items-start">
                          <Ionicons name="navigate" size={16} color="#BD8C5E" />
                          <View className="ml-2 flex-1">
                            <ThemedText variant="caption">DESTINATION</ThemedText>
                            <ThemedText>{task.dropoff_address}</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <ThemedText variant="caption">Driver: {task.driver_name}</ThemedText>
                        <TouchableOpacity className="bg-burgundy px-4 py-2 rounded-lg">
                          <ThemedText className="text-white font-semibold">Navigate</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View className="flex-row items-center">
                      <View className="bg-success/10 p-2 rounded-full">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      </View>
                      <View className="ml-3 flex-1">
                        <ThemedText className="font-semibold">
                          Driver Pickup {task.task_reference}
                        </ThemedText>
                        <ThemedText variant="caption">
                          Completed {formatTimeAgo(task.completed_at)}
                        </ThemedText>
                        <ThemedText variant="caption">
                          {task.pickup_address} → {task.dropoff_address}
                        </ThemedText>
                      </View>
                      <ThemedText className="font-bold text-burgundy">
                        ₹{parseFloat(task.biker_earnings).toFixed(2)}
                      </ThemedText>
                    </View>
                  )}
                </ThemedCard>
              ))
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}