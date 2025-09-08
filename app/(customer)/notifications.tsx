import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'booking' | 'marketing' | 'security' | 'driver';
}

export default function NotificationsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    // Booking Notifications
    {
      id: 'booking_confirmations',
      title: 'Booking Confirmations',
      description: 'Get notified when your ride is confirmed',
      icon: 'checkmark-circle',
      enabled: true,
      category: 'booking'
    },
    {
      id: 'driver_updates',
      title: 'Driver Updates',
      description: 'Receive updates about your driver\'s arrival',
      icon: 'car',
      enabled: true,
      category: 'booking'
    },
    {
      id: 'ride_reminders',
      title: 'Ride Reminders',
      description: 'Reminders for upcoming scheduled rides',
      icon: 'time',
      enabled: true,
      category: 'booking'
    },
    {
      id: 'trip_completion',
      title: 'Trip Completion',
      description: 'Notifications when your trip is completed',
      icon: 'flag',
      enabled: true,
      category: 'booking'
    },

    // Driver Notifications
    {
      id: 'driver_messages',
      title: 'Driver Messages',
      description: 'Messages from your assigned chauffeur',
      icon: 'chatbox',
      enabled: true,
      category: 'driver'
    },
    {
      id: 'driver_arrival',
      title: 'Driver Arrival',
      description: 'Alert when driver arrives at pickup location',
      icon: 'location',
      enabled: true,
      category: 'driver'
    },

    // Marketing Notifications
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Special deals and discount notifications',
      icon: 'pricetag',
      enabled: false,
      category: 'marketing'
    },
    {
      id: 'new_features',
      title: 'New Features',
      description: 'Updates about new app features and services',
      icon: 'sparkles',
      enabled: true,
      category: 'marketing'
    },

    // Security Notifications
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      icon: 'shield-checkmark',
      enabled: true,
      category: 'security'
    },
    {
      id: 'payment_updates',
      title: 'Payment Updates',
      description: 'Payment receipts and transaction notifications',
      icon: 'card',
      enabled: true,
      category: 'security'
    }
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
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
              <ThemedText variant="small" className="text-gray-600">
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
                  <ThemedText variant="small" className="text-gray-600">
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
                            color="#BD8C5E" 
                          />
                        </View>
                        <View className="flex-1">
                          <ThemedText className="font-semibold mb-1">
                            {notification.title}
                          </ThemedText>
                          <ThemedText variant="small" className="text-gray-600">
                            {notification.description}
                          </ThemedText>
                        </View>
                      </View>
                      
                      <Switch
                        value={notification.enabled}
                        onValueChange={() => toggleNotification(notification.id)}
                        trackColor={{ 
                          false: isDarkMode ? '#374151' : '#D1D5DB',
                          true: '#BD8C5E' 
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
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                    <Ionicons name="checkmark-done" size={20} color="#10B981" />
                  </View>
                  <ThemedText>Enable All Notifications</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-4">
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
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