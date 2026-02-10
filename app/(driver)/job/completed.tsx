import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Pressable, Alert, ActivityIndicator, TextInput, Linking } from 'react-native';
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
import { JobHistory } from '../../../types/navigation';
import DriverRidesApiService from '../../../services/api/DriverRidesApiService';

export default function CompletedRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { completedJobs, jobHistory } = useJobStore();

  const [job, setJob] = useState<JobHistory | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [customerRating, setCustomerRating] = useState(0);
  const [customerComment, setCustomerComment] = useState('');

  useEffect(() => {
    const foundJob = completedJobs.find(j => j.id === jobId) || jobHistory.find(j => j.id === jobId);

    if (foundJob) {
      const normalizedRating =
        typeof foundJob.rating === 'number' && foundJob.rating >= 1 ? foundJob.rating : undefined;
      setJob({ ...foundJob, rating: normalizedRating });
      // If already rated, set the rating
      if (typeof normalizedRating === 'number') {
        setCustomerRating(normalizedRating);
      }
      if (foundJob.customerComment) {
        setCustomerComment(foundJob.customerComment);
      }
    } else {
      // Fetch job details from API if not found in store
      fetchJobDetails();
    }
  }, [jobId, completedJobs, jobHistory]);

  const fetchJobDetails = async () => {
    setLoadingJob(true);
    try {
      const response = await DriverRidesApiService.getRideDetails(jobId);
      if (response.success && response.data) {
        const rated = response.data.customer_rating;
        const normalizedRating =
          typeof rated?.overall_rating === 'number' && rated.overall_rating >= 1
            ? rated.overall_rating
            : undefined;
        // Map the booking to JobHistory
        const mappedJob: JobHistory = {
          id: response.data.id,
          customerId: response.data.customer,
          customerName: response.data.customer_details?.full_name || 'Customer',
          date: new Date(response.data.created_at),
          pickupLocation: {
            latitude: parseFloat(String(response.data.pickup_lat)) || 0,
            longitude: parseFloat(String(response.data.pickup_long)) || 0,
            address: response.data.pickup_address,
            name: response.data.pickup_address?.split(',')[0]
          },
          dropoffLocation: response.data.dropoff_address ? {
            latitude: parseFloat(String(response.data.dropoff_lat)) || 0,
            longitude: parseFloat(String(response.data.dropoff_long)) || 0,
            address: response.data.dropoff_address,
            name: response.data.dropoff_address?.split(',')[0]
          } : undefined,
          duration: response.data.estimated_duration_minutes || 30,
          distance: parseFloat(String(response.data.estimated_distance_km)) || 10,
          fare: parseFloat(String(response.data.final_fare)) || parseFloat(String(response.data.estimated_fare)) || 0,
          tips: parseFloat(String(response.data.tip_amount)) || 0,
          rating: normalizedRating,
          customerRating: response.data.customer_details?.average_rating || 0,
          customerComment: rated?.review || undefined,
          status: 'completed'
        };
        setJob(mappedJob);
      } else {
        Alert.alert('Error', 'Failed to load ride details', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.alert('Error', 'Failed to load ride details', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoadingJob(false);
    }
  };

  const refreshJobDetails = async () => {
    try {
      const response = await DriverRidesApiService.getRideDetails(jobId);
      if (response.success && response.data) {
        const rated = response.data.customer_rating;
        const normalizedRating =
          typeof rated?.overall_rating === 'number' && rated.overall_rating >= 1
            ? rated.overall_rating
            : undefined;
        setJob((current) => {
          if (!current) return current;
          return {
            ...current,
            customerRating: response.data?.customer_details?.average_rating || current.customerRating,
            rating: normalizedRating ?? current.rating,
            customerComment: rated?.review ?? current.customerComment,
          };
        });
      }
    } catch (error) {
      console.error('Error refreshing ride details:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (customerRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (!job) return;

    setSubmittingRating(true);
    try {
      const response = await DriverRidesApiService.rateCustomer(
        job.id,
        customerRating,
        customerComment || undefined
      );

      if (response.success) {
        Alert.alert(
          'Rating Submitted',
          'Thank you for your feedback!',
          [
            {
              text: 'OK',
              onPress: async () => {
                setJob({ ...job, rating: customerRating, customerComment });
                await refreshJobDetails();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to submit rating. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCallCustomer = () => {
    if (!job) return;
    Alert.alert('Call Customer', 'This ride has been completed. You can still contact the customer if needed.');
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loadingJob) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#BD8C5E" />
          <ThemedText className="mt-4">Loading ride details...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <Ionicons name="close-circle" size={48} color="#ef4444" />
          <ThemedText className="mt-4 text-lg">Ride not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const serviceDetails = getServiceTypeDetails('trip');
  const totalEarnings = job.fare + job.tips;
  const isAlreadyRated = typeof job.rating === 'number' && job.rating > 0;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Completed Ride
          </ThemedText>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Completion Banner */}
          <View className="bg-success/10 p-4">
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <ThemedText className="text-success font-bold text-lg ml-2">
                Ride Completed
              </ThemedText>
            </View>
            <ThemedText variant="caption" className="text-center text-secondary mt-1">
              {formatDate(job.date)}
            </ThemedText>
          </View>

          {/* Earnings Summary Card */}
          <View className="px-4 pt-4">
            <ThemedCard className="p-4 mb-4 bg-gradient-to-r from-success/5 to-success/10">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText variant="title" className="font-bold">
                  Earnings Breakdown
                </ThemedText>
                <View className="bg-success/20 px-3 py-1 rounded-full">
                  <ThemedText className="text-success font-bold text-sm">
                    + ₹{totalEarnings.toLocaleString('en-IN')}
                  </ThemedText>
                </View>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-burgundy/10 rounded-full items-center justify-center mr-3">
                      <Ionicons name="car" size={16} color="#BD8C5E" />
                    </View>
                    <ThemedText>Base Fare</ThemedText>
                  </View>
                  <ThemedText className="font-semibold">
                    ₹{job.fare.toLocaleString('en-IN')}
                  </ThemedText>
                </View>

                {job.tips > 0 && (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-warning/10 rounded-full items-center justify-center mr-3">
                        <Ionicons name="heart" size={16} color="#f59e0b" />
                      </View>
                      <ThemedText>Tips</ThemedText>
                    </View>
                    <ThemedText className="font-semibold text-warning">
                      + ₹{job.tips.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                )}

                <View className="border-t border-border dark:border-darkBorder my-2" />

                <View className="flex-row justify-between items-center">
                  <ThemedText className="font-bold text-lg">Total Earnings</ThemedText>
                  <ThemedText className="font-bold text-lg text-success">
                    ₹{totalEarnings.toLocaleString('en-IN')}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Service Type */}
          <View className="px-4">
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
              </View>

              <View className="border-t border-border dark:border-darkBorder pt-3">
                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText variant="caption" className="text-secondary ml-2">
                      {job.duration} min
                    </ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="navigate" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                    <ThemedText variant="caption" className="text-secondary ml-2">
                      {job.distance} km
                    </ThemedText>
                  </View>
                </View>
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
                  className="flex-row items-center bg-secondary/10 px-3 py-2 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={16} color="#BD8C5E" />
                  <ThemedText className="text-secondary font-semibold ml-2">
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
                          name={star <= (job.customerRating || 0) ? "star" : "star-outline"}
                          size={14}
                          color="#fbbf24"
                        />
                      ))}
                      {job.customerRating > 0 && (
                        <ThemedText variant="caption" className="ml-2">
                          {job.customerRating.toFixed(1)} rating
                        </ThemedText>
                      )}
                    </View>
                  </View>
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
                    <View className="w-4 h-4 border-2 border-burgundy rounded-full mt-1 mr-3" />
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
          {job.pickupLocation && (
            <View className="px-4 mb-4">
              <RouteMap
                pickupLocation={job.pickupLocation}
                dropoffLocation={job.dropoffLocation}
                mapHeight={200}
                showControls={false}
              />
            </View>
          )}

          {/* Rating Section */}
          <View className="px-4 mb-6">
            <ThemedCard className="p-4">
              <ThemedText variant="title" className="font-bold mb-4 text-center">
                {isAlreadyRated ? 'Your Rating' : 'Rate Customer'}
              </ThemedText>

              {isAlreadyRated ? (
                <View className="items-center">
                  <View className="flex-row items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= job.rating! ? "star" : "star-outline"}
                        size={32}
                        color="#fbbf24"
                        style={{ marginRight: 4 }}
                      />
                    ))}
                  </View>
                  <ThemedText className="text-success font-semibold mb-2">
                    You rated this customer {job.rating}/5
                  </ThemedText>
                  {job.customerComment && (
                    <View className="bg-surface dark:bg-darkSurface p-3 rounded-lg mt-3">
                      <ThemedText variant="caption" className="italic">
                        "{job.customerComment}"
                      </ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                <View className="items-center">
                  <ThemedText variant="secondary" className="text-center mb-4">
                    How was your experience with this customer?
                  </ThemedText>

                  <View className="flex-row items-center justify-center mb-4" style={{ position: 'relative', zIndex: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        onPress={() => setCustomerRating(star)}
                        onPressIn={() => setCustomerRating(star)}
                        hitSlop={8}
                        style={{ padding: 4 }}
                      >
                        <Ionicons
                          name={star <= customerRating ? "star" : "star-outline"}
                          size={40}
                          color={star <= customerRating ? "#fbbf24" : "#d1d5db"}
                          style={{ marginRight: 8 }}
                        />
                      </Pressable>
                    ))}
                  </View>

                  {customerRating > 0 && (
                    <ThemedText className="text-center mb-4">
                      {customerRating === 1 ? 'Poor' :
                       customerRating === 2 ? 'Fair' :
                       customerRating === 3 ? 'Good' :
                       customerRating === 4 ? 'Very Good' : 'Excellent'}
                    </ThemedText>
                  )}

                  <View className="w-full mb-4">
                    <ThemedText variant="caption" className="text-secondary mb-2">
                      Add a comment (optional)
                    </ThemedText>
                    <View className="bg-surface dark:bg-darkSurface rounded-lg p-3 border border-border dark:border-darkBorder">
                      <ThemedText className="min-h-[60px]">
                        {customerComment || 'Tap to add a comment...'}
                      </ThemedText>
                    </View>
                  </View>

                  <PrimaryButton
                    title={submittingRating ? 'Submitting...' : 'Submit Rating'}
                    onPress={handleSubmitRating}
                    disabled={customerRating === 0 || submittingRating}
                    className="w-full"
                  />
                </View>
              )}
            </ThemedCard>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="p-4 border-t border-border dark:border-darkBorder bg-surface dark:bg-darkSurface">
          <TouchableOpacity
            onPress={() => router.push('/(driver)/(tabs)/requests')}
            className="w-full py-4 items-center bg-secondary rounded-lg"
            activeOpacity={0.7}
          >
            <ThemedText className="font-semibold text-white">
              Back to Rides
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
