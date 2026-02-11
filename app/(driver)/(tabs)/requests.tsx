import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { JobCard } from '../../../components/driver/job/JobCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';

type TabType = 'pending' | 'accepted' | 'in-progress' | 'completed';

// Tab labels for display
const TAB_LABELS: Record<TabType, string> = {
  'pending': 'Pending',
  'accepted': 'Accepted',
  'in-progress': 'Active',
  'completed': 'Completed',
};

export default function RideRequestsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);

  const {
    pendingRequests,
    acceptedJobs,
    inProgressJobs,
    completedJobs,
    activeJob,
    loadingPending,
    loadingAccepted,
    loadingInProgress,
    loadingCompleted,
    fetchPendingRequests,
    fetchAcceptedJobs,
    fetchInProgressJobs,
    fetchCompletedJobs,
    fetchRideDetailsAndSync,
    acceptRideFromAPI,
    declineJob,
    getPendingCount,
    getAcceptedCount,
    getInProgressCount,
    getCompletedCount,
    lastAcceptError,
    lastApiError,
  } = useJobStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  // Check if current tab has an error
  const hasError = () => {
    return !!lastApiError;
  };

  const fetchTabData = async (tab: TabType) => {
    switch (tab) {
      case 'pending':
        await fetchPendingRequests();
        break;
      case 'accepted':
        await fetchAcceptedJobs();
        break;
      case 'in-progress':
        await fetchInProgressJobs();
        break;
      case 'completed':
        await fetchCompletedJobs();
        break;
    }
  };

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTabData(activeTab);
    setRefreshing(false);
  }, [activeTab]);

  const handleAcceptJob = async (jobId: string) => {
    setProcessing(jobId);
    try {
      const success = await acceptRideFromAPI(jobId);
      if (success) {
        // Navigate to job accept page
        router.push({
          pathname: '/(driver)/job/accept',
          params: { jobId }
        });
      } else {
        Alert.alert('Error', lastAcceptError || 'Failed to accept ride. Please try again.');
        await fetchTabData(activeTab);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineJob = (jobId: string) => {
    declineJob(jobId);
  };

  const handleViewJobDetails = async (jobId: string) => {
    setProcessing(jobId);
    try {
      await fetchRideDetailsAndSync(jobId);

      // For completed jobs, navigate to completed ride details page
      if (activeTab === 'completed') {
        router.push({
          pathname: '/(driver)/job/completed',
          params: { jobId }
        });
      } else if (activeTab === 'in-progress') {
        router.push({
          pathname: '/(driver)/job/active',
          params: { jobId }
        });
      } else {
        router.push({
          pathname: '/(driver)/job/accept',
          params: { jobId }
        });
      }
    } finally {
      setProcessing(null);
    }
  };

  const getTabCount = (tab: TabType): number => {
    switch (tab) {
      case 'pending':
        return getPendingCount();
      case 'accepted':
        return getAcceptedCount();
      case 'in-progress':
        return getInProgressCount();
      case 'completed':
        return getCompletedCount();
      default:
        return 0;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'pending':
        return loadingPending;
      case 'accepted':
        return loadingAccepted;
      case 'in-progress':
        return loadingInProgress;
      case 'completed':
        return loadingCompleted;
      default:
        return false;
    }
  };

  const getCurrentJobs = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRequests;
      case 'accepted':
        return acceptedJobs;
      case 'in-progress':
        return inProgressJobs;
      case 'completed':
        return completedJobs;
      default:
        return [];
    }
  };

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    const count = getTabCount(tab);

    return isActive ? (
      <View className="flex-1 py-3 rounded-lg bg-burgundy">
        <ThemedText className="text-center font-semibold text-white">
          {label} {count > 0 && `(${count})`}
        </ThemedText>
      </View>
    ) : (
      <TouchableOpacity
        onPress={() => setActiveTab(tab)}
        className="flex-1 py-3 rounded-lg"
      >
        <ThemedText className="text-center font-semibold text-textSecondary">
          {label} {count > 0 && `(${count})`}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'pending':
        return {
          icon: 'car',
          title: 'No Pending Requests',
          subtitle: 'New ride requests will appear here. Make sure you\'re online to receive requests.'
        };
      case 'accepted':
        return {
          icon: 'checkmark-circle',
          title: 'No Accepted Rides',
          subtitle: 'Rides you accept will appear here once you confirm them.'
        };
      case 'in-progress':
        return {
          icon: 'navigate',
          title: 'No Active Rides',
          subtitle: 'Your currently active rides will appear here.'
        };
      case 'completed':
        return {
          icon: 'ribbon',
          title: 'No Completed Rides',
          subtitle: 'Your completed ride history will appear here.'
        };
      default:
        return {
          icon: 'car',
          title: 'No Rides',
          subtitle: 'No rides found.'
        };
    }
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
            <ThemedText variant="title" className="text-2xl font-bold">
              Ride Requests
            </ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              {getPendingCount()} pending request{getPendingCount() !== 1 ? 's' : ''}
            </ThemedText>
          </View>

          {/* Active Job Alert */}
          {activeJob && (
            <View className="px-6 mb-4">
              <ThemedCard className="p-4 border border-success">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-3 h-3 bg-success rounded-full mr-3" />
                    <View>
                      <ThemedText className="font-bold">Active Ride</ThemedText>
                      <ThemedText variant="caption" className="text-success capitalize">
                        {activeJob.status.replace('_', ' ')}
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push(`/(driver)/job/active?jobId=${activeJob.id}`)}
                    className="bg-success px-4 py-2 rounded-lg"
                  >
                    <ThemedText className="text-white font-semibold">View</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Tabs */}
          <View className="px-6 mb-6">
            <View className={`flex-row bg-surface dark:bg-darkSurface rounded-xl p-1`}>
              {renderTabButton('pending', TAB_LABELS['pending'])}
              {renderTabButton('accepted', TAB_LABELS['accepted'])}
              {renderTabButton('in-progress', TAB_LABELS['in-progress'])}
              {renderTabButton('completed', TAB_LABELS['completed'])}
            </View>
          </View>

          {/* Requests List */}
          <View className="px-6">
            {isLoading() ? (
              <View className="items-center py-16">
                <Ionicons name="car" size={40} color={iconColor} />
                <ThemedText className="mt-4 text-textSecondary">Loading rides...</ThemedText>
              </View>
            ) : hasError() && getCurrentJobs().length === 0 ? (
              // Error State
              <ThemedCard className="p-8 items-center border border-danger/30">
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <ThemedText variant="title" className="mt-4 mb-2 text-danger">
                  Unable to Load Rides
                </ThemedText>
                <ThemedText variant="secondary" className="text-center text-textSecondary px-8 mb-4">
                  {lastApiError || 'An error occurred while fetching rides. Please try again.'}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => fetchTabData(activeTab)}
                  className="bg-burgundy px-6 py-3 rounded-xl"
                >
                  <ThemedText className="text-white font-semibold">Retry</ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            ) : getCurrentJobs().length > 0 ? (
              getCurrentJobs().map((request) => (
                <JobCard
                  key={request.id}
                  job={request}
                  onAccept={activeTab === 'pending' ? handleAcceptJob : undefined}
                  onDecline={activeTab === 'pending' ? handleDeclineJob : undefined}
                  onViewDetails={handleViewJobDetails}
                  processing={processing === request.id}
                />
              ))
            ) : (
              // Empty State
              <ThemedCard className="p-8 items-center">
                <Ionicons name={getEmptyStateMessage().icon as any} size={48} color="#bd8c5e" />
                <ThemedText variant="title" className="mt-4 mb-2">
                  {getEmptyStateMessage().title}
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  {getEmptyStateMessage().subtitle}
                </ThemedText>
              </ThemedCard>
            )}
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
