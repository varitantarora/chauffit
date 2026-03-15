import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { BrandColors } from '../../constants/Colors';

interface Notification {
  id: string;
  type: 'ride' | 'earnings' | 'review' | 'achievement' | 'system';
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
  read: boolean;
}

export default function NotificationsCenterScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ride',
      title: 'New ride request available',
      message: 'Sarah C. • BMW X5 • ₹675',
      time: 'Just now',
      icon: 'car',
      color: '#10b981',
      read: false
    },
    {
      id: '2',
      type: 'earnings',
      title: 'Earnings update',
      message: 'Daily target 87% complete',
      time: '2 hours ago',
      icon: 'cash',
      color: BrandColors.burgundy,
      read: false
    },
    {
      id: '3',
      type: 'review',
      title: 'New 5-star review received',
      message: '"Excellent professional service..."',
      time: '4 hours ago',
      icon: 'star',
      color: '#fbbf24',
      read: true
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Weekly goal achieved!',
      message: 'Earned ₹12,150 this week',
      time: 'Yesterday, 8:30 PM',
      icon: 'trophy',
      color: BrandColors.secondary,
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'System maintenance scheduled',
      message: 'Sunday 2:00-4:00 AM',
      time: 'Yesterday, 2:00 PM',
      icon: 'construct',
      color: '#6b7280',
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifs => notifs.map(notif => ({ ...notif, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifs => 
      notifs.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const todayNotifications = notifications.filter(n => 
    n.time.includes('Just now') || n.time.includes('hours ago')
  );
  
  const yesterdayNotifications = notifications.filter(n => 
    n.time.includes('Yesterday')
  );

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => markAsRead(notification.id)}
      className={`mb-3 ${notification.read ? 'opacity-75' : ''}`}
    >
      <ThemedCard className="p-4">
        <View className="flex-row items-start">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: notification.color + '20' }}
          >
            <Ionicons 
              name={notification.icon as any} 
              size={20} 
              color={notification.color} 
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <ThemedText className="font-semibold flex-1">
                {notification.title}
              </ThemedText>
              {!notification.read && (
                <View className="w-2 h-2 bg-burgundy rounded-full ml-2" />
              )}
            </View>
            <ThemedText variant="secondary" className="mb-2">
              {notification.message}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {notification.time}
            </ThemedText>
          </View>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Notifications
          </ThemedText>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          {/* Today Section */}
          {todayNotifications.length > 0 && (
            <View className="py-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="notifications" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold ml-2">TODAY</ThemedText>
              </View>
              {todayNotifications.map(renderNotification)}
            </View>
          )}

          {/* Yesterday Section */}
          {yesterdayNotifications.length > 0 && (
            <View className="py-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="time" size={20} color={BrandColors.secondary} />
                <ThemedText className="font-bold ml-2">YESTERDAY</ThemedText>
              </View>
              {yesterdayNotifications.map(renderNotification)}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-4 py-6">
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-surface dark:bg-darkSurface px-6 py-3 rounded-lg border border-border dark:border-darkBorder"
            >
              <ThemedText className="text-secondary">Mark all as read</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(driver)/notifications')}
              className="bg-burgundy px-6 py-3 rounded-lg"
            >
              <ThemedText className="text-white font-semibold">Settings</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}