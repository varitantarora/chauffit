import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, View, Alert } from 'react-native';
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

export default function DriverProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const { isOnline, setOnlineStatus, jobHistory, resetDemoRequests } = useJobStore();
  const { earnings } = useEarningsStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'stats'>('profile');

  // Driver stats
  const driverStats = {
    totalRides: jobHistory.length,
    rating: jobHistory.length > 0 
      ? jobHistory.reduce((sum, job) => sum + (job.customerRating || 0), 0) / jobHistory.length
      : 4.9,
    totalEarnings: earnings.totalEarnings,
    joinDate: new Date('2024-01-15'), // Mock join date
    completionRate: 96.5,
    onlineHours: 450 // Mock total hours
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };


  const handleGoOnline = () => {
    if (!isOnline) {
      Alert.alert(
        'Go Online?',
        'You will start receiving ride requests when you go online.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Online', onPress: () => setOnlineStatus(true) }
        ]
      );
    } else {
      setOnlineStatus(false);
    }
  };

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
                    {user?.name?.charAt(0).toUpperCase()}
                  </ThemedText>
                  {isOnline && (
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white" />
                  )}
                </View>
                <ThemedText variant="title" className="text-xl font-bold">
                  {user?.name}
                </ThemedText>
                <ThemedText variant="secondary">{user?.email}</ThemedText>
                {user?.phone && (
                  <ThemedText variant="secondary">{user.phone}</ThemedText>
                )}
                
                <View className="flex-row items-center mt-3 bg-success/10 px-3 py-2 rounded-full">
                  <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                  <ThemedText className="text-success font-semibold ml-2">
                    Verified Driver
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
                      {Math.round(driverStats.completionRate)}%
                    </ThemedText>
                    <ThemedText variant="caption">Complete</ThemedText>
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
                  className={`px-4 py-2 rounded-lg ${
                    isOnline ? 'bg-danger/10 border border-danger/20' : 'bg-success/10 border border-success/20'
                  }`}
                >
                  <ThemedText className={`font-semibold ${isOnline ? 'text-danger' : 'text-success'}`}>
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </ThemedText>
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
                        {driverStats.joinDate.toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Total Earnings:</ThemedText>
                      <ThemedText className="font-semibold text-burgundy">
                        ₹{driverStats.totalEarnings.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Online Hours:</ThemedText>
                      <ThemedText className="font-semibold">
                        {driverStats.onlineHours}h
                      </ThemedText>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <ThemedText>Completion Rate:</ThemedText>
                      <ThemedText className="font-semibold text-success">
                        {driverStats.completionRate.toFixed(1)}%
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