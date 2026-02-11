import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { RouteMap } from '../../../components/driver/navigation/RouteMap';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import { ActiveJob, Location } from '../../../types/navigation';
import DriverRidesApiService, { BookingDetail } from '../../../services/api/DriverRidesApiService';

// Map backend booking status to frontend ActiveJob status
const mapBackendStatusToFrontend = (bookingStatus: string): ActiveJob['status'] => {
  switch (bookingStatus) {
    case 'requested':
      return 'accepted' as const;
    case 'driver_assigned':
    case 'biker_assigned':
      return 'accepted' as const;
    case 'driver_en_route':
      return 'en_route_pickup' as const;
    case 'driver_arrived':
      return 'arrived_pickup' as const;
    case 'trip_started':
      return 'started' as const;
    case 'trip_completed':
      return 'completed' as const;
    default:
      return 'accepted' as const;
  }
};

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const {
    activeJob,
    updateJobStatus,
    updateCurrentLocation,
    updateETA,
    syncActiveJobFromBooking
  } = useJobStore();

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  const formatCoord = (value?: number | null) => {
    if (value === null || value === undefined) return undefined;
    return Number(value.toFixed(8));
  };

  const updateBackendRideStatus = async (status: 'driver_en_route' | 'driver_arrived') => {
    if (!activeJob?.id) return false;
    const response = await DriverRidesApiService.updateRideStatus(activeJob.id, {
      status,
      location_lat: formatCoord(currentLocation?.latitude),
      location_long: formatCoord(currentLocation?.longitude),
    });
    if (!response.success || !response.data) {
      Alert.alert('Status Update Failed', response.error || 'Please try again.');
      return false;
    }
    syncActiveJobFromBooking(response.data as BookingDetail);
    return true;
  };

  // Get current ride status from backend and redirect appropriately
  const initializeNavigation = async (rideId: string) => {
    try {
      const response = await DriverRidesApiService.getRideDetails(rideId);

      if (!response.success || !response.data) {
        Alert.alert('Error', 'Failed to fetch ride details.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      let rideDetails = response.data;
      let bookingStatus = rideDetails.booking_status;
      console.log('[Navigation] Current booking status:', bookingStatus);

      // If ride is still requested, try to accept it first
      if (bookingStatus === 'requested') {
        console.log('[Navigation] Ride still in requested status, accepting...');
        const acceptResponse = await DriverRidesApiService.acceptRide(rideId);
        if (!acceptResponse.success) {
          console.error('[Navigation] Failed to accept ride:', acceptResponse.error);
          Alert.alert(
            'Cannot Start Navigation',
            'Please accept this ride first.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
        if (acceptResponse.data) {
          rideDetails = acceptResponse.data as BookingDetail;
          bookingStatus = rideDetails.booking_status;
        }
      }

      // Keep local store synchronized with latest backend details
      syncActiveJobFromBooking(rideDetails as BookingDetail);

      // If trip has already started, redirect to active trip page
      if (bookingStatus === 'trip_started') {
        console.log('[Navigation] Trip already started, redirecting to active trip page');
        router.replace({
          pathname: '/(driver)/job/active',
          params: { jobId: rideId }
        });
        return;
      }

      // Map backend status to frontend status and update local state
      const frontendStatus = mapBackendStatusToFrontend(bookingStatus);

      // Only update status if it's not already en_route_pickup or arrived_pickup
      const currentActiveJob = (useJobStore as any).getState().activeJob;
      if (currentActiveJob &&
          currentActiveJob.status !== 'en_route_pickup' &&
          currentActiveJob.status !== 'arrived_pickup' &&
          currentActiveJob.status !== frontendStatus) {
        updateJobStatus(frontendStatus);
      }

      // If status is driver_arrived, skip to arrived state
      if (bookingStatus === 'driver_arrived') {
        setHasArrived(true);
      }

      // Start backend sync if status is still early
      if (bookingStatus === 'driver_assigned' || bookingStatus === 'biker_assigned') {
        const movedEnRoute = await updateBackendRideStatus('driver_en_route');
        if (movedEnRoute) {
          updateJobStatus('en_route_pickup');
        }
      }

      setIsNavigating(true);
    } catch (error) {
      console.error('[Navigation] Error initializing navigation:', error);
      Alert.alert('Error', 'Failed to initialize navigation.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  useEffect(() => {
    // Check if we have an activeJob, if not redirect back
    const currentActiveJob = (useJobStore as any).getState().activeJob;
    if (!currentActiveJob) {
      router.back();
      return;
    }

    initializeNavigation(currentActiveJob.id);

    // Mock location updates
    const cleanup = startLocationTracking();
    return cleanup;
  }, []); // Run only once on mount

  const startLocationTracking = () => {
    // Mock location tracking - in real app, use expo-location
    const interval = setInterval(() => {
      const mockLocation: Location = {
        latitude: 28.4595 + (Math.random() - 0.5) * 0.01,
        longitude: 77.0266 + (Math.random() - 0.5) * 0.01,
        address: 'Current Location'
      };
      
      setCurrentLocation(mockLocation);
      updateCurrentLocation(mockLocation);
      
      // Update ETA
      const eta = Math.floor(Math.random() * 20) + 5;
      updateETA(`${eta} min`);
    }, 5000);

    return () => clearInterval(interval);
  };

  const handleArrivedAtPickup = () => {
    Alert.alert(
      'Arrived at Pickup?',
      'Have you arrived at the customer pickup location?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, I\'ve Arrived',
          onPress: async () => {
            const updated = await updateBackendRideStatus('driver_arrived');
            if (!updated) return;

            updateJobStatus('arrived_pickup');
            setHasArrived(true);
            Alert.alert(
              'Great!',
              'Please call the customer to let them know you have arrived.',
              [
                {
                  text: 'Call Customer',
                  onPress: handleCallCustomer
                },
                {
                  text: 'OK'
                }
              ]
            );
          },
        }
      ]
    );
  };

  const handleStartRide = () => {
    Alert.alert(
      'Start Ride?',
      'Is the customer in the vehicle and ready to start the ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Get OTP',
          onPress: () => {
            // Redirect to OTP screen to verify customer before starting ride
            router.push({
              pathname: '/(driver)/job/otp-start',
              params: { jobId: activeJob?.id }
            });
          }
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    if (!activeJob?.customerPhone) return;
    
    const phoneNumber = activeJob.customerPhone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenMaps = () => {
    if (!activeJob) return;
    
    const destination = `${activeJob.pickupLocation.latitude},${activeJob.pickupLocation.longitude}`;
    
    Alert.alert(
      'Open Navigation App',
      'Choose your preferred navigation app',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            Linking.openURL(url);
          }
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `maps://app?daddr=${destination}`;
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getStatusInfo = () => {
    if (!activeJob) return { title: '', description: '', color: '' };
    
    switch (activeJob.status) {
      case 'en_route_pickup':
        return {
          title: 'Driving to Pickup',
          description: 'Navigate to customer location',
          color: '#3b82f6'
        };
      case 'arrived_pickup':
        return {
          title: 'Arrived at Pickup',
          description: 'Waiting for customer',
          color: '#10b981'
        };
      default:
        return {
          title: 'Navigation',
          description: 'En route to customer',
          color: '#6b7280'
        };
    }
  };

  if (!activeJob) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>No active job found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center">
            <View className="flex-row items-center">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: statusInfo.color }}
              />
              <ThemedText variant="title" className="font-bold">
                {statusInfo.title}
              </ThemedText>
            </View>
            <ThemedText variant="caption" className="text-secondary">
              {statusInfo.description}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={handleOpenMaps}>
            <Ionicons name="navigate" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View className="flex-1">
          <RouteMap
            pickupLocation={activeJob.pickupLocation}
            dropoffLocation={activeJob.dropoffLocation}
            currentLocation={currentLocation || undefined}
            route={activeJob.route}
            eta={activeJob.eta}
            distance={`${Math.round(Math.random() * 10 + 1)} km away`}
            mapHeight={400}
            showCurrentLocation={true}
            onLocationUpdate={updateCurrentLocation}
          />
        </View>

        {/* Customer Info Card */}
        <View className="p-4">
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                  <ThemedText className="font-bold text-secondary text-lg">
                    {activeJob.customerName.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-bold text-lg">
                    {activeJob.customerName}
                  </ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    {activeJob.customerPhone}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-burgundy font-semibold">
                    ₹{activeJob.fare.toLocaleString('en-IN')} • {activeJob.eta || 'Calculating...'}
                  </ThemedText>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={handleCallCustomer}
                className="w-12 h-12 bg-success rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </ThemedCard>

          {/* Location Info */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row items-start">
              <View className="w-4 h-4 bg-success rounded-full mt-1 mr-3" />
              <View className="flex-1">
                <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                  PICKUP LOCATION
                </ThemedText>
                <ThemedText className="font-semibold">
                  {activeJob.pickupLocation.name || activeJob.pickupLocation.address}
                </ThemedText>
                {activeJob.pickupLocation.name && (
                  <ThemedText variant="caption" className="text-secondary">
                    {activeJob.pickupLocation.address}
                  </ThemedText>
                )}
              </View>
            </View>
            
            {activeJob.dropoffLocation && (
              <View className="flex-row items-start mt-3 pt-3 border-t border-border dark:border-darkBorder">
                <View className="w-4 h-4 border-2 border-danger rounded-full mt-1 mr-3" />
                <View className="flex-1">
                  <ThemedText variant="caption" className="text-secondary uppercase font-semibold mb-1">
                    DESTINATION
                  </ThemedText>
                  <ThemedText className="font-semibold">
                    {activeJob.dropoffLocation.name || activeJob.dropoffLocation.address}
                  </ThemedText>
                  {activeJob.dropoffLocation.name && (
                    <ThemedText variant="caption" className="text-secondary">
                      {activeJob.dropoffLocation.address}
                    </ThemedText>
                  )}
                </View>
              </View>
            )}
          </ThemedCard>

          {/* Action Buttons */}
          {activeJob.status === 'en_route_pickup' && !hasArrived && (
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleOpenMaps}
                className="flex-1 flex-row items-center justify-center py-4 border border-secondary rounded-lg"
                activeOpacity={0.7}
              >
                <Ionicons name="navigate" size={20} color="#bd8c5e" />
                <ThemedText className="text-secondary font-semibold ml-2">
                  Open Maps
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleArrivedAtPickup}
                className="flex-1 flex-row items-center justify-center py-4 bg-success rounded-lg"
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <ThemedText className="text-white font-semibold ml-2">
                  I've Arrived
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {(activeJob.status === 'arrived_pickup' || hasArrived) && (
            <View className="space-y-3">
              {/* Arrival confirmation */}
              <View className="bg-success/10 border border-success/20 rounded-lg p-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="text-success font-semibold ml-2">
                    You have arrived at the pickup location
                  </ThemedText>
                </View>
                <ThemedText variant="caption" className="text-success mt-1">
                  Please call the customer and wait for them to get in the vehicle.
                </ThemedText>
              </View>

              {/* Action buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleCallCustomer}
                  className="flex-1 flex-row items-center justify-center py-4 border border-success rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={20} color="#10b981" />
                  <ThemedText className="text-success font-semibold ml-2">
                    Call Customer
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleStartRide}
                  className="flex-1 flex-row items-center justify-center py-4 bg-burgundy rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="play-circle" size={20} color="white" />
                  <ThemedText className="text-white font-semibold ml-2">
                    Start Ride
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
