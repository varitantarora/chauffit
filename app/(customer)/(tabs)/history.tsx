import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function HistoryScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'cancelled'>('all');

  const iconColor = isDarkMode ? '#BD8C5E' : '#720C17';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const rides = [
    {
      id: '1',
      type: 'Airport Transfer',
      date: '2024-01-15',
      time: '09:00 AM',
      from: 'Cyber Hub, DLF Phase 3',
      to: 'IGI Airport Terminal 3',
      status: 'completed',
      fare: '₹2,850',
      rating: 5,
      chauffeur: 'Rajesh Kumar'
    },
    {
      id: '2',
      type: 'Business Meeting',
      date: '2024-01-10',
      time: '02:30 PM',
      from: 'Hotel Oberoi, MG Road',
      to: 'Unitech Cyber Park',
      status: 'completed',
      fare: '₹1,500',
      rating: 4,
      chauffeur: 'Priya Sharma'
    },
    {
      id: '3',
      type: 'City Tour',
      date: '2024-01-08',
      time: '10:00 AM',
      from: 'DLF Mall, Phase 3',
      to: 'Multiple Stops',
      status: 'completed',
      fare: '₹8,000',
      rating: 5,
      chauffeur: 'Amit Singh'
    },
    {
      id: '4',
      type: 'Wedding Service',
      date: '2024-01-05',
      time: '03:00 PM',
      from: 'The Leela Ambience',
      to: 'Kingdom of Dreams',
      status: 'cancelled',
      fare: '₹6,500',
      rating: 0,
      chauffeur: 'Vikram Gupta'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'time';
    }
  };

  const filteredRides = rides.filter(ride => {
    if (activeTab === 'all') return true;
    return ride.status === activeTab;
  });

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons 
            key={star} 
            name={star <= rating ? "star" : "star-outline"} 
            size={12} 
            color="#fbbf24" 
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border dark:border-darkBorder">
          <ThemedText variant="h1">Ride History</ThemedText>
          <ThemedText variant="small" className="mt-1">
            View your past and upcoming rides
          </ThemedText>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 py-4">
          <View className="flex-row bg-background dark:bg-darkSurface rounded-xl p-1 border border-border dark:border-darkBorder">
            {[
              { key: 'all', label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === tab.key ? 'bg-burgundy' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    activeTab === tab.key ? 'text-white font-semibold' : ''
                  }`}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rides List */}
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="px-6">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => (
                <ThemedCard key={ride.id} className="mb-4 p-4">
                  {/* Header */}
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <ThemedText className="font-bold text-lg">{ride.type}</ThemedText>
                      <ThemedText variant="caption">
                        {new Date(ride.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {ride.time}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        <Ionicons 
                          name={getStatusIcon(ride.status) as any} 
                          size={16} 
                          color={getStatusColor(ride.status)} 
                        />
                        <ThemedText 
                          className="ml-1 text-xs font-semibold capitalize"
                          style={{ color: getStatusColor(ride.status) }}
                        >
                          {ride.status}
                        </ThemedText>
                      </View>
                      <ThemedText className="font-bold text-primary">{ride.fare}</ThemedText>
                    </View>
                  </View>

                  {/* Route */}
                  <View className="space-y-2 mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#10b981" />
                      <ThemedText variant="secondary" className="ml-2 flex-1">
                        From: {ride.from}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={16} color="#ef4444" />
                      <ThemedText variant="secondary" className="ml-2 flex-1">
                        To: {ride.to}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Bottom Section */}
                  <View className="flex-row justify-between items-center pt-3 border-t border-border dark:border-darkBorder">
                    <View>
                      <ThemedText variant="caption">Chauffeur</ThemedText>
                      <ThemedText className="font-semibold">{ride.chauffeur}</ThemedText>
                    </View>
                    
                    {ride.status === 'completed' && (
                      <View className="items-end">
                        <ThemedText variant="caption">Your Rating</ThemedText>
                        {renderStars(ride.rating)}
                      </View>
                    )}
                    
                    {ride.status === 'cancelled' && (
                      <TouchableOpacity className="bg-primary/10 px-3 py-1 rounded">
                        <ThemedText className="text-primary text-sm">Rebook</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </ThemedCard>
              ))
            ) : (
              <View className="items-center py-12">
                <Ionicons name="car" size={64} color={iconColor} />
                <ThemedText variant="title" className="mt-4 mb-2">
                  No rides found
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  No rides match your current filter.{'\n'}Try selecting a different filter.
                </ThemedText>
              </View>
            )}
          </View>
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}