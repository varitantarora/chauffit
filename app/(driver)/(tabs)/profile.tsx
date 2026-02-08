import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { DocumentsList } from '../../../components/driver/profile/DocumentUpload';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';
import { useEarningsStore } from '../../../store/earningsStore';
import { useRouter } from 'expo-router';
import DriverApiService, { DriverProfile as DriverProfileType } from '../../../services/api/DriverApiService';

export default function DriverProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const { isOnline, setOnlineStatus, jobHistory, resetDemoRequests } = useJobStore();
  const { earnings } = useEarningsStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'stats'>('profile');
  const [driverProfile, setDriverProfile] = useState<DriverProfileType | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch driver profile, documents on mount
  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileResponse = await DriverApiService.getProfile();
      
      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        setDriverProfile(profile);
        // Sync online status with store
        if (profile.is_online !== isOnline) {
          setOnlineStatus(profile.is_online);
        }
        
        // If profile has ID, fetch detailed profile with documents
        if (profile.id) {
          const detailedResponse = await DriverApiService.getProfileById(profile.id);
          if (detailedResponse.success && detailedResponse.data) {
            const detailed = detailedResponse.data as any;
            if (detailed.documents) setDocuments(detailed.documents);
          }
        }
      } else {
        console.warn('Failed to load driver profile:', profileResponse.error);
      }
      
      // Also try fetching documents separately as fallback
      const documentsResponse = await DriverApiService.getDocuments();
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoOnline = async () => {
    if (updatingStatus) return;

    try {
      setUpdatingStatus(true);
      
      const newStatus = !isOnline;
      
      // Optimistic update
      setOnlineStatus(newStatus);
      
      const response = await DriverApiService.updateStatus({
        is_online: newStatus,
        // You can add current location here if available
      });

      if (!response.success) {
        // Revert on error
        setOnlineStatus(!newStatus);
        Alert.alert(
          'Error',
          response.error || 'Failed to update online status. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        // Update local profile state
        if (driverProfile) {
          setDriverProfile({
            ...driverProfile,
            is_online: newStatus,
          });
        }
      }
    } catch (error) {
      // Revert on error
      setOnlineStatus(!isOnline);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  // Driver stats from profile - no mock data
  const driverStats = {
    totalRides: driverProfile?.total_trips ?? 0,
    rating: driverProfile?.average_rating ?? 0,
    totalEarnings: earnings.totalEarnings ?? 0,
    joinDate: driverProfile?.created_at ? new Date(driverProfile.created_at) : undefined,
    // completionRate and onlineHours not available in API - will show N/A
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#BD8C5E" />
          <ThemedText className="mt-4">Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title" className="text-2xl font-bold text-center">
              Driver Profile
            </ThemedText>
          </View>

          {/* Profile Card */}
          <View className="px-6 mb-6">
            <ThemedCard className="p-6">
              <View className="items-center mb-6">
                <View className="w-24 h-24 bg-burgundy rounded-full items-center justify-center mb-4 relative">
                  <ThemedText className="text-white text-3xl font-bold">
                    {/* {driverProfile?.full_name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()} */}
                  </ThemedText>
                  
                  {isOnline && (
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white" />
                  )}
                </View>
                <ThemedText variant="title" className="text-xl font-bold">
                  {driverProfile?.full_name || user?.name}
                </ThemedText>
                <ThemedText variant="secondary">{driverProfile?.email || user?.email}</ThemedText>
                {driverProfile?.phone_number && (
                  <ThemedText variant="secondary">{driverProfile.phone_number}</ThemedText>
                )}
                
                <View className="flex-row items-center mt-3 bg-success/10 px-3 py-2 rounded-full">
                  <Ionicons 
                    name={driverProfile?.is_verified ? "shield-checkmark" : "shield-outline"} 
                    size={16} 
                    color={driverProfile?.is_verified ? "#10b981" : "#6b7280"} 
                  />
                  <ThemedText className={`font-semibold ml-2 ${driverProfile?.is_verified ? 'text-success' : 'text-secondary'}`}>
                    {driverProfile?.is_verified ? 'Verified Driver' : 'Pending Verification'}
                  </ThemedText>
                </View>
              </View>
              
              {/* Driver Stats */}
              <View className="border-t border-border dark:border-darkBorder pt-4">
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <ThemedText className="text-2xl font-bold text-burgundy">
                      {driverStats.rating.toFixed(1)}
                    </ThemedText>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <ThemedText variant="caption" className="ml-1">Rating</ThemedText>
                    </View>
                  </View>
                  <View className="items-center">
                    <ThemedText className="text-2xl font-bold">
                      {driverStats.totalRides}
                    </ThemedText>
                    <ThemedText variant="caption">Rides</ThemedText>
                  </View>
                  <View className="items-center">
                    <ThemedText className="text-2xl font-bold">
                      ₹{Math.round(driverStats.totalEarnings / 1000)}k
                    </ThemedText>
                    <ThemedText variant="caption">Earnings</ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Online Status */}
          <View className="px-6 mb-6">
            <ThemedCard className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-4 h-4 rounded-full mr-3 ${isOnline ? 'bg-success' : 'bg-gray-400'}`} />
                  <View>
                    <ThemedText className="font-bold">
                      {isOnline ? 'Online' : 'Offline'}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {isOnline ? 'Available for rides' : 'Not receiving requests'}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleGoOnline}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-lg ${
                    isOnline ? 'bg-danger/10 border border-danger/20' : 'bg-success/10 border border-success/20'
                  } ${updatingStatus ? 'opacity-50' : ''}`}
                >
                  {updatingStatus ? (
                    <ActivityIndicator size="small" color={isOnline ? "#ef4444" : "#10b981"} />
                  ) : (
                    <ThemedText className={`font-semibold ${isOnline ? 'text-danger' : 'text-success'}`}>
                      {isOnline ? 'Go Offline' : 'Go Online'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </ThemedCard>
          </View>

          {/* Tab Navigation */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'documents', label: 'Documents' },
                { key: 'stats', label: 'Stats' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 rounded-lg ${
                    activeTab === tab.key ? 'bg-burgundy' : ''
                  }`}
                >
                  <ThemedText 
                    className={`text-center ${
                      activeTab === tab.key ? 'text-white font-semibold' : ''
                    }`}
                  >
                    {tab.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Content */}
          <View className="px-6">
            {activeTab === 'profile' && (
              <View>
                {/* Account Settings */}
                <View className="mb-6">
                  <TouchableOpacity
                    onPress={toggleTheme}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="moon" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">Dark Mode</ThemedText>
                    </View>
                    <View className={`w-12 h-6 rounded-full ${isDarkMode ? 'bg-burgundy' : 'bg-gray-300'} justify-center`}>
                      <View className={`w-5 h-5 bg-white rounded-full ${isDarkMode ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/banking-details')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="card" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">Banking Details</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/notifications')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="notifications" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">Notifications</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/support')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="help-circle" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">Help & Support</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      resetDemoRequests();
                      router.push('/(driver)/(tabs)/requests');
                    }}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="refresh" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">Reset Demo Requests</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'documents' && (
              <View>
                <DocumentsList />
              </View>
            )}

            {activeTab === 'stats' && (
              <View>
                {/* Detailed Stats */}
                <ThemedCard className="p-4 mb-4">
                  <ThemedText variant="title" className="font-bold mb-4">
                    Career Statistics
                  </ThemedText>
                  
                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <ThemedText>Member Since:</ThemedText>
                      <ThemedText className="font-semibold">
                        {driverStats.joinDate 
                          ? driverStats.joinDate.toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Total Earnings:</ThemedText>
                      <ThemedText className="font-semibold text-burgundy">
                        ₹{driverStats.totalEarnings.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Total Rides:</ThemedText>
                      <ThemedText className="font-semibold">
                        {driverStats.totalRides}
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Average Rating:</ThemedText>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <ThemedText className="font-semibold ml-1">
                          {driverStats.rating.toFixed(2)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </ThemedCard>

                {/* Recent Reviews */}
                <ThemedCard className="p-4 mb-4">
                  <ThemedText variant="title" className="font-bold mb-4">
                    Recent Reviews
                  </ThemedText>
                  
                  {jobHistory.filter(job => job.customerComment).slice(0, 3).map((job) => (
                    <View key={job.id} className="mb-4 last:mb-0">
                      <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 bg-secondary/20 rounded-full items-center justify-center mr-3">
                          <ThemedText className="font-bold text-secondary text-xs">
                            {job.customerName.charAt(0)}
                          </ThemedText>
                        </View>
                        <View className="flex-1">
                          <ThemedText className="font-semibold">{job.customerName}</ThemedText>
                          <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons 
                                key={star} 
                                name={star <= (job.customerRating || 0) ? "star" : "star-outline"} 
                                size={12} 
                                color="#fbbf24" 
                              />
                            ))}
                            <ThemedText variant="caption" className="ml-2">
                              {new Date(job.date).toLocaleDateString('en-IN')}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      {job.customerComment && (
                        <ThemedText variant="caption" className="ml-11 text-secondary">
                          "{job.customerComment}"
                        </ThemedText>
                      )}
                    </View>
                  ))}
                  
                  {jobHistory.filter(job => job.customerComment).length === 0 && (
                    <ThemedText variant="secondary" className="text-center">
                      No reviews yet. Complete rides to receive customer feedback.
                    </ThemedText>
                  )}
                </ThemedCard>
              </View>
            )}
          </View>


          {/* Logout Button */}
          <View className="px-6 py-6">
            <PrimaryButton
              title="Logout"
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}