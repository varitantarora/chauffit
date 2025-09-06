import React from 'react';
import { TouchableOpacity, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

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
  
  const handleRoleSwitch = (role: 'driver' | 'biker') => {
    Alert.alert(
      'Switch Role',
      `Are you sure you want to switch to ${role} role?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => {
            // Update user role in store
            // This would typically involve API calls
            router.replace(`/(${role})`);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-border dark:border-darkBorder">
            <ThemedText variant="h1">Profile</ThemedText>
            <ThemedText variant="small" className="mt-1">
              Manage your account and preferences
            </ThemedText>
          </View>
          
          {/* User Info Card */}
          <View className="px-6 py-6">
            <ThemedCard variant="premium" className="items-center py-6">
              <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-4">
                <ThemedText className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText variant="h2">{user?.name}</ThemedText>
              <ThemedText variant="small" className="mt-1">{user?.email}</ThemedText>
              {user?.phone && (
                <ThemedText variant="tiny" className="mt-1">{user.phone}</ThemedText>
              )}
              
              <View className="bg-secondary/10 px-3 py-1 rounded-full mt-3">
                <ThemedText variant="tiny" className="text-secondary font-semibold">CUSTOMER</ThemedText>
              </View>
            </ThemedCard>
          </View>
          
          {/* Role Switching CTA */}
          <View className="px-6 mb-6">
            <ThemedCard variant="elevated" className="p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-burgundy/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="car" size={20} color="#720C17" />
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
            
            <TouchableOpacity className="mb-3">
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
            
            <TouchableOpacity className="mb-3">
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
            
            <TouchableOpacity className="mb-3" onPress={() => router.push('/(customer)/(tabs)/history')}>
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