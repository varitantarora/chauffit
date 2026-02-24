import React from 'react';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';

export default function AdminProfile() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colors = isDarkMode ? DarkColors : LightColors;

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
          },
        },
      ]
    );
  };

  const infoRows = [
    { label: 'Name', value: user?.name || 'Admin', icon: 'person-outline' as const },
    { label: 'Email', value: user?.email || '—', icon: 'mail-outline' as const },
    { label: 'Phone', value: user?.phone || '—', icon: 'call-outline' as const },
    { label: 'Role', value: 'Admin', icon: 'shield-checkmark-outline' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-4">
        <ThemedText variant="h2" className="mt-4 mb-6">Profile</ThemedText>

        {/* Avatar + Name */}
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: colors.burgundy }}
          >
            <ThemedText className="text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </ThemedText>
          </View>
          <ThemedText variant="h2">{user?.name || 'Admin'}</ThemedText>
          <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: colors.burgundy + '20' }}>
            <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="font-semibold">
              ADMINISTRATOR
            </ThemedText>
          </View>
        </View>

        {/* User Details */}
        <ThemedText variant="h3" className="mb-3">Account Details</ThemedText>
        <View className="rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-6 overflow-hidden">
          {infoRows.map((row, index) => (
            <View
              key={row.label}
              className={`flex-row items-center px-4 py-4 ${
                index < infoRows.length - 1 ? 'border-b border-border dark:border-darkBorder' : ''
              }`}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.burgundy + '15' }}
              >
                <Ionicons name={row.icon} size={16} color={colors.burgundy} />
              </View>
              <View className="flex-1">
                <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>{row.label}</ThemedText>
                <ThemedText variant="small" className="font-semibold mt-0.5">{row.value}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <ThemedText variant="h3" className="mb-3">Preferences</ThemedText>
        <View className="rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-6 overflow-hidden">
          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center px-4 py-4"
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.burgundy + '15' }}
            >
              <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={16} color={colors.burgundy} />
            </View>
            <ThemedText className="flex-1">Dark Mode</ThemedText>
            <View
              className="w-12 h-6 rounded-full justify-center"
              style={{ backgroundColor: isDarkMode ? colors.burgundy : colors.border }}
            >
              <View
                className="w-5 h-5 bg-white rounded-full"
                style={{ alignSelf: isDarkMode ? 'flex-end' : 'flex-start', marginHorizontal: 2 }}
              />
            </View>
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center p-4 rounded-2xl border border-red-200 dark:border-red-900 mb-8"
          style={{ backgroundColor: '#EF444415' }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <ThemedText className="ml-2 font-semibold" style={{ color: '#EF4444' }}>
            Logout
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
