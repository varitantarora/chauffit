import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
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
import { CustomerCar } from '../../types/navigation';
import { useBookingStore } from '../../store/bookingStore';
import BookingApiService, { FareEstimateResponse } from '../../services/api/BookingApiService';
import LocationApiService, { FavoriteLocation } from '../../services/api/LocationApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkMapStyle } from '../../constants/MapStyles';
import { BrandColors } from '../../constants/Colors';
import { MapLocationPicker, MapPickerLocation } from '../../components/customer/MapLocationPicker';
import { TaxesAndFeesRow } from '../../components/customer/TaxesAndFeesRow';
import { appConfig } from '../../config/env';

interface BookingLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  fullAddress?: string;
}

interface RecentDestination {
  address: string;
  latitude: number;
  longitude: number;
}

const RECENT_DESTINATIONS_KEY = '@chauffit/recent_destinations';

interface RideSearchParams {
  initialPickup?: string;
  initialPickupLat?: string;
  initialPickupLng?: string;
}

const formatVehicleType = (type: string) =>
  type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerField, setMapPickerField] = useState<'pickup' | 'dropoff'>('pickup');

  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([]);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const [recentDestinations, setRecentDestinations] = useState<RecentDestination[]>([]);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [displayCoords, setDisplayCoords] = useState<LatLng[]>([]);
  const routeAnimRef = useRef<NodeJS.Timeout | null>(null);
  const routeRestartRef = useRef<NodeJS.Timeout | null>(null);

  const mapRef = useRef<MapView>(null);
  const fareCardAnim = useRef(new Animated.Value(200)).current;
  const fareDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startRouteAnimation = (coords: LatLng[]) => {
    if (routeAnimRef.current) clearInterval(routeAnimRef.current);
    if (routeRestartRef.current) clearTimeout(routeRestartRef.current);

    let index = 0;
    const step = Math.max(1, Math.floor(coords.length / 40));
    setDisplayCoords([]);

    routeAnimRef.current = setInterval(() => {
      index += step;
      if (index >= coords.length) {
        setDisplayCoords(coords);
        clearInterval(routeAnimRef.current!);
        routeAnimRef.current = null;
        routeRestartRef.current = setTimeout(() => {
          startRouteAnimation(coords);
        }, 2000);
      } else {
        setDisplayCoords(coords.slice(0, index));
      }
    }, 16);
  };

  // Cleanup route animation on unmount
  useEffect(() => {
    return () => {
      if (routeAnimRef.current) clearInterval(routeAnimRef.current);
      if (routeRestartRef.current) clearTimeout(routeRestartRef.current);
    };
  }, []);

  // Load cars on mount
  useEffect(() => {
    if (user?.id) {
      loadUserCars(user.id);
    }
  }, [user?.id]);

  // Auto-select car when cars load
  useEffect(() => {
    if (!selectedCar && (defaultCar || cars.length > 0)) {
      setSelectedCar(defaultCar || cars[0]);
    }
  }, [defaultCar, cars]);

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

  // Fetch saved/favorite locations
  useEffect(() => {
    if (!user?.id) return;
    setIsFetchingFavorites(true);
    LocationApiService.getFavorites()
      .then((res) => { if (res.success && res.data) setFavoriteLocations(res.data); })
      .finally(() => setIsFetchingFavorites(false));
  }, [user?.id]);

  // Load recent destinations from local storage
  useEffect(() => {
    AsyncStorage.getItem(RECENT_DESTINATIONS_KEY)
      .then((raw) => {
        if (raw) setRecentDestinations(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  // Fare calculation with 400ms debounce
  useEffect(() => {
    if (!pickupLocation.address || !dropLocation) return;

    const vehicleId = selectedCar?.id || defaultCar?.id || cars[0]?.id;

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

    // Slide card up immediately (shows loading spinner while API is in-flight)
    setIsCalculatingFare(true);
    setFareError(null);
    Animated.spring(fareCardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();

    if (fareDebounceRef.current) clearTimeout(fareDebounceRef.current);

    fareDebounceRef.current = setTimeout(() => {
      calculateFare(vehicleId);
    }, 400);

    return () => {
      if (fareDebounceRef.current) clearTimeout(fareDebounceRef.current);
    };
  }, [pickupLocation, dropLocation, selectedCar, defaultCar, cars, isCarsLoading]);

  const calculateFare = async (vehicleId: string) => {
    if (!dropLocation) return;
    const fmt = (n: number) => parseFloat(n.toFixed(6));
    try {
      const response = await BookingApiService.getFareEstimate({
        vehicle_id: vehicleId,
        from_lat: fmt(pickupLocation.latitude),
        from_long: fmt(pickupLocation.longitude),
        from_address: pickupLocation.address,
        to_lat: fmt(dropLocation.latitude),
        to_long: fmt(dropLocation.longitude),
        to_address: dropLocation.address,
        type: 'one_way',
        when: 'now',
      });
      if (response.success && response.data) {
        setFareEstimate(response.data);
        setFareError(null);
      } else {
        setFareError(response.error || 'Failed to get fare estimate');
        setFareEstimate(null);
      }
    } catch {
      setFareError('Failed to calculate fare. Please try again.');
      setFareEstimate(null);
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
        // Reset route when new drop is chosen
        if (routeAnimRef.current) clearInterval(routeAnimRef.current);
        if (routeRestartRef.current) clearTimeout(routeRestartRef.current);
        setRouteCoords([]);
        setDisplayCoords([]);

        setDropLocation(newLocation);
        saveRecentDestination(newLocation);
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

  const handleOpenMapPicker = (fieldType: 'pickup' | 'dropoff') => {
    setMapPickerField(fieldType);
    setShowMapPicker(true);
  };

  const handleMapLocationSelected = (location: MapPickerLocation) => {
    if (mapPickerField === 'pickup') {
      setPickupLocation({
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } else {
      // Reset route when new drop is chosen
      if (routeAnimRef.current) clearInterval(routeAnimRef.current);
      if (routeRestartRef.current) clearTimeout(routeRestartRef.current);
      setRouteCoords([]);
      setDisplayCoords([]);
      setDropLocation({
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      saveRecentDestination({
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      fareCardAnim.setValue(200);
      setFareEstimate(null);
      setFareError(null);
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

  const getFavoriteIcon = (title: string): React.ComponentProps<typeof Ionicons>['name'] => {
    const t = title.toLowerCase();
    if (t.includes('home')) return 'home';
    if (t.includes('work') || t.includes('office')) return 'business';
    if (t.includes('airport')) return 'airplane';
    return 'star';
  };

  const saveRecentDestination = (location: { address: string; latitude: number; longitude: number }) => {
    setRecentDestinations((prev) => {
      const deduped = prev.filter((r) => r.address !== location.address);
      const next = [{ address: location.address, latitude: location.latitude, longitude: location.longitude }, ...deduped].slice(0, 5);
      AsyncStorage.setItem(RECENT_DESTINATIONS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const selectQuickDestination = (location: { address: string; latitude: number; longitude: number }) => {
    if (routeAnimRef.current) clearInterval(routeAnimRef.current);
    if (routeRestartRef.current) clearTimeout(routeRestartRef.current);
    setRouteCoords([]);
    setDisplayCoords([]);
    fareCardAnim.setValue(200);
    setFareEstimate(null);
    setFareError(null);
    setDropLocation({ address: location.address, latitude: location.latitude, longitude: location.longitude });
  };

  const handleConfirmBooking = async () => {
    const vehicleId = selectedCar?.id || defaultCar?.id || cars[0]?.id;
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
          vehicleType: selectedCar?.vehicleType || (defaultCar as any)?.vehicleType || 'luxury_sedan',
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

  const selectVehicle = (car: CustomerCar) => {
    setSelectedCar(car);
    setShowVehicleModal(false);
  };

  // Card is always mounted when drop is set so the Animated.View exists before animation fires
  const showFareCard = !!dropLocation;

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
    if (fmt(bd.time_fare)) {
      const timeLabel = bd.duration_minutes && bd.per_min_rate
        ? `Time (${Number(bd.duration_minutes).toFixed(0)} min × ₹${bd.per_min_rate}/min)`
        : 'Time fare';
      rows.push({ label: timeLabel, value: fmt(bd.time_fare)! });
    }
    if (fmt(bd.biker_transport_fee)) rows.push({ label: 'Biker transport', value: fmt(bd.biker_transport_fee)! });
    if (fareEstimate?.surge_multiplier && fareEstimate.surge_multiplier > 1 && fmt(bd.surge_amount)) {
      rows.push({ label: `Surge x${fareEstimate.surge_multiplier.toFixed(2)}`, value: fmt(bd.surge_amount)! });
    }
    if (fmt(bd.insurance_premium)) rows.push({ label: 'Insurance', value: fmt(bd.insurance_premium)! });

    const taxPlatformFee = Number(bd.platform_fee ?? 0);
    const taxGst = Number(bd.gst_amount ?? 0);
    const taxSmallDistance = Number(bd.small_distance_fee ?? 0);

    if (rows.length === 0 && taxPlatformFee <= 0 && taxGst <= 0 && taxSmallDistance <= 0) return null;

    const totalValue = bd.total ? `₹${Math.round(Number(bd.total))}` : `₹${Math.round(Number(fareEstimate!.estimated_fare))}`;

    return (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowBreakdown((v) => !v)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}
        >
          <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Fare Breakdown
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '700' }}>{totalValue}</Text>
            <Ionicons name={showBreakdown ? 'chevron-up' : 'chevron-down'} size={16} color={textSecondary} />
          </View>
        </TouchableOpacity>

        {showBreakdown && (
          <>
            <View style={{ marginTop: 10 }}>
              {rows.map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: textSecondary, fontSize: 14 }}>{row.label}</Text>
                  <Text style={{ color: textPrimary, fontSize: 14 }}>{row.value}</Text>
                </View>
              ))}
              {(taxPlatformFee > 0 || taxGst > 0 || taxSmallDistance > 0) && (
                <TaxesAndFeesRow
                  platformFee={taxPlatformFee}
                  gstAmount={taxGst}
                  smallDistanceFee={taxSmallDistance}
                  formatAmount={(v) => `₹${Math.round(v)}`}
                  variant="inline-style"
                  textColor={textPrimary}
                  textSecondaryColor={textSecondary}
                />
              )}
            </View>
            <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '700' }}>Total</Text>
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '700' }}>{totalValue}</Text>
            </View>
          </>
        )}
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
        {dropLocation && (
          <MapViewDirections
            origin={{ latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }}
            destination={{ latitude: dropLocation.latitude, longitude: dropLocation.longitude }}
            apikey={appConfig.googlePlacesApiKey}
            strokeWidth={0}
            onReady={(result) => {
              const coords = result.coordinates;
              setRouteCoords(coords);
              startRouteAnimation(coords);
              if (mapRef.current && coords.length > 1) {
                mapRef.current.fitToCoordinates(coords, {
                  edgePadding: { top: 160, bottom: 360, left: 60, right: 60 },
                  animated: true,
                });
              }
            }}
            onError={(err) => console.warn('Route error:', err)}
          />
        )}
        {/* Grey static base route — always full */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={isDarkMode ? '#555555' : '#aaaaaa'}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {/* Dark animated line drawn progressively on top */}
        {displayCoords.length > 1 && (
          <Polyline
            coordinates={displayCoords}
            strokeColor={isDarkMode ? '#e0cfc0' : '#1a1a1a'}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Top card — back button + pickup + destination inputs */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          right: 16,
          backgroundColor: cardBg,
          borderRadius: 14,
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 8, alignSelf: 'flex-start', padding: 4 }}
        >
          <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#e5e5e5' : '#333'} />
        </TouchableOpacity>

        {/* Pickup field */}
        <View style={{ marginBottom: 4 }}>
          <GooglePlacesAutocomplete
            placeholder="Pickup location"
            value={pickupLocation.address}
            onPlaceSelected={(place) => handlePlaceSelected(place, 'pickup')}
            apiKey={appConfig.googlePlacesApiKey}
            isDarkMode={isDarkMode}
            icon="radio-button-on"
            onUseCurrentLocation={handleUseCurrentLocation}
            isFetchingCurrentLocation={isFetchingCurrentLocation}
            onChooseOnMap={() => handleOpenMapPicker('pickup')}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: borderColor,
            marginHorizontal: 6,
            marginBottom: 4,
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
          onChooseOnMap={() => handleOpenMapPicker('dropoff')}
        />

        {/* Quick Destinations: Saved + Recent */}
        {(!isFetchingFavorites && favoriteLocations.length > 0) || recentDestinations.length > 0 ? (
          <>
            <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 6, marginTop: 8, marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
              {favoriteLocations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  onPress={() => selectQuickDestination(loc)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Ionicons name={getFavoriteIcon(loc.title)} size={14} color={BrandColors.secondary} />
                  <Text style={{ color: textPrimary, fontSize: 13, marginLeft: 6, fontWeight: '500' }}>
                    {loc.title}
                  </Text>
                </TouchableOpacity>
              ))}
              {recentDestinations.slice(0, 3).map((loc, index) => {
                const label = loc.address.split(',')[0].trim();
                return (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    onPress={() => selectQuickDestination(loc)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                    }}
                  >
                    <Ionicons name="time-outline" size={14} color={textSecondary} />
                    <Text style={{ color: textPrimary, fontSize: 13, marginLeft: 6, fontWeight: '500' }} numberOfLines={1}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

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

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                <Ionicons name="close" size={24} color={textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
              {isCarsLoading && (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={BrandColors.secondary} />
                  <Text style={{ color: textSecondary, marginTop: 12 }}>Loading vehicles...</Text>
                </View>
              )}

              {!isCarsLoading && cars.length === 0 && (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Ionicons name="car-outline" size={40} color="#999" />
                  <Text style={{ color: textSecondary, marginTop: 12 }}>No vehicles added yet</Text>
                  <TouchableOpacity
                    onPress={() => { setShowVehicleModal(false); router.push('/(auth)/car-details'); }}
                    style={{ marginTop: 16, backgroundColor: BrandColors.burgundy, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Add Vehicle</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isCarsLoading && cars.map((car) => (
                <TouchableOpacity
                  key={car.id}
                  onPress={() => selectVehicle(car)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1.5,
                    borderColor: selectedCar?.id === car.id ? BrandColors.burgundy : (isDarkMode ? '#333' : '#e5e5e5'),
                    backgroundColor: selectedCar?.id === car.id
                      ? (isDarkMode ? 'rgba(114,12,23,0.15)' : 'rgba(114,12,23,0.06)')
                      : 'transparent',
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDarkMode ? '#333' : '#f0e8e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="car" size={22} color={BrandColors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '600' }}>
                      {car.make} {car.model}
                    </Text>
                    <Text style={{ color: textSecondary, fontSize: 13 }}>
                      {car.color} · {car.registrationNumber}
                    </Text>
                    {(car.vehicleType || car.transmission) && (
                      <Text style={{ color: textSecondary, fontSize: 12 }}>
                        {[
                          car.vehicleType ? formatVehicleType(car.vehicleType) : null,
                          car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) : null,
                        ].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                  </View>
                  {selectedCar?.id === car.id && (
                    <Ionicons name="checkmark-circle" size={22} color={BrandColors.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              paddingTop: 14,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 16,
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
                {/* Fare + distance + duration in one row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: textPrimary }}>
                    ₹{Math.round(Number(fareEstimate.estimated_fare))}
                  </Text>
                  {fareEstimate.pricing_factors?.is_night_surcharge && (
                    <View style={{ backgroundColor: '#1e3a5f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700' }}>Night</Text>
                    </View>
                  )}
                  {fareEstimate.pricing_factors?.surge_active && (
                    <View style={{ backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '700' }}>Surge</Text>
                    </View>
                  )}
                  {fareEstimate.estimated_distance_km != null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                      <Ionicons name="navigate-outline" size={13} color={BrandColors.secondary} />
                      <Text style={{ color: textPrimary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                        {fareEstimate.estimated_distance_km.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                  {fareEstimate.estimated_duration_minutes != null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                      <Ionicons name="time-outline" size={13} color={BrandColors.secondary} />
                      <Text style={{ color: textPrimary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                        {fareEstimate.estimated_duration_minutes} min
                      </Text>
                    </View>
                  )}
                </View>

                {/* Car selector */}
                <TouchableOpacity
                  onPress={() => setShowVehicleModal(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="car" size={20} color={BrandColors.secondary} />
                    {selectedCar ? (
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>
                          {selectedCar.make} {selectedCar.model}
                        </Text>
                        <Text style={{ color: textSecondary, fontSize: 12 }}>
                          {selectedCar.color} · {selectedCar.registrationNumber}
                        </Text>
                        {(selectedCar.vehicleType || selectedCar.transmission) && (
                          <Text style={{ color: textSecondary, fontSize: 11 }}>
                            {[
                              selectedCar.vehicleType ? formatVehicleType(selectedCar.vehicleType) : null,
                              selectedCar.transmission ? selectedCar.transmission.charAt(0).toUpperCase() + selectedCar.transmission.slice(1) : null,
                            ].filter(Boolean).join(' · ')}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={{ color: textSecondary, fontSize: 14, marginLeft: 10 }}>
                        Choose car
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={18} color={textSecondary} />
                </TouchableOpacity>

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

      {/* Map Location Picker */}
      <MapLocationPicker
        visible={showMapPicker}
        onLocationSelected={handleMapLocationSelected}
        onClose={() => setShowMapPicker(false)}
        initialCoordinate={
          mapPickerField === 'pickup'
            ? { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }
            : dropLocation
              ? { latitude: dropLocation.latitude, longitude: dropLocation.longitude }
              : undefined
        }
        locationType={mapPickerField}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
