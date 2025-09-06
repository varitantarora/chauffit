import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function RideRequestsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="h1">Ride Requests</ThemedText>
            <ThemedText variant="small" className="mt-1">
              Manage your ride requests
            </ThemedText>
          </View>
          
          {/* Tabs */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setActiveTab('pending')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'pending' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'pending' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Pending
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('accepted')}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === 'accepted' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === 'accepted' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Accepted
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Requests List */}
          <View className="px-6">
            {activeTab === 'pending' ? (
              <>
                {/* Pending Request 1 */}
                <ThemedCard variant="premium" className="mb-4">
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <ThemedText variant="h3">Airport Pickup</ThemedText>
                      <ThemedText className="text-secondary font-bold">₹2,850</ThemedText>
                    </View>
                    <ThemedText variant="tiny">In 2 hours • 25 km</ThemedText>
                  </View>
                  
                  <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
                    <View className="flex-row items-start mb-2">
                      <Ionicons name="location" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP</ThemedText>
                        <ThemedText>Sector 29, Cyber Hub, Gurgaon</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="navigate" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DROPOFF</ThemedText>
                        <ThemedText>IGI Airport Terminal 3, Delhi</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row space-x-3">
                    <TouchableOpacity className="flex-1 mr-2">
                      <View className="bg-secondary/10 border border-secondary py-3 rounded-lg">
                        <ThemedText className="text-center text-secondary font-semibold">
                          Decline
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 ml-2">
                      <View className="bg-primary py-3 rounded-lg">
                        <ThemedText className="text-center text-white font-semibold">
                          Accept
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
                
                {/* Pending Request 2 */}
                <ThemedCard variant="premium" className="mb-4">
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <ThemedText className="font-bold text-lg">Business Meeting</ThemedText>
                      <ThemedText className="text-primary font-bold">$45</ThemedText>
                    </View>
                    <ThemedText variant="caption">In 4 hours " 12 km</ThemedText>
                  </View>
                  
                  <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
                    <View className="flex-row items-start mb-2">
                      <Ionicons name="location" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP</ThemedText>
                        <ThemedText>Hotel Grand Plaza</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="navigate" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DROPOFF</ThemedText>
                        <ThemedText>Corporate Tower, Financial District</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row space-x-3">
                    <TouchableOpacity className="flex-1 mr-2">
                      <View className="bg-secondary/10 border border-secondary py-3 rounded-lg">
                        <ThemedText className="text-center text-secondary font-semibold">
                          Decline
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 ml-2">
                      <View className="bg-primary py-3 rounded-lg">
                        <ThemedText className="text-center text-white font-semibold">
                          Accept
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
              </>
            ) : (
              <>
                {/* Accepted Request */}
                <ThemedCard variant="premium" className="mb-4">
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <ThemedText className="font-bold text-lg">Evening Pickup</ThemedText>
                      <ThemedText className="text-primary font-bold">$65</ThemedText>
                    </View>
                    <ThemedText variant="caption">Tomorrow, 7:00 PM " 18 km</ThemedText>
                  </View>
                  
                  <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
                    <View className="flex-row items-start mb-2">
                      <Ionicons name="location" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">PICKUP</ThemedText>
                        <ThemedText>Residence Gardens, Apt 402</ThemedText>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="navigate" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DROPOFF</ThemedText>
                        <ThemedText>City Opera House</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center bg-green-500/10 p-3 rounded-lg">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <ThemedText className="ml-2 text-green-600 font-semibold">
                      Accepted - Scheduled
                    </ThemedText>
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