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
  showActions?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onTrack,
  showActions = true,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  // Guard against undefined booking
  if (!booking) {
    return null;
  }

  const getStatusColor = () => {
    switch (booking?.status) {
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
    switch (booking?.status) {
      case 'pending':
        return 'Pending Confirmation';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return booking.status;
    }
  };

  const getStatusIcon = () => {
    switch (booking?.status) {
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Date not available';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
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
          <ThemedText variant="small" className="ml-2 text-textSecondary">
            {formatDate(booking.startTime)}
          </ThemedText>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={16} color="#BD8C5E" />
          <ThemedText variant="small" className="ml-2 text-textSecondary flex-1">
            {booking.pickupLocation?.address || 'Location not available'}
          </ThemedText>
        </View>

        {booking.id && (
          <View className="flex-row items-center">
            <Ionicons name="document-text" size={16} color="#BD8C5E" />
            <ThemedText variant="small" className="ml-2 text-textSecondary font-mono">
              #{booking.id.slice(-6).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Amount */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <ThemedText variant="small" className="text-textSecondary">
            Total Amount
          </ThemedText>
          <ThemedText variant="h3" className="font-bold text-burgundy">
            ₹{((booking.totalAmount || 0) * 1.18).toLocaleString()}
          </ThemedText>
        </View>

        <View className="items-end">
          <ThemedText variant="small" className="text-textSecondary">
            Payment
          </ThemedText>
          <View className="flex-row items-center">
            <Ionicons
              name={booking.paymentStatus === 'paid' ? 'checkmark-circle' : 'time'}
              size={14}
              color={booking.paymentStatus === 'paid' ? '#10B981' : '#F59E0B'}
            />
            <ThemedText
              variant="small"
              className={`ml-1 font-semibold ${
                booking.paymentStatus === 'paid' ? 'text-success' : 'text-orange-500'
              }`}
            >
              {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Actions for confirmed/in_progress - show Track and Cancel toggle */}
      {showActions && (booking?.status === 'confirmed' || booking?.status === 'in_progress') && onTrack && onCancel && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <TouchableOpacity
            onPress={onTrack}
            className="flex-1 py-3 px-4 rounded-lg bg-primary"
          >
            <ThemedText className="text-center font-semibold text-burgundy">
              {booking?.status === 'in_progress' ? 'View Live' : 'Track Ride'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 py-3 px-4 rounded-lg"
          >
            <ThemedText className="text-center font-semibold text-textSecondary">
              Cancel
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions for pending - only show Cancel */}
      {showActions && booking?.status === 'pending' && onCancel && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
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

      {/* Actions for completed - show Book Again */}
      {showActions && booking?.status === 'completed' && (
        <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <TouchableOpacity className="flex-1 py-3 px-4 rounded-lg bg-primary">
            <ThemedText className="text-center font-semibold text-burgundy">
              Book Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};