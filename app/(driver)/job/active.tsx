import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Alert, Linking, ScrollView, Dimensions, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { RouteMap } from '../../../components/driver/navigation/RouteMap';
import { useJobStore } from '../../../store/jobStore';
import { BrandColors } from '../../../constants/Colors';
import { useEarningsStore } from '../../../store/earningsStore';
import { useAuthStore } from '../../../store/authStore';
import { Location } from '../../../types/navigation';
import DriverRidesApiService, { DriverRideDetail } from '../../../services/api/DriverRidesApiService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_PANEL_HEIGHT = SCREEN_HEIGHT * 0.40;

export default function ActiveJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const {
    activeJob,
    updateJobStatus,
    updateCurrentLocation,
    fetchRideDetailsAndSync,
    completeJob,
    cancelJob,
    completeRideFromAPI
  } = useJobStore();

  const { addJobEarnings } = useEarningsStore();

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const rideStartTimeRef = useRef<Date | null>(null);
  const [rideDuration, setRideDuration] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [rideDetails, setRideDetails] = useState<DriverRideDetail | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncRideDetails = async () => {
      try {
        const response = await DriverRidesApiService.getRideDetails(jobId);
        if (mounted && response.success && response.data) {
          setRideDetails(response.data);
          useJobStore.getState().syncActiveJobFromBooking(response.data as any);
          if (response.data.trip_started_at) {
            const startedAt = new Date(response.data.trip_started_at);
            if (!Number.isNaN(startedAt.getTime())) {
              rideStartTimeRef.current = startedAt;
              setRideDuration(getDurationSeconds(startedAt));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching active ride details:', error);
      }
    };

    const init = async () => {
      let currentActiveJob = useJobStore.getState().activeJob;
      if (!currentActiveJob && jobId) {
        await fetchRideDetailsAndSync(jobId);
        currentActiveJob = useJobStore.getState().activeJob;
      }

      if (!currentActiveJob) {
        if (mounted) router.back();
        return;
      }

      if (currentActiveJob.status !== 'started') {
        updateJobStatus('started');
      }

      if (currentActiveJob.startTime) {
        const startedAt = new Date(currentActiveJob.startTime);
        if (!Number.isNaN(startedAt.getTime())) {
          rideStartTimeRef.current = startedAt;
          setRideDuration(getDurationSeconds(startedAt));
        }
      }

      await syncRideDetails();
    };

    init();

    const timer = startRideTimer();
    const tracking = startLocationTracking();
    const detailsRefresh = setInterval(() => {
      syncRideDetails();
    }, 15000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      if (tracking) clearInterval(tracking);
      clearInterval(detailsRefresh);
    };
  }, [fetchRideDetailsAndSync, jobId, router, updateJobStatus]);

  const getDurationSeconds = (startedAt: Date) =>
    Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));

  const startRideTimer = () => {
    const interval = setInterval(() => {
      setRideDuration(() => {
        if (!rideStartTimeRef.current) return 0; // Wait for real start time from backend
        return getDurationSeconds(rideStartTimeRef.current);
      });
    }, 1000);

    return interval;
  };

  const startLocationTracking = () => {
    // Mock location tracking
    const interval = setInterval(() => {
      const mockLocation: Location = {
        latitude: 28.4595 + (Math.random() - 0.5) * 0.01,
        longitude: 77.0266 + (Math.random() - 0.5) * 0.01,
        address: 'Current Location'
      };

      setCurrentLocation(mockLocation);
      updateCurrentLocation(mockLocation);
    }, 5000);

    return interval;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride?',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Ride',
          onPress: showRatingDialog
        }
      ]
    );
  };

  const showRatingDialog = () => {
    Alert.alert(
      'Rate Customer',
      'How was your experience with this customer?',
      [
        {
          text: '5 Stars',
          onPress: () => completeRideWithRating(5)
        },
        {
          text: '4 Stars',
          onPress: () => completeRideWithRating(4)
        },
        {
          text: '3 Stars',
          onPress: () => completeRideWithRating(3)
        },
        {
          text: 'Skip Rating',
          onPress: () => completeRideWithRating()
        }
      ]
    );
  };

  const completeRideWithRating = async (customerRating?: number) => {
    if (!activeJob) return;

    setIsCompleting(true);

    try {
      const toNum = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const actualDuration = Math.floor(rideDuration / 60);
      const actualDistance = toNum(
        (rideDetails as any)?.actual_distance_km ??
        (rideDetails as any)?.estimated_distance_km ??
        (activeJob as any)?.distance
      ) || 0;
      const tips = toNum((rideDetails as any)?.tip_amount) || 0;

      const success = await completeRideFromAPI(activeJob.id, {
        dropoff_lat: currentLocation?.latitude?.toString() || '0',
        dropoff_long: currentLocation?.longitude?.toString() || '0',
        actual_distance_km: actualDistance,
        actual_duration_minutes: actualDuration,
      });

      if (!success) {
        Alert.alert('Error', 'Failed to complete ride on server. Please try again.');
        setIsCompleting(false);
        return;
      }

      addJobEarnings(activeJob.fare, tips, actualDistance, actualDuration);
      completeJob(tips, customerRating);

      Alert.alert(
        'Ride Completed!',
        `Great job! You earned ₹${(
          toNum((rideDetails as any)?.net_earnings) ??
          toNum((rideDetails as any)?.driver_earnings_breakdown?.net_earnings) ??
          activeJob.net_earnings ??
          activeJob.fare
        ).toLocaleString('en-IN')} for this trip.`,
        [
          {
            text: 'View Earnings',
            onPress: () => {
              router.replace('/(driver)/(tabs)/earnings');
            }
          },
          {
            text: 'Find Next Ride',
            onPress: () => {
              router.replace('/(driver)/(tabs)');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error completing ride:', error);
      Alert.alert('Error', 'Failed to complete the ride. Please try again.');
      setIsCompleting(false);
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'What type of emergency assistance do you need?',
      [
        {
          text: 'Call Police',
          onPress: () => Linking.openURL('tel:100')
        },
        {
          text: 'Medical Emergency',
          onPress: () => Linking.openURL('tel:108')
        },
        {
          text: 'Support',
          onPress: () => Linking.openURL('tel:+911234567890')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    if (!activeJob?.customerPhone) return;

    const phoneNumber = activeJob.customerPhone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride?',
      'Are you sure you want to cancel this ride? This action cannot be undone.',
      [
        { text: 'No, Continue', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelJob('Cancelled by driver');
            router.replace('/(driver)');
          }
        }
      ]
    );
  };

  const handleStartNavigation = () => {
    const dropoff = activeJob?.dropoffLocation;
    if (!dropoff?.latitude || !dropoff?.longitude) {
      Alert.alert('Navigation', 'Destination coordinates are not available yet.');
      return;
    }

    const { latitude, longitude } = dropoff;
    const label = encodeURIComponent(dropoff.address || dropoff.name || 'Destination');

    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
      Linking.canOpenURL(appleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(appleMapsUrl);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`);
        }
      });
    } else {
      const googleMapsUrl = `google.navigation:q=${latitude},${longitude}`;
      Linking.canOpenURL(googleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(googleMapsUrl);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        }
      });
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

  const backendData = (rideDetails || activeJob) as any;
  const breakdown = backendData.driver_earnings_breakdown || backendData.earnings || {};
  const toNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const formatMoney = (value: number | null) => value === null ? 'NA' : `₹${value.toLocaleString('en-IN')}`;
  const formatMoneyWithSign = (value: number | null, sign: '+' | '-') =>
    value === null ? 'NA' : `${sign} ₹${value.toLocaleString('en-IN')}`;

  const totalFare = toNumber(
    breakdown.total_fare ??
    backendData.actual_fare ??
    backendData.estimated_fare ??
    backendData.fare
  );
  const platformFee = toNumber(
    breakdown.platform_fee ??
    backendData.platform_fee
  );
  const tipAmount = toNumber(
    breakdown.tip_amount ??
    backendData.tip_amount
  );
  const bonusAmount = toNumber(
    breakdown.bonus_amount ??
    backendData.bonus_amount
  );
  const yourEarnings = toNumber(
    breakdown.net_earnings ??
    backendData.net_earnings ??
    backendData.driver_earnings ??
    activeJob.net_earnings
  );
  const otherFees = Array.isArray(breakdown.other_fees) ? breakdown.other_fees : [];
  const displayDistance = toNumber(
    backendData.actual_distance_km ??
    backendData.estimated_distance_km ??
    backendData.distance
  );

  return (
    <View style={styles.container}>
      {/* Full-Screen Map Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <RouteMap
          pickupLocation={activeJob.pickupLocation}
          dropoffLocation={activeJob.dropoffLocation}
          currentLocation={currentLocation || undefined}
          route={activeJob.route}
          eta={activeJob.eta}
          mapHeight={SCREEN_HEIGHT}
          showCurrentLocation={true}
          onLocationUpdate={updateCurrentLocation}
        />
      </View>

      {/* Floating Header Overlay */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View
          className="border border-border dark:border-darkBorder"
          style={[styles.headerBar, { backgroundColor: isDarkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.92)' }]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center flex-1">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-success rounded-full mr-2" />
              <ThemedText variant="title" className="font-bold">
                Ride in Progress
              </ThemedText>
            </View>
            <ThemedText variant="caption" className="text-success">
              Duration: {formatDuration(rideDuration)}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={handleEmergency}
            className="w-10 h-10 bg-danger rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="warning" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View
        className="bg-surface dark:bg-darkSurface"
        style={styles.bottomPanel}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}
          bounces={false}
        >
          {/* Single Unified Card — All Details */}
          <ThemedCard variant="elevated" className="p-4 mb-3">
            {/* Customer Info Section */}
            <View className="flex-row items-center justify-between mb-3">
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
                    In vehicle • {formatDuration(rideDuration)}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCallCustomer}
                className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color="#bd8c5e" />
              </TouchableOpacity>
            </View>

            {/* Destination Section */}
            {activeJob.dropoffLocation && (
              <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="flag" size={16} color="#ef4444" />
                  <ThemedText variant="caption" className="text-secondary uppercase font-semibold ml-2">
                    DESTINATION
                  </ThemedText>
                </View>
                <ThemedText className="font-bold text-lg">
                  {activeJob.dropoffLocation.name || activeJob.dropoffLocation.address}
                </ThemedText>
                {activeJob.dropoffLocation.name && (
                  <ThemedText variant="caption" className="text-secondary">
                    {activeJob.dropoffLocation.address}
                  </ThemedText>
                )}
              </View>
            )}

            {/* Trip Stats Section */}
            <View className="border-t border-border dark:border-darkBorder pt-3 mb-3">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <ThemedText className="font-bold text-lg">
                    {formatDuration(rideDuration)}
                  </ThemedText>
                  <ThemedText variant="caption">Duration</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg">
                    {displayDistance === null ? 'NA' : `${displayDistance} km`}
                  </ThemedText>
                  <ThemedText variant="caption">Distance</ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText className="font-bold text-lg text-burgundy">
                    {formatMoney(yourEarnings)}
                  </ThemedText>
                  <ThemedText variant="caption">Earnings</ThemedText>
                </View>
              </View>
            </View>

            {/* Fare Breakdown Section */}
            <View className="border-t border-border dark:border-darkBorder pt-3">
              <View className="flex-row justify-between items-center mb-1">
                <ThemedText variant="caption" className="text-secondary">
                  Total Fare
                </ThemedText>
                <ThemedText className="font-semibold">
                  {formatMoney(totalFare)}
                </ThemedText>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <ThemedText variant="caption" className="text-secondary">
                  Platform Fee
                </ThemedText>
                <ThemedText variant="caption">
                  {formatMoneyWithSign(platformFee, '-')}
                </ThemedText>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <ThemedText variant="caption" className="text-secondary">
                  Tips
                </ThemedText>
                <ThemedText variant="caption">
                  {formatMoneyWithSign(tipAmount, '+')}
                </ThemedText>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <ThemedText variant="caption" className="text-secondary">
                  Bonus
                </ThemedText>
                <ThemedText variant="caption">
                  {formatMoneyWithSign(bonusAmount, '+')}
                </ThemedText>
              </View>
              {otherFees.map((fee: any, index: number) => {
                const feeAmount = toNumber(fee?.amount);
                const sign: '+' | '-' = fee?.direction === 'plus' ? '+' : '-';
                return (
                  <View className="flex-row justify-between items-center mb-1" key={`active-other-fee-${index}`}>
                    <ThemedText variant="caption" className="text-secondary">
                      {fee?.label || 'Other Fee'}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {formatMoneyWithSign(feeAmount, sign)}
                    </ThemedText>
                  </View>
                );
              })}
              <View className="flex-row justify-between items-center mt-1">
                <ThemedText variant="caption" className="text-secondary">
                  Your Earnings
                </ThemedText>
                <ThemedText className="text-burgundy font-bold text-lg">
                  {formatMoney(yourEarnings)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Navigate Button */}
          <TouchableOpacity
            onPress={handleStartNavigation}
            className="flex-row items-center justify-center py-4 bg-blue-500 rounded-xl mb-3"
            style={styles.navBtnShadow}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <ThemedText className="text-white font-bold ml-2">
              Navigate to Destination
            </ThemedText>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-3">
            <TouchableOpacity
              onPress={handleCancelRide}
              className="flex-1 py-4 items-center border border-danger/30 rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="font-semibold text-danger">
                Cancel Ride
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCompleteRide}
              disabled={isCompleting}
              className={`py-4 items-center rounded-lg ${isCompleting ? 'bg-gray-400' : 'bg-success'
                }`}
              style={{ flex: 2 }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={isCompleting ? "hourglass" : "checkmark-circle"}
                  size={20}
                  color="white"
                />
                <ThemedText className="text-white font-semibold ml-2">
                  {isCompleting ? 'Completing...' : 'Complete Ride'}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Emergency Contact */}
          <TouchableOpacity
            onPress={handleEmergency}
            className="py-3 items-center bg-danger/10 border border-danger/20 rounded-lg mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#ef4444" />
              <ThemedText className="text-danger font-semibold ml-2">
                Emergency Contact
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Bottom safe area spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_PANEL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  navBtnShadow: {
    shadowColor: BrandColors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
