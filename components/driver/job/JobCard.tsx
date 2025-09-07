import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { JobRequest } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';

interface JobCardProps {
  job: JobRequest;
  onAccept: (jobId: string) => void;
  onDecline: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
}

export function JobCard({ job, onAccept, onDecline, onViewDetails }: JobCardProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
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
            <ThemedText className="text-primary font-bold text-xl">
              ₹{job.fare.toLocaleString('en-IN')}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {job.estimatedDuration} min
            </ThemedText>
          </View>
        </View>

        {/* Customer Info */}
        <View className="flex-row items-center mb-3 p-3 bg-surface dark:bg-darkSurface rounded-lg">
          <View className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center mr-3">
            <ThemedText className="font-bold text-secondary">
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
                <Ionicons name="call" size={14} color="#10b981" />
                <ThemedText variant="caption" className="text-success ml-1">
                  Call
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Locations */}
        <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
          <View className="flex-row items-start mb-3">
            <View className="w-4 h-4 bg-success rounded-full mt-1 mr-3" />
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
              <View className="w-4 h-4 border-2 border-danger rounded-full mt-1 mr-3" />
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
        <View className="bg-danger/10 border border-danger/20 rounded-lg p-2 mb-3">
          <ThemedText variant="caption" className="text-center text-danger font-semibold">
            Request expires in {Math.max(0, Math.floor((job.expiresAt.getTime() - Date.now()) / 1000))}s
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="flex-row border-t border-border dark:border-darkBorder">
        <TouchableOpacity 
          onPress={() => onDecline(job.id)}
          className="flex-1 py-4 items-center border-r border-border dark:border-darkBorder"
          activeOpacity={0.7}
        >
          <ThemedText className="font-semibold text-danger">
            Decline
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => onAccept(job.id)}
          className="flex-1 py-4 items-center bg-primary"
          activeOpacity={0.7}
        >
          <ThemedText className="font-semibold text-white">
            Accept Ride
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedCard>
  );
}