import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
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
}

// Map API booking status to card display status
const mapApiStatusToCardStatus = (apiStatus: string): string => {
  // Active statuses
  if (['requested', 'driver_assigned', 'biker_assigned', 'driver_en_route', 'driver_arrived', 'trip_started'].includes(apiStatus)) {
    if (apiStatus === 'requested') return 'pending';
    if (apiStatus === 'trip_started') return 'in_progress';
    return 'confirmed';
  }
  // Completed status
  if (apiStatus === 'trip_completed') return 'completed';
  // Cancelled statuses
  if (['cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(apiStatus)) return 'cancelled';
  return apiStatus;
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onTrack,
  onViewDetails,
  onPayNow,
  showActions = true,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const formatDate = (dateValue: Date | string): string => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Guard against undefined booking
  if (!booking) {
    return null;
  }

  // Convert API status to card status
  const cardStatus = mapApiStatusToCardStatus(booking.status);

  const getStatusColor = () => {
    switch (cardStatus) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    // Use original API status text for more specific display
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
      case 'pending':
        return 'time';
      case 'confirmed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'car';
      case 'completed':
        return 'checkmark-done';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const canCancel = () => {
    // Can cancel if ride is in requested status only
    return booking.status === 'requested';
  };

  const canTrack = () => {
    // Can track if ride has driver assigned but not completed
    return ['driver_assigned', 'biker_assigned', 'driver_en_route', 'driver_arrived', 'trip_started'].includes(booking.status);
  };

  const isCompleted = () => {
    return booking.status === 'trip_completed';
  };

  const isCancelled = () => {
    return ['cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_system'].includes(booking.status);
  };

  const needsPayment = () => {
    return booking.status === 'trip_completed' &&
      booking.paymentStatus !== 'paid' &&
      booking.paymentStatus !== 'completed';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 rounded-2xl mb-4 border ${
        isDarkMode 
          ? 'bg-darkSurface border-darkBorder' 
          : 'bg-white border-border'
      }`}
      activeOpacity={1}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: getStatusColor() }}
          />
          <ThemedText variant="h3" className="font-bold">
            {booking?.duration || 'Ride'} Service
          </ThemedText>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons 
            name={getStatusIcon() as any} 
            size={16} 
            color={getStatusColor()} 
          />
          <ThemedText 
            variant="small" 
            className="ml-1 font-semibold"
            style={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </ThemedText>
        </View>
      </View>

      {/* Booking Details */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar" size={16} color="#BD8C5E" />
          <ThemedText variant="small" className="ml-2 text-textSecondary dark:text-darkTextSecondary">
            {formatDate(booking.startTime)}
          </ThemedText>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={16} color="#BD8C5E" />
          <ThemedText variant="small" className="ml-2 text-textSecondary dark:text-darkTextSecondary flex-1">
            {booking.pickupLocation?.address || 'Location not available'}
          </ThemedText>
        </View>

        {booking.id && (
          <View className="flex-row items-center">
            <Ionicons name="document-text" size={16} color="#BD8C5E" />
            <ThemedText variant="small" className="ml-2 text-textSecondary dark:text-darkTextSecondary font-mono">
              #{booking.id.slice(-6).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Amount */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
            Total Amount
          </ThemedText>
          <ThemedText variant="h3" className="font-bold text-burgundy dark:text-secondary">
            ₹{((booking.totalAmount || 0) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </ThemedText>
        </View>

        <View className="items-end">
          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
            Payment
          </ThemedText>
          <View className="flex-row items-center">
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
                    variant="small"
                    className={`ml-1 font-semibold ${isPaid ? 'text-success' : 'text-orange-500'}`}
                  >
                    {isPaid ? 'Paid' : 'Pending'}
                  </ThemedText>
                </>
              );
            })()}
          </View>
        </View>
      </View>

      {/* Actions for active rides - show Track (and Cancel only for requested status) */}
      {showActions && canTrack() && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <TouchableOpacity
            onPress={onTrack}
            className="flex-1 py-3 px-4 rounded-lg bg-primary"
          >
            <ThemedText className="text-center font-semibold text-burgundy">
              {booking.status === 'trip_started' ? 'View Live' : 'Track Ride'}
            </ThemedText>
          </TouchableOpacity>

          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              className="flex-1 py-3 px-4 rounded-lg"
            >
              <ThemedText className="text-center font-semibold text-textSecondary dark:text-darkTextSecondary">
                Details
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions for requested - show Cancel */}
      {showActions && canCancel() && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              className="flex-1 py-3 px-4 rounded-lg"
            >
              <ThemedText className="text-center font-semibold text-textSecondary">
                Details
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 py-3 px-4 rounded-lg bg-primary"
          >
            <ThemedText className="text-center font-semibold text-burgundy">
              Cancel Booking
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions for completed - show Pay Now (if unpaid), Details and Book Again */}
      {showActions && isCompleted() && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              className="flex-1 py-3 px-4 rounded-lg"
            >
              <ThemedText className="text-center font-semibold text-textSecondary">
                View Details
              </ThemedText>
            </TouchableOpacity>
          )}

          {needsPayment() && onPayNow ? (
            <TouchableOpacity
              onPress={onPayNow}
              className="flex-1 py-3 px-4 rounded-lg bg-burgundy"
            >
              <ThemedText className="text-center font-semibold text-white">
                Pay Now
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="flex-1 py-3 px-4 rounded-lg bg-primary">
              <ThemedText className="text-center font-semibold text-burgundy">
                Book Again
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions for cancelled - show View Details */}
      {showActions && isCancelled() && onViewDetails && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <TouchableOpacity
            onPress={onViewDetails}
            className="flex-1 py-3 px-4 rounded-lg bg-primary"
          >
            <ThemedText className="text-center font-semibold text-burgundy">
              View Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};
