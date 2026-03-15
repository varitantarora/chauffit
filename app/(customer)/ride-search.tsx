import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  GooglePlacesAutocomplete,
  getPlaceDetails,
} from '../../components/customer/GooglePlacesAutocomplete';
import { useAuthStore } from '../../store/authStore';
import { useCarStore } from '../../store/carStore';
import { useBookingStore } from '../../store/bookingStore';
import BookingApiService, { FareEstimateResponse } from '../../services/api/BookingApiService';
import { DarkMapStyle } from '../../constants/MapStyles';
import { BrandColors } from '../../constants/Colors';
import { appConfig } from '../../config/env';

interface BookingLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  fullAddress?: string;
}

interface RideSearchParams {
  initialPickup?: string;
  initialPickupLat?: string;
  initialPickupLng?: string;
}

export default function RideSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as RideSearchParams;
  const insets = useSafeAreaInsets();

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const { cars, defaultCar, loadUserCars, isLoading: isCarsLoading } = useCarStore();
  const { createBooking } = useBookingStore();

  const [pickupLocation, setPickupLocation] = useState<BookingLocation>({
    address: params.initialPickup || '',
    latitude: params.initialPickupLat ? Number(params.initialPickupLat) : 28.6139,
    longitude: params.initialPickupLng ? Number(params.initialPickupLng) : 77.2090,
  });
  const [dropLocation, setDropLocation] = useState<BookingLocation | null>(null);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
  const [isFetchingPlaceDetails, setIsFetchingPlaceDetails] = useState(false);
  const [fareEstimate, setFareEstimate] = useState<FareEstimateResponse | null>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [fareError, setFareError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const mapRef = useRef<MapView>(null);
  const fareCardAnim = useRef(new Animated.Value(200)).current;
  const fareDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load cars on mount
  useEffect(() => {
    if (user?.id) {
      loadUserCars(user.id);
    }
  }, [user?.id]);

  // GPS auto-fill on mount
  const hasCoords = params.initialPickupLat && Number(params.initialPickupLat) !== 28.6139;
  useEffect(() => {
    if (hasCoords && !params.initialPickup) {
      // Coords available but no address — reverse-geocode in background
      (async () => {
        setIsFetchingCurrentLocation(true);
        try {
          const lat = Number(params.initialPickupLat);
          const lng = Number(params.initialPickupLng);
          const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (addresses.length > 0) {
            const addr = addresses[0];
            const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
            setPickupLocation(prev => ({ ...prev, address: parts.join(', ') }));
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        } finally {
          setIsFetchingCurrentLocation(false);
        }
      })();
    } else if (!hasCoords && !params.initialPickup) {
      // No coords at all — fresh GPS fetch
      (async () => {
        setIsFetchingCurrentLocation(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = loc.coords;
          const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (addresses.length > 0) {
            const addr = addresses[0];
            const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
            setPickupLocation({ address: parts.join(', '), latitude, longitude });
          }
        } catch (e) {
          console.warn('GPS auto-fill failed:', e);
        } finally {
          setIsFetchingCurrentLocation(false);
        }
      })();
    }
    // If both address and coords are present, no action needed
  }, []);

  // Fare calculation with 400ms debounce
  useEffect(() => {
    if (!pickupLocation.address || !dropLocation) return;

    const vehicleId = defaultCar?.id || cars[0]?.id;

    if (!vehicleId) {
      if (isCarsLoading) return; // Still loading — effect will re-run when cars resolve
      // Cars loaded but no vehicle registered — show card with CTA
      setFareEstimate(null);
      setFareError('no_vehicle');
      Animated.spring(fareCardAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
      return;
    }

    if (fareDebounceRef.current) clearTimeout(fareDebounceRef.current);

    fareDebounceRef.current = setTimeout(() => {
      calculateFare(vehicleId);
    }, 400);

    return () => {
      if (fareDebounceRef.current) clearTimeout(fareDebounceRef.current);
    };
  }, [pickupLocation, dropLocation, defaultCar, cars, isCarsLoading]);

  const calculateFare = async (vehicleId: string) => {
    if (!dropLocation) return;
    setIsCalculatingFare(true);
    setFareError(null);
    try {
      const response = await BookingApiService.getFareEstimate({
        vehicle_id: vehicleId,
        from_lat: pickupLocation.latitude,
        from_long: pickupLocation.longitude,
        from_address: pickupLocation.address,
        to_lat: dropLocation.latitude,
        to_long: dropLocation.longitude,
        to_address: dropLocation.address,
        type: 'one_way',
        when: 'now',
      });
      if (response.success && response.data) {
        setFareEstimate(response.data);
        Animated.spring(fareCardAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 10,
        }).start();
      } else {
        setFareError(response.error || 'Failed to get fare estimate');
        setFareEstimate(null);
        Animated.spring(fareCardAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 10,
        }).start();
      }
    } catch {
      setFareError('Failed to calculate fare. Please try again.');
      setFareEstimate(null);
      Animated.spring(fareCardAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } finally {
      setIsCalculatingFare(false);
    }
  };

  const handlePlaceSelected = async (place: any, fieldType: 'pickup' | 'dropoff') => {
    setIsFetchingPlaceDetails(true);
    try {
      const details = await getPlaceDetails(place.place_id, appConfig.googlePlacesApiKey);
      const displayAddress = place.structured_formatting?.main_text
        ? place.description
        : details.address;
      const newLocation: BookingLocation = {
        address: displayAddress,
        latitude: details.lat,
        longitude: details.lng,
        placeId: place.place_id,
        fullAddress: details.address,
      };

      if (fieldType === 'pickup') {
        setPickupLocation(newLocation);
      } else {
        setDropLocation(newLocation);
        // Animate map to fit both markers
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates(
              [
                { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
                { latitude: details.lat, longitude: details.lng },
              ],
              {
                edgePadding: { top: 220, bottom: 320, left: 60, right: 60 },
                animated: true,
              }
            );
          }
        }, 200);
        // Reset fare card when new destination is chosen
        fareCardAnim.setValue(200);
        setFareEstimate(null);
        setFareError(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to get location details. Please try again.');
    } finally {
      setIsFetchingPlaceDetails(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is needed to use your current location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
        setPickupLocation({ address: parts.join(', '), latitude, longitude });
      }
    } catch {
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setIsFetchingCurrentLocation(false);
    }
  };

  const handleConfirmBooking = async () => {
    const vehicleId = defaultCar?.id || cars[0]?.id;
    if (!vehicleId) {
      Alert.alert(
        'No Vehicle Found',
        'You need to add a vehicle before booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Vehicle',
            onPress: () => router.push('/(auth)/car-details'),
          },
        ]
      );
      return;
    }

    if (!dropLocation || !fareEstimate) return;

    setIsBooking(true);
    try {
      const formatCoord = (n: number) => parseFloat(n.toFixed(6));
      const bookingData = {
        vehicle_id: vehicleId,
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(dropLocation.latitude),
        to_long: formatCoord(dropLocation.longitude),
        to_address: dropLocation.fullAddress || dropLocation.address,
        type: 'one_way' as const,
      };

      const response = await BookingApiService.bookRide(bookingData);
      if (response.success && response.data) {
        const bookingId = response.data.id;
        await createBooking({
          id: bookingId,
          customerId: user?.id || '',
          chauffeurId: '',
          chauffeurName: 'Finding driver...',
          duration: 'One-way',
          pickupLocation: {
            address: pickupLocation.address,
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          },
          dropLocation: {
            address: dropLocation.address,
            latitude: dropLocation.latitude,
            longitude: dropLocation.longitude,
          },
          startTime: new Date(),
          price: Number(fareEstimate.estimated_fare),
          totalAmount: Number(fareEstimate.estimated_fare),
          status: 'pending' as const,
          paymentMethod: 'upi',
          paymentStatus: 'pending' as const,
          vehicleType: (defaultCar as any)?.vehicleType || 'luxury_sedan',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        router.push({
          pathname: '/(customer)/searching-drivers',
          params: {
            bookingId,
            pickup: pickupLocation.address,
            destination: dropLocation.address,
            fare: String(fareEstimate.estimated_fare),
            pickupLat: pickupLocation.latitude.toString(),
            pickupLng: pickupLocation.longitude.toString(),
            dropLat: dropLocation.latitude.toString(),
            dropLng: dropLocation.longitude.toString(),
          },
        });
      } else {
        Alert.alert('Booking Failed', response.error || 'Unable to book ride. Please try again.');
      }
    } catch {
      Alert.alert('Booking Failed', 'An error occurred while booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const showFareCard = !!dropLocation && (isCalculatingFare || !!fareEstimate || !!fareError);

  const renderFareBreakdown = () => {
    const bd = fareEstimate?.fare_breakdown;
    if (!bd) return null;

    const fmt = (val: string | undefined) => {
      if (!val) return null;
      const n = Number(val);
      if (isNaN(n) || n === 0) return null;
      return `₹${Math.round(n)}`;
    };

    const rows: Array<{ label: string; value: string }> = [];
    if (fmt(bd.base_fare)) rows.push({ label: 'Base fare', value: fmt(bd.base_fare)! });
    if (fmt(bd.distance_fare)) rows.push({ label: bd.distance_km ? `Distance (${Number(bd.distance_km).toFixed(1)} km)` : 'Distance fare', value: fmt(bd.distance_fare)! });
    if (fmt(bd.time_fare)) rows.push({ label: 'Time fare', value: fmt(bd.time_fare)! });
    if (fmt(bd.platform_fee)) rows.push({ label: 'Platform fee', value: fmt(bd.platform_fee)! });
    if (fmt(bd.biker_transport_fee)) rows.push({ label: 'Biker transport', value: fmt(bd.biker_transport_fee)! });
    if (fmt(bd.surge_amount)) rows.push({ label: 'Surge', value: fmt(bd.surge_amount)! });
    if (fmt(bd.insurance_premium)) rows.push({ label: 'Insurance', value: fmt(bd.insurance_premium)! });

    if (rows.length === 0) return null;

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Fare Breakdown
        </Text>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: textSecondary, fontSize: 14 }}>{row.label}</Text>
            <Text style={{ color: textPrimary, fontSize: 14 }}>{row.value}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '700' }}>Total</Text>
          <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '700' }}>
            ₹{Math.round(Number(fareEstimate!.estimated_fare))}
          </Text>
        </View>
      </View>
    );
  };

  const cardBg = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textPrimary = isDarkMode ? '#e5e5e5' : '#1a1a1a';
  const textSecondary = isDarkMode ? '#aaaaaa' : '#666666';
  const borderColor = isDarkMode ? '#333333' : '#e5e5e5';

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#111' : '#f5f5f5' }}>
      {/* Full-screen Map */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        customMapStyle={isDarkMode ? DarkMapStyle : undefined}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {pickupLocation.address !== '' && (
          <Marker
            coordinate={{ latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }}
            pinColor="#10b981"
          />
        )}
        {dropLocation && (
          <Marker
            coordinate={{ latitude: dropLocation.latitude, longitude: dropLocation.longitude }}
            pinColor="#ef4444"
          />
        )}
      </MapView>

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
          zIndex: 20,
        }}
      >
        <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#e5e5e5' : '#333'} />
      </TouchableOpacity>

      {/* Top card — pickup + destination inputs */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          right: 16,
          marginLeft: 48, // leave room for back button
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 10,
        }}
      >
        {/* Pickup field */}
        <View style={{ marginBottom: 8 }}>
          <GooglePlacesAutocomplete
            placeholder="Pickup location"
            value={pickupLocation.address}
            onPlaceSelected={(place) => handlePlaceSelected(place, 'pickup')}
            apiKey={appConfig.googlePlacesApiKey}
            isDarkMode={isDarkMode}
            icon="radio-button-on"
            onUseCurrentLocation={handleUseCurrentLocation}
            isFetchingCurrentLocation={isFetchingCurrentLocation}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: borderColor,
            marginHorizontal: 8,
            marginBottom: 8,
          }}
        />

        {/* Destination field */}
        <GooglePlacesAutocomplete
          placeholder="Where to?"
          value={dropLocation?.address || ''}
          onPlaceSelected={(place) => handlePlaceSelected(place, 'dropoff')}
          apiKey={appConfig.googlePlacesApiKey}
          isDarkMode={isDarkMode}
          icon="location"
          autoFocus={true}
        />

        {/* Fetching place details indicator */}
        {isFetchingPlaceDetails && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <ActivityIndicator size="small" color={BrandColors.secondary} />
            <Text style={{ color: textSecondary, fontSize: 12, marginLeft: 8 }}>
              Getting location details...
            </Text>
          </View>
        )}
      </View>

      {/* Fare card (slides up from bottom) */}
      {showFareCard && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: fareCardAnim }],
          }}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 16,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDarkMode ? '#555' : '#ddd',
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            {isCalculatingFare && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <ActivityIndicator size="small" color={BrandColors.secondary} />
                <Text style={{ color: textSecondary, fontSize: 14, marginLeft: 10 }}>
                  Estimating fare...
                </Text>
              </View>
            )}

            {fareError && !isCalculatingFare && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>
                  {fareError === 'no_vehicle'
                    ? 'You need a registered vehicle to book a ride.'
                    : fareError}
                </Text>
                {fareError === 'no_vehicle' ? (
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/car-details')}
                    style={{
                      backgroundColor: BrandColors.burgundy,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Add Vehicle</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      const vehicleId = defaultCar?.id || cars[0]?.id;
                      if (vehicleId) calculateFare(vehicleId);
                    }}
                    style={{
                      backgroundColor: BrandColors.burgundy,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {fareEstimate && !isCalculatingFare && (
              <>
                {/* Fare headline */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '800',
                      color: textPrimary,
                    }}
                  >
                    ₹{Math.round(Number(fareEstimate.estimated_fare))}
                  </Text>
                  {fareEstimate.pricing_factors?.is_night_surcharge && (
                    <View style={{ marginLeft: 8, backgroundColor: '#1e3a5f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700' }}>Night</Text>
                    </View>
                  )}
                  {fareEstimate.pricing_factors?.surge_active && (
                    <View style={{ marginLeft: 6, backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '700' }}>Surge</Text>
                    </View>
                  )}
                </View>

                {/* Distance & duration pills */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  {fareEstimate.estimated_distance_km != null && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="navigate-outline" size={14} color={BrandColors.secondary} />
                      <Text style={{ color: textPrimary, fontSize: 13, marginLeft: 5, fontWeight: '600' }}>
                        {fareEstimate.estimated_distance_km.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                  {fareEstimate.estimated_duration_minutes != null && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="time-outline" size={14} color={BrandColors.secondary} />
                      <Text style={{ color: textPrimary, fontSize: 13, marginLeft: 5, fontWeight: '600' }}>
                        {fareEstimate.estimated_duration_minutes} min
                      </Text>
                    </View>
                  )}
                </View>

                {/* Fare breakdown */}
                {renderFareBreakdown()}

                {/* Confirm button */}
                <TouchableOpacity
                  onPress={handleConfirmBooking}
                  disabled={isBooking}
                  style={{
                    backgroundColor: isBooking ? '#999' : BrandColors.burgundy,
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
                  {isBooking ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                        Booking...
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                      Confirm Booking
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
