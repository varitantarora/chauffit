import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';

const formatMoney = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return 'N/A';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined) return 'N/A';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const formatDistance = (km: string | null | undefined): string => {
  if (!km) return 'N/A';
  const num = parseFloat(km);
  if (!Number.isFinite(num)) return 'N/A';
  return `${num.toFixed(1)} km`;
};

export default function RideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { selectedRide, fetchRideDetail, dispatchRide, cancelRide } = useAdminStore();
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchRideDetail(id);
  }, [id]);

  const handleDispatch = async () => {
    if (!id || !driverId.trim()) {
      Alert.alert('Error', 'Please enter a driver ID');
      return;
    }
    setLoading(true);
    const success = await dispatchRide(id, driverId.trim());
    if (success) {
      await fetchRideDetail(id);
      setDriverId('');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (!id) return;
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          await cancelRide(id, 'Cancelled by admin');
          await fetchRideDetail(id);
          setLoading(false);
        },
      },
    ]);
  };

  const ride = selectedRide;

  // Parse fare breakdown from estimated_fare_notes
  const fareBreakdown = ride?.estimated_fare_notes;
  const breakdown = fareBreakdown && typeof fareBreakdown === 'object' ? fareBreakdown : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Ride Detail</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {ride ? (
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <ThemedText variant="h2">#{ride.booking_reference}</ThemedText>
                <ThemedText variant="tiny" className="mt-1">{new Date(ride.created_at).toLocaleString()}</ThemedText>
              </View>
              <StatusBadge status={ride.booking_status} />
            </View>

            {/* Route Card */}
            <SectionCard title="Route" icon="navigate-outline" iconColor="#3B82F6">
              <View className="flex-row items-start mb-3">
                <View className="w-3 h-3 rounded-full mt-1 mr-3" style={{ backgroundColor: '#10B981' }} />
                <View className="flex-1">
                  <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>PICKUP</ThemedText>
                  <ThemedText className="font-medium">{ride.pickup_address}</ThemedText>
                </View>
              </View>
              <View className="flex-row items-start">
                <View className="w-3 h-3 rounded-full mt-1 mr-3 border-2" style={{ borderColor: '#EF4444' }} />
                <View className="flex-1">
                  <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>DROP-OFF</ThemedText>
                  <ThemedText className="font-medium">{ride.dropoff_address}</ThemedText>
                </View>
              </View>
            </SectionCard>

            {/* Trip Info Card */}
            <SectionCard title="Trip Information" icon="information-circle-outline" iconColor="#8B5CF6">
              <InfoRow label="Trip Type" value={ride.trip_type_display || ride.trip_type} />
              <InfoRow label="Booking Status" value={ride.booking_status_display || ride.booking_status} />
              <InfoRow label="Payment Status" value={ride.payment_status_display || ride.payment_status || 'N/A'} />
              {ride.service_type && <InfoRow label="Service Type" value={ride.service_type} />}
              {ride.scheduled_at && <InfoRow label="Scheduled At" value={new Date(ride.scheduled_at).toLocaleString()} />}
              {ride.special_requests && <InfoRow label="Special Requests" value={ride.special_requests} />}
              {ride.notes && <InfoRow label="Notes" value={ride.notes} isLast />}
            </SectionCard>

            {/* Distance & Duration Card */}
            <SectionCard title="Distance & Duration" icon="speedometer-outline" iconColor="#F59E0B">
              <View className="flex-row">
                <View className="flex-1 items-center py-3">
                  <Ionicons name="map-outline" size={22} color={colors.textSecondary} />
                  <ThemedText variant="tiny" className="mt-1" style={{ color: colors.textSecondary }}>Est. Distance</ThemedText>
                  <ThemedText className="font-bold text-lg">{formatDistance(ride.estimated_distance_km)}</ThemedText>
                </View>
                <View className="w-px bg-border dark:bg-darkBorder" />
                <View className="flex-1 items-center py-3">
                  <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
                  <ThemedText variant="tiny" className="mt-1" style={{ color: colors.textSecondary }}>Est. Duration</ThemedText>
                  <ThemedText className="font-bold text-lg">{formatDuration(ride.estimated_duration_minutes)}</ThemedText>
                </View>
              </View>
              {(ride.actual_distance_km || ride.actual_duration_minutes) && (
                <>
                  <View className="h-px bg-border dark:bg-darkBorder my-2" />
                  <View className="flex-row">
                    <View className="flex-1 items-center py-3">
                      <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Actual Distance</ThemedText>
                      <ThemedText className="font-bold text-lg">{formatDistance(ride.actual_distance_km)}</ThemedText>
                    </View>
                    <View className="w-px bg-border dark:bg-darkBorder" />
                    <View className="flex-1 items-center py-3">
                      <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Actual Duration</ThemedText>
                      <ThemedText className="font-bold text-lg">{formatDuration(ride.actual_duration_minutes)}</ThemedText>
                    </View>
                  </View>
                </>
              )}
            </SectionCard>

            {/* Fare Breakdown Card */}
            <SectionCard title="Fare Breakdown" icon="receipt-outline" iconColor="#10B981">
              <InfoRow label="Estimated Fare" value={formatMoney(ride.estimated_fare)} />
              {ride.actual_fare && <InfoRow label="Actual Fare" value={formatMoney(ride.actual_fare)} />}
              {breakdown && (
                <>
                  <View className="h-px bg-border dark:bg-darkBorder my-2" />
                  <ThemedText variant="tiny" className="mb-2" style={{ color: colors.textSecondary }}>BREAKDOWN</ThemedText>
                  {breakdown.base_fare != null && <InfoRow label="Base Fare" value={formatMoney(breakdown.base_fare)} />}
                  {breakdown.distance_fare != null && <InfoRow label="Distance Fare" value={formatMoney(breakdown.distance_fare)} />}
                  {breakdown.time_fare != null && <InfoRow label="Time Fare" value={formatMoney(breakdown.time_fare)} />}
                  {breakdown.per_km_rate != null && <InfoRow label="Per KM Rate" value={formatMoney(breakdown.per_km_rate)} />}
                  {breakdown.platform_fee != null && <InfoRow label="Platform Fee" value={formatMoney(breakdown.platform_fee)} />}
                  {breakdown.biker_transport_fee != null && <InfoRow label="Biker Transport Fee" value={formatMoney(breakdown.biker_transport_fee)} />}
                  {breakdown.surge_amount != null && (
                    <InfoRow label="Surge Amount" value={formatMoney(breakdown.surge_amount)} highlight />
                  )}
                  {breakdown.insurance_premium != null && <InfoRow label="Insurance Premium" value={formatMoney(breakdown.insurance_premium)} />}
                  {breakdown.subtotal != null && (
                    <>
                      <View className="h-px bg-border dark:bg-darkBorder my-2" />
                      <InfoRow label="Subtotal" value={formatMoney(breakdown.subtotal)} />
                    </>
                  )}
                  {breakdown.total != null && (
                    <InfoRow label="Total" value={formatMoney(breakdown.total)} bold />
                  )}
                </>
              )}
            </SectionCard>

            {/* Insurance Card */}
            <SectionCard
              title="Insurance"
              icon={ride.insurance ? 'shield-checkmark' : 'shield-outline'}
              iconColor={ride.insurance ? '#3B82F6' : colors.textSecondary}
            >
              {ride.insurance ? (
                <>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="px-2.5 py-1 rounded-full mr-2" style={{ backgroundColor: '#3B82F620' }}>
                        <ThemedText variant="tiny" style={{ color: '#3B82F6' }} className="font-semibold">Insured</ThemedText>
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
                          variant="tiny"
                          className="font-semibold capitalize"
                          style={{
                            color:
                              ride.insurance.status === 'active' ? '#10B981' :
                              ride.insurance.status === 'cancelled' ? '#EF4444' : '#6B7280',
                          }}
                        >
                          {ride.insurance.status}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText className="font-bold" style={{ color: '#3B82F6' }}>
                      {formatMoney(ride.insurance.premium_amount)}
                    </ThemedText>
                  </View>
                  <InfoRow label="Plan Name" value={ride.insurance.plan_name} />
                  <InfoRow label="Plan Tier" value={ride.insurance.plan_tier} />
                  <InfoRow label="Premium Amount" value={formatMoney(ride.insurance.premium_amount)} />
                  <InfoRow label="Max Coverage" value={formatMoney(ride.insurance.max_coverage_amount)} isLast />
                </>
              ) : (
                <View className="flex-row items-center py-2">
                  <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                  <ThemedText variant="small" className="ml-2" style={{ color: colors.textSecondary }}>
                    No insurance was added for this ride.
                  </ThemedText>
                </View>
              )}
            </SectionCard>

            {/* Amenities Card */}
            <SectionCard title="Amenities" icon="gift-outline" iconColor="#EC4899">
              {ride.amenities && ride.amenities.length > 0 ? (
                <>
                  {ride.amenities.map((amenity, index) => (
                    <View
                      key={amenity.id || index}
                      className={`flex-row items-center justify-between py-3 ${
                        index < ride.amenities!.length - 1 ? 'border-b border-border dark:border-darkBorder' : ''
                      }`}
                    >
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center">
                          <ThemedText className="font-semibold">{amenity.name}</ThemedText>
                          {amenity.category && (
                            <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EC489920' }}>
                              <ThemedText variant="tiny" style={{ color: '#EC4899' }}>{amenity.category}</ThemedText>
                            </View>
                          )}
                        </View>
                        {amenity.description && (
                          <ThemedText variant="tiny" className="mt-0.5" style={{ color: colors.textSecondary }}>
                            {amenity.description}
                          </ThemedText>
                        )}
                        {amenity.quantity && amenity.quantity > 1 && (
                          <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Qty: {amenity.quantity}</ThemedText>
                        )}
                      </View>
                      <View className="items-end">
                        <ThemedText className="font-semibold">{formatMoney(amenity.total_price || amenity.price)}</ThemedText>
                        {amenity.is_delivered !== undefined && (
                          <View className="flex-row items-center mt-1">
                            <Ionicons
                              name={amenity.is_delivered ? 'checkmark-circle' : 'time-outline'}
                              size={12}
                              color={amenity.is_delivered ? '#10B981' : '#F59E0B'}
                            />
                            <ThemedText variant="tiny" className="ml-1" style={{ color: amenity.is_delivered ? '#10B981' : '#F59E0B' }}>
                              {amenity.is_delivered ? 'Delivered' : 'Pending'}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                  {ride.amenities_total && (
                    <View className="flex-row justify-between items-center pt-3 mt-1 border-t border-border dark:border-darkBorder">
                      <ThemedText className="font-bold">Amenities Total</ThemedText>
                      <ThemedText className="font-bold">{formatMoney(ride.amenities_total)}</ThemedText>
                    </View>
                  )}
                </>
              ) : (
                <View className="flex-row items-center py-2">
                  <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                  <ThemedText variant="small" className="ml-2" style={{ color: colors.textSecondary }}>
                    No amenities were added for this ride.
                  </ThemedText>
                </View>
              )}
            </SectionCard>

            {/* People Card */}
            <SectionCard title="People" icon="people-outline" iconColor="#8B5CF6">
              <PersonRow
                label="Customer"
                icon="person"
                iconBg="#3B82F620"
                iconColor="#3B82F6"
                user={ride.customer_details}
              />
              <PersonRow
                label="Driver"
                icon="car-sport"
                iconBg="#8B5CF620"
                iconColor="#8B5CF6"
                user={ride.driver_details}
              />
              <PersonRow
                label="Biker"
                icon="bicycle"
                iconBg="#F59E0B20"
                iconColor="#F59E0B"
                user={ride.biker_details}
                isLast
              />
            </SectionCard>

            {/* Timestamps Card */}
            <SectionCard title="Timeline" icon="time-outline" iconColor="#6B7280">
              <InfoRow label="Created" value={new Date(ride.created_at).toLocaleString()} />
              {ride.driver_assigned_at && <InfoRow label="Driver Assigned" value={new Date(ride.driver_assigned_at).toLocaleString()} />}
              {ride.driver_arrived_at && <InfoRow label="Driver Arrived" value={new Date(ride.driver_arrived_at).toLocaleString()} />}
              {ride.trip_started_at && <InfoRow label="Trip Started" value={new Date(ride.trip_started_at).toLocaleString()} />}
              {ride.trip_completed_at && <InfoRow label="Trip Completed" value={new Date(ride.trip_completed_at).toLocaleString()} />}
              {ride.cancelled_at && <InfoRow label="Cancelled At" value={new Date(ride.cancelled_at).toLocaleString()} />}
              {ride.cancellation_reason && <InfoRow label="Cancel Reason" value={ride.cancellation_reason} />}
              {ride.updated_at && <InfoRow label="Last Updated" value={new Date(ride.updated_at).toLocaleString()} isLast />}
            </SectionCard>

            {/* Manual Dispatch */}
            {ride.booking_status === 'requested' && (
              <SectionCard title="Manual Dispatch" icon="send-outline" iconColor={colors.burgundy}>
                <TextInput
                  value={driverId}
                  onChangeText={setDriverId}
                  placeholder="Enter Driver ID"
                  className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 mb-3"
                  style={{ backgroundColor: colors.background, color: colors.textPrimary }}
                  placeholderTextColor={colors.textSecondary}
                />
                <PrimaryButton title="Dispatch to Driver" onPress={handleDispatch} loading={loading} variant="secondary" />
              </SectionCard>
            )}

            {/* Cancel button */}
            {!['trip_completed', 'cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(ride.booking_status) && (
              <PrimaryButton title="Cancel Ride" onPress={handleCancel} loading={loading} className="mb-8" />
            )}

            <View className="h-4" />
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading ride details...</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Reusable Components ---

function SectionCard({ title, icon, iconColor, children }: {
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <ThemedText variant="h3" className="ml-2">{title}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value, isLast, bold, highlight }: {
  label: string;
  value: string;
  isLast?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View className={`flex-row justify-between py-2.5 ${isLast ? '' : 'border-b border-border dark:border-darkBorder'}`}>
      <ThemedText variant="small" style={highlight ? { color: '#F59E0B' } : undefined}>{label}</ThemedText>
      <ThemedText
        className={`flex-1 text-right ml-4 ${bold ? 'font-bold text-base' : 'font-medium'}`}
        style={highlight ? { color: '#F59E0B' } : undefined}
        numberOfLines={2}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function PersonRow({ label, icon, iconBg, iconColor, user, isLast }: {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  user?: { full_name?: string; first_name?: string; last_name?: string; email?: string; phone_number?: string } | null;
  isLast?: boolean;
}) {
  const name = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name}` : null);
  return (
    <View className={`flex-row items-center py-3 ${isLast ? '' : 'border-b border-border dark:border-darkBorder'}`}>
      <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <ThemedText variant="tiny" style={{ color: iconColor }}>{label}</ThemedText>
        <ThemedText className="font-semibold">{name || 'Not assigned'}</ThemedText>
        {user?.email && <ThemedText variant="tiny">{user.email}</ThemedText>}
        {user?.phone_number && <ThemedText variant="tiny">{user.phone_number}</ThemedText>}
      </View>
    </View>
  );
}
