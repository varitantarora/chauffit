import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, View, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { useRouter } from 'expo-router';

export default function BikerProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { earnings } = useBikerEarningsStore();
  const router = useRouter();
  
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  
  // Mock user data with vehicle info
  const bikerProfile = {
    name: user?.name || 'Rajesh Kumar',
    email: user?.email || 'rajesh.kumar@example.com',
    phone: user?.phone || '+91 98765 43210',
    rating: 4.8,
    completedPickups: 847,
    memberSince: 'March 2023',
    vehicleInfo: {
      type: 'Motorcycle',
      make: 'Honda',
      model: 'CBR600RR',
      year: '2022',
      plate: 'KA 01 AB 1234',
      color: 'Red'
    },
    documents: {
      license: { status: 'verified', expiryDate: '2026-12-15' },
      insurance: { status: 'verified', expiryDate: '2024-11-30' },
      registration: { status: 'verified', expiryDate: '2025-08-20' }
    },
    preferences: {
      zone: 'Central Bangalore',
      maxDistance: '15 km',
      workHours: '9 AM - 8 PM'
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
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };
  
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
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

  
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      'Status Updated',
      `You are now ${!isOnline ? 'online and available' : 'offline'} for pickup requests.`
    );
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

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="p-6">
            {/* Profile Header */}
            <ThemedCard className="p-6 mb-6">
              <View className="items-center mb-4">
                <View className="w-24 h-24 bg-burgundy rounded-full items-center justify-center mb-4">
                  <ThemedText className="text-white text-3xl font-bold">
                    {bikerProfile.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText variant="title" className="font-bold text-xl">
                  {bikerProfile.name}
                </ThemedText>
                <ThemedText variant="secondary" className="mb-2">
                  {bikerProfile.email}
                </ThemedText>
                <ThemedText variant="secondary">
                  {bikerProfile.phone}
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
                <Switch
                  value={isOnline}
                  onValueChange={toggleOnlineStatus}
                  trackColor={{ false: '#9ca3af', true: '#10b981' }}
                  thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              
              {/* Quick Stats */}
              <View className="flex-row justify-between">
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <ThemedText className="font-bold text-lg ml-1">
                      {bikerProfile.rating}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption">Rating</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg text-burgundy">
                    {bikerProfile.completedPickups}
                  </ThemedText>
                  <ThemedText variant="caption">Pickups</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg text-success">
                    ₹{(earnings?.totalEarnings || 0).toLocaleString('en-IN')}
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
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <ThemedText>Type:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.vehicleInfo.type}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Vehicle:</ThemedText>
                  <ThemedText className="font-semibold">
                    {bikerProfile.vehicleInfo.make} {bikerProfile.vehicleInfo.model}
                  </ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Plate Number:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.vehicleInfo.plate}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Color:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.vehicleInfo.color}</ThemedText>
                </View>
              </View>
              
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
                {Object.entries(bikerProfile.documents).map(([key, doc]) => (
                  <View key={key} className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons 
                        name={getDocumentStatusIcon(doc.status)} 
                        size={20} 
                        color={getDocumentStatusColor(doc.status)} 
                      />
                      <View className="ml-3 flex-1">
                        <ThemedText className="font-semibold capitalize">
                          {key === 'license' ? 'Driving License' : key === 'registration' ? 'Vehicle Registration' : 'Insurance'}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          Expires: {doc.expiryDate}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText 
                      className={`font-semibold capitalize ${
                        doc.status === 'verified' ? 'text-success' :
                        doc.status === 'pending' ? 'text-warning' : 'text-danger'
                      }`}
                    >
                      {doc.status}
                    </ThemedText>
                  </View>
                ))}
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
                  ⚙️ WORK PREFERENCES
                </ThemedText>
              </View>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <ThemedText>Service Zone:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.preferences.zone}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Max Distance:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.preferences.maxDistance}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Work Hours:</ThemedText>
                  <ThemedText className="font-semibold">{bikerProfile.preferences.workHours}</ThemedText>
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
                  <ThemedText className="font-semibold">{bikerProfile.memberSince}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Account Type:</ThemedText>
                  <ThemedText className="font-semibold text-burgundy">Verified Biker</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>App Version:</ThemedText>
                  <ThemedText className="font-semibold">1.2.3</ThemedText>
                </View>
              </View>
            </ThemedCard>


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
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}