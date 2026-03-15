import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import NotificationPreferencesApiService, { NotificationPreferences } from '../../services/api/NotificationPreferencesApiService';
import { BrandColors, useThemeColors } from '../../constants/Colors';

interface NotificationSetting {
  id: string;
  apiField: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'booking' | 'marketing' | 'security' | 'driver';
}

const NOTIFICATION_SETTINGS: Omit<NotificationSetting, 'enabled'>[] = [
  // Booking Notifications
  {
    id: 'booking_confirmations',
    apiField: 'booking_confirmations',
    title: 'Booking Confirmations',
    description: 'Get notified when your ride is confirmed',
    icon: 'checkmark-circle',
    category: 'booking'
  },
  {
    id: 'driver_updates',
    apiField: 'driver_updates',
    title: 'Driver Updates',
    description: "Receive updates about your driver's arrival",
    icon: 'car',
    category: 'booking'
  },
  {
    id: 'ride_reminders',
    apiField: 'ride_reminders',
    title: 'Ride Reminders',
    description: 'Reminders for upcoming scheduled rides',
    icon: 'time',
    category: 'booking'
  },
  {
    id: 'trip_completion',
    apiField: 'trip_completion',
    title: 'Trip Completion',
    description: 'Notifications when your trip is completed',
    icon: 'flag',
    category: 'booking'
  },
  // Driver Notifications
  {
    id: 'driver_messages',
    apiField: 'driver_messages',
    title: 'Driver Messages',
    description: 'Messages from your assigned chauffeur',
    icon: 'chatbox',
    category: 'driver'
  },
  {
    id: 'driver_arrival',
    apiField: 'driver_arrival',
    title: 'Driver Arrival',
    description: 'Alert when driver arrives at pickup location',
    icon: 'location',
    category: 'driver'
  },
  // Marketing Notifications
  {
    id: 'promotions',
    apiField: 'promotions_offers',
    title: 'Promotions & Offers',
    description: 'Special deals and discount notifications',
    icon: 'pricetag',
    category: 'marketing'
  },
  {
    id: 'new_features',
    apiField: 'new_features',
    title: 'New Features',
    description: 'Updates about new app features and services',
    icon: 'sparkles',
    category: 'marketing'
  },
  // Security Notifications
  {
    id: 'security_alerts',
    apiField: 'security_alerts',
    title: 'Security Alerts',
    description: 'Important security and account notifications',
    icon: 'shield-checkmark',
    category: 'security'
  },
  {
    id: 'payment_updates',
    apiField: 'payment_updates',
    title: 'Payment Updates',
    description: 'Payment receipts and transaction notifications',
    icon: 'card',
    category: 'security'
  }
];

export default function NotificationsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const router = useRouter();

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;

  const [notifications, setNotifications] = useState<NotificationSetting[]>(() =>
    NOTIFICATION_SETTINGS.map(s => ({ ...s, enabled: true }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await NotificationPreferencesApiService.getPreferences();
    if (response.success && response.data) {
      const prefs = response.data;
      setNotifications(
        NOTIFICATION_SETTINGS.map(s => ({
          ...s,
          enabled: !!prefs[s.apiField],
        }))
      );
    } else {
      setError(response.error || 'Failed to load preferences');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const toggleNotification = async (id: string) => {
    const setting = notifications.find(n => n.id === id);
    if (!setting) return;

    const newValue = !setting.enabled;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, enabled: newValue } : n))
    );

    const response = await NotificationPreferencesApiService.updatePreferences({
      [setting.apiField]: newValue,
    } as Partial<NotificationPreferences>);

    if (!response.success) {
      // Revert on failure
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, enabled: !newValue } : n))
      );
    }
  };

  const handleEnableAll = async () => {
    const previous = notifications.map(n => ({ ...n }));
    setNotifications(prev => prev.map(n => ({ ...n, enabled: true })));

    const response = await NotificationPreferencesApiService.enableAll();
    if (!response.success) {
      setNotifications(previous);
    }
  };

  const handleDisableAll = async () => {
    const previous = notifications.map(n => ({ ...n }));
    setNotifications(prev => prev.map(n => ({ ...n, enabled: false })));

    const response = await NotificationPreferencesApiService.disableAll();
    if (!response.success) {
      setNotifications(previous);
    }
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(notif => notif.category === category);
  };

  const categories = [
    { id: 'booking', title: 'Booking Notifications', description: 'Stay updated about your rides' },
    { id: 'driver', title: 'Driver Communications', description: 'Messages and updates from drivers' },
    { id: 'marketing', title: 'Promotions & Updates', description: 'Deals and new features' },
    { id: 'security', title: 'Security & Payments', description: 'Important account notifications' }
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor }}>
        <ThemedView className="flex-1" style={{ backgroundColor }}>
          <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Notifications</ThemedText>
          </View>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={BrandColors.secondary} />
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor }}>
        <ThemedView className="flex-1" style={{ backgroundColor }}>
          <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Notifications</ThemedText>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={48} color={BrandColors.danger} />
            <ThemedText className="mt-4 text-center">{error}</ThemedText>
            <TouchableOpacity
              onPress={fetchPreferences}
              className="mt-4 px-6 py-3 rounded-lg"
              style={{ backgroundColor: BrandColors.secondary }}
            >
              <ThemedText style={{ color: '#FFFFFF' }}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Notifications</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Notification Preferences
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                Choose which notifications you'd like to receive to stay updated on your rides and account.
              </ThemedText>
            </View>

            {/* Notification Categories */}
            {categories.map((category) => (
              <ThemedCard key={category.id} variant="elevated" className="mb-6 p-6">
                <View className="mb-4">
                  <ThemedText variant="h3" className="mb-1">
                    {category.title}
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    {category.description}
                  </ThemedText>
                </View>

                {getNotificationsByCategory(category.id).map((notification, index) => (
                  <View key={notification.id}>
                    <TouchableOpacity
                      onPress={() => toggleNotification(notification.id)}
                      className="flex-row items-center justify-between py-4"
                      activeOpacity={1}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-4">
                          <Ionicons
                            name={notification.icon as any}
                            size={20}
                            color={BrandColors.secondary}
                          />
                        </View>
                        <View className="flex-1">
                          <ThemedText className="font-semibold mb-1">
                            {notification.title}
                          </ThemedText>
                          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                            {notification.description}
                          </ThemedText>
                        </View>
                      </View>

                      <Switch
                        value={notification.enabled}
                        onValueChange={() => toggleNotification(notification.id)}
                        trackColor={{
                          false: isDarkMode ? '#374151' : '#D1D5DB',
                          true: BrandColors.secondary
                        }}
                        thumbColor={notification.enabled ? '#FFFFFF' : '#9CA3AF'}
                        ios_backgroundColor={isDarkMode ? '#374151' : '#D1D5DB'}
                      />
                    </TouchableOpacity>

                    {index < getNotificationsByCategory(category.id).length - 1 && (
                      <View className="border-b border-gray-100 dark:border-gray-700" />
                    )}
                  </View>
                ))}
              </ThemedCard>
            ))}

            {/* Quick Actions */}
            <ThemedCard variant="elevated" className="p-6">
              <ThemedText variant="h3" className="mb-4">
                Quick Actions
              </ThemedText>

              <TouchableOpacity
                onPress={handleEnableAll}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                    <Ionicons name="checkmark-done" size={20} color={BrandColors.success} />
                  </View>
                  <ThemedText>Enable All Notifications</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDisableAll}
                className="flex-row items-center justify-between py-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-4">
                    <Ionicons name="close-circle" size={20} color={BrandColors.danger} />
                  </View>
                  <ThemedText>Disable All Notifications</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
