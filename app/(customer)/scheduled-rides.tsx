import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface ScheduledRide {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  vehicle: string;
  driver: string;
  driverRating: number;
  estimatedFare: number;
  duration: number;
  type: 'one-way' | 'round-trip' | 'hourly';
  stops: number;
  status: 'confirmed' | 'driver_assigned' | 'pending_driver';
  waitTime?: number;
}

export default function ScheduledRidesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';

  const upcomingRides: ScheduledRide[] = [
    {
      id: '1',
      date: 'Tomorrow',
      time: '8:00 AM',
      from: '🏠 Home',
      to: '🏢 Downtown Office',
      vehicle: 'BMW X5',
      driver: 'Marcus R.',
      driverRating: 4.9,
      estimatedFare: 650,
      duration: 45,
      type: 'one-way',
      stops: 0,
      status: 'confirmed',
    },
    {
      id: '2',
      date: 'Friday',
      time: '6:30 PM',
      from: '🏢 Office',
      to: '✈️ Airport',
      vehicle: 'Tesla Model S',
      driver: 'Jennifer L.',
      driverRating: 4.8,
      estimatedFare: 1200,
      duration: 60,
      type: 'one-way',
      stops: 1,
      status: 'driver_assigned',
    },
    {
      id: '3',
      date: 'Saturday',
      time: '2:00 PM',
      from: '🏠 Home',
      to: '🍽️ Restaurant',
      vehicle: 'BMW X5',
      driver: 'TBD',
      driverRating: 0,
      estimatedFare: 800,
      duration: 120,
      type: 'round-trip',
      stops: 0,
      status: 'pending_driver',
      waitTime: 2,
    },
  ];

  const rideHistory: ScheduledRide[] = [
    {
      id: '4',
      date: 'Last Monday',
      time: '9:00 AM',
      from: '🏠 Home',
      to: '🏥 Medical Center',
      vehicle: 'BMW X5',
      driver: 'Sarah P.',
      driverRating: 4.7,
      estimatedFare: 450,
      duration: 30,
      type: 'one-way',
      stops: 0,
      status: 'confirmed',
    },
  ];

  const currentRides = activeTab === 'upcoming' ? upcomingRides : rideHistory;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'driver_assigned': return 'text-blue-600';
      case 'pending_driver': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'driver_assigned': return 'Driver assigned';
      case 'pending_driver': return 'Pending driver';
      default: return status;
    }
  };

  const handleEdit = (rideId: string) => {
    Alert.alert('Edit Ride', `Edit functionality for ride ${rideId} would be implemented here.`);
  };

  const handleCancel = (rideId: string) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this scheduled ride?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Ride Cancelled', 'Your scheduled ride has been cancelled.');
          }
        }
      ]
    );
  };

  const handleViewDetails = (rideId: string) => {
    Alert.alert('View Details', `View details for ride ${rideId} would be implemented here.`);
  };

  const handleScheduleNew = () => {
    router.push('/(customer)/schedule');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Scheduled Rides</ThemedText>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 py-4">
          <View className={`flex-row rounded-xl p-1 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-gray-100'
          }`}>
            <TouchableOpacity
              onPress={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 rounded-lg ${
                activeTab === 'upcoming' ? 'bg-burgundy' : ''
              }`}
            >
              <ThemedText 
                className={`text-center font-semibold ${
                  activeTab === 'upcoming' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Upcoming
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              className={`flex-1 py-3 rounded-lg ${
                activeTab === 'history' ? 'bg-burgundy' : ''
              }`}
            >
              <ThemedText 
                className={`text-center font-semibold ${
                  activeTab === 'history' ? 'text-white' : 'text-gray-600'
                }`}
              >
                History
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rides List */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6">
            {currentRides.length > 0 ? (
              currentRides.map((ride) => (
                <ThemedCard key={ride.id} variant="elevated" className="mb-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <ThemedText variant="h3">📅 {ride.date} • {ride.time}</ThemedText>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      ride.status === 'confirmed' ? 'bg-green-100' :
                      ride.status === 'driver_assigned' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      <ThemedText variant="small" className={getStatusColor(ride.status)}>
                        {getStatusText(ride.status)}
                      </ThemedText>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <ThemedText className="text-lg">{ride.from} → {ride.to}</ThemedText>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <ThemedText variant="small" className="text-gray-600">
                      {ride.vehicle} • {ride.driver}
                      {ride.driverRating > 0 && (
                        <>
                          {' ('}
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          {ride.driverRating})
                        </>
                      )}
                    </ThemedText>
                  </View>

                  <View className="flex-row justify-between items-center mb-3">
                    <ThemedText variant="small" className="text-gray-600">
                      Est. ₹{ride.estimatedFare} • {ride.duration} minutes
                    </ThemedText>
                    <ThemedText variant="small" className="text-gray-600">
                      {ride.type === 'round-trip' ? 'Round-trip' : 
                       ride.type === 'hourly' ? 'Hourly' : 'One-way'}
                      {ride.stops > 0 && ` • ${ride.stops} stop${ride.stops > 1 ? 's' : ''}`}
                      {ride.waitTime && ` • Wait time: ${ride.waitTime} hours`}
                    </ThemedText>
                  </View>

                  <View className="flex-row justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <TouchableOpacity 
                      onPress={() => handleEdit(ride.id)}
                      className="px-4 py-2"
                    >
                      <ThemedText variant="small" className="text-burgundy">Edit</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => handleCancel(ride.id)}
                      className="px-4 py-2"
                    >
                      <ThemedText variant="small" className="text-red-600">Cancel</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => handleViewDetails(ride.id)}
                      className="px-4 py-2"
                    >
                      <ThemedText variant="small" className="text-burgundy">View Details</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedCard>
              ))
            ) : (
              <View className="items-center py-16">
                <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                  <Ionicons name="calendar" size={40} color={iconColor} />
                </View>
                <ThemedText variant="h3" className="text-center mb-2">
                  {activeTab === 'upcoming' ? 'No Upcoming Rides' : 'No Ride History'}
                </ThemedText>
                <ThemedText variant="small" className="text-center text-gray-600 mb-6">
                  {activeTab === 'upcoming' 
                    ? 'Schedule your first ride for later'
                    : 'Your past scheduled rides will appear here'
                  }
                </ThemedText>
                
                {activeTab === 'upcoming' && (
                  <PrimaryButton
                    title="Schedule New Ride"
                    onPress={handleScheduleNew}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        {currentRides.length > 0 && (
          <View className="px-6 py-4">
            <PrimaryButton
              title="+ Schedule New Ride"
              onPress={handleScheduleNew}
            />
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}