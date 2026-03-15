import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Animated, Dimensions, Image, RefreshControl, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BookingApiService, { BookingDetail } from '../../services/api/BookingApiService';
import UniversalMapView, { MapMarker, MapRoute } from '../../components/shared/MapView';
import { appConfig } from '../../config/env';
import { BrandColors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SearchingDriversScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const curtainAnim = useRef(new Animated.Value(height)).current;
  const searchRipple1 = useRef(new Animated.Value(0)).current;
  const searchRipple2 = useRef(new Animated.Value(0)).current;
  const searchRipple3 = useRef(new Animated.Value(0)).current;
  const dotAnimation = useRef(new Animated.Value(0)).current;

  const [searchText, setSearchText] = useState('Searching for a chauffeur near you');
  const [showCurtain, setShowCurtain] = useState(false);
  const [rideDetails, setRideDetails] = useState<BookingDetail | null>(null);
  const [rideError, setRideError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch ride details from API
  const fetchRideDetails = useCallback(async () => {
    const bookingId = String(params.bookingId || '');
    if (!bookingId) {
      setRideError('Missing booking ID');
      return;
    }

    try {
      const response = await BookingApiService.getRideDetails(bookingId);
      if (response.success && response.data) {
        setRideDetails(response.data);
        if (response.data.driver) {
          setShowCurtain(true);
          startCurtainAnimation();
        }
      } else if (response.error) {
        setRideError(response.error);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      setRideError('Failed to fetch ride details');
    }
  }, [params.bookingId]);

  useEffect(() => {
    startSearchAnimations();
    startTextAnimations();
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRideDetails();

    // Poll for driver assignment every 2 seconds
    const interval = setInterval(() => {
      fetchRideDetails();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchRideDetails]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRideDetails();
    setRefreshing(false);
  }, [fetchRideDetails]);

  const startSearchAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const createRippleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createRippleAnimation(searchRipple1, 0).start();
    createRippleAnimation(searchRipple2, 500).start();
    createRippleAnimation(searchRipple3, 1000).start();
  };

  const startTextAnimations = () => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCurtainAnimation = () => {
    Animated.timing(curtainAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      router.replace({
        pathname: '/(customer)/ride-tracking',
        params: {
          bookingId: tripDetails.bookingId || '',
          pickup: tripDetails.pickup || '',
          destination: tripDetails.destination || '',
          fare: tripDetails.fare || '',
        },
      });
    });
  };

  const handleCancelSearch = () => {
    const bookingId = String(params.bookingId || '');
    Alert.alert(
      'Cancel Search',
      'Are you sure you want to cancel your ride request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (bookingId) {
              await BookingApiService.cancelRide(bookingId, 'Cancelled during search');
            }
            router.back();
          },
        },
      ]
    );
  };

  const tripDetails = {
    pickup: (Array.isArray(params.pickup) ? params.pickup[0] : params.pickup) || 'Current Location',
    destination: (Array.isArray(params.destination) ? params.destination[0] : params.destination) || 'Destination',
    bookingId: Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId,
    fare: Array.isArray(params.fare) ? params.fare[0] : params.fare,
  };

  const pickupCoordinate = useMemo(() => {
    if (rideDetails?.pickup_lat && rideDetails?.pickup_long) {
      const latitude = Number(rideDetails.pickup_lat);
      const longitude = Number(rideDetails.pickup_long);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) return { latitude, longitude };
    }
    
    if (params.pickupLat && params.pickupLng) {
      const latitude = Number(Array.isArray(params.pickupLat) ? params.pickupLat[0] : params.pickupLat);
      const longitude = Number(Array.isArray(params.pickupLng) ? params.pickupLng[0] : params.pickupLng);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) return { latitude, longitude };
    }
    
    return null;
  }, [rideDetails?.pickup_lat, rideDetails?.pickup_long, params.pickupLat, params.pickupLng]);

  const dropoffCoordinate = useMemo(() => {
    if (rideDetails?.dropoff_lat && rideDetails?.dropoff_long) {
      const latitude = Number(rideDetails.dropoff_lat);
      const longitude = Number(rideDetails.dropoff_long);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) return { latitude, longitude };
    }

    if (params.dropLat && params.dropLng) {
      const latitude = Number(Array.isArray(params.dropLat) ? params.dropLat[0] : params.dropLat);
      const longitude = Number(Array.isArray(params.dropLng) ? params.dropLng[0] : params.dropLng);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) return { latitude, longitude };
    }

    return null;
  }, [rideDetails?.dropoff_lat, rideDetails?.dropoff_long, params.dropLat, params.dropLng]);

  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];
    if (pickupCoordinate) {
      markers.push({
        id: 'pickup',
        coordinate: pickupCoordinate,
        title: 'Pickup',
        description: rideDetails?.pickup_address || tripDetails.pickup,
        type: 'pickup',
      });
    }
    if (dropoffCoordinate) {
      markers.push({
        id: 'dropoff',
        coordinate: dropoffCoordinate,
        title: 'Destination',
        description: rideDetails?.dropoff_address || tripDetails.destination,
        type: 'dropoff',
      });
    }
    return markers;
  }, [pickupCoordinate, dropoffCoordinate, rideDetails?.pickup_address, rideDetails?.dropoff_address, tripDetails.pickup, tripDetails.destination]);

  const mapRoute: MapRoute | undefined = useMemo(() => {
    if (!pickupCoordinate || !dropoffCoordinate) return undefined;
    return {
      origin: pickupCoordinate,
      destination: dropoffCoordinate,
      strokeColor: BrandColors.secondary,
      strokeWidth: 4,
    };
  }, [pickupCoordinate, dropoffCoordinate]);

  // Initial map region - use pickup coordinate if available, otherwise default to Delhi
  const initialRegion = useMemo(() => {
    if (pickupCoordinate) {
      return {
        ...pickupCoordinate,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Default to Delhi region
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0922,
    };
  }, [pickupCoordinate]);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="flex-1">
          {/* Map Background - Top Partial */}
          <View style={{ height: height * 0.45 }}>
            <UniversalMapView
              initialRegion={initialRegion}
              markers={mapMarkers}
              route={mapRoute}
              googleMapsApiKey={appConfig.googleMapsApiKey}
              showUserLocation={false}
              style={{ flex: 1 }}
            />

            {/* Driver Search Animation - Overlay on Map */}
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
              <Animated.View
                className="absolute w-40 h-40 rounded-full border-2 border-burgundy"
                style={{
                  opacity: searchRipple1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0],
                  }),
                  transform: [{
                    scale: searchRipple1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2],
                    }),
                  }],
                }}
              />
              <Animated.View
                className="absolute w-40 h-40 rounded-full border-2 border-secondary"
                style={{
                  opacity: searchRipple2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 0],
                  }),
                  transform: [{
                    scale: searchRipple2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2.5],
                    }),
                  }],
                }}
              />
              <Animated.View
                className="absolute w-40 h-40 rounded-full border-2 border-burgundy opacity-30"
                style={{
                  opacity: searchRipple3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [{
                    scale: searchRipple3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 3],
                    }),
                  }],
                }}
              />

              <Animated.View
                className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-lg border-2 border-burgundy"
                style={{
                  transform: [{
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  }],
                }}
              >
                <Image
                  source={require('../../assets/chauffit-logo.png')}
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom - Search Status */}
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 30 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[BrandColors.secondary]}
                tintColor={BrandColors.secondary}
              />
            }
          >
            <Animated.View
              className="items-center justify-center"
              style={{ opacity: textOpacity }}
            >
              {/* Status Icon */}
              <View className="w-20 h-20 bg-secondary/10 rounded-full items-center justify-center mb-6">
                <Animated.View
                  style={{
                    transform: [{
                      rotate: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    }],
                  }}
                >
                  <Ionicons name="search" size={32} color={BrandColors.secondary} />
                </Animated.View>
              </View>

              {/* Search Text with Animated Dots */}
              <View className="flex-row items-center mb-8">
                <ThemedText variant="h3" className="text-center">
                  {searchText}
                </ThemedText>
                <Animated.View
                  className="ml-2 flex-row"
                  style={{
                    opacity: dotAnimation.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                  }}
                >
                  <ThemedText variant="h3">...</ThemedText>
                </Animated.View>
              </View>

              <ThemedText variant="small" className="text-center px-4">
                We're connecting you with the best chauffeur in your area. This usually takes 10-30 seconds.
              </ThemedText>

              {/* Trip Details Preview */}
              <View className="mt-8 w-full">
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location" size={16} color={BrandColors.success} />
                    <ThemedText variant="small" className="ml-2">From</ThemedText>
                  </View>
                  <ThemedText className="mb-3 pl-6">{tripDetails.pickup}</ThemedText>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="navigate" size={16} color={BrandColors.danger} />
                    <ThemedText variant="small" className="ml-2">To</ThemedText>
                  </View>
                  <ThemedText className="pl-6">{tripDetails.destination}</ThemedText>
                </View>
              </View>

              {/* Cancel Search Button */}
              <TouchableOpacity
                onPress={handleCancelSearch}
                style={{
                  marginTop: 24,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#DC2626',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <ThemedText style={{ color: '#DC2626', fontWeight: '600', fontSize: 15 }}>
                  Cancel Search
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Curtain Animation Overlay */}
          {showCurtain && (
            <Animated.View
              className="absolute inset-0 bg-background dark:bg-darkBackground items-center justify-center"
              style={{
                transform: [{
                  translateY: curtainAnim,
                }],
              }}
            >
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={32} color={BrandColors.success} />
                </View>
                <ThemedText variant="h3" className="text-center mb-2">
                  Driver Found!
                </ThemedText>
                <ThemedText variant="small" className="text-center">
                  {rideDetails?.driver?.full_name || 'Your driver'} is on the way
                </ThemedText>
              </View>
            </Animated.View>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
