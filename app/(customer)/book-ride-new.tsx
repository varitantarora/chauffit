import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomerCar } from '../../types/navigation';
import BookingApiService, {
  TripType,
  FareEstimateRequest,
  FareEstimateResponse,
  BookingRequest,
  InsuranceInfo,
} from '../../services/api/BookingApiService';
import InsuranceApiService, { InsurancePlan } from '../../services/api/InsuranceApiService';
import { formatFare } from '../../utils/fareCalculator';
import {
  GooglePlacesAutocomplete,
  getPlaceDetails,
} from '../../components/customer/GooglePlacesAutocomplete';
import UniversalMapView, { MapMarker, MapRoute } from '../../components/shared/MapView';
import { appConfig } from '../../config/env';

interface BookingLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  fullAddress?: string;
}

type ScheduleOption = 'now' | 'schedule';

interface BookRideParams {
  destination?: string;
  vehicleId?: string;
  insurancePlanId?: string;
  insurancePremium?: string;
}

export default function BookRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as BookRideParams;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const { cars, defaultCar, loadUserCars, isLoading: isCarsLoading } = useCarStore();
  const { createBooking } = useBookingStore();

  const [pickupLocation, setPickupLocation] = useState<BookingLocation>({
    address: '',
    latitude: 28.6139,
    longitude: 77.2090,
  });
  const [dropLocation, setDropLocation] = useState<BookingLocation | null>(null);
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [isFetchingPlaceDetails, setIsFetchingPlaceDetails] = useState(false);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);

  const [fareEstimate, setFareEstimate] = useState<FareEstimateResponse | null>(null);
  const [selectedInsurancePlanId, setSelectedInsurancePlanId] = useState<string | null>(null);
  const [selectedInsurancePremium, setSelectedInsurancePremium] = useState<number>(0);

  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoadingInsurance, setIsLoadingInsurance] = useState(false);
  const [tempSelectedPlanId, setTempSelectedPlanId] = useState<string | null>(null);
  const [selectedInsuranceName, setSelectedInsuranceName] = useState<string>('');

  useEffect(() => {
    if (params.vehicleId) {
      const car = cars.find((c) => c.id === params.vehicleId);
      if (car) setSelectedCar(car);
    } else if (defaultCar) {
      setSelectedCar(defaultCar);
    }
  }, [params.vehicleId, cars, defaultCar]);

  useEffect(() => {
    if (user?.id) {
      loadUserCars(user.id).catch(() => null);
    }
  }, [user?.id, loadUserCars]);

  useEffect(() => {
    if (params.destination) {
      setDropLocation({
        address: params.destination,
        latitude: 28.6129,
        longitude: 77.2295,
      });
    }
  }, [params.destination]);

  // Handle insurance params from navigation
  useEffect(() => {
    if (params.insurancePlanId) {
      setSelectedInsurancePlanId(params.insurancePlanId);
    }
    if (params.insurancePremium) {
      setSelectedInsurancePremium(parseFloat(params.insurancePremium) || 0);
    }
  }, [params.insurancePlanId, params.insurancePremium]);

  // Handle insurance info from fare estimate response
  useEffect(() => {
    if (fareEstimate?.insurance) {
      setSelectedInsurancePlanId(fareEstimate.insurance.plan_id);
      setSelectedInsurancePremium(fareEstimate.insurance.premium_amount);
    }
  }, [fareEstimate?.insurance]);

  // Fetch insurance plans on mount
  useEffect(() => {
    (async () => {
      setIsLoadingInsurance(true);
      const res = await InsuranceApiService.listPlans();
      if (res.success && res.data) setInsurancePlans(res.data);
      setIsLoadingInsurance(false);
    })();
  }, []);

  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary border-gray-200';

  const savedLocations = [
    {
      id: 'home',
      icon: 'home' as const,
      label: 'Home',
      address: '123 Main St, Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    {
      id: 'work',
      icon: 'business' as const,
      label: 'Work',
      address: '456 Office Plaza, Gurgaon',
      latitude: 28.4695,
      longitude: 77.0366,
    },
    {
      id: 'airport',
      icon: 'airplane' as const,
      label: 'Airport',
      address: 'IGI Airport Terminal 3',
      latitude: 28.5562,
      longitude: 77.0999,
    },
  ];

  // Helper function to generate next 7 days
  const generateNext7Days = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Skip today if current time is past 8 PM (20:00)
      const currentHour = now.getHours();
      if (i === 0 && currentHour >= 20) {
        continue;
      }

      days.push({
        date,
        dateString: date.toDateString(),
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
      });
    }

    return days;
  };

  // Helper function to generate time slots (every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = now.toDateString();

    const isToday = scheduledDate && scheduledDate.toDateString() === todayStr;

    // Start from 6 AM, end at 11:30 PM
    for (let hour = 6; hour <= 23; hour++) {
      for (const minute of ['00', '30']) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const label = `${displayHour}:${minute} ${ampm}`;

        // Disable past times for today
        let isDisabled = false;
        if (isToday) {
          if (hour < currentHour) {
            isDisabled = true;
          } else if (hour === currentHour && parseInt(minute) <= currentMinute) {
            isDisabled = true;
          }
        }

        slots.push({ value: timeValue, label, disabled: isDisabled });
      }
    }

    return slots;
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // Preserve the time if already selected, otherwise reset to default
    if (scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setScheduledDate(date);
    } else {
      // Default to 10 AM if no time selected yet
      date.setHours(10, 0, 0, 0);
      setScheduledDate(date);
    }

    // Reset time if it's now invalid for the new date
    if (scheduledTime) {
      const slots = generateTimeSlots();
      const isStillValid = slots.some(slot => slot.value === scheduledTime && !slot.disabled);
      if (!isStillValid) {
        setScheduledTime('');
      }
    }
  };

  // Handle time selection
  const handleTimeSelect = (timeValue: string) => {
    setScheduledTime(timeValue);

    if (scheduledDate) {
      const [hours, minutes] = timeValue.split(':');
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setScheduledDate(new Date(scheduledDate));
    }
  };

  // Format scheduled date/time for display
  const formatScheduledDateTime = () => {
    if (!scheduledDate) return '';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[scheduledDate.getDay()];
    const month = monthNames[scheduledDate.getMonth()];
    const date = scheduledDate.getDate();
    const hour = scheduledDate.getHours();
    const minute = scheduledDate.getMinutes();
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;

    return `${dayName}, ${month} ${date} at ${timeStr}`;
  };

  const formatCoord = (value?: number | null): number => {
    if (value === null || value === undefined) return 0;
    return Number(value.toFixed(8));
  };

  // Handle schedule confirmation
  const handleConfirmSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      Alert.alert('Incomplete Selection', 'Please select both date and time for your scheduled ride.');
      return;
    }

    setScheduleOption('schedule');
    setShowScheduleModal(false);
  };

  const calculateFare = async () => {
    if (!dropLocation || !selectedCar) {
      Alert.alert('Missing Information', 'Please select destination and vehicle');
      return;
    }

    setIsCalculatingFare(true);

    try {
      const estimateRequest: FareEstimateRequest = {
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(dropLocation.latitude),
        to_long: formatCoord(dropLocation.longitude),
        to_address: dropLocation.fullAddress || dropLocation.address,
        vehicle_id: selectedCar.id,
        when: scheduleOption,
        type: tripType,
        ...(scheduleOption === 'schedule' && scheduledDate
          ? { scheduled_at: scheduledDate.toISOString() }
          : {}),
        ...(selectedInsurancePlanId ? { insurance_plan_id: selectedInsurancePlanId } : {}),
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

  const handleBookNow = () => {
    if (!pickupLocation?.address) {
      Alert.alert('Missing Information', 'Please select a pickup location');
      return;
    }
    if (!dropLocation?.address) {
      Alert.alert('Missing Information', 'Please select a destination');
      return;
    }
    if (!selectedCar) {
      Alert.alert('Missing Information', 'Please select a vehicle');
      return;
    }
    if (scheduleOption === 'schedule' && (!scheduledDate || !scheduledTime)) {
      Alert.alert('Missing Information', 'Please select a date and time for your scheduled ride');
      setShowScheduleModal(true);
      return;
    }

    calculateFare();
  };

  const openInsuranceModal = () => {
    setTempSelectedPlanId(selectedInsurancePlanId);
    setShowInsuranceModal(true);
  };

  const confirmInsuranceSelection = () => {
    if (tempSelectedPlanId) {
      const plan = insurancePlans.find(p => p.id === tempSelectedPlanId);
      if (plan) {
        setSelectedInsurancePlanId(plan.id);
        setSelectedInsurancePremium(InsuranceApiService.parseAmount(plan.premium_amount));
        setSelectedInsuranceName(plan.name);
      }
    } else {
      setSelectedInsurancePlanId(null);
      setSelectedInsurancePremium(0);
      setSelectedInsuranceName('');
    }
    setShowInsuranceModal(false);
  };

  const clearInsurance = () => {
    setTempSelectedPlanId(null);
    setSelectedInsurancePlanId(null);
    setSelectedInsurancePremium(0);
    setSelectedInsuranceName('');
    setShowInsuranceModal(false);
  };

  // Recalculate fare when insurance is selected (for future use with dynamic fare updates)
  const recalculateFareWithInsurance = async (insuranceId: string | null) => {
    if (!fareEstimate || !dropLocation || !selectedCar) return;

    // Update local state
    setSelectedInsurancePlanId(insuranceId);

    // Recalculate fare with new insurance
    try {
      const estimateRequest: FareEstimateRequest = {
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(dropLocation.latitude),
        to_long: formatCoord(dropLocation.longitude),
        to_address: dropLocation.fullAddress || dropLocation.address,
        vehicle_id: selectedCar.id,
        when: scheduleOption,
        type: tripType,
        ...(scheduleOption === 'schedule' && scheduledDate
          ? { scheduled_at: scheduledDate.toISOString() }
          : {}),
        ...(insuranceId ? { insurance_plan_id: insuranceId } : {}),
      };

      const response = await BookingApiService.getFareEstimate(estimateRequest);

      if (response.success && response.data) {
        setFareEstimate(response.data);
        if (response.data.insurance) {
          setSelectedInsurancePremium(response.data.insurance.premium_amount);
        } else {
          setSelectedInsurancePremium(0);
        }
      }
    } catch (error) {
      console.error('Failed to recalculate fare with insurance:', error);
    }
  };

  const confirmBooking = async () => {
    if (!fareEstimate || !dropLocation || !selectedCar) {
      return;
    }

    setIsBooking(true);

    try {
      const bookingData: BookingRequest = {
        from_lat: formatCoord(pickupLocation.latitude),
        from_long: formatCoord(pickupLocation.longitude),
        from_address: pickupLocation.fullAddress || pickupLocation.address,
        to_lat: formatCoord(dropLocation.latitude),
        to_long: formatCoord(dropLocation.longitude),
        to_address: dropLocation.fullAddress || dropLocation.address,
        vehicle_id: selectedCar.id,
        when: scheduleOption,
        type: tripType,
        ...(scheduleOption === 'schedule' && scheduledDate
          ? { scheduled_at: scheduledDate.toISOString() }
          : {}),
        ...(selectedInsurancePlanId ? { insurance_plan_id: selectedInsurancePlanId } : {}),
      };

      const response = await BookingApiService.bookRide(bookingData);

      if (response.success && response.data) {
        await createBooking({
          id: response.data.id,
          customerId: user?.id || '',
          chauffeurId: '',
          chauffeurName: 'Finding driver...',
          duration: tripType === 'hourly_charter' ? 'Hourly' : tripType === 'round_trip' ? 'Round-trip' : 'One-way',
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
          startTime: (scheduleOption === 'schedule' && scheduledDate)
            ? scheduledDate
            : new Date(),
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

        router.push({
          pathname: '/(customer)/searching-drivers',
          params: {
            bookingId: response.data?.id || '',
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
    } catch (error) {
      Alert.alert('Booking Failed', 'An error occurred while booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const selectSavedLocation = (location: typeof savedLocations[0]) => {
    setDropLocation({
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setShowSavedLocations(false);
  };

  const selectVehicle = (car: CustomerCar) => {
    setSelectedCar(car);
    setShowVehicleModal(false);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTripTypeLabel = (type: TripType): string => {
    switch (type) {
      case 'one_way':
        return 'One-way';
      case 'round_trip':
        return 'Round-trip';
      case 'hourly_charter':
        return 'Hourly';
      default:
        return type;
    }
  };

  const mapMarkers = useMemo((): MapMarker[] => {
    if (!pickupLocation || !dropLocation) return [];
    return [
      {
        id: 'pickup',
        coordinate: { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
        title: 'Pickup',
        type: 'pickup',
      },
      {
        id: 'dropoff',
        coordinate: { latitude: dropLocation.latitude, longitude: dropLocation.longitude },
        title: 'Destination',
        type: 'dropoff',
      },
    ];
  }, [pickupLocation, dropLocation]);

  const mapRoute = useMemo((): MapRoute | undefined => {
    if (!pickupLocation || !dropLocation) return undefined;
    return {
      origin: { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
      destination: { latitude: dropLocation.latitude, longitude: dropLocation.longitude },
      strokeColor: '#BD8C5E',
      strokeWidth: 4,
    };
  }, [pickupLocation, dropLocation]);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-darkBorder">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Book a Chauffeur</ThemedText>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Main Booking Card */}
            <ThemedCard variant="elevated" className="mb-4 p-4">
              {/* From Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-gray-400">
                  From
                </ThemedText>
                <GooglePlacesAutocomplete
                  placeholder="Pickup location"
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
                    <ActivityIndicator size="small" color="#BD8C5E" />
                  ) : (
                    <Ionicons name="location" size={18} color={iconColor} />
                  )}
                  <ThemedText className="ml-2 text-burgundy">
                    {isFetchingCurrentLocation ? 'Getting location...' : 'Use current location'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* To Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-gray-400">
                  To
                </ThemedText>
                <GooglePlacesAutocomplete
                  placeholder="Select destination"
                  value={dropLocation?.address || ''}
                  apiKey={appConfig.googlePlacesApiKey}
                  isDarkMode={isDarkMode}
                  icon="navigate"
                  onPlaceSelected={(place) => handlePlaceSelected(place, 'dropoff')}
                />
              </View>

              {/* Vehicle Selection */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-gray-400">
                  Vehicle
                </ThemedText>
                <TouchableOpacity
                  className={`flex-row items-center justify-between p-3 rounded-xl border ${inputClass}`}
                  onPress={() => setShowVehicleModal(true)}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="car" size={20} color={iconColor} />
                    {selectedCar ? (
                      <View className="ml-3">
                        <ThemedText>{selectedCar.make} {selectedCar.model}</ThemedText>
                        <ThemedText variant="tiny" className="text-gray-500">
                          {selectedCar.color} • {selectedCar.registrationNumber}
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText className="ml-3 text-gray-500">Select vehicle</ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color={iconColor} />
                </TouchableOpacity>
              </View>

              {/* When */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-gray-400">
                  When
                </ThemedText>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border mr-2 ${
                      scheduleOption === 'now'
                        ? 'bg-burgundy border-burgundy'
                        : inputClass
                    }`}
                    onPress={() => setScheduleOption('now')}
                  >
                    <ThemedText
                      className={`text-center ${
                        scheduleOption === 'now' ? 'text-white' : ''
                      }`}
                    >
                      Now
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border ${
                      scheduleOption === 'schedule'
                        ? 'bg-burgundy border-burgundy'
                        : inputClass
                    }`}
                    onPress={() => setShowScheduleModal(true)}
                  >
                    <ThemedText
                      className={`text-center ${
                        scheduleOption === 'schedule' ? 'text-white' : ''
                      }`}
                    >
                      Schedule
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {scheduleOption === 'schedule' && scheduledDate && scheduledTime && (
                  <View className="mt-2 p-3 bg-secondary/10 rounded-xl flex-row items-center">
                    <Ionicons name="calendar" size={18} color="#BD8C5E" />
                    <ThemedText variant="small" className="text-secondary ml-2 flex-1">
                      {formatScheduledDateTime()}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
                      <Ionicons name="pencil" size={16} color="#BD8C5E" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Ride Type */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-gray-400">
                  Trip Type
                </ThemedText>
                <View className="flex-row justify-between">
                  {([
                    { id: 'one_way' as TripType, label: 'One-way' },
                    { id: 'round_trip' as TripType, label: 'Round-trip' },
                    { id: 'hourly_charter' as TripType, label: 'Hourly' },
                  ]).map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setTripType(type.id)}
                      className={`flex-1 p-3 rounded-xl border mx-1 ${
                        tripType === type.id ? 'bg-burgundy border-burgundy' : inputClass
                      }`}
                    >
                      <ThemedText
                        variant="small"
                        className={`text-center ${
                          tripType === type.id ? 'text-white' : ''
                        }`}
                      >
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Trip Insurance Banner */}
              <TouchableOpacity
                onPress={openInsuranceModal}
                className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name={selectedInsurancePlanId ? 'shield-checkmark' : 'shield-outline'}
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <View className="flex-1">
                      <ThemedText variant="small" className="font-semibold">
                        {selectedInsurancePlanId ? selectedInsuranceName : 'Add Trip Insurance'}
                      </ThemedText>
                      <ThemedText variant="tiny" className="text-gray-500">
                        {selectedInsurancePlanId
                          ? `₹${selectedInsurancePremium} · Tap to change`
                          : 'Protect your car during the trip'}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedInsurancePlanId ? 'checkmark-circle' : 'chevron-forward'}
                    size={22}
                    color={selectedInsurancePlanId ? '#10B981' : '#3B82F6'}
                  />
                </View>
              </TouchableOpacity>

              {/* Book Button */}
              <PrimaryButton
                title="BOOK NOW"
                onPress={handleBookNow}
                loading={isCalculatingFare}
                className="w-full"
              />
            </ThemedCard>

            {/* Quick Actions - Saved Locations */}
            <View className="mb-4">
              <ThemedText variant="h3" className="mb-3">
                Saved Places
              </ThemedText>
              <View className="flex-row justify-between">
                {savedLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    onPress={() => selectSavedLocation(location)}
                    className="flex-1 mx-1"
                  >
                    <ThemedCard className="items-center py-3">
                      <Ionicons name={location.icon} size={24} color={iconColor} />
                      <ThemedText variant="small" className="mt-1">
                        {location.label}
                      </ThemedText>
                    </ThemedCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* No Cars Warning */}
            {cars.length === 0 && (
              <ThemedCard className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <ThemedText variant="small" className="ml-2 text-yellow-700 dark:text-yellow-400">
                    No vehicles added. Please add a vehicle to book a chauffeur.
                  </ThemedText>
                </View>
                <PrimaryButton
                  title="Add Vehicle"
                  onPress={() => router.push('/(customer)/car-create')}
                  variant="outline"
                  size="small"
                  className="mt-3"
                />
              </ThemedCard>
            )}
          </View>
        </ScrollView>

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
                <ThemedText variant="h2">Select Vehicle</ThemedText>
                <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {isCarsLoading && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color="#BD8C5E" />
                    <ThemedText className="mt-3 text-gray-500">Loading vehicles...</ThemedText>
                  </View>
                )}

                {!isCarsLoading && cars.length === 0 && (
                  <View className="py-6 items-center">
                    <Ionicons name="car-outline" size={40} color="#999" />
                    <ThemedText className="mt-3 text-gray-600">No vehicles added yet</ThemedText>
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
                        <Ionicons name="car" size={24} color="#BD8C5E" />
                      </View>
                      <View className="flex-1">
                        <ThemedText variant="body" className="font-semibold">
                          {car.make} {car.model}
                        </ThemedText>
                        <ThemedText variant="small" className="text-gray-500">
                          {car.color} • {car.registrationNumber}
                        </ThemedText>
                      </View>
                      {selectedCar?.id === car.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#BD8C5E" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Fare Estimate Modal */}
        <Modal
          visible={showFareModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFareModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h2">Fare Estimate</ThemedText>
                <TouchableOpacity onPress={() => setShowFareModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              {fareEstimate && (
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
                  <View className="mb-4 h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-darkBorder">
                    <UniversalMapView
                      initialRegion={{
                        latitude: (pickupLocation.latitude + (dropLocation?.latitude || pickupLocation.latitude)) / 2,
                        longitude: (pickupLocation.longitude + (dropLocation?.longitude || pickupLocation.longitude)) / 2,
                        latitudeDelta: Math.abs(pickupLocation.latitude - (dropLocation?.latitude || pickupLocation.latitude)) * 1.5 + 0.05,
                        longitudeDelta: Math.abs(pickupLocation.longitude - (dropLocation?.longitude || pickupLocation.longitude)) * 1.5 + 0.05,
                      }}
                      markers={mapMarkers}
                      route={mapRoute}
                      googleMapsApiKey={appConfig.googleMapsApiKey}
                      showUserLocation={false}
                    />
                  </View>
                  <View>
                  {/* Trip Summary */}
                  <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={16} color={isDarkMode ? '#BD8C5E' : '#666'} />
                      <ThemedText variant="small" className="ml-2 flex-1">
                        {pickupLocation.address}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center justify-center my-2">
                      <Ionicons name="arrow-down" size={16} color={isDarkMode ? '#BD8C5E' : '#666'} />
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={16} color={isDarkMode ? '#BD8C5E' : '#666'} />
                      <ThemedText variant="small" className="ml-2 flex-1">
                        {dropLocation?.address}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Trip Details */}
                  <View className="flex-row justify-between mb-4 px-2">
                    <ThemedText variant="small" className="text-gray-600">
                      Trip Type
                    </ThemedText>
                    <ThemedText variant="small" className="font-semibold">
                      {getTripTypeLabel(tripType)}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-4 px-2">
                    <ThemedText variant="small" className="text-gray-600">
                      Distance
                    </ThemedText>
                    <ThemedText variant="small" className="font-semibold">
                      {fareEstimate.estimated_distance_km !== null
                        ? `${fareEstimate.estimated_distance_km} km`
                        : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-4 px-2">
                    <ThemedText variant="small" className="text-gray-600">
                      Duration
                    </ThemedText>
                    <ThemedText variant="small" className="font-semibold">
                      {fareEstimate.estimated_duration_minutes
                        ? formatDuration(fareEstimate.estimated_duration_minutes)
                        : 'N/A'}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between mb-4 px-2">
                    <ThemedText variant="small" className="text-gray-600">
                      Vehicle
                    </ThemedText>
                    <View className="items-end">
                      <ThemedText variant="small" className="font-semibold">
                        {selectedCar?.make} {selectedCar?.model}
                      </ThemedText>
                      <ThemedText variant="tiny" className="text-gray-500">
                        {selectedCar?.registrationNumber}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Fare Breakdown */}
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <ThemedText variant="h3">Estimated Fare</ThemedText>
                      <ThemedText variant="h2" className="text-burgundy">
                        {formatFare(parseFloat(fareEstimate.estimated_fare))}
                      </ThemedText>
                    </View>
                    {fareEstimate.fare_breakdown && (
                      <>
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-gray-500">Base fare</ThemedText>
                          <ThemedText variant="tiny" className="text-gray-500">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.base_fare))}
                          </ThemedText>
                        </View>
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-gray-500">Distance fare</ThemedText>
                          <ThemedText variant="tiny" className="text-gray-500">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.distance_fare))}
                          </ThemedText>
                        </View>
                        {fareEstimate.fare_breakdown.time_fare !== undefined && parseFloat(fareEstimate.fare_breakdown.time_fare) > 0 && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-gray-500">Time fare</ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.time_fare))}
                            </ThemedText>
                          </View>
                        )}
                        {fareEstimate.fare_breakdown.subtotal !== undefined && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-gray-500">Subtotal</ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.subtotal))}
                            </ThemedText>
                          </View>
                        )}
                        {fareEstimate.surge_multiplier !== undefined && fareEstimate.surge_multiplier > 1 && fareEstimate.fare_breakdown.surge_amount !== undefined && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-gray-500">
                              Surge x{fareEstimate.surge_multiplier.toFixed(2)}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.surge_amount))}
                            </ThemedText>
                          </View>
                        )}
                        {fareEstimate.fare_breakdown.insurance_premium !== undefined && parseFloat(fareEstimate.fare_breakdown.insurance_premium) > 0 && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-green-600">Insurance Premium</ThemedText>
                            <ThemedText variant="tiny" className="text-green-600">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.insurance_premium))}
                            </ThemedText>
                          </View>
                        )}
                        {fareEstimate.fare_breakdown.total !== undefined && (
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-gray-500 font-semibold">Total</ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500 font-semibold">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.total))}
                            </ThemedText>
                          </View>
                        )}
                      </>
                    )}
                    <ThemedText variant="tiny" className="text-gray-500 text-center">
                      *Final fare may vary based on actual route and traffic
                    </ThemedText>
                  </View>

                  {/* Insurance Selection */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowFareModal(false);
                      openInsuranceModal();
                    }}
                    className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                        </View>
                        <View>
                          <ThemedText variant="small" className="font-semibold">
                            {selectedInsurancePlanId ? 'Insurance Added' : 'Add Trip Insurance'}
                          </ThemedText>
                          <ThemedText variant="tiny" className="text-gray-500">
                            {selectedInsurancePlanId
                              ? `₹${selectedInsurancePremium} for trip coverage`
                              : 'Protect your journey from unexpected damages'}
                          </ThemedText>
                        </View>
                      </View>
                      <Ionicons
                        name={selectedInsurancePlanId ? "checkmark-circle" : "chevron-forward"}
                        size={24}
                        color={selectedInsurancePlanId ? "#10B981" : "#3B82F6"}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Confirm Button */}
                  <PrimaryButton
                    title="CONFIRM BOOKING"
                    onPress={confirmBooking}
                    loading={isBooking}
                    className="w-full"
                  />
                </View>
              </ScrollView>
            )}
            </View>
          </View>
        </Modal>

        {/* Insurance Selection Modal */}
        <Modal
          visible={showInsuranceModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowInsuranceModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6 max-h-[85%]`}>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h2">Trip Insurance</ThemedText>
                <TouchableOpacity onPress={() => setShowInsuranceModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Loading */}
                {isLoadingInsurance && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color="#BD8C5E" />
                    <ThemedText className="mt-3 text-gray-500">Loading plans...</ThemedText>
                  </View>
                )}

                {/* Plan Cards */}
                {!isLoadingInsurance && insurancePlans.map((plan) => {
                  const isSelected = tempSelectedPlanId === plan.id;
                  const premium = InsuranceApiService.parseAmount(plan.premium_amount);
                  const coverage = InsuranceApiService.formatCoverageAmount(plan.max_coverage_amount);
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      onPress={() => setTempSelectedPlanId(isSelected ? null : plan.id)}
                      className={`mb-3 p-4 rounded-xl border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <ThemedText variant="h3">{plan.name}</ThemedText>
                          <ThemedText variant="tiny" className="text-gray-500 mt-1">{plan.description}</ThemedText>
                        </View>
                        <View className="items-end ml-3">
                          <ThemedText variant="h3" className="text-blue-600 font-bold">₹{premium}</ThemedText>
                          <View className={`w-6 h-6 rounded-full border-2 mt-1 items-center justify-center ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                          </View>
                        </View>
                      </View>
                      {/* Coverage pill */}
                      <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/10 rounded-lg px-2 py-1 mb-2 self-start">
                        <Ionicons name="cash-outline" size={13} color="#3B82F6" />
                        <ThemedText variant="tiny" className="ml-1 text-blue-700 dark:text-blue-400">
                          Coverage up to {coverage}
                        </ThemedText>
                      </View>
                      {/* Features */}
                      {plan.coverage_details?.map((feat, i) => (
                        <View key={i} className="flex-row items-center mt-1">
                          <Ionicons name="checkmark-circle" size={14} color="#720C17" />
                          <ThemedText variant="tiny" className="ml-1 text-gray-600 dark:text-gray-400">{feat}</ThemedText>
                        </View>
                      ))}
                    </TouchableOpacity>
                  );
                })}

                {/* Confirm button */}
                {!isLoadingInsurance && (
                  <PrimaryButton
                    title={tempSelectedPlanId ? `Add ${insurancePlans.find(p => p.id === tempSelectedPlanId)?.name || 'Insurance'}` : 'Continue Without Insurance'}
                    onPress={confirmInsuranceSelection}
                    className="mt-2 mb-2"
                  />
                )}

                {/* Clear link */}
                {tempSelectedPlanId && (
                  <TouchableOpacity onPress={clearInsurance} className="py-3 items-center">
                    <ThemedText className="text-gray-500 text-center">Remove Insurance</ThemedText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Schedule Modal - Bottom Sheet */}
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View className="flex-1">
            {/* Backdrop - tapping closes modal */}
            <TouchableOpacity
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setShowScheduleModal(false)}
            />

            {/* Modal Content - doesn't propagate to backdrop */}
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl max-h-[80%]`}>
              {/* Handle Bar */}
              <View className="items-center py-3">
                <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center">
                  <ThemedText variant="h2">Schedule Ride</ThemedText>
                  <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                  </TouchableOpacity>
                </View>
                <ThemedText variant="small" className="mt-1 text-gray-500 dark:text-gray-400">
                  Select pickup date and time
                </ThemedText>
              </View>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                  {/* Date Selection */}
                  <View className="mb-6">
                    <ThemedText variant="small" className="mb-3 font-semibold text-gray-600 dark:text-gray-400">
                      SELECT DATE
                    </ThemedText>

                    {generateNext7Days().length === 0 ? (
                      <View className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl items-center">
                        <Ionicons name="moon" size={24} color="#F59E0B" />
                        <ThemedText variant="small" className="text-yellow-700 dark:text-yellow-400 mt-2 text-center">
                          It's too late to schedule for today. Please check back tomorrow morning.
                        </ThemedText>
                      </View>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {generateNext7Days().map((day) => {
                          const isSelected = scheduledDate &&
                            scheduledDate.toDateString() === day.date.toDateString();
                          const isToday = day.date.toDateString() === new Date().toDateString();

                          return (
                            <TouchableOpacity
                              key={day.dateString}
                              onPress={() => handleDateSelect(day.date)}
                              className={`px-4 py-3 rounded-xl border-2 min-w-[70px] items-center ${
                                isSelected
                                  ? 'border-burgundy bg-burgundy/10 dark:border-secondary dark:bg-secondary/10'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <ThemedText
                                variant="tiny"
                                className={`${
                                  isSelected ? 'text-burgundy dark:text-secondary font-semibold' : 'text-gray-500'
                                }`}
                              >
                                {isToday ? 'Today' : day.dayName}
                              </ThemedText>
                              <ThemedText
                                variant="h3"
                                className={`${isSelected ? 'text-burgundy dark:text-secondary' : ''} mt-1`}
                              >
                                {day.dayNumber}
                              </ThemedText>
                              <ThemedText
                                variant="tiny"
                                className={`${isSelected ? 'text-burgundy dark:text-secondary' : 'text-gray-400'}`}
                              >
                                {day.month}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* Time Selection */}
                  {generateNext7Days().length > 0 && (
                    <View className="mb-6">
                      <ThemedText variant="small" className="mb-3 font-semibold text-gray-600 dark:text-gray-400">
                        SELECT TIME
                      </ThemedText>

                      <View className="flex-row flex-wrap gap-2">
                        {generateTimeSlots().map((timeSlot) => {
                          const isSelected = scheduledTime === timeSlot.value;
                          const isDisabled = timeSlot.disabled;

                          return (
                            <TouchableOpacity
                              key={timeSlot.value}
                              onPress={() => !isDisabled && handleTimeSelect(timeSlot.value)}
                              disabled={isDisabled}
                              className={`px-4 py-3 rounded-xl border-2 min-w-[90px] items-center ${
                                isDisabled
                                  ? 'border-gray-100 bg-gray-50 opacity-50'
                                  : isSelected
                                  ? 'border-burgundy bg-burgundy/10'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <ThemedText
                                variant="body"
                                className={`${
                                  isDisabled
                                    ? 'text-gray-400'
                                    : isSelected
                                    ? 'text-burgundy dark:text-secondary font-semibold'
                                    : ''
                                }`}
                              >
                                {timeSlot.label}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Selected Summary */}
                  {scheduledDate && scheduledTime && (
                    <View className="bg-secondary/10 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={20} color="#BD8C5E" />
                        <View className="flex-1 ml-3">
                          <ThemedText variant="small" className="font-semibold text-secondary">
                            Pickup Scheduled
                          </ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary mt-0.5">
                            {formatScheduledDateTime()}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Confirm Button */}
                  <PrimaryButton
                    title="Confirm Schedule"
                    onPress={handleConfirmSchedule}
                    disabled={!scheduledDate || !scheduledTime}
                    className="w-full"
                  />

                  {/* Bottom padding */}
                  <View className="h-4" />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Saved Locations Modal */}
        <Modal
          visible={showSavedLocations}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSavedLocations(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6 max-h-[60%]`}>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h2">Select Destination</ThemedText>
                <TouchableOpacity onPress={() => setShowSavedLocations(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {savedLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    onPress={() => selectSavedLocation(location)}
                    className="mb-3 p-4 border border-gray-200 dark:border-darkBorder rounded-xl"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name={location.icon} size={20} color={iconColor} />
                      <View className="ml-3">
                        <ThemedText variant="body">{location.label}</ThemedText>
                        <ThemedText variant="small" className="text-gray-500">
                          {location.address}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
