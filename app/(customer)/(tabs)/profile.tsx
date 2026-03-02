import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, ScrollView, View, Alert, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useCarStore } from '../../../store/carStore';
import { useLoyaltyStore } from '../../../store/loyaltyStore';
import LoyaltyApiService from '../../../services/api/LoyaltyApiService';
import { useRouter } from 'expo-router';
import { appConfig } from '../../../config/env';
import { LightColors, DarkColors, useThemeColors } from '../../../constants/Colors';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const addRole = useAuthStore((state) => state.addRole);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const switchRole = useAuthStore((state) => state.switchRole);
  const { cars, loadUserCars, deleteCar } = useCarStore();
  const { profile: loyaltyProfile, fetchProfile: fetchLoyaltyProfile } = useLoyaltyStore();
  const router = useRouter();
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to get full image URL (handles relative URLs from backend)
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserCars(user.id);
    }
  }, [user?.id, loadUserCars]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.id) {
      loadUserCars(user.id);
      fetchLoyaltyProfile();
    }
  }, [user?.id]);

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
  

  const handleAddCar = () => {
    router.push('/(auth)/car-details');
  };

  const handleDeleteCar = (carId: string) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to remove this car from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCar(carId);
              Alert.alert('Success', 'Car has been removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove car. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRoleSwitch = (role: 'driver' | 'biker') => {
    Alert.alert(
      'Switch to ' + (role === 'driver' ? 'Driver' : 'Biker') + ' App',
      `You will need to complete the ${role} onboarding process. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => {
            try {
              // Switch role which will trigger onboarding for that role
              switchRole(role);
              // Force navigation to the correct app
              if (role === 'driver') {
                router.replace('/(driver)/(tabs)');
              } else if (role === 'biker') {
                router.replace('/(biker)/(tabs)');
              }
            } catch (error) {
              console.error('Role switch error:', error);
              Alert.alert('Error', 'Failed to switch roles. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
        >
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
            <ThemedText style={{ color: '#ffffff', fontSize: 22, fontWeight: '800' }}>Profile</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(customer)/edit-profile')}>
              <Ionicons name="create" size={24} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View className="px-6 py-6">
            <ThemedCard variant="premium" className="items-center py-6">
              {/* Profile Picture */}
              {user?.avatar ? (
                <Image
                  source={{ uri: getImageUrl(user.avatar) || undefined }}
                  className="w-24 h-24 rounded-full mb-4"
                  style={{ backgroundColor: '#BD8C5E' }}
                />
              ) : (
                <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-4">
                  <ThemedText className="text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </ThemedText>
                </View>
              )}

              <ThemedText variant="h2">{user?.name || 'Guest'}</ThemedText>
              <ThemedText variant="small" className="mt-1">{user?.email}</ThemedText>
              {user?.phone && (
                <ThemedText variant="tiny" className="mt-1">{user.phone}</ThemedText>
              )}

              <View className="bg-secondary/10 px-3 py-1 rounded-full mt-3">
                <ThemedText variant="tiny" className="text-secondary font-semibold">CUSTOMER</ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Loyalty & Rewards Card */}
          <View className="px-6 mb-6">
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(customer)/wallet')}>
              <ThemedCard variant="elevated" className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: loyaltyProfile
                          ? `${LoyaltyApiService.getTierColor(loyaltyProfile.tier)}30`
                          : '#D9D1C630',
                      }}
                    >
                      <Ionicons
                        name="star"
                        size={20}
                        color={
                          loyaltyProfile
                            ? LoyaltyApiService.getTierColor(loyaltyProfile.tier)
                            : '#BD8C5E'
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <ThemedText variant="h3">Loyalty & Rewards</ThemedText>
                      <ThemedText variant="small" className="text-textSecondary">
                        {loyaltyProfile
                          ? `${LoyaltyApiService.getTierLabel(loyaltyProfile.tier)} • ₹${Number(loyaltyProfile.credit_balance).toFixed(0)} credits`
                          : 'View your tier and credits'}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#720C17" />
                </View>
                {loyaltyProfile && loyaltyProfile.discount_percentage > 0 && (
                  <View className="mt-3 p-2 bg-green-50 rounded-xl flex-row items-center">
                    <Ionicons name="pricetag" size={14} color="#10B981" />
                    <ThemedText variant="tiny" className="ml-2 text-green-700 font-semibold">
                      {loyaltyProfile.discount_percentage}% loyalty discount active
                    </ThemedText>
                  </View>
                )}
              </ThemedCard>
            </TouchableOpacity>
          </View>

          {/* Car Management Section */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="h3">Your Vehicles</ThemedText>
              <TouchableOpacity
                onPress={handleAddCar}
                className="flex-row items-center"
              >
                <Ionicons name="add-circle" size={20} color="#BD8C5E" />
                <ThemedText className="ml-1 text-secondary font-semibold">Add Car</ThemedText>
              </TouchableOpacity>
            </View>

            {cars.length > 0 ? (
              cars.map((car) => (
                <ThemedCard key={car.id} className="mb-3">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                      <Ionicons name="car-sport" size={24} color="#BD8C5E" />
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <ThemedText variant="body" className="font-semibold">
                          {car.make} {car.model}
                        </ThemedText>
                        {car.isDefault && (
                          <View className="bg-burgundy px-2 py-1 rounded-full ml-2">
                            <ThemedText variant="tiny" className="text-white font-semibold">
                              DEFAULT
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText variant="small" className="text-textSecondary">
                        {car.color} • {car.year} • {car.registrationNumber}
                      </ThemedText>
                    </View>

                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleDeleteCar(car.id)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ThemedCard>
              ))
            ) : (
              <ThemedCard className="items-center py-8">
                <View className="w-16 h-16 bg-textSecondary/20 rounded-full items-center justify-center mb-3">
                  <Ionicons name="car-sport" size={32} color="#6B7280" />
                </View>
                <ThemedText variant="body" className="font-semibold mb-1">
                  No Cars Added
                </ThemedText>
                <ThemedText variant="small" className="text-textSecondary text-center mb-4">
                  Add your car details to start booking rides
                </ThemedText>
                <TouchableOpacity
                  onPress={handleAddCar}
                  className="bg-secondary px-4 py-2 rounded-lg"
                >
                  <ThemedText className="text-white font-semibold">
                    Add Your First Car
                  </ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            )}
          </View>
          
          {/* Role Switching CTA */}
          <View className="px-6 mb-6">
            <ThemedCard variant="elevated" className="p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="car" size={20} color="#BD8C5E" />
                </View>
                <View className="flex-1">
                  <ThemedText variant="h3">Start Earning</ThemedText>
                  <ThemedText variant="small">Become a driver or biker partner</ThemedText>
                </View>
              </View>
              
              <View className="flex-row space-x-3">
                <PrimaryButton
                  title="Become Driver"
                  onPress={() => handleRoleSwitch('driver')}
                  variant="secondary"
                  size="small"
                  className="flex-1 mr-2"
                />
                <PrimaryButton
                  title="Become Biker"
                  onPress={() => handleRoleSwitch('biker')}
                  variant="outline"
                  size="small"
                  className="flex-1 ml-2"
                />
              </View>
            </ThemedCard>
          </View>
          
          {/* Settings */}
          <View className="px-6 mb-6">
            <ThemedText variant="h3" className="mb-4">Settings</ThemedText>
            
            <TouchableOpacity
              onPress={toggleTheme}
              className="mb-3"
              activeOpacity={1}
            >
              <ThemedCard className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#BD8C5E" />
                  </View>
                  <ThemedText>Dark Mode</ThemedText>
                </View>
                <View className={`w-12 h-6 rounded-full ${isDarkMode ? 'bg-burgundy' : 'bg-border'} justify-center`}>
                  <View className={`w-5 h-5 bg-white rounded-full ${isDarkMode ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
                </View>
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity className="mb-3" activeOpacity={1} onPress={() => router.push('/(customer)/notifications')}>
              <ThemedCard className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="notifications" size={20} color="#BD8C5E" />
                  </View>
                  <ThemedText>Notifications</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#720C17" />
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity className="mb-3" activeOpacity={1} onPress={() => router.push('/(customer)/payment-methods')}>
              <ThemedCard className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="card" size={20} color="#BD8C5E" />
                  </View>
                  <ThemedText>Payment Methods</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#720C17" />
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity className="mb-3" onPress={() => router.push('/(customer)/(tabs)/history')} activeOpacity={1}>
              <ThemedCard className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#BD8C5E" />
                  </View>
                  <ThemedText>Ride History</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#720C17" />
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity className="mb-3" onPress={() => router.push('/(customer)/support')} activeOpacity={1}>
              <ThemedCard className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="help-circle" size={20} color="#BD8C5E" />
                  </View>
                  <ThemedText>Support</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#720C17" />
              </ThemedCard>
            </TouchableOpacity>
          </View>
          
          {/* Logout */}
          <View className="px-6 pb-6">
            <PrimaryButton
              title="Logout"
              onPress={handleLogout}
              variant="outline"
            />
          </View>
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}