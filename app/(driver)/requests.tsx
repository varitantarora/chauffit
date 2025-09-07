import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { JobCard } from '../../components/driver/job/JobCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useJobStore } from '../../store/jobStore';

export default function RideRequestsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { pendingRequests, activeJob, acceptJob, declineJob } = useJobStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleAcceptJob = (jobId: string) => {
    router.push({
      pathname: '/(driver)/job/accept',
      params: { jobId }
    });
  };

  const handleDeclineJob = (jobId: string) => {
    declineJob(jobId);
  };

  const handleViewJobDetails = (jobId: string) => {
    router.push({
      pathname: '/(driver)/job/accept',
      params: { jobId }
    });
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
              {pendingRequests.length} pending requests
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
                      <ThemedText variant="caption" className="text-success">
                        {activeJob.customerName} • {activeJob.status}
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
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setActiveTab('pending')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'pending' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'pending' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Pending ({pendingRequests.length})
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('accepted')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'accepted' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'accepted' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Accepted ({activeJob ? 1 : 0})
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Requests List */}
          <View className="px-6">
            {activeTab === 'pending' ? (
              <>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <JobCard
                      key={request.id}
                      job={request}
                      onAccept={handleAcceptJob}
                      onDecline={handleDeclineJob}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))
                ) : (
                  <ThemedCard className="p-8 items-center">
                    <Ionicons name="car" size={48} color="#bd8c5e" />
                    <ThemedText variant="title" className="mt-4 mb-2">
                      No Pending Requests
                    </ThemedText>
                    <ThemedText variant="secondary" className="text-center">
                      New ride requests will appear here. Make sure you're online to receive requests.
                    </ThemedText>
                  </ThemedCard>
                )}
              </>
            ) : (
              <>
                {activeJob ? (
                  <ThemedCard className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <ThemedText className="font-bold text-lg">
                          {activeJob.customerName}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-success capitalize">
                          {activeJob.status.replace('_', ' ')}
                        </ThemedText>
                      </View>
                      <ThemedText className="text-primary font-bold text-xl">
                        ₹{activeJob.fare.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                    
                    <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
                      <View className="flex-row items-start mb-2">
                        <Ionicons name="location" size={16} color="#10b981" />
                        <View className="ml-2 flex-1">
                          <ThemedText variant="caption">PICKUP</ThemedText>
                          <ThemedText>{activeJob.pickupLocation.address}</ThemedText>
                        </View>
                      </View>
                      {activeJob.dropoffLocation && (
                        <View className="flex-row items-start">
                          <Ionicons name="flag" size={16} color="#ef4444" />
                          <View className="ml-2 flex-1">
                            <ThemedText variant="caption">DROPOFF</ThemedText>
                            <ThemedText>{activeJob.dropoffLocation.address}</ThemedText>
                          </View>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => {
                        if (activeJob.status === 'accepted') {
                          router.push(`/(driver)/job/navigation?jobId=${activeJob.id}`);
                        } else {
                          router.push(`/(driver)/job/active?jobId=${activeJob.id}`);
                        }
                      }}
                      className="bg-primary py-3 rounded-lg"
                    >
                      <ThemedText className="text-center text-white font-semibold">
                        {activeJob.status === 'accepted' ? 'Start Navigation' : 'View Ride'}
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedCard>
                ) : (
                  <ThemedCard className="p-8 items-center">
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                    <ThemedText variant="title" className="mt-4 mb-2">
                      No Accepted Rides
                    </ThemedText>
                    <ThemedText variant="secondary" className="text-center">
                      Rides you accept will appear here.
                    </ThemedText>
                  </ThemedCard>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}