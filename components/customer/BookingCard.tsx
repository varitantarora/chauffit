import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { BookingDetails } from '../../types/navigation';

interface BookingCardProps {
  booking: BookingDetails;
  onPress?: () => void;
  onCancel?: () => void;
  onTrack?: () => void;
  onViewDetails?: () => void;
  onPayNow?: () => void;
  showActions?: boolean;
  loyaltyDiscountPct?: number;
}

// Map API booking status to card display status
const mapApiStatusToCardStatus = (apiStatus: string): string => {
  if (['requested', 'driver_assigned', 'biker_assigned', 'driver_en_route', 'driver_arrived', 'trip_started'].includes(apiStatus)) {
    if (apiStatus === 'requested') return 'pending';
    if (apiStatus === 'trip_started') return 'in_progress';
    return 'confirmed';
  }
  if (apiStatus === 'trip_completed') return 'completed';
  if (['cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(apiStatus)) return 'cancelled';
  return apiStatus;
};

// Generate a simple barcode-like pattern from booking ID
const BarcodeElement: React.FC<{ bookingId: string; isDarkMode: boolean }> = ({ bookingId, isDarkMode }) => {
  // Use last 12 chars of ID to generate bar widths
  const chars = (bookingId || '000000000000').slice(-12);
  const bars: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const code = chars.charCodeAt(i);
    bars.push(code % 2 === 0 ? 2 : 1);
    bars.push(0); // gap
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, marginTop: 8 }}>
      {bars.map((width, i) => (
        <View
          key={i}
          style={{
            width: width === 0 ? 1 : width,
            height: width === 0 ? 0 : 20,
            backgroundColor: width === 0 ? 'transparent' : (isDarkMode ? 'rgba(217,209,198,0.3)' : 'rgba(0,0,0,0.15)'),
            marginHorizontal: width === 0 ? 1 : 0,
          }}
        />
      ))}
    </View>
  );
};

// Dashed line separator (tear-off effect)
const DashedSeparator: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, overflow: 'hidden' }}>
    {/* Left notch */}
    <View
      style={{
        width: 12,
        height: 24,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        marginLeft: -20,
        marginRight: 8,
      }}
    />
    {/* Dashed line */}
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            backgroundColor: i % 2 === 0
              ? (isDarkMode ? 'rgba(74,74,74,0.8)' : 'rgba(200,200,200,0.8)')
              : 'transparent',
          }}
        />
      ))}
    </View>
    {/* Right notch */}
    <View
      style={{
        width: 12,
        height: 24,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        marginRight: -20,
        marginLeft: 8,
      }}
    />
  </View>
);

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onTrack,
  onViewDetails,
  onPayNow,
  showActions = true,
  loyaltyDiscountPct,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const formatDate = (dateValue: Date | string): string => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!booking) {
    return null;
  }

  const cardStatus = mapApiStatusToCardStatus(booking.status);

  const getStatusColor = () => {
    switch (cardStatus) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
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
    return statusMap[booking.status] || booking.status;
  };

  const getStatusIcon = () => {
    switch (cardStatus) {
      case 'pending': return 'time';
      case 'confirmed': return 'checkmark-circle';
      case 'in_progress': return 'car';
      case 'completed': return 'checkmark-done';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const canCancel = () => booking.status === 'requested';
  const canTrack = () => ['driver_assigned', 'biker_assigned', 'driver_en_route', 'driver_arrived', 'trip_started'].includes(booking.status);
  const isCompleted = () => booking.status === 'trip_completed';
  const isCancelled = () => ['cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(booking.status);

  const getTripTypeLabel = (duration?: string): string => {
    if (!duration) return 'Ride';
    const type = duration.toLowerCase().replace('-', '_');
    switch (type) {
      case 'one_way': return 'One-way';
      case 'round_trip': return 'Round-trip';
      case 'hourly': return 'Hourly';
      case 'multi_stop': return 'Multi-stop';
      default: return duration;
    }
  };

  const needsPayment = () => {
    return booking.status === 'trip_completed' &&
      booking.paymentStatus !== 'paid' &&
      booking.paymentStatus !== 'completed';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={{
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: isDarkMode ? '#2C2C2C' : '#FDFCFA',
        // Receipt-style shadow
        shadowColor: isDarkMode ? '#000' : '#720C17',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
      }}
    >
      {/* Top accent strip */}
      <View
        style={{
          height: 3,
          backgroundColor: getStatusColor(),
        }}
      />

      {/* Header section */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: getStatusColor(),
                marginRight: 10,
              }}
            />
            <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>
              {getTripTypeLabel(booking?.duration)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={getStatusIcon() as any} size={14} color={getStatusColor()} />
            <ThemedText style={{ fontSize: 12, fontWeight: '600', color: getStatusColor() }}>
              {getStatusText()}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Dashed tear-off separator */}
      <DashedSeparator isDarkMode={isDarkMode} />

      {/* Booking Details - receipt body */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="calendar" size={14} color="#BD8C5E" />
          <ThemedText style={{ marginLeft: 8, fontSize: 13, color: isDarkMode ? '#999' : '#666' }}>
            {formatDate(booking.startTime)}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
          <Ionicons name="location" size={14} color="#BD8C5E" style={{ marginTop: 2 }} />
          <ThemedText style={{ marginLeft: 8, fontSize: 13, color: isDarkMode ? '#999' : '#666', flex: 1 }}>
            {booking.pickupLocation?.address || 'Location not available'}
          </ThemedText>
        </View>

        {booking.id && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="document-text" size={14} color="#BD8C5E" />
            <ThemedText style={{ marginLeft: 8, fontSize: 12, color: isDarkMode ? '#999' : '#666', fontFamily: 'monospace' }}>
              #{booking.id.slice(-6).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Amount section - receipt total line */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginTop: 4,
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? 'rgba(74,74,74,0.5)' : 'rgba(200,200,200,0.5)',
          borderStyle: 'dashed' as any,
        }}
      >
        <View>
          <ThemedText style={{ fontSize: 11, color: isDarkMode ? '#999' : '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total Amount
          </ThemedText>
          <ThemedText style={{ fontSize: 18, fontWeight: '800', color: isDarkMode ? '#BD8C5E' : '#720C17' }}>
            ₹{((booking.totalAmount || 0) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </ThemedText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText style={{ fontSize: 11, color: isDarkMode ? '#999' : '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Payment
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(() => {
              const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed';
              return (
                <>
                  <Ionicons
                    name={isPaid ? 'checkmark-circle' : 'time'}
                    size={14}
                    color={isPaid ? '#10B981' : '#F59E0B'}
                  />
                  <ThemedText
                    style={{
                      marginLeft: 4,
                      fontSize: 13,
                      fontWeight: '600',
                      color: isPaid ? '#10B981' : '#F59E0B',
                    }}
                  >
                    {isPaid ? 'Paid' : 'Pending'}
                  </ThemedText>
                </>
              );
            })()}
          </View>
        </View>
      </View>

      {/* Loyalty Discount Badge */}
      {loyaltyDiscountPct && loyaltyDiscountPct > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
          <Ionicons name="star" size={12} color="#10B981" />
          <ThemedText style={{ marginLeft: 4, fontSize: 11, color: '#10B981', fontWeight: '600' }}>
            {loyaltyDiscountPct}% loyalty discount applied
          </ThemedText>
        </View>
      ) : null}

      {/* Barcode element */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <BarcodeElement bookingId={booking.id} isDarkMode={isDarkMode} />
      </View>

      {/* Actions */}
      {showActions && canTrack() && (
        <View style={{
          flexDirection: 'row',
          padding: 4,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: isDarkMode ? 'rgba(44,44,44,0.5)' : 'rgba(249,249,249,0.8)',
        }}>
          <TouchableOpacity
            onPress={onTrack}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#D9D1C6' : '#D9D1C6' }}
          >
            <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#720C17' }}>
              {booking.status === 'trip_started' ? 'View Live' : 'Track Ride'}
            </ThemedText>
          </TouchableOpacity>
          {onViewDetails && (
            <TouchableOpacity onPress={onViewDetails} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
              <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: isDarkMode ? '#999' : '#666' }}>
                Details
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showActions && canCancel() && (
        <View style={{
          flexDirection: 'row',
          padding: 4,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: isDarkMode ? 'rgba(44,44,44,0.5)' : 'rgba(249,249,249,0.8)',
        }}>
          {onViewDetails && (
            <TouchableOpacity onPress={onViewDetails} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
              <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: isDarkMode ? '#999' : '#666' }}>
                Details
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onCancel}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#D9D1C6' : '#D9D1C6' }}
          >
            <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#720C17' }}>
              Cancel Booking
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {showActions && isCompleted() && (
        <View style={{
          flexDirection: 'row',
          padding: 4,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: isDarkMode ? 'rgba(44,44,44,0.5)' : 'rgba(249,249,249,0.8)',
        }}>
          {onViewDetails && (
            <TouchableOpacity onPress={onViewDetails} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
              <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: isDarkMode ? '#999' : '#666' }}>
                View Details
              </ThemedText>
            </TouchableOpacity>
          )}
          {needsPayment() && onPayNow ? (
            <TouchableOpacity onPress={onPayNow} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#720C17' }}>
              <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#fff' }}>
                Pay Now
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#D9D1C6' : '#D9D1C6' }}>
              <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#720C17' }}>
                Book Again
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showActions && isCancelled() && onViewDetails && (
        <View style={{
          flexDirection: 'row',
          padding: 4,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: isDarkMode ? 'rgba(44,44,44,0.5)' : 'rgba(249,249,249,0.8)',
        }}>
          <TouchableOpacity
            onPress={onViewDetails}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#D9D1C6' : '#D9D1C6' }}
          >
            <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#720C17' }}>
              View Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};
