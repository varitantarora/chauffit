import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { BookingCard } from '../../../components/customer/BookingCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  
  const { activeBookings, bookingHistory, cancelBooking } = useBookingStore();
  const router = useRouter();

  const iconColor = isDarkMode ? '#BD8C5E' : '#720C17';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, this would refresh data from the server
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const allBookings = [...activeBookings, ...bookingHistory];
  
  const filteredBookings = allBookings.filter(booking => {
    switch (activeTab) {
      case 'active':
        return booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'in_progress';
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const handleBookingPress = (booking: any) => {
    if (booking.status === 'in_progress' || booking.status === 'confirmed') {
      router.push({
        pathname: '/(customer)/ride/tracking',
        params: { bookingId: booking.id }
      });
    }
  };

  const handleTrackRide = (booking: any) => {
    router.push({
      pathname: '/(customer)/ride/tracking',
      params: { bookingId: booking.id }
    });
  };

  const handleCancelBooking = (booking: any) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation charges may apply.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking.id);
              Alert.alert('Success', 'Booking has been cancelled');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <ThemedText variant="h1">Bookings</ThemedText>
          <ThemedText variant="small" className="mt-1 text-textSecondary">
            Manage your rides and view history
          </ThemedText>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 py-4">
          <View className={`flex-row rounded-xl p-1 border ${
            isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-surface border-border'
          }`}>
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
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
                  variant="small"
                  className={`text-center font-semibold ${
                    activeTab === tab.key ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bookings List */}
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#BD8C5E']}
              tintColor="#BD8C5E"
            />
          }
        >
          <View className="px-6">
            {filteredBookings.length > 0 ? (
              filteredBookings
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPress={() => handleBookingPress(booking)}
                    onTrack={() => handleTrackRide(booking)}
                    onCancel={() => handleCancelBooking(booking)}
                  />
                ))
            ) : (
              <View className="items-center py-16">
                <View className="w-20 h-20 bg-textSecondary/20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="car" size={40} color={iconColor} />
                </View>
                <ThemedText variant="h3" className="text-center mb-2">
                  {activeTab === 'active' && 'No Active Bookings'}
                  {activeTab === 'completed' && 'No Completed Rides'}
                  {activeTab === 'cancelled' && 'No Cancelled Bookings'}
                  {activeTab === 'all' && 'No Bookings Yet'}
                </ThemedText>
                <ThemedText variant="small" className="text-center text-textSecondary px-8 mb-6">
                  {activeTab === 'all' 
                    ? 'Start your first journey with Chauffit premium service'
                    : `No bookings found in ${activeTab} category`
                  }
                </ThemedText>
                
                {activeTab === 'all' && (
                  <TouchableOpacity
                    onPress={() => router.push('/(customer)/booking/select-duration')}
                    className="bg-burgundy px-6 py-3 rounded-xl"
                  >
                    <ThemedText className="text-white font-semibold">
                      Book Your First Ride
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={() => router.push('/(customer)/booking/select-duration')}
            className="w-14 h-14 bg-burgundy rounded-full items-center justify-center shadow-lg"
            style={{
              shadowColor: '#720C17',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}