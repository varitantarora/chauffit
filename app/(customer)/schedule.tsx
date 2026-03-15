import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useCarStore } from '../../store/carStore';
import { useBookingStore } from '../../store/bookingStore';
import { useRouter } from 'expo-router';
import { CustomerCar } from '../../types/navigation';
import BookingApiService, {
  FareEstimateResponse,
} from '../../services/api/BookingApiService';
import { formatFare } from '../../utils/fareCalculator';
import {
  GooglePlacesAutocomplete,
  getPlaceDetails,
} from '../../components/customer/GooglePlacesAutocomplete';
import { appConfig } from '../../config/env';
import { BrandColors } from '../../constants/Colors';

interface BookingLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  fullAddress?: string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

// WheelPicker component using ScrollView instead of FlatList to avoid nesting issues
const WheelPicker = React.memo(({
  data,
  selectedValue,
  onValueChange,
  width = 70,
  isDarkMode
}: {
  data: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  width?: number;
  isDarkMode: boolean;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = data.indexOf(selectedValue);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onValueChange(data[clampedIndex]);
  }, [data, onValueChange]);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
      }, 100);
    }
  }, []);

  // Calculate position for each item relative to center
  const getItemStyle = (index: number) => {
    const centerIndex = data.indexOf(selectedValue);
    const isCenter = index === centerIndex;

    return {
      fontSize: isCenter ? 24 : 18,
      fontWeight: isCenter ? '600' as const : '400' as const,
      color: isCenter
        ? (isDarkMode ? '#ffffff' : '#000000')
        : (isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')
    };
  };

  return (
    <View style={{ width, height: ITEM_HEIGHT * VISIBLE_ITEMS, overflow: 'hidden' }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
        }}
      >
        {data.map((item, index) => {
          const itemStyle = getItemStyle(index);
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={1}
              onPress={() => {
                onValueChange(item);
                scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
              }}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
                width: width
              }}
            >
              <ThemedText style={itemStyle}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default function ScheduleScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const { cars, defaultCar, loadUserCars, isLoading: isCarsLoading } = useCarStore();
  const { createBooking } = useBookingStore();
  const router = useRouter();

  const [bookingType, setBookingType] = useState<'scheduled' | 'extended'>('scheduled');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  // Location state
  const [pickupLocation, setPickupLocation] = useState<BookingLocation>({
    address: '',
    latitude: 28.6139,
    longitude: 77.2090,
  });
  const [dropLocation, setDropLocation] = useState<BookingLocation | null>(null);

  // Vehicle state
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Fare & booking state
  const [fareEstimate, setFareEstimate] = useState<FareEstimateResponse | null>(null);
  const [showFareModal, setShowFareModal] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Location fetching state
  const [isFetchingPlaceDetails, setIsFetchingPlaceDetails] = useState(false);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';
  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary dark:text-darkText border-border dark:border-darkBorder';

  // Load user cars on mount
  useEffect(() => {
    if (user?.id) {
      loadUserCars(user.id).catch(() => null);
    }
  }, [user?.id, loadUserCars]);

  // Set default car when cars load
  useEffect(() => {
    if (defaultCar && !selectedCar) {
      setSelectedCar(defaultCar);
    }
  }, [defaultCar, selectedCar]);

  const getDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      options.push({
        value: date.toISOString().split('T')[0],
        label: label,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      });
    }
    return options;
  };

  // Hours and minutes for iOS-style picker
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const [selectedHour, setSelectedHour] = useState('6');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const extendedServices = [
    {
      id: '4h',
      hours: 4,
      duration: '4 Hours',
      description: 'Perfect for business meetings or shopping',
      popular: false
    },
    {
      id: '8h',
      hours: 8,
      duration: '8 Hours',
      description: 'Full day service for tours or events',
      popular: true
    },
    {
      id: '12h',
      hours: 12,
      duration: '12 Hours',
      description: 'Extended service for long events',
      popular: false
    }
  ];

  const dateOptions = getDateOptions();

  // Get formatted time string
  const getFormattedTime = () => {
    return `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
  };

  // Build ISO datetime from selected date + time
  const buildScheduledAt = (): string | null => {
    if (!selectedDate) return null;

    let hour24 = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const dateObj = new Date(`${selectedDate}T${hour24.toString().padStart(2, '0')}:${selectedMinute}:00`);
    return dateObj.toISOString();
  };

  const formatCoord = (value?: number | null): number => {
    if (value === null || value === undefined) return 0;
    return Number(value.toFixed(8));
  };

  // Get hours for extended service
  const getSelectedHours = (): number | null => {
    const service = extendedServices.find(s => s.id === selectedDuration);
    return service ? service.hours : null;
  };

  // Get trip type based on booking type
  // API accepts 'one_way' or 'hourly' (not 'hourly_charter')
  const getTripType = (): string => {
    return bookingType === 'extended' ? 'hourly' : 'one_way';
  };

  // Handle place selection from autocomplete
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location details. Please try again.');
      const fallbackLocation: BookingLocation = {
        address: place.description,
        latitude: fieldType === 'pickup' ? 28.6139 : 28.6129,
        longitude: fieldType === 'pickup' ? 77.2090 : 77.2295,
        placeId: place.place_id,
      };

      if (fieldType === 'pickup') {
        setPickupLocation(fallbackLocation);
      } else {
        setDropLocation(fallbackLocation);
      }
    } finally {
      setIsFetchingPlaceDetails(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [
      address.name,
      address.street,
      address.subregion,
      address.city,
      address.region,
      address.postalCode,
      address.country,
    ];
    return parts.filter(Boolean).join(', ');
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location access is required to use your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = reverse.length > 0 ? formatAddress(reverse[0]) : 'Current Location';

      setPickupLocation({
        address: formattedAddress,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        fullAddress: formattedAddress,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try again.');
    } finally {
      setIsFetchingCurrentLocation(false);
    }
  };

  const selectVehicle = (car: CustomerCar) => {
    setSelectedCar(car);
    setShowVehicleModal(false);
  };

  const handleSchedule = async () => {
    const formattedTime = getFormattedTime();
    const tripType = getTripType();

    // Validate pickup location
    if (!pickupLocation?.address) {
      Alert.alert('Missing Information', 'Please select a pickup location.');
      return;
    }

    // Validate dropoff for point-to-point
    if (bookingType === 'scheduled' && !dropLocation?.address) {
      Alert.alert('Missing Information', 'Please select a destination.');
      return;
    }

    // Validate vehicle
    if (!selectedCar) {
      Alert.alert('Missing Information', 'Please select a vehicle.');
      return;
    }

    // Validate date
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a date.');
      return;
    }

    // Validate duration for extended
    if (bookingType === 'extended' && !selectedDuration) {
      Alert.alert('Missing Information', 'Please select a service duration.');
      return;
    }

    const scheduledAt = buildScheduledAt();
    if (!scheduledAt) {
      Alert.alert('Missing Information', 'Please select a valid date and time.');
      return;
    }

    // Step 1: Check availability
    setIsCheckingAvailability(true);
    try {
      const availabilityResponse = await BookingApiService.checkScheduleAvailability({
        scheduled_at: scheduledAt,
      });

      if (!availabilityResponse.success) {
        Alert.alert(
          'Time Unavailable',
          availabilityResponse.error || 'The selected time is not available. Please choose a different time.'
        );
        return;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check availability. Please try again.');
      return;
    } finally {
      setIsCheckingAvailability(false);
    }

    // Step 2: Get fare estimate
    setIsCalculatingFare(true);
    try {
      // For extended/hourly, use pickup as both from/to if no dropoff
      const toLocation = dropLocation || pickupLocation;

      const estimateRequest = {
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(toLocation.latitude),
        to_long: formatCoord(toLocation.longitude),
        to_address: toLocation.fullAddress || toLocation.address,
        vehicle_id: selectedCar.id,
        when: 'schedule' as const,
        type: tripType,
        scheduled_at: scheduledAt,
        ...(bookingType === 'extended' ? { hours: getSelectedHours() } : {}),
      };

      const response = await BookingApiService.getFareEstimate(estimateRequest);

      if (response.success && response.data) {
        setFareEstimate(response.data);
        setShowFareModal(true);
      } else {
        Alert.alert('Error', response.error || 'Failed to calculate fare. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate fare. Please try again.');
    } finally {
      setIsCalculatingFare(false);
    }
  };

  const confirmBooking = async () => {
    if (!fareEstimate || !selectedCar) return;

    const scheduledAt = buildScheduledAt();
    if (!scheduledAt) return;

    const tripType = getTripType();
    const toLocation = dropLocation || pickupLocation;

    setIsBooking(true);
    try {
      const bookingData = {
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(toLocation.latitude),
        to_long: formatCoord(toLocation.longitude),
        to_address: toLocation.fullAddress || toLocation.address,
        vehicle_id: selectedCar.id,
        when: 'schedule' as const,
        type: tripType,
        scheduled_at: scheduledAt,
        ...(bookingType === 'extended' ? { hours: getSelectedHours() } : {}),
      };

      const response = await BookingApiService.bookRide(bookingData);

      if (response.success && response.data) {
        await createBooking({
          id: response.data.id,
          customerId: user?.id || '',
          chauffeurId: '',
          chauffeurName: 'Finding driver...',
          duration: bookingType === 'extended'
            ? extendedServices.find(s => s.id === selectedDuration)?.duration || 'Hourly'
            : 'One-way',
          pickupLocation: {
            address: pickupLocation.address,
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          },
          dropLocation: {
            address: toLocation.address,
            latitude: toLocation.latitude,
            longitude: toLocation.longitude,
          },
          startTime: new Date(scheduledAt),
          price: Number(fareEstimate.estimated_fare),
          totalAmount: Number(fareEstimate.estimated_fare),
          status: 'pending' as const,
          paymentMethod: 'upi',
          paymentStatus: 'pending' as const,
          vehicleType: (selectedCar as any).vehicleType || 'luxury_sedan',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setShowFareModal(false);

        Alert.alert(
          'Ride Scheduled!',
          `Your chauffeur service has been scheduled for ${getFormattedTime()} on ${dateOptions.find(d => d.value === selectedDate)?.fullDate}.`,
          [
            {
              text: 'View Details',
              onPress: () => {
                router.push({
                  pathname: '/(customer)/ride-details',
                  params: { bookingId: response.data!.id },
                });
              },
            },
            {
              text: 'Done',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Booking Failed', response.error || 'Unable to schedule ride. Please try again.');
      }
    } catch (error) {
      Alert.alert('Booking Failed', 'An error occurred while scheduling. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDuration = (mins: number): string => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const isLoading = isCheckingAvailability || isCalculatingFare;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="title" className="ml-4">Schedule Ride</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Service Type Toggle */}
          <View className="px-6 py-6">
            <ThemedText variant="title" className="text-lg mb-4">Service Type</ThemedText>
            <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
              {bookingType === 'scheduled' ? (
                <View className="flex-1 py-3 rounded-lg bg-secondary">
                  <ThemedText className="text-center font-semibold text-white">Point to Point</ThemedText>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setBookingType('scheduled')} className="flex-1 py-3 rounded-lg">
                  <ThemedText className="text-center font-semibold text-textSecondary dark:text-darkTextSecondary">Point to Point</ThemedText>
                </TouchableOpacity>
              )}
              {bookingType === 'extended' ? (
                <View className="flex-1 py-3 rounded-lg bg-secondary">
                  <ThemedText className="text-center font-semibold text-white">Extended Service</ThemedText>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setBookingType('extended')} className="flex-1 py-3 rounded-lg">
                  <ThemedText className="text-center font-semibold text-textSecondary dark:text-darkTextSecondary">Extended Service</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Pickup Location */}
          <View className="px-6 pb-4">
            <ThemedText variant="title" className="text-lg mb-4">Pickup Location</ThemedText>
            <GooglePlacesAutocomplete
              placeholder="Enter pickup location"
              value={pickupLocation.address}
              apiKey={appConfig.googlePlacesApiKey}
              isDarkMode={isDarkMode}
              icon="location"
              onPlaceSelected={(place) => handlePlaceSelected(place, 'pickup')}
            />
            <TouchableOpacity
              className="mt-2 flex-row items-center justify-center rounded-xl border border-burgundy/30 bg-burgundy/10 px-4 py-3"
              onPress={handleUseCurrentLocation}
              disabled={isFetchingCurrentLocation}
            >
              {isFetchingCurrentLocation ? (
                <ActivityIndicator size="small" color={BrandColors.secondary} />
              ) : (
                <Ionicons name="location" size={18} color={iconColor} />
              )}
              <ThemedText className="ml-2 text-burgundy">
                {isFetchingCurrentLocation ? 'Getting location...' : 'Use current location'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Dropoff Location - only for Point to Point */}
          {bookingType === 'scheduled' && (
            <View className="px-6 pb-4">
              <ThemedText variant="title" className="text-lg mb-4">Destination</ThemedText>
              <GooglePlacesAutocomplete
                placeholder="Enter destination"
                value={dropLocation?.address || ''}
                apiKey={appConfig.googlePlacesApiKey}
                isDarkMode={isDarkMode}
                icon="navigate"
                onPlaceSelected={(place) => handlePlaceSelected(place, 'dropoff')}
              />
            </View>
          )}

          {/* Dropoff Location - optional for Extended */}
          {bookingType === 'extended' && (
            <View className="px-6 pb-4">
              <ThemedText variant="title" className="text-lg mb-4">Destination (Optional)</ThemedText>
              <GooglePlacesAutocomplete
                placeholder="Enter destination (optional)"
                value={dropLocation?.address || ''}
                apiKey={appConfig.googlePlacesApiKey}
                isDarkMode={isDarkMode}
                icon="navigate"
                onPlaceSelected={(place) => handlePlaceSelected(place, 'dropoff')}
              />
            </View>
          )}

          {/* Vehicle Selection */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">Vehicle</ThemedText>
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 rounded-xl border ${inputClass}`}
              onPress={() => setShowVehicleModal(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="car" size={20} color={iconColor} />
                {selectedCar ? (
                  <View className="ml-3">
                    <ThemedText className="font-semibold">{selectedCar.make} {selectedCar.model}</ThemedText>
                    <ThemedText variant="secondary" className="text-xs">
                      {selectedCar.color} {'\u2022'} {selectedCar.registrationNumber}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText className="ml-3 text-textSecondary dark:text-darkTextSecondary">Select vehicle</ThemedText>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color={iconColor} />
            </TouchableOpacity>

            {/* No Cars Warning */}
            {!isCarsLoading && cars.length === 0 && (
              <View className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex-row items-center">
                <Ionicons name="warning" size={18} color={BrandColors.warning} />
                <ThemedText variant="secondary" className="ml-2 flex-1 text-yellow-700 dark:text-yellow-400">
                  No vehicles added. Please add a vehicle first.
                </ThemedText>
                <TouchableOpacity onPress={() => router.push('/(customer)/car-create')}>
                  <ThemedText className="text-primary font-semibold">Add</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Extended Service Duration */}
          {bookingType === 'extended' && (
            <View className="px-6 pb-6">
              <ThemedText variant="title" className="text-lg mb-4">Service Duration</ThemedText>
              {extendedServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedDuration(service.id)}
                  className="mb-3"
                >
                  <ThemedCard className={`p-4 ${
                    selectedDuration === service.id ? 'border-2 border-primary' : ''
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <ThemedText className="font-bold text-lg">{service.duration}</ThemedText>
                          {service.popular && (
                            <View className="bg-primary/20 px-2 py-1 rounded ml-2">
                              <ThemedText className="text-primary text-xs font-semibold">POPULAR</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText variant="secondary" className="mt-1">
                          {service.description}
                        </ThemedText>
                      </View>
                      {selectedDuration === service.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#bd8c5e" />
                      )}
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Date Selection */}
          <View className="px-6 pb-8">
            <ThemedText variant="title" className="text-lg mb-4">Select Date</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dateOptions.map((date) => {
                const isSelected = selectedDate === date.value;
                return isSelected ? (
                  <View key={date.value} className="mr-3 px-4 py-3 min-w-[100px] items-center rounded-xl bg-burgundy">
                    <ThemedText className="font-semibold text-white">{date.label}</ThemedText>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={date.value}
                    onPress={() => setSelectedDate(date.value)}
                    className={`mr-3 px-4 py-3 min-w-[100px] items-center rounded-xl ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}
                  >
                    <ThemedText className="font-semibold text-textSecondary dark:text-darkTextSecondary">{date.label}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selection - iOS Style Wheel Picker */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">Select Time</ThemedText>
            <ThemedCard className="p-4">
              <View className="relative">
                {/* Selection Indicator */}
                <View
                  className="absolute left-0 right-0 bg-secondary/10 rounded-xl"
                  style={{
                    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                    height: ITEM_HEIGHT,
                  }}
                  pointerEvents="none"
                />

                {/* Wheel Pickers */}
                <View className="flex-row justify-center items-center">
                  <WheelPicker
                    data={hours}
                    selectedValue={selectedHour}
                    onValueChange={setSelectedHour}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                  <ThemedText style={{ fontSize: 22, fontWeight: '600', marginHorizontal: 4 }}>:</ThemedText>
                  <WheelPicker
                    data={minutes}
                    selectedValue={selectedMinute}
                    onValueChange={setSelectedMinute}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                  <View style={{ width: 16 }} />
                  <WheelPicker
                    data={periods}
                    selectedValue={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Service Information */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">What's Included</ThemedText>
            <ThemedCard className="p-4">
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Professional chauffeur</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Verified & trained drivers</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Real-time ride tracking</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">24/7 customer support</ThemedText>
                </View>
                {bookingType === 'extended' && (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <ThemedText className="ml-3">Flexible stops and waiting time</ThemedText>
                  </View>
                )}
              </View>
            </ThemedCard>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-border dark:border-darkBorder">
          {selectedDate && (bookingType === 'scheduled' || selectedDuration) && (
            <View className="mb-4 p-4 bg-secondary/10 border border-secondary rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <ThemedText className="font-semibold text-secondary">Schedule Summary</ThemedText>
                <Ionicons name="calendar" size={20} color="#720c17" />
              </View>
              <ThemedText variant="secondary">
                {dateOptions.find(d => d.value === selectedDate)?.fullDate} at {getFormattedTime()}
              </ThemedText>
              {bookingType === 'extended' && selectedDuration && (
                <ThemedText variant="secondary">
                  {extendedServices.find(s => s.id === selectedDuration)?.duration} service
                </ThemedText>
              )}
              {selectedCar && (
                <ThemedText variant="secondary">
                  {selectedCar.make} {selectedCar.model} {'\u2022'} {selectedCar.registrationNumber}
                </ThemedText>
              )}
              {pickupLocation.address ? (
                <ThemedText variant="secondary" numberOfLines={1}>
                  From: {pickupLocation.address}
                </ThemedText>
              ) : null}
              {dropLocation?.address ? (
                <ThemedText variant="secondary" numberOfLines={1}>
                  To: {dropLocation.address}
                </ThemedText>
              ) : null}
            </View>
          )}

          <PrimaryButton
            title={isCheckingAvailability ? 'Checking Availability...' : isCalculatingFare ? 'Calculating Fare...' : 'Schedule Ride'}
            onPress={handleSchedule}
            loading={isLoading}
          />

          <TouchableOpacity className="mt-3 items-center">
            <ThemedText className="text-secondary">Need help? Contact support</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Vehicle Selection Modal */}
        <Modal
          visible={showVehicleModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVehicleModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6 max-h-[70%]`}>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="title">Select Vehicle</ThemedText>
                <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                {isCarsLoading && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color={BrandColors.secondary} />
                    <ThemedText className="mt-3 text-textSecondary dark:text-darkTextSecondary">Loading vehicles...</ThemedText>
                  </View>
                )}

                {!isCarsLoading && cars.length === 0 && (
                  <View className="py-6 items-center">
                    <Ionicons name="car-outline" size={40} color="#999" />
                    <ThemedText className="mt-3 text-textSecondary dark:text-darkTextSecondary">No vehicles added yet</ThemedText>
                    <PrimaryButton
                      title="Add Vehicle"
                      onPress={() => {
                        setShowVehicleModal(false);
                        router.push('/(customer)/car-create');
                      }}
                      className="mt-4"
                    />
                  </View>
                )}

                {!isCarsLoading && cars.length > 0 && cars.map((car) => (
                  <TouchableOpacity
                    key={car.id}
                    onPress={() => selectVehicle(car)}
                    className={`mb-3 p-4 rounded-xl border ${
                      selectedCar?.id === car.id
                        ? 'border-burgundy bg-burgundy/10 dark:border-secondary dark:bg-secondary/10'
                        : 'border-gray-200 dark:border-darkBorder'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                        <Ionicons name="car" size={24} color={BrandColors.secondary} />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-semibold">
                          {car.make} {car.model}
                        </ThemedText>
                        <ThemedText variant="secondary" className="text-xs">
                          {car.color} {'\u2022'} {car.registrationNumber}
                        </ThemedText>
                      </View>
                      {selectedCar?.id === car.id && (
                        <Ionicons name="checkmark-circle" size={24} color={BrandColors.secondary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Fare Estimate & Confirmation Modal */}
        <Modal
          visible={showFareModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFareModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="title">Fare Estimate</ThemedText>
                <TouchableOpacity onPress={() => setShowFareModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              {fareEstimate && (
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]" contentContainerStyle={{ paddingBottom: 50 }}>
                  {/* Trip Summary */}
                  <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                      <ThemedText variant="secondary" className="ml-2 flex-1" numberOfLines={1}>
                        {pickupLocation.address}
                      </ThemedText>
                    </View>
                    {(dropLocation?.address) && (
                      <>
                        <View className="flex-row items-center justify-center my-1">
                          <Ionicons name="arrow-down" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="navigate" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                          <ThemedText variant="secondary" className="ml-2 flex-1" numberOfLines={1}>
                            {dropLocation.address}
                          </ThemedText>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Schedule Info */}
                  <View className="mb-4 p-3 bg-secondary/10 rounded-xl flex-row items-center">
                    <Ionicons name="calendar" size={18} color={BrandColors.secondary} />
                    <ThemedText variant="secondary" className="ml-2 text-secondary">
                      {dateOptions.find(d => d.value === selectedDate)?.fullDate} at {getFormattedTime()}
                    </ThemedText>
                  </View>

                  {/* Trip Details */}
                  <View className="flex-row justify-between mb-3 px-2">
                    <ThemedText variant="secondary">Trip Type</ThemedText>
                    <ThemedText className="font-semibold">
                      {bookingType === 'extended' ? 'Hourly' : 'One-way'}
                    </ThemedText>
                  </View>
                  {bookingType === 'extended' && selectedDuration && (
                    <View className="flex-row justify-between mb-3 px-2">
                      <ThemedText variant="secondary">Duration</ThemedText>
                      <ThemedText className="font-semibold">
                        {extendedServices.find(s => s.id === selectedDuration)?.duration}
                      </ThemedText>
                    </View>
                  )}
                  {fareEstimate.estimated_distance_km != null && fareEstimate.estimated_distance_km > 0 && (
                    <View className="flex-row justify-between mb-3 px-2">
                      <ThemedText variant="secondary">Distance</ThemedText>
                      <ThemedText className="font-semibold">
                        {fareEstimate.estimated_distance_km} km
                      </ThemedText>
                    </View>
                  )}
                  {fareEstimate.estimated_duration_minutes != null && fareEstimate.estimated_duration_minutes > 0 && (
                    <View className="flex-row justify-between mb-3 px-2">
                      <ThemedText variant="secondary">Est. Duration</ThemedText>
                      <ThemedText className="font-semibold">
                        {formatDuration(fareEstimate.estimated_duration_minutes)}
                      </ThemedText>
                    </View>
                  )}
                  <View className="flex-row justify-between mb-3 px-2">
                    <ThemedText variant="secondary">Vehicle</ThemedText>
                    <View className="items-end">
                      <ThemedText className="font-semibold">
                        {selectedCar?.make} {selectedCar?.model}
                      </ThemedText>
                      <ThemedText variant="secondary" className="text-xs">
                        {selectedCar?.registrationNumber}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Fare */}
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <ThemedText variant="title" className="text-lg">Estimated Fare</ThemedText>
                      <ThemedText variant="title" className="text-lg text-burgundy">
                        {formatFare(parseFloat(fareEstimate.estimated_fare))}
                      </ThemedText>
                    </View>
                    {fareEstimate.fare_breakdown && (
                      <>
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="secondary" className="text-xs">Base fare</ThemedText>
                          <ThemedText variant="secondary" className="text-xs">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.base_fare))}
                          </ThemedText>
                        </View>
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="secondary" className="text-xs">Distance fare</ThemedText>
                          <ThemedText variant="secondary" className="text-xs">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.distance_fare))}
                          </ThemedText>
                        </View>
                        {fareEstimate.fare_breakdown.time_fare !== undefined && parseFloat(fareEstimate.fare_breakdown.time_fare) > 0 && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="secondary" className="text-xs">Time fare</ThemedText>
                            <ThemedText variant="secondary" className="text-xs">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.time_fare))}
                            </ThemedText>
                          </View>
                        )}
                        {fareEstimate.surge_multiplier !== undefined && fareEstimate.surge_multiplier > 1 && fareEstimate.fare_breakdown.surge_amount !== undefined && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="secondary" className="text-xs">
                              Surge x{fareEstimate.surge_multiplier.toFixed(2)}
                            </ThemedText>
                            <ThemedText variant="secondary" className="text-xs">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.surge_amount))}
                            </ThemedText>
                          </View>
                        )}
                      </>
                    )}
                    <ThemedText variant="secondary" className="text-xs text-center mt-2">
                      *Final fare may vary based on actual route and traffic
                    </ThemedText>
                  </View>

                  {/* Confirm Button */}
                  <PrimaryButton
                    title="CONFIRM SCHEDULING"
                    onPress={confirmBooking}
                    loading={isBooking}
                    className="w-full"
                  />

                  <View className="h-4" />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
