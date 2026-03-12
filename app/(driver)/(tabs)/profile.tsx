import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, ScrollView, View, Alert, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { DocumentsList } from '../../../components/driver/profile/DocumentUpload';
import { JobCard } from '../../../components/driver/job/JobCard';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';
import { useEarningsStore } from '../../../store/earningsStore';
import { useRouter, useFocusEffect } from 'expo-router';
import DriverApiService, { DriverProfile as DriverProfileType } from '../../../services/api/DriverApiService';
import { useI18nStore } from '../../../store/i18nStore';
import { appConfig } from '../../../config/env';

type RidesTabType = 'accepted' | 'in-progress' | 'completed';

export default function DriverProfile() {
  const user = useAuthStore((state) => state.user);
  const userCreatedAt = useAuthStore((state) => state.userCreatedAt);
  const userIsVerified = useAuthStore((state) => state.userIsVerified);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { language, setLanguage, t } = useI18nStore();
  const router = useRouter();

  const { isOnline, setOnlineStatus, jobHistory, resetDemoRequests,
    acceptedJobs, inProgressJobs, completedJobs,
    loadingAccepted, loadingInProgress, loadingCompleted,
    fetchAcceptedJobs, fetchInProgressJobs, fetchCompletedJobs,
    fetchRideDetailsAndSync } = useJobStore();
  const { earnings } = useEarningsStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'stats' | 'rides'>('profile');
  const [ridesTab, setRidesTab] = useState<RidesTabType>('accepted');
  const [driverProfile, setDriverProfile] = useState<DriverProfileType | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Helper to get full image URL (handles relative URLs from backend)
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch driver profile, documents on mount and focus
  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  // Fetch rides when rides tab is activated
  useEffect(() => {
    if (activeTab === 'rides') {
      switch (ridesTab) {
        case 'accepted':
          fetchAcceptedJobs();
          break;
        case 'in-progress':
          fetchInProgressJobs();
          break;
        case 'completed':
          fetchCompletedJobs();
          break;
      }
    }
  }, [activeTab, ridesTab, fetchAcceptedJobs, fetchInProgressJobs, fetchCompletedJobs]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDriverData();
    }, [fetchDriverData])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDriverData();
    setRefreshing(false);
  }, [fetchDriverData]);

  const handleViewRideDetails = React.useCallback(async (
    jobId: string,
    targetPath: '/(driver)/job/accept' | '/(driver)/job/active' | '/(driver)/job/completed'
  ) => {
    await fetchRideDetailsAndSync(jobId);
    router.push({
      pathname: targetPath,
      params: { jobId }
    });
  }, [fetchRideDetailsAndSync, router]);

  const fetchDriverData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch profile - but handle gracefully if it fails
      const profileResponse = await DriverApiService.getProfile();

      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        setDriverProfile(profile);
        // Sync online status with store
        if (profile.is_online !== undefined) {
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
        // Profile fetch failed - likely because driver profile doesn't exist yet
        console.warn('Failed to load driver profile:', profileResponse.error);
        // Don't show error to user, just use fallback to auth store data
      }

      // Also try fetching documents separately as fallback
      try {
        const documentsResponse = await DriverApiService.getDocuments();
        if (documentsResponse.success && documentsResponse.data) {
          setDocuments(documentsResponse.data);
        }
      } catch (error) {
        console.warn('Failed to fetch documents:', error);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoOnline = async () => {
    if (updatingStatus) return;

    try {
      setUpdatingStatus(true);

      const newStatus = !isOnline;

      // Optimistic update
      setOnlineStatus(newStatus);

      const response = await DriverApiService.updateStatus({
        is_online: newStatus,
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
      setOnlineStatus(!newStatus);
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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/phone-login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(driver)/edit-profile');
  };

  // Use actual API data, show N/A or empty when not available
  const displayName = driverProfile?.full_name || user?.name || 'N/A';
  const displayEmail = driverProfile?.email || user?.email || 'N/A';
  const displayPhone = driverProfile?.phone_number || user?.phone || 'N/A';
  const displayRating = driverProfile?.average_rating ?? 0;
  const displayCompletedTrips = driverProfile?.total_trips ?? 0;

  // Extract date from createdAt (which is a datetime string) and format for Member Since
  const displayMemberSince = driverProfile?.created_at || userCreatedAt
    ? (() => {
      const date = new Date(driverProfile?.created_at || userCreatedAt || '');
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    })()
    : 'N/A';

  // Driver stats from profile
  const driverStats = {
    totalRides: driverProfile?.total_trips ?? 0,
    rating: driverProfile?.average_rating ?? 0,
    totalEarnings: earnings.totalEarnings ?? 0,
    joinDate: driverProfile?.created_at ? new Date(driverProfile.created_at) : undefined,
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
        {/* Header */}
        <View
          style={{
            backgroundColor: '#720C17',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: '#720C17',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ThemedText style={{ color: '#ffffff', fontSize: 22, fontWeight: '800' }}>
            {t('driverProfile')}
          </ThemedText>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#BD8C5E']}
              tintColor="#BD8C5E"
            />
          }
        >
          {/* Profile Card */}
          <View className="p-6 mb-6">
            <ThemedCard className="p-6">
              <View className="items-center mb-6">
                {user?.avatar ? (
                  <Image
                    source={{ uri: getImageUrl(user.avatar) || undefined }}
                    className="w-24 h-24 rounded-full mb-4"
                    style={{ backgroundColor: '#BD8C5E' }}
                  />
                ) : (
                  <View className="w-24 h-24 bg-burgundy rounded-full items-center justify-center mb-4 relative">
                    <ThemedText className="text-white text-3xl font-bold">
                      {displayName !== 'N/A' ? displayName.charAt(0).toUpperCase() : '?'}
                    </ThemedText>
                  </View>
                )}

                {isOnline && (
                  <View className="absolute top-24 left-1/2 ml-12 w-6 h-6 bg-success rounded-full border-2 border-white" />
                )}
              </View>

              <View className="items-center mb-4">
                <ThemedText variant="title" className="text-xl font-bold">
                  {displayName}
                </ThemedText>
                <ThemedText variant="secondary">{displayEmail}</ThemedText>
                <ThemedText variant="secondary">{displayPhone}</ThemedText>

                <View className="flex-row items-center mt-3 bg-success/10 px-3 py-2 rounded-full">
                  <Ionicons
                    name={userIsVerified ? 'shield-checkmark' : 'shield-outline'}
                    size={16}
                    color={userIsVerified ? '#10b981' : '#6b7280'}
                  />
                  <ThemedText className={`font-semibold ml-2 ${userIsVerified ? 'text-success' : 'text-secondary'}`}>
                    {userIsVerified ? 'Verified Driver' : 'Pending Verification'}
                  </ThemedText>
                </View>
              </View>

              {/* Driver Stats */}
              <View className="border-t border-border dark:border-darkBorder pt-4">
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="star" size={16} color="#fbbf24" />
                      <ThemedText className="font-bold text-lg ml-1">
                        {displayRating > 0 ? displayRating.toFixed(1) : 'N/A'}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption">{t('drivingScore')}</ThemedText>
                  </View>
                  <View className="items-center">
                    <ThemedText className="text-2xl font-bold">
                      {displayCompletedTrips}
                    </ThemedText>
                    <ThemedText variant="caption">Rides</ThemedText>
                  </View>
                  <View className="items-center">
                    <ThemedText className="text-2xl font-bold text-success">
                      ₹{(earnings?.totalEarnings ?? 0).toLocaleString('en-IN')}
                    </ThemedText>
                    <ThemedText variant="caption">Total Earned</ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Profile Completion Notice - Show only if driver profile is not complete */}
          {!driverProfile && !loading && (
            <View className="px-6 mb-6">
              <ThemedCard className="p-4 bg-secondary/10 border border-secondary/30">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#BD8C5E" />
                  <View className="flex-1 ml-3">
                    <ThemedText className="font-semibold text-secondary mb-1">
                      Complete Your Profile
                    </ThemedText>
                    <ThemedText variant="small" className="text-textSecondary">
                      Add your license and ID details to start receiving ride requests.
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleEditProfile}
                  className="mt-3 bg-secondary px-4 py-2 rounded-lg self-start"
                >
                  <ThemedText className="text-white font-semibold">
                    Complete Profile
                  </ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            </View>
          )}

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
                  className={`px-4 py-2 rounded-lg ${isOnline ? 'bg-danger/10 border border-danger/20' : 'bg-success/10 border border-success/20'
                    } ${updatingStatus ? 'opacity-50' : ''}`}
                >
                  {updatingStatus ? (
                    <ActivityIndicator size="small" color={isOnline ? '#ef4444' : '#10b981'} />
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
            <View className={`flex-row bg-surface dark:bg-darkSurface rounded-xl p-1`}>
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'documents', label: 'Documents' },
                { key: 'rides', label: 'Rides' },
                { key: 'stats', label: 'Stats' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 px-1 rounded-lg ${activeTab === tab.key ? 'bg-burgundy' : ''
                    }`}
                >
                  <ThemedText
                    className={`text-center text-sm ${activeTab === tab.key ? 'text-white font-semibold' : ''
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
                {/* Account Info */}
                <ThemedCard className="p-4 mb-6">
                  <ThemedText className="font-bold text-lg mb-4">
                    ℹ️ {t('accountInfo')}
                  </ThemedText>

                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <ThemedText>{t('memberSince')}:</ThemedText>
                      <ThemedText className="font-semibold">{displayMemberSince}</ThemedText>
                    </View>
                    {driverProfile ? (
                      <>
                        <View className="flex-row justify-between">
                          <ThemedText>{t('licenseNumber')}:</ThemedText>
                          <ThemedText className="font-semibold">{driverProfile?.license_number || 'N/A'}</ThemedText>
                        </View>
                        <View className="flex-row justify-between">
                          <ThemedText>{t('licenseExpiry')}:</ThemedText>
                          <ThemedText className="font-semibold">{driverProfile?.license_expiry_date || 'N/A'}</ThemedText>
                        </View>
                        <View className="flex-row justify-between">
                          <ThemedText>{t('experience')}:</ThemedText>
                          <ThemedText className="font-semibold">
                            {driverProfile?.years_of_experience ? `${driverProfile.years_of_experience} years` : 'N/A'}
                          </ThemedText>
                        </View>
                      </>
                    ) : (
                      <View className="items-center py-2">
                        <ThemedText variant="secondary" className="text-center">
                          Complete your profile to see detailed information
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </ThemedCard>

                {/* Account Settings */}
                <View className="mb-6">
                  <TouchableOpacity
                    onPress={toggleTheme}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">{t('darkMode')}</ThemedText>
                    </View>
                    <View className={`w-12 h-6 rounded-full ${isDarkMode ? 'bg-burgundy' : 'bg-gray-300'} justify-center`}>
                      <View className={`w-5 h-5 bg-white rounded-full ${isDarkMode ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
                    </View>
                  </TouchableOpacity>

                  {/* English/Hindi Language Toggle */}
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Language / भाषा',
                        'Select your preferred language',
                        [
                          { text: 'English', onPress: () => setLanguage('en') },
                          { text: 'हिन्दी', onPress: () => setLanguage('hi') },
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="language" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">{t('language')}</ThemedText>
                    </View>
                    <View className="flex-row items-center">
                      <ThemedText variant="caption" className="text-secondary mr-1">{language === 'en' ? 'EN' : 'हि'}</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/banking-details')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="card" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">{t('bankingDetails')}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>

                  {/* Training Certificate — only for certified/active drivers */}
                  {(driverProfile?.current_status === 'certified' || driverProfile?.current_status === 'active') && (
                    <TouchableOpacity
                      onPress={() => router.push('/(driver)/training-certificate' as any)}
                      className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="ribbon" size={20} color="#BD8C5E" />
                        <ThemedText className="ml-3">Training Certificate</ThemedText>
                      </View>
                      <View className="flex-row items-center">
                        <View className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mr-2">
                          <ThemedText className="text-green-700 dark:text-green-300 text-xs font-semibold">
                            Certified ✓
                          </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/notifications')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="notifications" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">{t('notifications')}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/support')}
                    className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="help-circle" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                      <ThemedText className="ml-3">{t('helpSupport')}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
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
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'documents' && (
              <View>
                <DocumentsList documents={documents} onRefresh={fetchDriverData} />
              </View>
            )}

            {activeTab === 'rides' && (
              <View>
                {/* Rides Sub-tabs */}
                <View className="mb-4">
                  <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
                    {[
                      { key: 'accepted' as RidesTabType, label: 'Accepted' },
                      { key: 'in-progress' as RidesTabType, label: 'In Progress' },
                      { key: 'completed' as RidesTabType, label: 'Completed' }
                    ].map((tab) => (
                      <TouchableOpacity
                        key={tab.key}
                        onPress={() => setRidesTab(tab.key)}
                        className={`flex-1 py-2 rounded-lg ${ridesTab === tab.key ? 'bg-burgundy' : ''
                          }`}
                      >
                        <ThemedText
                          className={`text-center text-sm ${ridesTab === tab.key ? 'text-white font-semibold' : ''
                            }`}
                        >
                          {tab.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Fetch rides when tab changes */}
                <View>
                  {ridesTab === 'accepted' && (
                    <>
                      {loadingAccepted ? (
                        <View className="items-center py-16">
                          <ActivityIndicator size="large" color="#BD8C5E" />
                          <ThemedText className="mt-4 text-textSecondary">Loading accepted rides...</ThemedText>
                        </View>
                      ) : acceptedJobs.length > 0 ? (
                        acceptedJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onViewDetails={(jobId) => handleViewRideDetails(jobId, '/(driver)/job/accept')}
                          />
                        ))
                      ) : (
                        <ThemedCard className="p-8 items-center">
                          <Ionicons name="checkmark-circle" size={48} color="#bd8c5e" />
                          <ThemedText variant="title" className="mt-4 mb-2">
                            No Accepted Rides
                          </ThemedText>
                          <ThemedText variant="secondary" className="text-center">
                            Rides you accept will appear here
                          </ThemedText>
                        </ThemedCard>
                      )}
                    </>
                  )}

                  {ridesTab === 'in-progress' && (
                    <>
                      {loadingInProgress ? (
                        <View className="items-center py-16">
                          <ActivityIndicator size="large" color="#BD8C5E" />
                          <ThemedText className="mt-4 text-textSecondary">Loading active rides...</ThemedText>
                        </View>
                      ) : inProgressJobs.length > 0 ? (
                        inProgressJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onViewDetails={(jobId) => handleViewRideDetails(jobId, '/(driver)/job/active')}
                          />
                        ))
                      ) : (
                        <ThemedCard className="p-8 items-center">
                          <Ionicons name="car" size={48} color="#bd8c5e" />
                          <ThemedText variant="title" className="mt-4 mb-2">
                            No Active Rides
                          </ThemedText>
                          <ThemedText variant="secondary" className="text-center">
                            You have no rides in progress
                          </ThemedText>
                        </ThemedCard>
                      )}
                    </>
                  )}

                  {ridesTab === 'completed' && (
                    <>
                      {loadingCompleted ? (
                        <View className="items-center py-16">
                          <ActivityIndicator size="large" color="#BD8C5E" />
                          <ThemedText className="mt-4 text-textSecondary">Loading completed rides...</ThemedText>
                        </View>
                      ) : completedJobs.length > 0 ? (
                        completedJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onViewDetails={(jobId) => handleViewRideDetails(jobId, '/(driver)/job/completed')}
                          />
                        ))
                      ) : (
                        <ThemedCard className="p-8 items-center">
                          <Ionicons name="ribbon" size={48} color="#bd8c5e" />
                          <ThemedText variant="title" className="mt-4 mb-2">
                            No Completed Rides
                          </ThemedText>
                          <ThemedText variant="secondary" className="text-center">
                            Your completed ride history will appear here
                          </ThemedText>
                        </ThemedCard>
                      )}
                    </>
                  )}
                </View>
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
                      <ThemedText>{t('memberSince')}:</ThemedText>
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
                                name={star <= (job.customerRating || 0) ? 'star' : 'star-outline'}
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
              title={t('logout')}
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
