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

  const getStatusColor = () => {
    switch (booking.status) {
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
    switch (booking.status) {
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
    switch (booking.status) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {booking.duration} Service
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
            {booking.pickupLocation.address}
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
            ₹{(booking.totalAmount * 1.18).toLocaleString()}
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

      {/* Actions */}
      {showActions && (
        <View className="flex-row space-x-3">
          {booking.status === 'confirmed' && onTrack && (
            <TouchableOpacity
              onPress={onTrack}
              className="flex-1 bg-secondary rounded-xl py-3"
            >
              <ThemedText className="text-white font-semibold text-center">
                Track Ride
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {booking.status === 'in_progress' && onTrack && (
            <TouchableOpacity
              onPress={onTrack}
              className="flex-1 bg-burgundy rounded-xl py-3"
            >
              <ThemedText className="text-white font-semibold text-center">
                View Live
              </ThemedText>
            </TouchableOpacity>
          )}

          {(booking.status === 'pending' || booking.status === 'confirmed') && onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border-2 border-burgundy rounded-xl py-3"
            >
              <ThemedText className="text-burgundy font-semibold text-center">
                Cancel
              </ThemedText>
            </TouchableOpacity>
          )}

          {booking.status === 'completed' && (
            <TouchableOpacity
              className="flex-1 border-2 border-secondary rounded-xl py-3"
            >
              <ThemedText className="text-secondary font-semibold text-center">
                Book Again
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};