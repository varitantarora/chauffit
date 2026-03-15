import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { BookingCard } from '../../../components/customer/BookingCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import BookingApiService, { CustomerRide } from '../../../services/api/BookingApiService';
import RazorpayService from '../../../services/RazorpayService';
import { BrandColors } from '../../../constants/Colors';

type TabType = 'all' | 'active' | 'completed' | 'cancelled';

interface MappedBooking {
  id: string;
  customerId: string;
  chauffeurId: string;
  chauffeurName: string;
  driverRating?: number;
  driverType?: string;
  trainingStatus?: string | null;
  trainingStatusDisplay?: string | null;
  driverTier?: string | null;
  duration: string;
  carId: string;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  startTime: Date;
  endTime: Date | undefined;
  price: number;
  totalAmount: number;
  status: any;
  paymentMethod: string;
  paymentStatus: string;
  vehicleType: string;
  createdAt: Date;
  updatedAt: Date;
  loyaltyDiscountPct?: number;
}

// Map API booking to store booking format
const mapApiBookingToStore = (apiBooking: CustomerRide): MappedBooking => {
  // Backend sends driver info under driver_details (from BookingDetailSerializer)
  // driver_details has: id, name, mobile, overall_rating, total_rides
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverDetails: any = apiBooking.driver_details || apiBooking.driver || null;

  // Resolve driver name - driver_details uses `name`, DriverInfo uses `full_name`
  const driverName: string | null = driverDetails?.name || driverDetails?.full_name || null;
  // Resolve driver rating - driver_details uses `overall_rating`, DriverInfo uses `average_rating`
  const driverRating: number | undefined =
    driverDetails?.overall_rating != null ? Number(driverDetails.overall_rating)
    : driverDetails?.average_rating != null ? Number(driverDetails.average_rating)
    : undefined;

  return {
    id: apiBooking.id,
    customerId: apiBooking.id, // apiBooking doesn't have customerId, using id as placeholder
    chauffeurId: driverDetails?.id || '',
    chauffeurName: driverName || 'Finding driver...',
    driverRating: driverRating != null ? Number(driverRating) : undefined,
    driverType: apiBooking.car?.vehicle_type || apiBooking.trip_type,
    trainingStatus: driverDetails?.training_status ?? null,
    trainingStatusDisplay: driverDetails?.training_status_display ?? null,
    driverTier: driverDetails?.driver_tier ?? null,
    duration: apiBooking.trip_type,
    pickupLocation: {
      address: apiBooking.pickup_address,
      latitude: apiBooking.pickup_lat,
      longitude: apiBooking.pickup_long,
    },
    dropLocation: {
      address: apiBooking.dropoff_address,
      latitude: apiBooking.dropoff_lat,
      longitude: apiBooking.dropoff_long,
    },
    startTime: new Date(apiBooking.created_at),
    endTime: apiBooking.scheduled_at ? new Date(apiBooking.scheduled_at) : undefined,
    price: parseFloat(apiBooking.estimated_fare || '0'),
    totalAmount: parseFloat(apiBooking.estimated_fare || '0'),
    status: apiBooking.booking_status,
    paymentMethod: 'upi', // Using default since not in CustomerRide
    paymentStatus: apiBooking.payment_status,
    vehicleType: 'luxury_sedan', // Would come from car details
    carId: apiBooking.car?.id || '',
    createdAt: new Date(apiBooking.created_at),
    updatedAt: apiBooking.updated_at ? new Date(apiBooking.updated_at) : new Date(apiBooking.created_at),
    loyaltyDiscountPct: apiBooking.loyalty_discount_pct,
  };
};

// Status mapping for tab filtering
const getTabStatuses = (tab: TabType): string[] | null => {
  switch (tab) {
    case 'active':
      // Active rides: from request to trip started
      return ['requested', 'driver_assigned', 'biker_assigned', 'driver_en_route', 'driver_arrived', 'trip_started'];
    case 'completed':
      // Successfully completed rides
      return ['trip_completed'];
    case 'cancelled':
      // All cancelled rides regardless of who cancelled
      return ['cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'];
    default:
      return null; // All bookings - no filter
  }
};

// Get display label for booking status
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'requested': 'Finding Chauffeur',
    'driver_assigned': 'Chauffeur Assigned',
    'biker_assigned': 'Biker Assigned',
    'driver_en_route': 'Chauffeur En Route',
    'driver_arrived': 'Chauffeur Arrived',
    'trip_started': 'Trip In Progress',
    'trip_completed': 'Completed',
    'cancelled_by_customer': 'Cancelled',
    'cancelled_by_driver': 'Cancelled by Driver',
    'cancelled_by_system': 'Cancelled by System',
  };
  return statusMap[status] || status;
};

export default function HistoryScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [bookings, setBookings] = useState<MappedBooking[]>([]);

  const router = useRouter();

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;

  // Fetch bookings from API
  const fetchBookings = useCallback(async (tab: TabType) => {
    setLoading(true);
    try {
      const statuses = getTabStatuses(tab);

      if (tab === 'all') {
        // Fetch all bookings - no status filter
        const response = await BookingApiService.listRides();
        if (response.success && response.data) {
          const mappedBookings = response.data.map(mapApiBookingToStore);
          setBookings(mappedBookings);
        } else {
          setBookings([]);
        }
      } else if (statuses) {
        // For filtered tabs, we need to fetch with individual status filters
        // since API only supports one status at a time
        const allBookings: CustomerRide[] = [];

        // Fetch for each status and merge results
        for (const status of statuses) {
          const response = await BookingApiService.listRides(status as any);
          if (response.success && response.data) {
            allBookings.push(...response.data);
          }
        }

        // Remove duplicates by ID and map
        const uniqueBookings = Array.from(
          new Map(allBookings.map(b => [b.id, b])).values()
        );
        const mappedBookings = uniqueBookings.map(mapApiBookingToStore);
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab, fetchBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings(activeTab);
    setRefreshing(false);
  }, [activeTab, fetchBookings]);

  const handleBookingPress = (booking: MappedBooking) => {
    // Navigate to ride details on card press
    router.push({
      pathname: '/(customer)/ride-details',
      params: { bookingId: booking.id }
    });
  };

  const handleTrackRide = (booking: MappedBooking) => {
    router.push({
      pathname: '/(customer)/ride/tracking',
      params: { bookingId: booking.id }
    });
  };

  const handleViewDetails = (booking: MappedBooking) => {
    router.push({
      pathname: '/(customer)/ride-details',
      params: { bookingId: booking.id }
    });
  };

  const handlePayNow = async (booking: MappedBooking) => {
    const user = useAuthStore.getState().user;
    try {
      const totalWithGst = booking.totalAmount * 1.18;
      const result = await RazorpayService.processPayment(
        booking.id,
        totalWithGst,
        {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }
      );

      if (result.success) {
        Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
        await fetchBookings(activeTab);
      } else {
        if (result.error !== 'Payment was cancelled') {
          Alert.alert('Payment Failed', result.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const handleCancelBooking = async (booking: MappedBooking) => {
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
              const response = await BookingApiService.cancelRide(booking.id);
              if (response.success) {
                Alert.alert('Success', 'Booking has been cancelled');
                // Refresh bookings
                await fetchBookings(activeTab);
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel booking');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return isActive ? (
      <View className="flex-1 py-3 rounded-lg bg-burgundy">
        <ThemedText className="text-center font-semibold text-white">{label}</ThemedText>
      </View>
    ) : (
      <TouchableOpacity onPress={() => setActiveTab(tab)} className="flex-1 py-3 rounded-lg">
        <ThemedText className="text-center font-semibold text-textSecondary dark:text-darkTextSecondary">{label}</ThemedText>
      </TouchableOpacity>
    );
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'active':
        return { title: 'No Active Bookings', subtitle: 'No bookings found in active category' };
      case 'completed':
        return { title: 'No Completed Rides', subtitle: 'No bookings found in completed category' };
      case 'cancelled':
        return { title: 'No Cancelled Bookings', subtitle: 'No bookings found in cancelled category' };
      default:
        return { title: 'No Bookings Yet', subtitle: 'Start your first journey with Chauffit premium service' };
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        {/* Burgundy Header */}
        <View
          style={{
            backgroundColor: '#541201',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: '#541201',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <ThemedText
            style={{ color: '#ffffff', fontSize: 22, fontWeight: '800' }}
          >
            Trips
          </ThemedText>
          <ThemedText
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}
          >
            Your ride history & active trips
          </ThemedText>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 py-4">
          <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
            {renderTabButton('all', 'All')}
            {renderTabButton('active', 'Active')}
            {renderTabButton('completed', 'Completed')}
            {renderTabButton('cancelled', 'Cancelled')}
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
              colors={[BrandColors.secondary]}
              tintColor={BrandColors.secondary}
            />
          }
        >
          <View className="px-6">
            {loading ? (
              <View className="items-center py-16">
                <Ionicons name="car" size={40} color={iconColor} />
                <ThemedText className="mt-4 text-textSecondary dark:text-darkTextSecondary">Loading bookings...</ThemedText>
              </View>
            ) : bookings.length > 0 ? (
              bookings
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPress={() => handleBookingPress(booking)}
                    onTrack={() => handleTrackRide(booking)}
                    onViewDetails={() => handleViewDetails(booking)}
                    onCancel={() => handleCancelBooking(booking)}
                    onPayNow={() => handlePayNow(booking)}
                    loyaltyDiscountPct={booking.loyaltyDiscountPct}
                  />
                ))
            ) : (
              <View className="items-center py-16">
                <View className="w-20 h-20 bg-textSecondary/20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="car" size={40} color={iconColor} />
                </View>
                <ThemedText variant="h3" className="text-center mb-2">
                  {getEmptyStateMessage().title}
                </ThemedText>
                <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary px-8 mb-6">
                  {getEmptyStateMessage().subtitle}
                </ThemedText>

                {activeTab === 'all' && (
                  <TouchableOpacity
                    onPress={() => router.push('/(customer)/book-ride-new')}
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

        {/* Floating Action Button with Glass-morph */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={() => router.push('/(customer)/book-ride-new')}
            activeOpacity={0.8}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              overflow: 'hidden',
              shadowColor: BrandColors.burgundy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <BlurView
              intensity={80}
              tint={isDarkMode ? 'dark' : 'light'}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(114,12,23,0.85)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 30,
                }}
              >
                <Ionicons name="add" size={28} color="white" />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
