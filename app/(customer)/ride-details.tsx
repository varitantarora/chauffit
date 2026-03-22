import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import BookingApiService, { CustomerRideDetail, BookingStatus, PaymentStatus } from '../../services/api/BookingApiService';
import RazorpayService from '../../services/RazorpayService';
import UniversalMapView, { MapMarker, MapRoute } from '../../components/shared/MapView';
import { BrandColors } from '../../constants/Colors';

// --- Helpers ---

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatMoney = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return 'NA';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return 'NA';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusConfig = (status: BookingStatus) => {
  switch (status) {
    case 'trip_completed':
      return { label: 'Completed', color: BrandColors.success, bgClass: 'bg-success/10', icon: 'checkmark-circle' as const };
    case 'trip_started':
      return { label: 'Trip In Progress', color: BrandColors.info, bgClass: 'bg-blue-500/10', icon: 'car' as const };
    case 'driver_en_route':
      return { label: 'Chauffeur En Route', color: BrandColors.warning, bgClass: 'bg-warning/10', icon: 'navigate' as const };
    case 'driver_arrived':
      return { label: 'Chauffeur Arrived', color: BrandColors.success, bgClass: 'bg-success/10', icon: 'checkmark-circle' as const };
    case 'driver_assigned':
    case 'biker_assigned':
      return { label: 'Chauffeur Assigned', color: BrandColors.success, bgClass: 'bg-success/10', icon: 'person' as const };
    case 'requested':
      return { label: 'Finding Chauffeur', color: BrandColors.warning, bgClass: 'bg-warning/10', icon: 'time' as const };
    case 'cancelled_by_customer':
    case 'cancelled_by_driver':
    case 'cancelled_by_system':
      return { label: 'Cancelled', color: BrandColors.danger, bgClass: 'bg-danger/10', icon: 'close-circle' as const };
    default:
      return { label: status, color: '#6B7280', bgClass: 'bg-secondary/10', icon: 'help-circle' as const };
  }
};

const getTripTypeLabel = (type: string) => {
  switch (type) {
    case 'one_way': return 'One Way';
    case 'round_trip': return 'Round Trip';
    case 'hourly_charter':
    case 'hourly': return 'Hourly Charter';
    default: return type;
  }
};

const formatTimelineEvent = (eventType: string): { label: string; icon: string } => {
  const map: Record<string, { label: string; icon: string }> = {
    'booking_created': { label: 'Booking Created', icon: 'add-circle' },
    'driver_assigned': { label: 'Chauffeur Assigned', icon: 'person-add' },
    'biker_assigned': { label: 'Biker Assigned', icon: 'bicycle' },
    'driver_en_route': { label: 'Chauffeur En Route', icon: 'navigate' },
    'driver_arrived': { label: 'Chauffeur Arrived', icon: 'location' },
    'trip_started': { label: 'Trip Started', icon: 'play-circle' },
    'trip_completed': { label: 'Trip Completed', icon: 'checkmark-circle' },
    'cancelled_by_customer': { label: 'Cancelled by Customer', icon: 'close-circle' },
    'cancelled_by_driver': { label: 'Cancelled by Driver', icon: 'close-circle' },
    'cancelled_by_system': { label: 'Cancelled by System', icon: 'close-circle' },
    'payment_completed': { label: 'Payment Completed', icon: 'card' },
  };
  return map[eventType] || { label: eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: 'ellipse' };
};

// --- Components ---

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">{label}</ThemedText>
      <ThemedText className={`font-semibold ${valueColor || ''}`}>{value}</ThemedText>
    </View>
  );
}

// --- Main Screen ---

export default function RideDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const amenitiesEnabled = getConfigValue('amenities_enabled') !== 'false';
  const insuranceEnabled = getConfigValue('insurance_enabled') === 'true';
  const user = useAuthStore((state) => state.user);

  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingNow, setPayingNow] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchRideDetails();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchRideDetails = async () => {
    setLoading(true);
    try {
      const response = await BookingApiService.getRideDetails(bookingId);
      if (response.success && response.data) {
        setRide(response.data);
      } else {
        setRide(null);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      setRide(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!ride) return;
    setPayingNow(true);
    try {
      const amount = parseFloat(ride.actual_fare || ride.estimated_fare || '0');
      const totalWithGst = amount * 1.18;
      const result = await RazorpayService.processPayment(
        ride.id,
        totalWithGst,
        {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }
      );

      if (result.success) {
        Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
        await fetchRideDetails();
      } else {
        if (result.error !== 'Payment was cancelled') {
          Alert.alert('Payment Failed', result.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setPayingNow(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BrandColors.secondary} />
          <ThemedText className="mt-4">Loading ride details...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // --- Error State ---
  if (!ride) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center p-6">
          <View className="bg-surface dark:bg-darkSurface p-4 rounded-full mb-4">
            <Ionicons name="document-text-outline" size={48} color="#6B7280" />
          </View>
          <ThemedText className="font-bold text-xl mb-2">Ride Not Found</ThemedText>
          <ThemedText variant="caption" className="text-center mb-6">
            The ride you're looking for doesn't exist or could not be loaded.
          </ThemedText>
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(ride.booking_status);
  const estimatedFare = parseFloat(ride.estimated_fare || '0');
  const actualFare = ride.actual_fare ? parseFloat(ride.actual_fare) : null;
  const displayFare = actualFare ?? estimatedFare;
  const gstAmount = displayFare * 0.18;
  const totalAmount = displayFare + gstAmount;
  const needsPayment = ride.booking_status === 'trip_completed' &&
    ride.payment_status !== 'completed' &&
    ride.payment_status !== 'refunded';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Ride Details
          </ThemedText>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View className={`${statusConfig.bgClass} p-4`}>
            <View className="flex-row items-center justify-center">
              <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
              <ThemedText className="font-bold text-lg ml-2" style={{ color: statusConfig.color }}>
                {statusConfig.label}
              </ThemedText>
            </View>
            <ThemedText variant="caption" className="text-center text-secondary mt-1">
              {formatDate(ride.created_at)}
            </ThemedText>
          </View>

          {/* 1. Route Details Card */}
          <View className="px-4 pt-4">
            <ThemedCard className="p-4 mb-4">
              <ThemedText variant="title" className="font-bold mb-4">
                Route Details
              </ThemedText>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="w-4 h-4 bg-success rounded-full mt-1 mr-3" />
                  <View className="flex-1">
                    <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                      PICKUP LOCATION
                    </ThemedText>
                    <ThemedText className="font-semibold">
                      {ride.pickup_address}
                    </ThemedText>
                  </View>
                </View>

                {ride.dropoff_address && (
                  <View className="flex-row items-start">
                    <View className="w-4 h-4 border-2 border-burgundy rounded-full mt-1 mr-3" />
                    <View className="flex-1">
                      <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                        DROP-OFF LOCATION
                      </ThemedText>
                      <ThemedText className="font-semibold">
                        {ride.dropoff_address}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </ThemedCard>
          </View>

          {/* 2. Driver Details Card */}
          {(ride.driver?.full_name || ride.driver_details?.name) && (
            <View className="px-4">
              <ThemedCard className="p-4 mb-4">
                <ThemedText variant="title" className="font-bold mb-3">
                  Driver Details
                </ThemedText>

                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                    <ThemedText className="font-bold text-secondary text-lg">
                      {(ride.driver_details?.name || ride.driver?.full_name || '?').charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-lg">
                      {ride.driver_details?.name || ride.driver?.full_name}
                    </ThemedText>
                    {/* Rating */}
                    {(() => {
                      const rating = ride.driver_details?.overall_rating ?? ride.driver?.average_rating;
                      return rating != null && rating > 0 ? (
                        <View className="flex-row items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= Math.round(rating!) ? 'star' : 'star-outline'}
                              size={14}
                              color="#fbbf24"
                            />
                          ))}
                          <ThemedText variant="caption" className="ml-2">
                            {rating!.toFixed(1)}
                          </ThemedText>
                        </View>
                      ) : null;
                    })()}
                  </View>
                </View>

                {/* Training Status & Tier badges */}
                {ride.driver_details && (ride.driver_details.training_status_display || ride.driver_details.driver_tier) && (
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {ride.driver_details.training_status_display && (
                      <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        <ThemedText variant="caption" className="text-blue-700 dark:text-blue-400 font-semibold">
                          {ride.driver_details.training_status_display}
                        </ThemedText>
                      </View>
                    )}
                    {ride.driver_details.driver_tier && (
                      <View className="bg-secondary/10 px-3 py-1 rounded-full">
                        <ThemedText variant="caption" className="text-secondary font-semibold capitalize">
                          {ride.driver_details.driver_tier} Tier
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {/* Total rides */}
                {ride.driver_details?.total_rides != null && ride.driver_details.total_rides > 0 && (
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="car-outline" size={14} color="#6B7280" />
                    <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary ml-1">
                      {ride.driver_details.total_rides} rides completed
                    </ThemedText>
                  </View>
                )}

                {ride.car && (
                  <View className="bg-surface dark:bg-darkSurface p-3 rounded-lg">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="car" size={16} color={BrandColors.secondary} />
                      <ThemedText className="ml-2 font-semibold">
                        {ride.car.make} {ride.car.model}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center justify-between mt-1">
                      <View className="flex-row items-center">
                        <View
                          className="w-3 h-3 rounded-full mr-2 border border-border"
                          style={{ backgroundColor: ride.car.color?.toLowerCase() || 'transparent' }}
                        />
                        <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                          {ride.car.color || 'N/A'}
                        </ThemedText>
                      </View>
                      <ThemedText variant="caption" className="font-mono text-textSecondary dark:text-darkTextSecondary">
                        {ride.car.plate_number}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </ThemedCard>
            </View>
          )}

          {/* 3. Map */}
          {ride.pickup_lat && ride.pickup_long && (() => {
            const pickupLat = parseFloat(String(ride.pickup_lat));
            const pickupLng = parseFloat(String(ride.pickup_long));
            const dropoffLat = ride.dropoff_lat ? parseFloat(String(ride.dropoff_lat)) : NaN;
            const dropoffLng = ride.dropoff_long ? parseFloat(String(ride.dropoff_long)) : NaN;
            const hasDropoff = Number.isFinite(dropoffLat) && Number.isFinite(dropoffLng);

            if (!Number.isFinite(pickupLat) || !Number.isFinite(pickupLng)) return null;

            return (
              <View className="px-4 mb-4">
                <ThemedCard className="overflow-hidden">
                  <UniversalMapView
                    style={{ height: 200 }}
                    showUserLocation={false}
                    initialRegion={{
                      latitude: hasDropoff ? (pickupLat + dropoffLat) / 2 : pickupLat,
                      longitude: hasDropoff ? (pickupLng + dropoffLng) / 2 : pickupLng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    markers={[
                      {
                        id: 'pickup',
                        coordinate: { latitude: pickupLat, longitude: pickupLng },
                        title: 'Pickup',
                        description: ride.pickup_address,
                        type: 'pickup',
                      } as MapMarker,
                      ...(hasDropoff
                        ? [{
                            id: 'dropoff',
                            coordinate: { latitude: dropoffLat, longitude: dropoffLng },
                            title: 'Drop-off',
                            description: ride.dropoff_address,
                            type: 'dropoff' as const,
                          } as MapMarker]
                        : []),
                    ]}
                    route={
                      hasDropoff
                        ? {
                            origin: { latitude: pickupLat, longitude: pickupLng },
                            destination: { latitude: dropoffLat, longitude: dropoffLng },
                            strokeColor: BrandColors.secondary,
                            strokeWidth: 4,
                          } as MapRoute
                        : undefined
                    }
                  />
                </ThemedCard>
              </View>
            );
          })()}

          {/* 4. Fare Breakdown Card */}
          <View className="px-4">
            <ThemedCard className="p-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText variant="title" className="font-bold">
                  Fare Breakdown
                </ThemedText>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: needsPayment ? '#F59E0B20' : '#10B98120' }}
                >
                  <ThemedText
                    className="font-bold text-sm"
                    style={{ color: needsPayment ? BrandColors.warning : BrandColors.success }}
                  >
                    {needsPayment ? 'Payment Pending' : ride.payment_status === 'completed' ? 'Paid' : ride.payment_status}
                  </ThemedText>
                </View>
              </View>

              <View className="space-y-2">
                {actualFare !== null && (
                  <DetailRow label="Actual Fare" value={formatMoney(actualFare)} />
                )}
                {actualFare === null && (
                  <DetailRow label="Estimated Fare" value={formatMoney(estimatedFare)} />
                )}
                <DetailRow label="GST (18%)" value={formatMoney(gstAmount)} />
                <View className="border-t border-border dark:border-darkBorder my-2" />
                <View className="flex-row justify-between items-center">
                  <ThemedText className="font-bold text-lg">Total Amount</ThemedText>
                  <ThemedText className="font-bold text-lg text-burgundy dark:text-secondary">
                    {formatMoney(totalAmount)}
                  </ThemedText>
                </View>
              </View>

              {needsPayment && (
                <View className="mt-4">
                  <PrimaryButton
                    title={payingNow ? 'Processing...' : 'Pay Now'}
                    onPress={handlePayNow}
                    disabled={payingNow}
                  />
                </View>
              )}
            </ThemedCard>
          </View>

          {/* 5. Trip Details Card */}
          <View className="px-4">
            <ThemedCard className="p-4 mb-4">
              <ThemedText variant="title" className="font-bold mb-3">
                Trip Details
              </ThemedText>
              <View className="space-y-1">
                <DetailRow label="Trip Type" value={getTripTypeLabel(ride.trip_type)} />
                <DetailRow label="Booking Ref" value={`#${ride.booking_reference}`} />
                <DetailRow label="Booked On" value={new Date(ride.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} />
                {ride.scheduled_at && (
                  <DetailRow label="Scheduled For" value={formatDate(ride.scheduled_at)} />
                )}
                {ride.special_requests && (
                  <DetailRow label="Special Requests" value={ride.special_requests} />
                )}
              </View>
            </ThemedCard>
          </View>

          {/* 6. Insurance Card */}
          {insuranceEnabled && <View className="px-4">
            <ThemedCard className="p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name={ride.insurance ? 'shield-checkmark' : 'shield-outline'}
                  size={20}
                  color={ride.insurance ? BrandColors.info : '#9CA3AF'}
                />
                <ThemedText variant="title" className="font-bold ml-2">
                  Insurance
                </ThemedText>
              </View>

              {ride.insurance ? (
                <View>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mr-2">
                        <ThemedText variant="caption" className="text-blue-700 dark:text-blue-400 font-semibold">
                          Insured
                        </ThemedText>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            ride.insurance.status === 'active' ? '#10B98120' :
                            ride.insurance.status === 'cancelled' ? '#EF444420' : '#6B728020',
                        }}
                      >
                        <ThemedText
                          variant="caption"
                          className="font-semibold capitalize"
                          style={{
                            color:
                              ride.insurance.status === 'active' ? BrandColors.success :
                              ride.insurance.status === 'cancelled' ? BrandColors.danger : '#6B7280',
                          }}
                        >
                          {ride.insurance.status}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText className="font-bold text-blue-600 dark:text-blue-400">
                      ₹{parseFloat(ride.insurance.premium_amount).toLocaleString('en-IN')}
                    </ThemedText>
                  </View>

                  <View className="bg-surface dark:bg-darkSurface p-3 rounded-lg space-y-1">
                    <DetailRow label="Plan" value={ride.insurance.plan_name} />
                    <DetailRow
                      label="Max Coverage"
                      value={`₹${parseFloat(ride.insurance.max_coverage_amount).toLocaleString('en-IN')}`}
                    />
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                    No insurance was added for this trip.
                  </ThemedText>
                </View>
              )}
            </ThemedCard>
          </View>}

          {/* 7. Amenities Card */}
          {amenitiesEnabled && <View className="px-4">
            <ThemedCard className="p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name={ride.amenities && ride.amenities.length > 0 ? 'sparkles' : 'sparkles-outline'}
                  size={20}
                  color={ride.amenities && ride.amenities.length > 0 ? BrandColors.secondary : '#9CA3AF'}
                />
                <ThemedText variant="title" className="font-bold ml-2">
                  Amenities
                </ThemedText>
              </View>

              {ride.amenities && ride.amenities.length > 0 ? (
                <View>
                  <View className="space-y-3">
                    {ride.amenities.map((item) => (
                      <View
                        key={item.id}
                        className="bg-surface dark:bg-darkSurface p-3 rounded-lg flex-row items-center justify-between"
                      >
                        <View className="flex-1">
                          <ThemedText className="font-semibold">
                            {item.amenity.name}
                          </ThemedText>
                          <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary capitalize">
                            {item.amenity.category} · Qty: {item.quantity}
                          </ThemedText>
                        </View>
                        <ThemedText className="font-bold text-secondary">
                          {formatMoney(item.total_price)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  {ride.amenities_total && (
                    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border dark:border-darkBorder">
                      <ThemedText className="font-semibold">Amenities Total</ThemedText>
                      <ThemedText className="font-bold text-secondary">
                        {formatMoney(ride.amenities_total)}
                      </ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row items-center">
                  <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                    No amenities were added for this trip.
                  </ThemedText>
                </View>
              )}
            </ThemedCard>
          </View>}

          {/* Timeline Card */}
          {ride.timeline && ride.timeline.length > 0 && (
            <View className="px-4">
              <ThemedCard className="p-4 mb-4">
                <ThemedText variant="title" className="font-bold mb-4">
                  Timeline
                </ThemedText>

                {ride.timeline.map((event, index) => {
                  const eventInfo = formatTimelineEvent(event.event_type);
                  const isLast = index === ride.timeline!.length - 1;
                  return (
                    <View key={`timeline-${index}`} className="flex-row">
                      {/* Stepper line + dot */}
                      <View className="items-center mr-3" style={{ width: 24 }}>
                        <View className="w-6 h-6 rounded-full items-center justify-center bg-burgundy/10">
                          <Ionicons name={eventInfo.icon as any} size={14} color={BrandColors.secondary} />
                        </View>
                        {!isLast && (
                          <View className="w-0.5 flex-1 bg-border dark:bg-darkBorder my-1" />
                        )}
                      </View>
                      {/* Content */}
                      <View className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
                        <ThemedText className="font-semibold text-sm">
                          {eventInfo.label}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                          {formatDate(event.created_at)}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </ThemedCard>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-4" />
        </ScrollView>

        {/* Bottom Action */}
        <View className="p-4 border-t border-border dark:border-darkBorder bg-surface dark:bg-darkSurface">
          <TouchableOpacity
            onPress={() => router.push('/(customer)/(tabs)/history')}
            className="w-full py-4 items-center bg-secondary rounded-lg"
            activeOpacity={0.7}
          >
            <ThemedText className="font-semibold text-white">
              Back to Bookings
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
