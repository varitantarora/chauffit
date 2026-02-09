import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, View, Alert, Switch, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { useRouter, useFocusEffect } from 'expo-router';
import BikerApiService, { BikerProfile as BikerProfileType } from '../../../services/api/BikerApiService';
import { appConfig } from '../../../config/env';

export default function BikerProfile() {
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const userCreatedAt = useAuthStore((state) => state.userCreatedAt);
  const userIsVerified = useAuthStore((state) => state.userIsVerified);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { earnings } = useBikerEarningsStore();
  const isOnline = useAuthStore((state) => state.bikerIsOnline);
  const setIsOnline = useAuthStore((state) => state.setBikerIsOnline);
  const router = useRouter();
  const [autoAccept, setAutoAccept] = useState(false);
  const [bikerProfile, setBikerProfile] = useState<BikerProfileType | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch biker profile, vehicles, and documents on mount
  useEffect(() => {
    fetchBikerData();
  }, []);

  // Refresh user profile and biker data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh user profile (for avatar, name updates)
      useAuthStore.getState().fetchProfile();

      // Refresh documents
      const refreshDocuments = async () => {
        try {
          const documentsResponse = await BikerApiService.getDocuments();
          if (documentsResponse.success && documentsResponse.data) {
            setDocuments(documentsResponse.data);
          }
        } catch (error) {
          console.error('Error refreshing documents:', error);
        }
      };
      refreshDocuments();
    }, [])
  );

  const fetchBikerData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileResponse = await BikerApiService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        setBikerProfile(profile);
        setIsOnline(profile.is_online); // Update shared store
        
        // If profile has ID, fetch detailed profile with vehicles and documents
        if (profile.id) {
          const detailedResponse = await BikerApiService.getProfileById(profile.id);
          if (detailedResponse.success && detailedResponse.data) {
            const detailed = detailedResponse.data as any;
            if (detailed.vehicles) setVehicles(detailed.vehicles);
            if (detailed.documents) setDocuments(detailed.documents);
          }
        }
      } else {
        Alert.alert('Error', profileResponse.error || 'Failed to fetch profile');
      }
      
      // Also try fetching vehicles and documents separately as fallback
      const vehiclesResponse = await BikerApiService.getVehicles();
      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data);
      }
      
      const documentsResponse = await BikerApiService.getDocuments();
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch biker data');
      console.error('Error fetching biker data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchBikerData();
  }, []);

  // Use actual API data, show N/A or empty when not available
  const displayName = bikerProfile?.full_name || user?.name || 'N/A';
  const displayEmail = bikerProfile?.email || user?.email || 'N/A';
  const displayPhone = bikerProfile?.phone_number || user?.phone || 'N/A';
  const displayRating = bikerProfile?.average_rating ?? 0;
  const displayCompletedPickups = bikerProfile?.total_tasks ?? 0;
  // Extract date from createdAt (which is a datetime string) and format for Member Since
  const displayMemberSince = userCreatedAt 
    ? (() => {
        const date = new Date(userCreatedAt);
        // Extract just the date part and format it
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      })()
    : 'N/A';
  const displayLicenseExpiry = bikerProfile?.license_expiry_date || 'N/A';
  
  // Determine account type based on user_type and is_verified from login API
  const getAccountType = () => {
    if (!userType) return 'N/A';
    const roleCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
    return userIsVerified ? `Verified ${roleCapitalized}` : roleCapitalized;
  };

  // Helper to get full image URL (handles relative URLs from backend)
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // If URL is already absolute (starts with http), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend the base URL
    const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };
  
  const handleEditProfile = () => {
    router.push('/(biker)/edit-profile');
  };
  
  const handleVehicleDetails = () => {
    router.push('/(biker)/onboarding/vehicle-registration');
  };
  
  const handleDocuments = () => {
    router.push('/(biker)/onboarding/documents');
  };
  
  const handlePerformanceAnalytics = () => {
    router.push('/(biker)/analytics/performance');
  };
  
  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose your preferred contact method:',
      [
        {
          text: 'Call Support',
          onPress: () => Alert.alert('Calling...', 'Calling Chauffit support at +91-800-SUPPORT')
        },
        {
          text: 'Email Support',
          onPress: () => Alert.alert('Email', 'Opening email to support@chauffit.com')
        },
        {
          text: 'Live Chat',
          onPress: () => Alert.alert('Live Chat', 'Opening live chat support')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    
    try {
      setUpdatingStatus(true);
      const response = await BikerApiService.updateStatus({
        is_online: newStatus,
      });
      
      if (response.success) {
        setIsOnline(newStatus);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setBikerProfile(response.data[0]);
        }
        Alert.alert(
          'Status Updated',
          `You are now ${newStatus ? 'online and available' : 'offline'} for pickup requests.`
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'pending': return 'hourglass';
      case 'expired': return 'warning';
      default: return 'document';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <ThemedText variant="title" className="font-bold">
            My Profile
          </ThemedText>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#BD8C5E"
            />
          }
        >
          {loading ? (
            <View className="flex-1 items-center justify-center p-6">
              <ActivityIndicator size="large" color="#BD8C5E" />
              <ThemedText className="mt-4">Loading profile...</ThemedText>
            </View>
          ) : (
            <View className="p-6">
              {/* Profile Header */}
              <ThemedCard className="p-6 mb-6">
                <View className="items-center mb-4">
                  {user?.avatar ? (
                    <Image
                      source={{ uri: getImageUrl(user.avatar) || undefined }}
                      className="w-24 h-24 rounded-full mb-4"
                      style={{ backgroundColor: '#BD8C5E' }}
                    />
                  ) : (
                    <View className="w-24 h-24 bg-burgundy rounded-full items-center justify-center mb-4">
                      <ThemedText className="text-white text-3xl font-bold">
                        {displayName !== 'N/A' ? displayName.charAt(0).toUpperCase() : '?'}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText variant="title" className="font-bold text-xl">
                    {displayName}
                  </ThemedText>
                  <ThemedText variant="secondary" className="mb-2">
                    {displayEmail}
                  </ThemedText>
                  <ThemedText variant="secondary">
                    {displayPhone}
                  </ThemedText>
                </View>
              
              {/* Status Toggle */}
              <View className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg mb-4">
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-success' : 'bg-danger'}`} />
                  <ThemedText className="font-semibold">
                    {isOnline ? 'Online - Available for pickups' : 'Offline'}
                  </ThemedText>
                </View>
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#BD8C5E" />
                ) : (
                  <Switch
                    value={isOnline}
                    onValueChange={toggleOnlineStatus}
                    trackColor={{ false: '#9ca3af', true: '#10b981' }}
                    thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
                  />
                )}
              </View>
              
              {/* Quick Stats */}
              <View className="flex-row justify-between">
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <ThemedText className="font-bold text-lg ml-1">
                      {displayRating > 0 ? displayRating.toFixed(1) : 'N/A'}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption">Rating</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg text-burgundy">
                    {displayCompletedPickups}
                  </ThemedText>
                  <ThemedText variant="caption">Pickups</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg text-success">
                    ₹{(earnings?.totalEarnings ?? 0).toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption">Total Earned</ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Vehicle Information */}
            <ThemedCard className="p-4 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="bicycle" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold text-lg ml-2">
                  🏍️ VEHICLE INFORMATION
                </ThemedText>
              </View>
              
              {vehicles && vehicles.length > 0 ? (
                vehicles.map((vehicle: any, index: number) => (
                  <View key={vehicle.id || index} className="space-y-3 mb-4">
                    <View className="flex-row justify-between">
                      <ThemedText>Type:</ThemedText>
                      <ThemedText className="font-semibold capitalize">{vehicle.vehicle_type || 'N/A'}</ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText>Vehicle:</ThemedText>
                      <ThemedText className="font-semibold capitalize">
                        {vehicle.brand ? `${vehicle.brand} ${vehicle.model_name || ''}`.trim() : 'N/A'}
                      </ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText>Plate Number:</ThemedText>
                      <ThemedText className="font-semibold">{vehicle.registration_number || 'N/A'}</ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText>Color:</ThemedText>
                      <ThemedText className="font-semibold capitalize">{vehicle.vehicle_color || 'N/A'}</ThemedText>
                    </View>
                  </View>
                ))
              ) : (
                <View className="space-y-3">
                  <ThemedText variant="secondary" className="text-center py-4">
                    No vehicle information available. Please add your vehicle details.
                  </ThemedText>
                </View>
              )}
              
              <TouchableOpacity
                onPress={handleVehicleDetails}
                className="mt-4 p-3 bg-burgundy/10 border border-burgundy/20 rounded-lg"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="create" size={16} color="#720C17" />
                  <ThemedText className="text-burgundy font-semibold ml-2">
                    Update Vehicle Details
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </ThemedCard>

            {/* Documents Status */}
            <ThemedCard className="p-4 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="document-text" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold text-lg ml-2">
                  📋 DOCUMENTS STATUS
                </ThemedText>
              </View>
              
              <View className="space-y-3">
                {/* License from profile */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name={bikerProfile?.license_number ? 'checkmark-circle' : 'document'} 
                      size={20} 
                      color={bikerProfile?.license_number ? '#10b981' : '#6b7280'} 
                    />
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Driving License</ThemedText>
                      <ThemedText variant="caption" className="text-secondary">
                        {displayLicenseExpiry !== 'N/A' ? `Expires: ${displayLicenseExpiry}` : 'Not provided'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText 
                    className={`font-semibold capitalize ${
                      bikerProfile?.license_number ? 'text-success' : 'text-secondary'
                    }`}
                  >
                    {bikerProfile?.license_number ? 'Provided' : 'N/A'}
                  </ThemedText>
                </View>
                
                {/* Documents from API */}
                {documents && documents.length > 0 ? (
                  documents.map((doc: any) => (
                    <View key={doc.id} className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons 
                          name={getDocumentStatusIcon(doc.verification_status)} 
                          size={20} 
                          color={getDocumentStatusColor(doc.verification_status)} 
                        />
                        <View className="ml-3 flex-1">
                          <ThemedText className="font-semibold capitalize">
                            {doc.document_type?.replace('_', ' ') || 'Document'}
                          </ThemedText>
                          <ThemedText variant="caption" className="text-secondary">
                            {doc.expiry_date ? `Expires: ${doc.expiry_date}` : doc.issue_date ? `Issued: ${doc.issue_date}` : 'No date'}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText 
                        className={`font-semibold capitalize ${
                          doc.verification_status === 'approved' ? 'text-success' :
                          doc.verification_status === 'pending' ? 'text-warning' : 'text-danger'
                        }`}
                      >
                        {doc.verification_status || 'N/A'}
                      </ThemedText>
                    </View>
                  ))
                ) : (
                  <ThemedText variant="secondary" className="text-center py-2">
                    No additional documents available
                  </ThemedText>
                )}
              </View>
              
              <TouchableOpacity
                onPress={handleDocuments}
                className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="cloud-upload" size={16} color="#3b82f6" />
                  <ThemedText className="text-info font-semibold ml-2">
                    Manage Documents
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </ThemedCard>

            {/* Preferences */}
            <ThemedCard className="p-4 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="settings" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold text-lg ml-2">
                  ⚙️ WORK PREFERENCES (Coming Soon)
                </ThemedText>
              </View>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <ThemedText>Service Zone:</ThemedText>
                  <ThemedText className="font-semibold">N/A</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Max Distance:</ThemedText>
                  <ThemedText className="font-semibold">N/A</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Work Hours:</ThemedText>
                  <ThemedText className="font-semibold">N/A</ThemedText>
                </View>
              </View>
              
              <View className="mt-4 p-3 bg-surface dark:bg-darkSurface rounded-lg">
                <View className="flex-row items-center justify-between">
                  <ThemedText>Auto-accept requests:</ThemedText>
                  <Switch
                    value={autoAccept}
                    onValueChange={setAutoAccept}
                    trackColor={{ false: '#9ca3af', true: '#720C17' }}
                    thumbColor={autoAccept ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
                <ThemedText variant="caption" className="text-secondary mt-1">
                  Automatically accept pickup requests within your zone
                </ThemedText>
              </View>
            </ThemedCard>

            {/* Quick Actions */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold text-lg mb-4">
                🚀 QUICK ACTIONS
              </ThemedText>
              
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={handlePerformanceAnalytics}
                  className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="analytics" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Performance Analytics</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => router.push('/(biker)/(tabs)/earnings')}
                  className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="wallet" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Earnings & Payouts</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSupport}
                  className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="help-circle" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Help & Support</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </ThemedCard>

            {/* App Settings */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold text-lg mb-4">
                📱 APP SETTINGS
              </ThemedText>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Dark Mode</ThemedText>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#9ca3af', true: '#720C17' }}
                    thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
                
                <TouchableOpacity
                  className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="notifications" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Notifications</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="shield-checkmark" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText className="ml-3 font-semibold">Privacy & Security</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </ThemedCard>

            {/* Account Info */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold text-lg mb-4">
                ℹ️ ACCOUNT INFORMATION
              </ThemedText>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <ThemedText>Member Since:</ThemedText>
                  <ThemedText className="font-semibold">{displayMemberSince}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Account Type:</ThemedText>
                  <ThemedText className="font-semibold text-burgundy">{getAccountType()}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>App Version:</ThemedText>
                  <ThemedText className="font-semibold">1.2.3</ThemedText>
                </View>
              </View>
            </ThemedCard>


            {/* Test Onboarding Button */}
            <TouchableOpacity
              onPress={() => router.push('/(biker)/onboarding/login')}
              className="w-full py-4 bg-secondary rounded-lg items-center mb-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="school" size={20} color="white" />
                <ThemedText className="text-white font-bold text-lg ml-2">
                  Test Onboarding
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="w-full py-4 bg-danger rounded-lg items-center mb-6"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out" size={20} color="white" />
                <ThemedText className="text-white font-bold text-lg ml-2">
                  Logout
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}