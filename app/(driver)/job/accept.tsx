import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { RouteMap } from '../../../components/driver/navigation/RouteMap';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import { JobRequest } from '../../../types/navigation';
import DriverRidesApiService, { BookingDetail } from '../../../services/api/DriverRidesApiService';

export default function JobAcceptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { pendingRequests, acceptedJobs, activeJob, acceptRideFromAPI, declineJob, lastAcceptError } = useJobStore();
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [job, setJob] = useState<JobRequest | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  const resolveJobStatus = (bookingStatus?: string): JobRequest['status'] => {
    switch (bookingStatus) {
      case 'requested':
        return 'pending';
      case 'trip_completed':
        return 'accepted';
      default:
        return 'accepted';
    }
  };

  const mapBookingToJobRequest = (booking: BookingDetail, status: JobRequest['status']): JobRequest => ({
    id: booking.id,
    customerId: booking.customer,
    customerName: 'Customer',
    customerPhone: '',
    customerRating: 4.5,
    pickupLocation: {
      latitude: parseFloat(booking.pickup_lat) || 0,
      longitude: parseFloat(booking.pickup_long) || 0,
      address: booking.pickup_address,
      name: booking.pickup_address.split(',')[0]
    },
    dropoffLocation: {
      latitude: parseFloat(booking.dropoff_lat) || 0,
      longitude: parseFloat(booking.dropoff_long) || 0,
      address: booking.dropoff_address,
      name: booking.dropoff_address.split(',')[0]
    },
    scheduledTime: booking.scheduled_at ? new Date(booking.scheduled_at) : new Date(booking.created_at),
    estimatedDuration: booking.estimated_duration_minutes || 30,
    estimatedDistance: parseFloat(booking.estimated_distance_km || '0') || 10,
    serviceType: booking.trip_type === 'hourly_charter' ? 'hourly' : 'trip',
    fare: parseFloat(booking.estimated_fare) || 0,
    vehicleType: 'sedan',
    status,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date(booking.created_at)
  });

  useEffect(() => {
    const foundJob =
      pendingRequests.find(req => req.id === jobId) ||
      acceptedJobs.find(req => req.id === jobId);

    if (foundJob) {
      setJob(foundJob);
      if (foundJob.status === 'pending') {
        updateTimeLeft(foundJob);
      }
      return;
    }

    const fetchJob = async () => {
      setLoadingJob(true);
      try {
        const response = await DriverRidesApiService.getRideDetails(jobId);
        if (response.success && response.data) {
          const status = resolveJobStatus(response.data.booking_status);
          const mappedJob = mapBookingToJobRequest(response.data, status);
          setJob(mappedJob);
          if (mappedJob.status === 'pending') {
            updateTimeLeft(mappedJob);
          }
        } else {
          router.back();
        }
      } catch (error) {
        router.back();
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [jobId, pendingRequests, acceptedJobs, router]);

  useEffect(() => {
    if (!job || job.status !== 'pending') return;

    const interval = setInterval(() => {
      updateTimeLeft(job);
    }, 1000);

    return () => clearInterval(interval);
  }, [job]);

  const updateTimeLeft = (job: JobRequest) => {
    const now = new Date().getTime();
    const expiry = new Date(job.expiresAt).getTime();
    const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
    
    setTimeLeft(remaining);
    
    if (remaining === 0) {
      Alert.alert(
        'Request Expired',
        'This ride request has expired.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const handleAccept = async () => {
    if (!job) return;
    
    setIsAccepting(true);
    
    try {
      const success = await acceptRideFromAPI(job.id);
      if (success) {
        Alert.alert(
          'Ride Accepted!',
          'You have successfully accepted this ride. Navigate to the customer pickup location.',
          [
            {
              text: 'Start Navigation',
              onPress: () => router.push({
                pathname: '/(driver)/job/navigation',
                params: { jobId: job.id }
              })
            }
          ]
        );
        setJob({ ...job, status: 'accepted' });
      } else {
        Alert.alert('Error', lastAcceptError || 'Failed to accept the ride. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept the ride. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    if (!job) return;
    
    Alert.alert(
      'Decline Ride?',
      'Are you sure you want to decline this ride request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            declineJob(job.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    if (!job?.customerPhone) return;
    
    const phoneNumber = job.customerPhone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getServiceTypeDetails = (type: string) => {
    switch (type) {
      case 'airport':
        return {
          icon: 'airplane',
          color: '#3b82f6',
          title: 'Airport Transfer',
          description: 'Professional airport pickup/drop service'
        };
      case 'outstation':
        return {
          icon: 'car-sport',
          color: '#8b5cf6',
          title: 'Outstation Trip',
          description: 'Long distance travel service'
        };
      case 'hourly':
        return {
          icon: 'time',
          color: '#f59e0b',
          title: 'Hourly Service',
          description: 'Dedicated chauffeur service by the hour'
        };
      default:
        return {
          icon: 'location',
          color: '#10b981',
          title: 'Point to Point',
          description: 'Direct pickup to destination service'
        };
    }
  };

  if (!job) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Loading job details...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const serviceDetails = getServiceTypeDetails(job.serviceType);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center">
            <ThemedText variant="title" className="font-bold">
              Ride Request
            </ThemedText>
            <View className="bg-danger/10 px-3 py-1 rounded-full">
              <ThemedText className="text-danger font-bold text-sm">
                Expires in {formatTimeLeft(timeLeft)}
              </ThemedText>
            </View>
          </View>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Service Type */}
          <View className="px-4 pt-4">
            <ThemedCard className="p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: serviceDetails.color + '20' }}
                >
                  <Ionicons 
                    name={serviceDetails.icon as any} 
                    size={24} 
                    color={serviceDetails.color} 
                  />
                </View>
                <View className="flex-1">
                  <ThemedText variant="title" className="text-lg font-bold">
                    {serviceDetails.title}
                  </ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    {serviceDetails.description}
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-burgundy font-bold text-2xl">
                    ₹{job.fare.toLocaleString('en-IN')}
                  </ThemedText>
                  <ThemedText variant="caption">
                    {job.estimatedDuration} min • {job.estimatedDistance} km
                  </ThemedText>
                </View>
              </View>
              
              <View className="border-t border-border dark:border-darkBorder pt-3">
                <ThemedText variant="caption" className="text-secondary mb-1">
                  SCHEDULED TIME
                </ThemedText>
                <ThemedText className="font-semibold">
                  {new Date(job.scheduledTime).toLocaleString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Customer Information */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText variant="title" className="font-bold">
                  Customer Details
                </ThemedText>
                <TouchableOpacity
                  onPress={handleCallCustomer}
                  className="flex-row items-center bg-success/10 px-3 py-2 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={16} color="#10b981" />
                  <ThemedText className="text-success font-semibold ml-2">
                    Call
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                  <ThemedText className="font-bold text-secondary text-lg">
                    {job.customerName.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold text-lg">
                    {job.customerName}
                  </ThemedText>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons 
                          key={star} 
                          name={star <= job.customerRating ? "star" : "star-outline"} 
                          size={14} 
                          color="#fbbf24" 
                        />
                      ))}
                      <ThemedText variant="caption" className="ml-2">
                        {job.customerRating.toFixed(1)} rating
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="caption" className="text-secondary">
                    {job.customerPhone}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Route Information */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
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
                        DROP-OFF LOCATION
                      </ThemedText>
                      <ThemedText className="font-semibold">
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
            </ThemedCard>
          </View>

          {/* Map */}
          <View className="px-4 mb-4">
            <RouteMap
              pickupLocation={job.pickupLocation}
              dropoffLocation={job.dropoffLocation}
              mapHeight={200}
              showControls={false}
            />
          </View>

          {/* Special Requests */}
          {job.specialRequests && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={20} color="#f59e0b" />
                  <ThemedText variant="title" className="font-bold ml-2">
                    Special Requests
                  </ThemedText>
                </View>
                <ThemedText className="text-warning">
                  {job.specialRequests}
                </ThemedText>
              </ThemedCard>
            </View>
          )}

          {/* Trip Summary */}
          <View className="px-4 mb-6">
            <ThemedCard className="p-4">
              <ThemedText variant="title" className="font-bold mb-3">
                Trip Summary
              </ThemedText>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <ThemedText>Distance:</ThemedText>
                  <ThemedText className="font-semibold">
                    {job.estimatedDistance} km
                  </ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Duration:</ThemedText>
                  <ThemedText className="font-semibold">
                    {job.estimatedDuration} minutes
                  </ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText>Service Type:</ThemedText>
                  <ThemedText className="font-semibold capitalize">
                    {job.serviceType}
                  </ThemedText>
                </View>
                <View className="border-t border-border dark:border-darkBorder pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <ThemedText className="font-bold text-lg">Total Fare:</ThemedText>
                    <ThemedText className="font-bold text-lg text-burgundy">
                      ₹{job.fare.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>

        {!loadingJob && (
          <View className="p-4 border-t border-border dark:border-darkBorder bg-surface dark:bg-darkSurface">
            {job?.status === 'pending' ? (
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleDecline}
                  className="flex-1 py-4 items-center border border-danger/30 rounded-lg"
                  activeOpacity={0.7}
                >
                  <ThemedText className="font-semibold text-danger">
                    Decline
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleAccept}
                  disabled={isAccepting || timeLeft === 0}
                  className={`flex-2 py-4 items-center rounded-lg ${
                    isAccepting || timeLeft === 0 
                      ? 'bg-gray-400' 
                      : 'bg-burgundy'
                  }`}
                  style={{ flex: 2 }}
                  activeOpacity={0.7}
                >
                  <ThemedText className="font-semibold text-white">
                    {isAccepting ? 'Accepting...' : 'Accept Ride'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/(driver)/job/navigation',
                  params: { jobId: job?.id }
                })}
                className="w-full py-4 items-center bg-burgundy rounded-lg"
                activeOpacity={0.7}
              >
                <ThemedText className="font-semibold text-white">
                  Start Navigation
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
