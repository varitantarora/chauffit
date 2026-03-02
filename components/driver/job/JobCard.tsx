import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { JobRequest, JobHistory } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';

type JobCardJob = JobRequest | JobHistory;

// Helper to check if job is JobHistory
function isJobHistory(job: JobCardJob): job is JobHistory {
  return 'status' in job && (job.status === 'completed' || job.status === 'cancelled');
}

interface JobCardProps {
  job: JobCardJob;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  processing?: boolean;
}

export function JobCard({ job, onAccept, onDecline, onViewDetails, processing = false }: JobCardProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Only set up timer for jobs with expiresAt (JobRequest, not JobHistory)
    if ('expiresAt' in job && job.expiresAt) {
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
    }
  }, ['expiresAt' in job ? (job as JobRequest).expiresAt : undefined]);

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

  const getTimeFromNow = (date: Date | null | undefined, isCompleted: boolean = false) => {
    if (!date) return 'now';

    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // For completed jobs, show past time relative
    if (isCompleted) {
      const pastHours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      const pastMinutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
      const days = Math.floor(pastHours / 24);

      if (days > 0) {
        return `${days}d ago`;
      } else if (pastHours > 0) {
        return `${pastHours}h ago`;
      } else if (pastMinutes > 0) {
        return `${pastMinutes}m ago`;
      } else {
        return 'just now';
      }
    }

    // For future jobs
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

  // Common properties for both JobRequest and JobHistory
  const customerName = job.customerName;
  const customerRating = 'customerRating' in job ? job.customerRating : (job as JobRequest)?.customerRating;
  const fare = job.fare;
  const net_earnings = job.net_earnings || job.fare; // Fallback to fare if net_earnings is missing
  const pickupLocation = job.pickupLocation;
  const dropoffLocation = job.dropoffLocation;
  const isCompletedJob = isJobHistory(job);
  const serviceType = isCompletedJob ? 'trip' : (job as JobRequest).serviceType;
  const scheduledTime = isCompletedJob ? job.date : (job as JobRequest).scheduledTime;
  const estimatedDuration = isCompletedJob ? job.duration : (job as JobRequest).estimatedDuration;
  const estimatedDistance = isCompletedJob ? job.distance : (job as JobRequest).estimatedDistance;
  const specialRequests = isCompletedJob ? undefined : (job as JobRequest).specialRequests;

  // For completed jobs
  const tips = isCompletedJob ? job.tips : 0;
  const rating = isCompletedJob ? job.rating : undefined;
  const hasAcceptActions = !!onAccept || !!onDecline;
  const canNavigate = !isCompletedJob && !hasAcceptActions && job.status === 'accepted';

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
                name={getServiceTypeIcon(serviceType) as any}
                size={16}
                color={getServiceTypeColor(serviceType)}
              />
              <ThemedText variant="title" className="text-lg font-bold ml-2 capitalize">
                {serviceType === 'airport' ? 'Airport Transfer' :
                  serviceType === 'outstation' ? 'Outstation Trip' :
                    serviceType === 'hourly' ? 'Hourly Service' : 'Point to Point'}
              </ThemedText>
              {isCompletedJob && (
                <View className="bg-success/20 px-2 py-0.5 rounded ml-2">
                  <ThemedText variant="caption" className="text-success font-semibold">
                    Completed
                  </ThemedText>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <ThemedText variant="caption" className="text-secondary">
                {formatTime(scheduledTime)} • {getTimeFromNow(scheduledTime, isCompletedJob)}
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary ml-2">
                • {estimatedDistance} km
              </ThemedText>
            </View>
          </View>
          <View className="items-end">
            <ThemedText className="text-burgundy font-bold text-xl">
              ₹{(net_earnings + tips).toLocaleString('en-IN')}
            </ThemedText>
            {!isCompletedJob && timeLeft > 0 && (
              <ThemedText variant="caption" className="text-secondary">
                {formatTimeLeft(timeLeft)}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center mr-3">
            <ThemedText className="font-bold text-secondary">
              {customerName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold">{customerName}</ThemedText>
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (customerRating || 0) ? "star" : "star-outline"}
                    size={12}
                    color="#fbbf24"
                  />
                ))}
                {customerRating !== undefined && (
                  <ThemedText variant="caption" className="ml-1">
                    {customerRating.toFixed(1)}
                  </ThemedText>
                )}
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
                {pickupLocation.name || pickupLocation.address}
              </ThemedText>
              {pickupLocation.name && (
                <ThemedText variant="caption" className="text-secondary">
                  {pickupLocation.address}
                </ThemedText>
              )}
            </View>
          </View>

          {dropoffLocation && (
            <View className="flex-row items-start">
              <View className="w-4 h-4 border-2 border-burgundy rounded-full mt-1 mr-3" />
              <View className="flex-1">
                <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                  DROPOFF
                </ThemedText>
                <ThemedText className="font-medium">
                  {dropoffLocation.name || dropoffLocation.address}
                </ThemedText>
                {dropoffLocation.name && (
                  <ThemedText variant="caption" className="text-secondary">
                    {dropoffLocation.address}
                  </ThemedText>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            <ThemedText variant="caption" className="text-secondary ml-2">
              {estimatedDuration} min
            </ThemedText>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            <ThemedText variant="caption" className="text-secondary ml-2">
              Cash/UPI
            </ThemedText>
          </View>
        </View>

        {/* Special Requests */}
        {specialRequests && (
          <View className="bg-warning/10 p-3 rounded-lg mb-3">
            <ThemedText variant="caption" className="text-warning">
              {specialRequests}
            </ThemedText>
          </View>
        )}

        {/* Rating for completed jobs */}
        {rating !== undefined && (
          <View className="flex-row items-center justify-end mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= rating ? "star" : "star-outline"}
                size={16}
                color="#fbbf24"
              />
            ))}
          </View>
        )}

        {/* Actions */}
        {hasAcceptActions && !isCompletedJob && (
          <View className="flex-row space-x-3">
            {onDecline && (
              <TouchableOpacity
                style={{ opacity: processing ? 0.5 : 1 }}
                onPress={() => timeLeft > 0 && !processing && onDecline(job.id)}
                disabled={timeLeft <= 0 || processing}
                className="flex-1 py-3 items-center border border-secondary rounded-lg"
              >
                {processing && timeLeft <= 0 ? (
                  <ActivityIndicator size="small" color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                ) : (
                  <ThemedText className="text-secondary font-semibold">Decline</ThemedText>
                )}
              </TouchableOpacity>
            )}
            {onAccept && (
              <TouchableOpacity
                style={{ opacity: processing ? 0.5 : 1 }}
                onPress={() => timeLeft > 0 && !processing && onAccept(job.id)}
                disabled={timeLeft <= 0 || processing}
                className="flex-1 py-3 items-center bg-burgundy rounded-lg"
              >
                {processing && timeLeft <= 0 ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ThemedText className="text-white font-semibold">Accept</ThemedText>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {canNavigate && onViewDetails && (
          <TouchableOpacity
            onPress={() => onViewDetails(job.id)}
            className="w-full py-3 items-center bg-burgundy rounded-lg"
          >
            <View className="flex-row items-center">
              <Ionicons name="navigate" size={16} color="#ffffff" />
              <ThemedText className="text-white font-semibold ml-2">Navigate</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </ThemedCard>
  );
}
