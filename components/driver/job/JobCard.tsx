import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { JobRequest } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';

interface JobCardProps {
  job: JobRequest;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  processing?: boolean;
}

export function JobCard({ job, onAccept, onDecline, onViewDetails, processing = false }: JobCardProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expiryTime = job.expiresAt.getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);
      
      // Auto-remove expired requests would be handled by the store cleanup
      if (remaining <= 0) {
        return;
      }
    };

    // Initial calculation
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [job.expiresAt]);

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeFromNow = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `in ${minutes}m`;
    } else {
      return 'now';
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'airport':
        return 'airplane';
      case 'outstation':
        return 'car-sport';
      case 'hourly':
        return 'time';
      default:
        return 'location';
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'airport':
        return '#3b82f6';
      case 'outstation':
        return '#8b5cf6';
      case 'hourly':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <ThemedCard className="mb-4 p-0">
      <TouchableOpacity
        onPress={() => onViewDetails?.(job.id)}
        className="p-4"
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons 
                name={getServiceTypeIcon(job.serviceType) as any} 
                size={16} 
                color={getServiceTypeColor(job.serviceType)} 
              />
              <ThemedText variant="title" className="text-lg font-bold ml-2 capitalize">
                {job.serviceType === 'airport' ? 'Airport Transfer' : 
                 job.serviceType === 'outstation' ? 'Outstation Trip' :
                 job.serviceType === 'hourly' ? 'Hourly Service' : 'Point to Point'}
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <ThemedText variant="caption" className="text-secondary">
                {formatTime(job.scheduledTime)} • {getTimeFromNow(job.scheduledTime)}
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary ml-2">
                • {job.estimatedDistance} km
              </ThemedText>
            </View>
          </View>
          <View className="items-end">
            <ThemedText className="text-burgundy font-bold text-xl">
              ₹{job.fare.toLocaleString('en-IN')}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {job.estimatedDuration} min
            </ThemedText>
          </View>
        </View>

        {/* Customer Info */}
        <View className="flex-row items-center mb-3 p-3 bg-surface dark:bg-darkSurface rounded-lg">
          <View className="w-10 h-10 bg-burgundy/10 rounded-full items-center justify-center mr-3">
            <ThemedText className="font-bold text-burgundy">
              {job.customerName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold">{job.customerName}</ThemedText>
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= job.customerRating ? "star" : "star-outline"} 
                    size={12} 
                    color="#fbbf24" 
                  />
                ))}
                <ThemedText variant="caption" className="ml-1">
                  {job.customerRating.toFixed(1)}
                </ThemedText>
              </View>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="call" size={14} color="#BD8C5E" />
                <ThemedText variant="caption" className="text-secondary ml-1">
                  Call
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Locations */}
        <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
          <View className="flex-row items-start mb-3">
            <View className="w-4 h-4 bg-secondary rounded-full mt-1 mr-3" />
            <View className="flex-1">
              <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                PICKUP
              </ThemedText>
              <ThemedText className="font-medium">
                {job.pickupLocation.name || job.pickupLocation.address}
              </ThemedText>
              {job.pickupLocation.name && (
                <ThemedText variant="caption" className="text-secondary">
                  {job.pickupLocation.address}
                </ThemedText>
              )}
            </View>
          </View>
          
          {job.dropoffLocation && (
            <View className="flex-row items-start">
              <View className="w-4 h-4 border-2 border-burgundy rounded-full mt-1 mr-3" />
              <View className="flex-1">
                <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                  DROPOFF
                </ThemedText>
                <ThemedText className="font-medium">
                  {job.dropoffLocation.name || job.dropoffLocation.address}
                </ThemedText>
                {job.dropoffLocation.name && (
                  <ThemedText variant="caption" className="text-secondary">
                    {job.dropoffLocation.address}
                  </ThemedText>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Special Requests */}
        {job.specialRequests && (
          <View className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={16} color="#f59e0b" />
              <ThemedText variant="caption" className="text-warning font-semibold ml-2">
                Special Request
              </ThemedText>
            </View>
            <ThemedText variant="caption" className="mt-1">
              {job.specialRequests}
            </ThemedText>
          </View>
        )}

        {/* Expires Timer */}
        <View className={`${timeLeft <= 60 ? 'bg-danger/20 border-danger/40' : timeLeft <= 300 ? 'bg-warning/20 border-warning/40' : 'bg-success/20 border-success/40'} border rounded-lg p-2 mb-3`}>
          <ThemedText variant="caption" className={`text-center font-semibold ${timeLeft <= 60 ? 'text-danger' : timeLeft <= 300 ? 'text-warning' : 'text-success'}`}>
            {timeLeft <= 0 ? 'Request Expired' : `Expires in ${formatTimeLeft(timeLeft)}`}
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      {onAccept && onDecline ? (
        <View className="flex-row border-t border-border dark:border-darkBorder">
          <TouchableOpacity
            onPress={() => timeLeft > 0 && !processing && onDecline(job.id)}
            className={`flex-1 py-4 items-center border-r border-border dark:border-darkBorder ${(timeLeft <= 0 || processing) ? 'opacity-50' : ''}`}
            activeOpacity={timeLeft <= 0 || processing ? 1 : 0.7}
            disabled={timeLeft <= 0 || processing}
          >
            <ThemedText className="font-semibold text-danger">
              Decline
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => timeLeft > 0 && !processing && onAccept(job.id)}
            className={`flex-1 py-4 items-center bg-burgundy flex-row justify-center ${(timeLeft <= 0 || processing) ? 'opacity-50' : ''}`}
            activeOpacity={timeLeft <= 0 || processing ? 1 : 0.7}
            disabled={timeLeft <= 0 || processing}
          >
            {processing ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <ThemedText className="font-semibold text-white ml-2">
                  Processing...
                </ThemedText>
              </>
            ) : (
              <ThemedText className="font-semibold text-white">
                {timeLeft <= 0 ? 'Expired' : 'Accept Ride'}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View className="border-t border-border dark:border-darkBorder">
          <TouchableOpacity
            onPress={() => onViewDetails?.(job.id)}
            className="w-full py-4 items-center bg-burgundy"
          >
            <ThemedText className="font-semibold text-white">
              View Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedCard>
  );
}