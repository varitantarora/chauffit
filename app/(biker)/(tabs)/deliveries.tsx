import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function DriverPickupsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title">Driver Pickups</ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Manage your driver pickup tasks
            </ThemedText>
          </View>
          
          {/* Tabs */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setActiveTab('active')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'active' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'active' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Active
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('completed')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'completed' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'completed' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Completed
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Pickups List */}
          <View className="px-6">
            {activeTab === 'active' ? (
              <>
                {/* Active Pickup 1 */}
                <ThemedCard className="mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-orange-500/10 px-3 py-1 rounded-full">
                      <ThemedText className="text-orange-500 text-xs font-semibold">
                        IN PROGRESS
                      </ThemedText>
                    </View>
                    <ThemedText className="font-bold text-primary">₹125.00</ThemedText>
                  </View>
                  
                  <ThemedText className="font-bold text-lg mb-2">Driver Pickup #4521</ThemedText>
                  
                  <View className="space-y-2 mb-3">
                    <View className="flex-row items-start">
                      <Ionicons name="location" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP LOCATION</ThemedText>
                        <ThemedText>Sector 15, Gurgaon - Driver Home</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="navigate" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DESTINATION</ThemedText>
                        <ThemedText>Cyber Hub, DLF Phase 3</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <ThemedText variant="caption">Driver: Amit Sharma</ThemedText>
                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
                      <ThemedText className="text-white font-semibold">Navigate</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
                
                {/* Active Pickup 2 */}
                <ThemedCard className="mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-blue-500/10 px-3 py-1 rounded-full">
                      <ThemedText className="text-blue-500 text-xs font-semibold">
                        PICKUP READY
                      </ThemedText>
                    </View>
                    <ThemedText className="font-bold text-primary">₹180.00</ThemedText>
                  </View>
                  
                  <ThemedText className="font-bold text-lg mb-2">Driver Pickup #7892</ThemedText>
                  
                  <View className="space-y-2 mb-3">
                    <View className="flex-row items-start">
                      <Ionicons name="location" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP LOCATION</ThemedText>
                        <ThemedText>MG Road Metro Station</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="navigate" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DESTINATION</ThemedText>
                        <ThemedText>Sushant Lok, Gurgaon</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <ThemedText variant="caption">Driver: Rajesh Kumar</ThemedText>
                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
                      <ThemedText className="text-white font-semibold">Start Pickup</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
              </>
            ) : (
              <>
                {/* Completed Pickups */}
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Driver Pickup #4520</ThemedText>
                      <ThemedText variant="caption">Completed 2 hours ago</ThemedText>
                      <ThemedText variant="caption">Sector 56 → Cyber Hub</ThemedText>
                    </View>
                    <ThemedText className="font-bold">₹95.00</ThemedText>
                  </View>
                </ThemedCard>
                
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Driver Pickup #7891</ThemedText>
                      <ThemedText variant="caption">Completed 3 hours ago</ThemedText>
                      <ThemedText variant="caption">Dwarka → Airport</ThemedText>
                    </View>
                    <ThemedText className="font-bold">₹160.00</ThemedText>
                  </View>
                </ThemedCard>
                
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Driver Pickup #2341</ThemedText>
                      <ThemedText variant="caption">Completed 4 hours ago</ThemedText>
                      <ThemedText variant="caption">Noida → Gurgaon</ThemedText>
                    </View>
                    <ThemedText className="font-bold">₹220.00</ThemedText>
                  </View>
                </ThemedCard>
              </>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}