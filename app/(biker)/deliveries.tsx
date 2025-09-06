import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function DeliveriesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="title">Deliveries</ThemedText>
            <ThemedText variant="secondary" className="mt-1">
              Manage your delivery tasks
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
          
          {/* Deliveries List */}
          <View className="px-6">
            {activeTab === 'active' ? (
              <>
                {/* Active Delivery 1 */}
                <ThemedCard className="mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-orange-500/10 px-3 py-1 rounded-full">
                      <ThemedText className="text-orange-500 text-xs font-semibold">
                        IN PROGRESS
                      </ThemedText>
                    </View>
                    <ThemedText className="font-bold text-primary">$12.50</ThemedText>
                  </View>
                  
                  <ThemedText className="font-bold text-lg mb-2">Restaurant Order #4521</ThemedText>
                  
                  <View className="space-y-2 mb-3">
                    <View className="flex-row items-start">
                      <Ionicons name="restaurant" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP</ThemedText>
                        <ThemedText>Italian Kitchen - 123 Food Street</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="home" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DELIVERY</ThemedText>
                        <ThemedText>456 Oak Avenue, Apt 12B</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <ThemedText variant="caption">Customer: John D.</ThemedText>
                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
                      <ThemedText className="text-white font-semibold">Navigate</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
                
                {/* Active Delivery 2 */}
                <ThemedCard className="mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-blue-500/10 px-3 py-1 rounded-full">
                      <ThemedText className="text-blue-500 text-xs font-semibold">
                        PICKUP READY
                      </ThemedText>
                    </View>
                    <ThemedText className="font-bold text-primary">$8.00</ThemedText>
                  </View>
                  
                  <ThemedText className="font-bold text-lg mb-2">Package Delivery #7892</ThemedText>
                  
                  <View className="space-y-2 mb-3">
                    <View className="flex-row items-start">
                      <Ionicons name="cube" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP</ThemedText>
                        <ThemedText>QuickMart - Downtown Branch</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="business" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DELIVERY</ThemedText>
                        <ThemedText>Office Tower, Floor 15</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <ThemedText variant="caption">Customer: Sarah M.</ThemedText>
                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
                      <ThemedText className="text-white font-semibold">Start Pickup</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
              </>
            ) : (
              <>
                {/* Completed Deliveries */}
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Food Delivery #4520</ThemedText>
                      <ThemedText variant="caption">Completed " 2 hours ago</ThemedText>
                      <ThemedText variant="caption">Pizza Palace ’ Riverside Apt</ThemedText>
                    </View>
                    <ThemedText className="font-bold">$9.50</ThemedText>
                  </View>
                </ThemedCard>
                
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Package #7891</ThemedText>
                      <ThemedText variant="caption">Completed " 3 hours ago</ThemedText>
                      <ThemedText variant="caption">Pharmacy ’ Customer Home</ThemedText>
                    </View>
                    <ThemedText className="font-bold">$6.00</ThemedText>
                  </View>
                </ThemedCard>
                
                <ThemedCard className="mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-green-500/10 p-2 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3 flex-1">
                      <ThemedText className="font-semibold">Grocery Delivery #2341</ThemedText>
                      <ThemedText variant="caption">Completed " 4 hours ago</ThemedText>
                      <ThemedText variant="caption">SuperMart ’ Green Valley</ThemedText>
                    </View>
                    <ThemedText className="font-bold">$11.00</ThemedText>
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