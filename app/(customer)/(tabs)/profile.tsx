import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView className="flex-1 px-6 py-8">
          <ThemedText variant="title" className="text-center mb-8">
            Profile
          </ThemedText>
          
          <ThemedView className="bg-surface dark:bg-darkSurface p-6 rounded-2xl mb-6">
            <ThemedView className="items-center mb-6">
              <ThemedView className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
                <ThemedText className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>
              <ThemedText variant="title">{user?.name}</ThemedText>
              <ThemedText variant="secondary">{user?.email}</ThemedText>
              {user?.phone && (
                <ThemedText variant="secondary">{user.phone}</ThemedText>
              )}
            </ThemedView>
            
            <ThemedView className="border-t border-border dark:border-darkBorder pt-4">
              <ThemedText variant="secondary" className="mb-2">Account Type</ThemedText>
              <ThemedText>Customer</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView className="mb-6">
            <TouchableOpacity
              onPress={toggleTheme}
              className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
            >
              <ThemedText>Dark Mode</ThemedText>
              <ThemedView className={`w-12 h-6 rounded-full ${isDarkMode ? 'bg-primary' : 'bg-gray-300'} justify-center`}>
                <ThemedView className={`w-5 h-5 bg-white rounded-full ${isDarkMode ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
              </ThemedView>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
            >
              <ThemedText>Notifications</ThemedText>
              <ThemedText variant="secondary">On</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
            >
              <ThemedText>Payment Methods</ThemedText>
              <ThemedText variant="secondary">→</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row justify-between items-center p-4 bg-surface dark:bg-darkSurface rounded-xl mb-3"
            >
              <ThemedText>Ride History</ThemedText>
              <ThemedText variant="secondary">→</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}