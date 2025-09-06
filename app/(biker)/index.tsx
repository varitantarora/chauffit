import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function BikerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [isOnline, setIsOnline] = useState(false);
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText variant="title">
                  Hello, {user?.name || 'Biker'}
                </ThemedText>
                <ThemedText variant="secondary" className="mt-1">
                  {isOnline ? 'Ready for deliveries' : 'You are offline'}
                </ThemedText>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: '#767577', true: '#bd8c5e' }}
                thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* Stats Overview */}
          <View className="px-6 mb-6">
            <ThemedCard>
              <View className="flex-row justify-around py-2">
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">24</ThemedText>
                  <ThemedText variant="caption">Today's Deliveries</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">₹6,000</ThemedText>
                  <ThemedText variant="caption">Today's Earnings</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText variant="title" className="text-2xl">4.8</ThemedText>
                  <ThemedText variant="caption">Rating</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>
          
          {/* Available Deliveries */}
          <View className="px-6 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Available Deliveries
            </ThemedText>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Restaurant Pickup</ThemedText>
                  <ThemedText variant="caption">2.5 km away " Est. 15 min</ThemedText>
                </View>
                <ThemedText className="font-bold text-primary">₹285</ThemedText>
              </View>
              <TouchableOpacity className="bg-primary/10 py-2 rounded-lg mt-2">
                <ThemedText className="text-center text-primary font-semibold">
                  Accept Delivery
                </ThemedText>
              </TouchableOpacity>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <ThemedText className="font-semibold">Package Delivery</ThemedText>
                  <ThemedText variant="caption">1.8 km away " Est. 10 min</ThemedText>
                </View>
                <ThemedText className="font-bold text-primary">₹200</ThemedText>
              </View>
              <TouchableOpacity className="bg-primary/10 py-2 rounded-lg mt-2">
                <ThemedText className="text-center text-primary font-semibold">
                  Accept Delivery
                </ThemedText>
              </TouchableOpacity>
            </ThemedCard>
          </View>
          
          {/* Recent Activity */}
          <View className="px-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Recent Deliveries
            </ThemedText>
            
            <ThemedCard className="mb-3">
              <View className="flex-row items-center">
                <View className="bg-green-500/10 p-2 rounded-full">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View className="ml-3 flex-1">
                  <ThemedText className="font-semibold">Food Delivery</ThemedText>
                  <ThemedText variant="caption">Completed " 30 min ago</ThemedText>
                </View>
                <ThemedText className="font-bold">₹250</ThemedText>
              </View>
            </ThemedCard>
            
            <ThemedCard className="mb-3">
              <View className="flex-row items-center">
                <View className="bg-green-500/10 p-2 rounded-full">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View className="ml-3 flex-1">
                  <ThemedText className="font-semibold">Document Pickup</ThemedText>
                  <ThemedText variant="caption">Completed " 1 hour ago</ThemedText>
                </View>
                <ThemedText className="font-bold">₹170</ThemedText>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}