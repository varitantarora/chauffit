import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
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
import { useConfigStore } from '../../store/configStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomerCar } from '../../types/navigation';
import BookingApiService, {
  TripType,
  FareEstimateRequest,
  FareEstimateResponse,
  BookingRequest,
  InsuranceInfo,
  Stop,
} from '../../services/api/BookingApiService';
import InsuranceApiService, { InsurancePlan } from '../../services/api/InsuranceApiService';
import AmenityApiService, { Amenity, AmenityCategory } from '../../services/api/AmenityApiService';
import LoyaltyApiService from '../../services/api/LoyaltyApiService';
import { useLoyaltyStore } from '../../store/loyaltyStore';
import LocationApiService, { FavoriteLocation, LocationType } from '../../services/api/LocationApiService';
import { formatFare } from '../../utils/fareCalculator';
import {
  GooglePlacesAutocomplete,
  getPlaceDetails,
} from '../../components/customer/GooglePlacesAutocomplete';
import UniversalMapView, { MapMarker, MapRoute } from '../../components/shared/MapView';
import { appConfig } from '../../config/env';
import { BrandColors } from '../../constants/Colors';

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
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
  const insuranceEnabled = getConfigValue('insurance_enabled') === 'true';

  const [pickupLocation, setPickupLocation] = useState<BookingLocation>({
    address: '',
    latitude: 28.6139,
    longitude: 77.2090,
  });
  const [dropLocation, setDropLocation] = useState<BookingLocation | null>(null);
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [hourlyHours, setHourlyHours] = useState<number>(2);
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [stops, setStops] = useState<Array<{ stop_number: number; address: string; lat: number; long: number; notes?: string }>>([]);
  const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(null);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [isFetchingPlaceDetails, setIsFetchingPlaceDetails] = useState(false);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([]);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [newPlaceLat, setNewPlaceLat] = useState<number | null>(null);
  const [newPlaceLng, setNewPlaceLng] = useState<number | null>(null);
  const [newPlaceType, setNewPlaceType] = useState<LocationType>('favorite');
  const [isSavingPlace, setIsSavingPlace] = useState(false);

  const [fareEstimate, setFareEstimate] = useState<FareEstimateResponse | null>(null);
  const [selectedInsurancePlanId, setSelectedInsurancePlanId] = useState<string | null>(null);
  const [selectedInsurancePremium, setSelectedInsurancePremium] = useState<number>(0);

  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoadingInsurance, setIsLoadingInsurance] = useState(false);
  const [tempSelectedPlanId, setTempSelectedPlanId] = useState<string | null>(null);
  const [selectedInsuranceName, setSelectedInsuranceName] = useState<string>('');

  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<Map<string, { amenity: Amenity; quantity: number }>>(new Map());

  const [showBreakdown, setShowBreakdown] = useState(false);
  const fareEstimateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Loyalty & Credits
  const { profile: loyaltyProfile, fetchProfile: fetchLoyaltyProfile } = useLoyaltyStore();
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState('');
  const [isApplyingCredits, setIsApplyingCredits] = useState(false);

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
      fetchLoyaltyProfile();
    }
  }, [user?.id, loadUserCars]);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setIsFetchingFavorites(true);
    LocationApiService.getFavorites()
      .then((res) => { if (res.success && res.data) setFavoriteLocations(res.data); })
      .finally(() => setIsFetchingFavorites(false));
  }, [user?.id]);

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

  // Fetch amenities on mount
  useEffect(() => {
    (async () => {
      setIsLoadingAmenities(true);
      const res = await AmenityApiService.listAmenities();
      if (res.success && res.data) setAvailableAmenities(res.data);
      setIsLoadingAmenities(false);
    })();
  }, []);

  // Inline fare calculation (does not open modal)
  const calculateFareInline = useCallback(async () => {
    if (!dropLocation || !selectedCar || !pickupLocation?.address) return;
    if (tripType === 'multi_stop' && stops.length === 0) return;

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
        ...(tripType === 'hourly' ? { hours: hourlyHours } : {}),
        ...(tripType === 'multi_stop' ? { stops: stops.map(s => ({ ...s, lat: formatCoord(s.lat), long: formatCoord(s.long) })) } : {}),
      };

      const response = await BookingApiService.getFareEstimate(estimateRequest);

      if (response.success && response.data) {
        setFareEstimate(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to calculate fare. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate fare. Please try again.');
    } finally {
      setIsCalculatingFare(false);
    }
  }, [pickupLocation, dropLocation, selectedCar, scheduleOption, tripType, scheduledDate, selectedInsurancePlanId, hourlyHours, stops]);

  // Auto-fetch fare estimate when all inputs are ready
  useEffect(() => {
    if (!pickupLocation?.address || !dropLocation || !selectedCar) {
      setFareEstimate(null);
      return;
    }

    if (fareEstimateTimerRef.current) {
      clearTimeout(fareEstimateTimerRef.current);
    }

    fareEstimateTimerRef.current = setTimeout(() => {
      calculateFareInline();
    }, 500);

    return () => {
      if (fareEstimateTimerRef.current) {
        clearTimeout(fareEstimateTimerRef.current);
      }
    };
  }, [
    pickupLocation?.address, pickupLocation?.latitude, pickupLocation?.longitude,
    dropLocation?.address, dropLocation?.latitude, dropLocation?.longitude,
    selectedCar?.id, tripType, scheduleOption, scheduledDate,
    // selectedInsurancePlanId removed - it's updated by fare estimate response, creating a loop
    hourlyHours, stops,
  ]);

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary dark:text-darkText border-border dark:border-darkBorder';

  const getFavoriteIcon = (title: string): React.ComponentProps<typeof Ionicons>['name'] => {
    const t = title.toLowerCase();
    if (t.includes('home')) return 'home';
    if (t.includes('work') || t.includes('office')) return 'business';
    if (t.includes('airport')) return 'airplane';
    return 'star';
  };

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
        ...(tripType === 'hourly' ? { hours: hourlyHours } : {}),
      };

      const response = await BookingApiService.getFareEstimate(estimateRequest);

      if (response.success && response.data) {
        setFareEstimate(response.data);
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

      // Phase 1: try instant cached location (home tab already fetched this)
      let locationResult = await Location.getLastKnownPositionAsync();

      // Treat as stale if older than 60 seconds
      if (locationResult && Date.now() - locationResult.timestamp > 60_000) {
        locationResult = null;
      }

      // Phase 2: fall back to fresh fetch with Balanced (WiFi/cell, ~1-2s)
      if (!locationResult) {
        locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const reverse = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      const formattedAddress = reverse.length > 0 ? formatAddress(reverse[0]) : 'Current Location';

      setPickupLocation({
        address: formattedAddress,
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
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

    if (fareEstimate) {
      confirmBooking();
    } else {
      calculateFareInline();
    }
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

  // Amenity helpers
  const toggleAmenity = (amenity: Amenity) => {
    setSelectedAmenities((prev) => {
      const next = new Map(prev);
      if (next.has(amenity.id)) {
        next.delete(amenity.id);
      } else {
        next.set(amenity.id, { amenity, quantity: 1 });
      }
      return next;
    });
  };

  const updateAmenityQuantity = (amenityId: string, quantity: number) => {
    if (quantity < 1 || quantity > 5) return;
    setSelectedAmenities((prev) => {
      const next = new Map(prev);
      const entry = next.get(amenityId);
      if (entry) {
        next.set(amenityId, { ...entry, quantity });
      }
      return next;
    });
  };

  const amenitiesTotal = Array.from(selectedAmenities.values()).reduce(
    (sum, { amenity, quantity }) => sum + AmenityApiService.parsePrice(amenity.price) * quantity,
    0
  );

  const selectedAmenitiesCount = selectedAmenities.size;

  const groupedAvailableAmenities = AmenityApiService.groupByCategory(availableAmenities);

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
        ...(tripType === 'hourly' ? { hours: hourlyHours } : {}),
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

  const navigateToSearching = (bookingId: string, creditsApplied: number = 0) => {
    router.push({
      pathname: '/(customer)/searching-drivers',
      params: {
        bookingId,
        pickup: pickupLocation.address,
        destination: dropLocation!.address,
        fare: String(fareEstimate?.estimated_fare ?? 0),
        pickupLat: pickupLocation.latitude.toString(),
        pickupLng: pickupLocation.longitude.toString(),
        dropLat: dropLocation!.latitude.toString(),
        dropLng: dropLocation!.longitude.toString(),
        creditsApplied: creditsApplied.toString(),
        loyaltyDiscountPct: String(loyaltyProfile?.discount_percentage ?? 0),
      },
    });
  };

  const handleApplyCredits = async () => {
    if (!pendingBookingId) return;
    const amount = parseFloat(creditsInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid credit amount.');
      return;
    }
    if (loyaltyProfile && amount > Number(loyaltyProfile.credit_balance)) {
      Alert.alert('Insufficient credits', `You only have ₹${Number(loyaltyProfile.credit_balance).toFixed(2)} credits available.`);
      return;
    }

    setIsApplyingCredits(true);
    try {
      const response = await LoyaltyApiService.applyCredits({
        booking_id: pendingBookingId,
        credits_to_apply: amount,
      });
      if (response.success) {
        await fetchLoyaltyProfile();
        setShowCreditsModal(false);
        navigateToSearching(pendingBookingId, amount);
      } else {
        Alert.alert('Failed', response.error || 'Could not apply credits. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'An error occurred while applying credits.');
    } finally {
      setIsApplyingCredits(false);
    }
  };

  const confirmBooking = async () => {
    if (!fareEstimate || !dropLocation || !selectedCar) {
      return;
    }

    if (tripType === 'multi_stop' && stops.length === 0) {
      Alert.alert('Invalid Booking', 'Please add at least one stop for multi-stop bookings');
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
        ...(tripType === 'hourly' ? { hours: hourlyHours } : {}),
        ...(tripType === 'multi_stop' ? { stops: stops.map(s => ({ ...s, lat: formatCoord(s.lat), long: formatCoord(s.long) })) } : {}),
      };

      const response = await BookingApiService.bookRide(bookingData);

      if (response.success && response.data) {
        const bookingId = response.data.id;

        // Add selected amenities to the booking
        if (selectedAmenities.size > 0) {
          const amenityPromises = Array.from(selectedAmenities.values()).map(({ amenity, quantity }) =>
            AmenityApiService.addAmenityToBooking(bookingId, amenity.id, quantity)
          );
          await Promise.allSettled(amenityPromises);
        }

        await createBooking({
          id: bookingId,
          customerId: user?.id || '',
          chauffeurId: '',
          chauffeurName: 'Finding driver...',
          duration: tripType === 'hourly' ? 'Hourly' : tripType === 'round_trip' ? 'Round-trip' : tripType === 'multi_stop' ? 'Multi-stop' : 'One-way',
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

        // If customer has credits, show the credits modal
        if (loyaltyProfile && Number(loyaltyProfile.credit_balance) > 0) {
          setPendingBookingId(bookingId);
          setCreditsInput('');
          setShowCreditsModal(true);
        } else {
          navigateToSearching(bookingId);
        }
      } else {
        Alert.alert('Booking Failed', response.error || 'Unable to book ride. Please try again.');
      }
    } catch (error) {
      Alert.alert('Booking Failed', 'An error occurred while booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleAddPlace = async () => {
    if (!newPlaceTitle.trim()) {
      Alert.alert('Missing name', 'Please enter a name for this place.');
      return;
    }
    if (!newPlaceAddress || newPlaceLat === null || newPlaceLng === null) {
      Alert.alert('Missing address', 'Please search and select an address.');
      return;
    }
    setIsSavingPlace(true);
    const res = await LocationApiService.addFavorite({
      title: newPlaceTitle.trim(),
      address: newPlaceAddress,
      latitude: newPlaceLat,
      longitude: newPlaceLng,
      location_type: newPlaceType,
    });
    setIsSavingPlace(false);
    if (res.success && res.data) {
      setFavoriteLocations((prev) => [...prev, res.data!]);
      setShowAddPlaceModal(false);
      setNewPlaceTitle('');
      setNewPlaceAddress('');
      setNewPlaceLat(null);
      setNewPlaceLng(null);
      setNewPlaceType('favorite');
    } else {
      Alert.alert('Error', res.error || 'Failed to save place. Please try again.');
    }
  };

  const selectSavedLocation = (location: FavoriteLocation) => {
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
      case 'hourly':
        return 'Hourly';
      case 'multi_stop':
        return 'Multi-stop';
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
      strokeColor: BrandColors.secondary,
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

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-6 py-4">
            {/* Main Booking Card */}
            <ThemedCard variant="elevated" className="mb-4 p-4">
              {/* Trip Type */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
                  Trip Type
                </ThemedText>
                <View className="flex-row justify-between gap-2">
                  {([
                    { id: 'one_way' as TripType, label: 'One-way' },
                    { id: 'round_trip' as TripType, label: 'Round-trip' },
                    { id: 'hourly' as TripType, label: 'Hourly' },
                    { id: 'multi_stop' as TripType, label: 'Multi-stop' },
                  ]).map((type) => {
                    const isSelected = tripType === type.id;
                    return (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => setTripType(type.id)}
                        activeOpacity={0.7}
                        className={
                          isSelected 
                            ? 'flex-1 p-2 rounded-lg border bg-burgundy border-burgundy' 
                            : `flex-1 p-2 rounded-lg border ${isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border dark:border-darkBorder'}`
                        }
                      >
                        <ThemedText
                          variant="small"
                          className={
                            isSelected 
                              ? 'text-center text-white font-medium' 
                              : `text-center ${isDarkMode ? 'text-darkText' : 'text-textPrimary dark:text-darkText'}`
                          }
                        >
                          {type.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* From Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
                  From
                </ThemedText>
                <GooglePlacesAutocomplete
                  placeholder="Pickup location"
                  value={pickupLocation.address}
                  apiKey={appConfig.googlePlacesApiKey}
                  isDarkMode={isDarkMode}
                  icon="location"
                  onPlaceSelected={(place) => handlePlaceSelected(place, 'pickup')}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  isFetchingCurrentLocation={isFetchingCurrentLocation}
                />
              </View>

              {/* Multi-Stop Management */}
              {tripType === 'multi_stop' && (
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <ThemedText variant="small" className="text-gray-600 dark:text-darkTextSecondary">
                      Stops ({stops.length})
                    </ThemedText>
                    {stops.length < 8 && (
                      <TouchableOpacity
                        onPress={() => {
                          const newStop = {
                            stop_number: stops.length + 1,
                            address: '',
                            lat: pickupLocation.latitude,
                            long: pickupLocation.longitude,
                          };
                          setStops([...stops, newStop]);
                        }}
                        className="flex-row items-center bg-burgundy rounded-lg px-3 py-2"
                      >
                        <Ionicons name="add" size={16} color="white" />
                        <ThemedText className="text-white text-xs font-semibold ml-1">Add Stop</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>

                  {stops.length === 0 && (
                    <ThemedCard className="p-3 border border-dashed border-border dark:border-darkBorder items-center">
                      <Ionicons name="location-outline" size={24} color="#999" />
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary mt-2 text-center">
                        Add at least one stop
                      </ThemedText>
                    </ThemedCard>
                  )}

                  {stops.map((stop, index) => (
                    <View key={index} className="mb-2">
                      <TouchableOpacity
                        onPress={() => setExpandedStopIndex(expandedStopIndex === index ? null : index)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-gray-900/30 active:opacity-70"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <ThemedText variant="tiny" className="font-semibold text-textSecondary dark:text-darkTextSecondary mb-1">
                              Stop {stop.stop_number}
                            </ThemedText>
                            <ThemedText variant="tiny" className={`${stop.address ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-darkTextSecondary italic'}`}>
                              {stop.address || 'Tap to set location'}
                            </ThemedText>
                          </View>
                          <View className="flex-row items-center ml-2">
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                setStops(stops.filter((_, i) => i !== index));
                              }}
                              className="ml-2"
                            >
                              <Ionicons name="close-circle" size={20} color={BrandColors.danger} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {expandedStopIndex === index && (
                        <View className="mt-2 p-3 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-gray-900">
                          <GooglePlacesAutocomplete
                            placeholder="Search location"
                            value={stop.address}
                            apiKey={appConfig.googlePlacesApiKey}
                            isDarkMode={isDarkMode}
                            icon="location"
                            onPlaceSelected={async (place) => {
                              setIsFetchingPlaceDetails(true);
                              try {
                                const details = await getPlaceDetails(place.place_id, appConfig.googlePlacesApiKey);
                                const displayAddress = place.structured_formatting?.main_text
                                  ? place.description
                                  : details.address;

                                const updatedStops = [...stops];
                                updatedStops[index] = {
                                  ...updatedStops[index],
                                  address: displayAddress,
                                  lat: details.lat,
                                  long: details.lng,
                                };
                                setStops(updatedStops);
                                setExpandedStopIndex(null);
                              } catch (error) {
                                Alert.alert('Error', 'Failed to fetch location details');
                              } finally {
                                setIsFetchingPlaceDetails(false);
                              }
                            }}
                          />
                        </View>
                      )}
                    </View>
                  ))}

                  {stops.length > 0 && (
                    <ThemedCard className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700">
                      <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={16} color="#B45309" className="mr-2 mt-0.5" />
                        <ThemedText variant="tiny" className="text-amber-900 dark:text-amber-200 flex-1">
                          Multi-stop bookings get {Math.min(15, 5 + (stops.length - 1) * 5)}% off the fare
                        </ThemedText>
                      </View>
                    </ThemedCard>
                  )}
                </View>
              )}

              {/* To Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
                  {tripType === 'round_trip' ? 'To (return point)' : 'To'}
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
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
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
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {selectedCar.color} • {selectedCar.registrationNumber}
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText className="ml-3 text-textSecondary dark:text-darkTextSecondary">Select vehicle</ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color={iconColor} />
                </TouchableOpacity>
              </View>

              {/* When */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
                  When
                </ThemedText>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border mr-2 ${scheduleOption === 'now'
                        ? 'bg-burgundy border-burgundy'
                        : inputClass
                      }`}
                    onPress={() => setScheduleOption('now')}
                  >
                    <ThemedText
                      className={`text-center ${scheduleOption === 'now' ? 'text-white' : ''
                        }`}
                    >
                      Now
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border ${scheduleOption === 'schedule'
                        ? 'bg-burgundy border-burgundy'
                        : inputClass
                      }`}
                    onPress={() => setShowScheduleModal(true)}
                  >
                    <ThemedText
                      className={`text-center ${scheduleOption === 'schedule' ? 'text-white' : ''
                        }`}
                    >
                      Schedule
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {scheduleOption === 'schedule' && scheduledDate && scheduledTime && (
                  <View className="mt-2 p-3 bg-secondary/10 rounded-xl flex-row items-center">
                    <Ionicons name="calendar" size={18} color={BrandColors.secondary} />
                    <ThemedText variant="small" className="text-secondary ml-2 flex-1">
                      {formatScheduledDateTime()}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
                      <Ionicons name="pencil" size={16} color={BrandColors.secondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Hourly Duration Selector */}
              {tripType === 'hourly' && (
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2 text-gray-600 dark:text-darkTextSecondary">
                    Duration (hours)
                  </ThemedText>
                  <View className="flex-row items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-darkBorder">
                    <TouchableOpacity
                      onPress={() => setHourlyHours(Math.max(2, hourlyHours - 2))}
                      className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                    >
                      <Ionicons name="remove" size={20} color={isDarkMode ? '#fff' : '#333'} />
                    </TouchableOpacity>
                    <ThemedText variant="h2" className="mx-4">
                      {hourlyHours} hours
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => setHourlyHours(Math.min(8, hourlyHours + 2))}
                      className="w-10 h-10 rounded-full bg-burgundy items-center justify-center"
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Trip Insurance Banner */}
              {insuranceEnabled && (
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
                          color={BrandColors.info}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText variant="small" className="font-semibold">
                          {selectedInsurancePlanId ? selectedInsuranceName : 'Add Trip Insurance'}
                        </ThemedText>
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {selectedInsurancePlanId
                            ? `₹${selectedInsurancePremium} · Tap to change`
                            : 'Protect your car during the trip'}
                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons
                      name={selectedInsurancePlanId ? 'checkmark-circle' : 'chevron-forward'}
                      size={22}
                      color={selectedInsurancePlanId ? BrandColors.success : BrandColors.info}
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Amenities Banner */}
              <TouchableOpacity
                onPress={() => setShowAmenityModal(true)}
                className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name={selectedAmenitiesCount > 0 ? 'cafe' : 'cafe-outline'}
                        size={20}
                        color="#D97706"
                      />
                    </View>
                    <View className="flex-1">
                      <ThemedText variant="small" className="font-semibold">
                        {selectedAmenitiesCount > 0
                          ? `${selectedAmenitiesCount} Amenit${selectedAmenitiesCount === 1 ? 'y' : 'ies'} Selected`
                          : 'Add Amenities'}
                      </ThemedText>
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                        {selectedAmenitiesCount > 0
                          ? `${formatFare(amenitiesTotal)} total · Tap to change`
                          : 'Customize your ride experience'}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedAmenitiesCount > 0 ? 'checkmark-circle' : 'chevron-forward'}
                    size={22}
                    color={selectedAmenitiesCount > 0 ? BrandColors.success : '#D97706'}
                  />
                </View>
              </TouchableOpacity>

              {/* Inline Fare Estimate */}
              {isCalculatingFare && !fareEstimate && (
                <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl items-center">
                  <ActivityIndicator size="small" color={BrandColors.secondary} />
                  <ThemedText variant="small" className="mt-2 text-textSecondary dark:text-darkTextSecondary">Calculating fare...</ThemedText>
                </View>
              )}

              {fareEstimate && (
                <ThemedCard variant="elevated" className="mb-4 p-4">
                  {/* Distance & Duration Row */}
                  <View className="flex-row justify-around mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="map-outline" size={18} color={iconColor} />
                      <ThemedText variant="small" className="ml-2 font-semibold">
                        {fareEstimate.estimated_distance_km != null
                          ? `${fareEstimate.estimated_distance_km} km`
                          : 'N/A'}
                      </ThemedText>
                    </View>
                    <View className="w-px bg-gray-300 dark:bg-gray-600" />
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={18} color={iconColor} />
                      <ThemedText variant="small" className="ml-2 font-semibold">
                        {fareEstimate.estimated_duration_minutes != null
                          ? formatDuration(fareEstimate.estimated_duration_minutes)
                          : 'N/A'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Total Fare */}
                  <View className="items-center mb-3">
                    <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Estimated Fare</ThemedText>
                    <ThemedText variant="h1" className="text-burgundy">
                      {formatFare(Number(fareEstimate.estimated_fare))}
                    </ThemedText>
                  </View>

                  {/* Loyalty Discount Badge */}
                  {loyaltyProfile && loyaltyProfile.discount_percentage > 0 && (
                    <View className="flex-row items-center justify-center mb-3 bg-green-50 py-2 px-4 rounded-xl">
                      <Ionicons name="star" size={14} color={BrandColors.success} />
                      <ThemedText variant="tiny" className="ml-2 text-green-700">
                        {loyaltyProfile.discount_percentage}% {LoyaltyApiService.getTierLabel(loyaltyProfile.tier)} discount already applied
                      </ThemedText>
                    </View>
                  )}

                  {/* Collapsible Breakdown */}
                  {fareEstimate.fare_breakdown && (
                    <TouchableOpacity
                      onPress={() => setShowBreakdown(!showBreakdown)}
                      className="flex-row items-center justify-center py-3 mb-2"
                      activeOpacity={0.6}
                    >
                      <ThemedText variant="small" className="text-secondary mr-1">
                        {showBreakdown ? 'Hide breakdown' : 'View breakdown'}
                      </ThemedText>
                      <Ionicons
                        name={showBreakdown ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={BrandColors.secondary}
                      />
                    </TouchableOpacity>
                  )}

                  {showBreakdown && fareEstimate.fare_breakdown && (
                    <View className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-2">
                      <View className="flex-row justify-between mb-1 px-2">
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Base fare</ThemedText>
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {formatFare(parseFloat(fareEstimate.fare_breakdown.base_fare))}
                        </ThemedText>
                      </View>
                      <View className="flex-row justify-between mb-1 px-2">
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {fareEstimate.fare_breakdown.distance_km && fareEstimate.fare_breakdown.per_km_rate
                            ? `Distance (${parseFloat(fareEstimate.fare_breakdown.distance_km).toFixed(2)} km × ₹${fareEstimate.fare_breakdown.per_km_rate}/km)`
                            : 'Distance fare'}
                        </ThemedText>
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {formatFare(parseFloat(fareEstimate.fare_breakdown.distance_fare))}
                        </ThemedText>
                      </View>
                      {fareEstimate.fare_breakdown.time_fare !== undefined && parseFloat(fareEstimate.fare_breakdown.time_fare) > 0 && (
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Time fare</ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.time_fare))}
                          </ThemedText>
                        </View>
                      )}
                      {fareEstimate.fare_breakdown.subtotal !== undefined && (
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Subtotal</ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                            {formatFare(parseFloat(fareEstimate.fare_breakdown.subtotal))}
                          </ThemedText>
                        </View>
                      )}
                      {fareEstimate.surge_multiplier !== undefined && fareEstimate.surge_multiplier > 1 && fareEstimate.fare_breakdown.surge_amount !== undefined && (
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                            Surge x{fareEstimate.surge_multiplier.toFixed(2)}
                          </ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
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
                      {amenitiesTotal > 0 && (
                        <View className="flex-row justify-between mb-1 px-2">
                          <ThemedText variant="tiny" className="text-amber-600">Amenities ({selectedAmenitiesCount})</ThemedText>
                          <ThemedText variant="tiny" className="text-amber-600">
                            {formatFare(amenitiesTotal)}
                          </ThemedText>
                        </View>
                      )}
                      {fareEstimate.fare_breakdown.total !== undefined && (
                        <>
                          <View className="border-t border-gray-200 dark:border-gray-600 mt-1 mb-1 mx-2" />
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary font-semibold">Total</ThemedText>
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary font-semibold">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.total))}
                            </ThemedText>
                          </View>
                        </>
                      )}
                    </View>
                  )}

                  <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary text-center">
                    *Final fare may vary based on actual route and traffic
                  </ThemedText>
                </ThemedCard>
              )}

              {/* Book / Estimate Button */}
              <PrimaryButton
                title={fareEstimate ? 'BOOK NOW' : (pickupLocation?.address && dropLocation && selectedCar ? 'GET ESTIMATE' : 'BOOK NOW')}
                onPress={handleBookNow}
                loading={fareEstimate ? isBooking : isCalculatingFare}
                disabled={!pickupLocation?.address || !dropLocation || !selectedCar}
                className="w-full"
              />
            </ThemedCard>

            {/* Quick Actions - Saved Locations */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <ThemedText variant="h3">Saved Places</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowAddPlaceModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add-circle-outline" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>
              {isFetchingFavorites ? (
                <ActivityIndicator size="small" color={iconColor} />
              ) : favoriteLocations.length === 0 ? (
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center">
                  No saved places
                </ThemedText>
              ) : (
                <View className="flex-row flex-wrap">
                  {favoriteLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      onPress={() => selectSavedLocation(location)}
                      className="mx-1 mb-2"
                      style={{ width: '30%' }}
                    >
                      <ThemedCard className="items-center py-3">
                        <Ionicons name={getFavoriteIcon(location.title)} size={24} color={iconColor} />
                        <ThemedText variant="small" className="mt-1 text-center" numberOfLines={1}>
                          {location.title}
                        </ThemedText>
                      </ThemedCard>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* No Cars Warning */}
            {cars.length === 0 && (
              <ThemedCard className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color={BrandColors.warning} />
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
                    className={`mb-3 p-4 rounded-xl border ${selectedCar?.id === car.id
                        ? 'border-burgundy bg-burgundy/10 dark:border-secondary dark:bg-secondary/10'
                        : 'border-gray-200 dark:border-darkBorder'
                      }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                        <Ionicons name="car" size={24} color={BrandColors.secondary} />
                      </View>
                      <View className="flex-1">
                        <ThemedText variant="body" className="font-semibold">
                          {car.make} {car.model}
                        </ThemedText>
                        <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                          {car.color} • {car.registrationNumber}
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
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]" contentContainerStyle={{ paddingBottom: 50 }}>
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
                        <Ionicons name="location" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                        <ThemedText variant="small" className="ml-2 flex-1">
                          {pickupLocation.address}
                        </ThemedText>
                      </View>
                      <View className="flex-row items-center justify-center my-2">
                        <Ionicons name="arrow-down" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="navigate" size={16} color={isDarkMode ? BrandColors.secondary : '#666'} />
                        <ThemedText variant="small" className="ml-2 flex-1">
                          {dropLocation?.address}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Trip Details */}
                    <View className="flex-row justify-between mb-4 px-2">
                      <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                        Trip Type
                      </ThemedText>
                      <ThemedText variant="small" className="font-semibold">
                        {getTripTypeLabel(tripType)}
                      </ThemedText>
                    </View>
                    <View className="flex-row justify-between mb-4 px-2">
                      <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                        Distance
                      </ThemedText>
                      <ThemedText variant="small" className="font-semibold">
                        {fareEstimate.estimated_distance_km !== null
                          ? `${fareEstimate.estimated_distance_km} km`
                          : 'N/A'}
                      </ThemedText>
                    </View>
                    <View className="flex-row justify-between mb-4 px-2">
                      <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                        Duration
                      </ThemedText>
                      <ThemedText variant="small" className="font-semibold">
                        {fareEstimate.estimated_duration_minutes
                          ? formatDuration(fareEstimate.estimated_duration_minutes)
                          : 'N/A'}
                      </ThemedText>
                    </View>
                    <View className="flex-row justify-between mb-4 px-2">
                      <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                        Vehicle
                      </ThemedText>
                      <View className="items-end">
                        <ThemedText variant="small" className="font-semibold">
                          {selectedCar?.make} {selectedCar?.model}
                        </ThemedText>
                        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                          {selectedCar?.registrationNumber}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Fare Breakdown */}
                    <View className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <ThemedText variant="h3">Estimated Fare</ThemedText>
                        <ThemedText variant="h2" className="text-burgundy">
                          {formatFare(Number(fareEstimate.estimated_fare))}
                        </ThemedText>
                      </View>
                      {fareEstimate.fare_breakdown && (
                        <>
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Base fare</ThemedText>
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.base_fare))}
                            </ThemedText>
                          </View>
                          <View className="flex-row justify-between mb-1 px-2">
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                              {fareEstimate.fare_breakdown.distance_km && fareEstimate.fare_breakdown.per_km_rate
                                ? `Distance (${parseFloat(fareEstimate.fare_breakdown.distance_km).toFixed(2)} km × ₹${fareEstimate.fare_breakdown.per_km_rate}/km)`
                                : 'Distance fare'}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                              {formatFare(parseFloat(fareEstimate.fare_breakdown.distance_fare))}
                            </ThemedText>
                          </View>
                          {fareEstimate.fare_breakdown.time_fare !== undefined && parseFloat(fareEstimate.fare_breakdown.time_fare) > 0 && (
                            <View className="flex-row justify-between mb-1 px-2">
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Time fare</ThemedText>
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                                {formatFare(parseFloat(fareEstimate.fare_breakdown.time_fare))}
                              </ThemedText>
                            </View>
                          )}
                          {fareEstimate.fare_breakdown.subtotal !== undefined && (
                            <View className="flex-row justify-between mb-1 px-2">
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Subtotal</ThemedText>
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                                {formatFare(parseFloat(fareEstimate.fare_breakdown.subtotal))}
                              </ThemedText>
                            </View>
                          )}
                          {fareEstimate.surge_multiplier !== undefined && fareEstimate.surge_multiplier > 1 && fareEstimate.fare_breakdown.surge_amount !== undefined && (
                            <View className="flex-row justify-between mb-1 px-2">
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                                Surge x{fareEstimate.surge_multiplier.toFixed(2)}
                              </ThemedText>
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
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
                          {amenitiesTotal > 0 && (
                            <View className="flex-row justify-between mb-1 px-2">
                              <ThemedText variant="tiny" className="text-amber-600">Amenities ({selectedAmenitiesCount})</ThemedText>
                              <ThemedText variant="tiny" className="text-amber-600">
                                {formatFare(amenitiesTotal)}
                              </ThemedText>
                            </View>
                          )}
                          {fareEstimate.fare_breakdown.total !== undefined && (
                            <>
                              <View className="border-t border-gray-200 dark:border-gray-600 mt-1 mb-1 mx-2" />
                              <View className="flex-row justify-between mb-1 px-2">
                                <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary font-semibold">Total</ThemedText>
                                <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary font-semibold">
                                  {formatFare(parseFloat(fareEstimate.fare_breakdown.total))}
                                </ThemedText>
                              </View>
                            </>
                          )}
                        </>
                      )}
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary text-center">
                        *Final fare may vary based on actual route and traffic
                      </ThemedText>
                    </View>

                    {/* Insurance Selection */}
                    {insuranceEnabled && (
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
                              <Ionicons name="shield-checkmark" size={20} color={BrandColors.info} />
                            </View>
                            <View>
                              <ThemedText variant="small" className="font-semibold">
                                {selectedInsurancePlanId ? 'Insurance Added' : 'Add Trip Insurance'}
                              </ThemedText>
                              <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                                {selectedInsurancePlanId
                                  ? `₹${selectedInsurancePremium} for trip coverage`
                                  : 'Protect your journey from unexpected damages'}
                              </ThemedText>
                            </View>
                          </View>
                          <Ionicons
                            name={selectedInsurancePlanId ? "checkmark-circle" : "chevron-forward"}
                            size={24}
                            color={selectedInsurancePlanId ? BrandColors.success : BrandColors.info}
                          />
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Amenities Selection in Fare Modal */}
                    <TouchableOpacity
                      onPress={() => {
                        setShowFareModal(false);
                        setShowAmenityModal(true);
                      }}
                      className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="cafe" size={20} color="#D97706" />
                          </View>
                          <View>
                            <ThemedText variant="small" className="font-semibold">
                              {selectedAmenitiesCount > 0
                                ? `${selectedAmenitiesCount} Amenit${selectedAmenitiesCount === 1 ? 'y' : 'ies'} Added`
                                : 'Add Amenities'}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                              {selectedAmenitiesCount > 0
                                ? `${formatFare(amenitiesTotal)} total`
                                : 'Customize your ride experience'}
                            </ThemedText>
                          </View>
                        </View>
                        <Ionicons
                          name={selectedAmenitiesCount > 0 ? "checkmark-circle" : "chevron-forward"}
                          size={24}
                          color={selectedAmenitiesCount > 0 ? BrandColors.success : "#D97706"}
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
          visible={insuranceEnabled && showInsuranceModal}
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

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Loading */}
                {isLoadingInsurance && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color={BrandColors.secondary} />
                    <ThemedText className="mt-3 text-textSecondary dark:text-darkTextSecondary">Loading plans...</ThemedText>
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
                      className={`mb-3 p-4 rounded-xl border-2 ${isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                        }`}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <ThemedText variant="h3">{plan.name}</ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary mt-1">{plan.description}</ThemedText>
                        </View>
                        <View className="items-end ml-3">
                          <ThemedText variant="h3" className="text-blue-600 font-bold">₹{premium}</ThemedText>
                          <View className={`w-6 h-6 rounded-full border-2 mt-1 items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-border dark:border-darkBorder'
                            }`}>
                            {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                          </View>
                        </View>
                      </View>
                      {/* Coverage pill */}
                      <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/10 rounded-lg px-2 py-1 mb-2 self-start">
                        <Ionicons name="cash-outline" size={13} color={BrandColors.info} />
                        <ThemedText variant="tiny" className="ml-1 text-blue-700 dark:text-blue-400">
                          Coverage up to {coverage}
                        </ThemedText>
                      </View>
                      {/* Features */}
                      <View className="flex-row flex-wrap mt-2">
                        {plan.coverage_details?.map((feat, i) => (
                          <View key={i} className="w-1/2 flex-row items-start mb-1 pr-2">
                            <Ionicons name="checkmark-circle" size={14} color={BrandColors.burgundy} className="flex-shrink-0 mt-0.5" />
                            <ThemedText variant="tiny" className="ml-1 text-gray-600 dark:text-darkTextSecondary flex-1">{feat}</ThemedText>
                          </View>
                        ))}
                      </View>
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
                    <ThemedText className="text-textSecondary dark:text-darkTextSecondary text-center">Remove Insurance</ThemedText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Amenity Selection Modal */}
        <Modal
          visible={showAmenityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAmenityModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6 max-h-[85%]`}>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h2">Add Amenities</ThemedText>
                <TouchableOpacity onPress={() => setShowAmenityModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                {isLoadingAmenities && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color={BrandColors.secondary} />
                    <ThemedText className="mt-3 text-textSecondary dark:text-darkTextSecondary">Loading amenities...</ThemedText>
                  </View>
                )}

                {!isLoadingAmenities && availableAmenities.length === 0 && (
                  <View className="py-8 items-center">
                    <Ionicons name="cafe-outline" size={40} color="#999" />
                    <ThemedText className="mt-3 text-textSecondary dark:text-darkTextSecondary">No amenities available</ThemedText>
                  </View>
                )}

                {!isLoadingAmenities && (Object.entries(groupedAvailableAmenities) as [AmenityCategory, Amenity[]][]).map(([category, items]) => {
                  if (items.length === 0) return null;
                  const categoryEmoji = category === 'refreshment' ? '💧' : category === 'comfort' ? '🛋️' : '✨';
                  return (
                    <View key={category} className="mb-5">
                      <ThemedText variant="h3" className="mb-3">
                        {categoryEmoji} {AmenityApiService.getCategoryDisplayName(category)}
                      </ThemedText>
                      {items.map((amenity) => {
                        const isSelected = selectedAmenities.has(amenity.id);
                        const entry = selectedAmenities.get(amenity.id);
                        const quantity = entry?.quantity || 1;
                        return (
                          <TouchableOpacity
                            key={amenity.id}
                            onPress={() => toggleAmenity(amenity)}
                            className={`mb-2 p-3 rounded-xl border-2 ${isSelected
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                              }`}
                            activeOpacity={0.8}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center flex-1">
                                <Ionicons
                                  name={AmenityApiService.getCategoryIcon(category) as any}
                                  size={20}
                                  color={isSelected ? '#D97706' : '#999'}
                                />
                                <View className="ml-3 flex-1">
                                  <ThemedText variant="small" className="font-semibold">{amenity.name}</ThemedText>
                                  <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">{amenity.description}</ThemedText>
                                </View>
                              </View>
                              <View className="items-end ml-2">
                                <ThemedText variant="small" className="font-bold text-amber-600">
                                  {AmenityApiService.formatPrice(amenity.price)}
                                </ThemedText>
                                <View className={`w-5 h-5 rounded-full border-2 mt-1 items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-border dark:border-darkBorder'
                                  }`}>
                                  {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                                </View>
                              </View>
                            </View>

                            {isSelected && (
                              <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                                <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Quantity</ThemedText>
                                <View className="flex-row items-center">
                                  <TouchableOpacity
                                    onPress={(e) => { e.stopPropagation(); updateAmenityQuantity(amenity.id, quantity - 1); }}
                                    className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                                  >
                                    <Ionicons name="remove" size={16} color={isDarkMode ? '#fff' : '#333'} />
                                  </TouchableOpacity>
                                  <ThemedText className="mx-3 font-semibold">{quantity}</ThemedText>
                                  <TouchableOpacity
                                    onPress={(e) => { e.stopPropagation(); updateAmenityQuantity(amenity.id, quantity + 1); }}
                                    className="w-7 h-7 rounded-full bg-amber-500 items-center justify-center"
                                  >
                                    <Ionicons name="add" size={16} color="white" />
                                  </TouchableOpacity>
                                  <ThemedText variant="small" className="ml-3 font-semibold text-amber-600">
                                    {formatFare(AmenityApiService.parsePrice(amenity.price) * quantity)}
                                  </ThemedText>
                                </View>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}

                {/* Total & Confirm */}
                {!isLoadingAmenities && (
                  <>
                    {selectedAmenitiesCount > 0 && (
                      <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-3">
                        <View className="flex-row justify-between items-center">
                          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                            {selectedAmenitiesCount} item{selectedAmenitiesCount !== 1 ? 's' : ''} selected
                          </ThemedText>
                          <ThemedText variant="h3" className="text-amber-600">
                            {formatFare(amenitiesTotal)}
                          </ThemedText>
                        </View>
                      </View>
                    )}
                    <PrimaryButton
                      title={selectedAmenitiesCount > 0 ? `Add ${selectedAmenitiesCount} Amenities` : 'Continue Without Amenities'}
                      onPress={() => setShowAmenityModal(false)}
                      className="mt-1 mb-2"
                    />
                    {selectedAmenitiesCount > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAmenities(new Map());
                          setShowAmenityModal(false);
                        }}
                        className="py-3 items-center"
                      >
                        <ThemedText className="text-textSecondary dark:text-darkTextSecondary text-center">Remove All Amenities</ThemedText>
                      </TouchableOpacity>
                    )}
                  </>
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

            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl h-[70%]`}>
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
                <ThemedText variant="small" className="mt-1 text-gray-500 dark:text-darkTextSecondary">
                  Select pickup date and time
                </ThemedText>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                <View className="p-6">
                  {/* Date Selection */}
                  <View className="mb-6">
                    <ThemedText variant="small" className="mb-3 font-semibold text-gray-600 dark:text-darkTextSecondary">
                      SELECT DATE
                    </ThemedText>

                    {generateNext7Days().length === 0 ? (
                      <View className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl items-center">
                        <Ionicons name="moon" size={24} color={BrandColors.warning} />
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
                              className={`px-4 py-3 rounded-xl border-2 min-w-[70px] items-center ${isSelected
                                  ? 'border-burgundy bg-burgundy/10 dark:border-secondary dark:bg-secondary/10'
                                  : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                              <ThemedText
                                variant="tiny"
                                className={`${isSelected ? 'text-burgundy dark:text-secondary font-semibold' : 'text-textSecondary dark:text-darkTextSecondary'
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
                                className={`${isSelected ? 'text-burgundy dark:text-secondary' : 'text-textSecondary dark:text-darkTextSecondary'}`}
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
                      <ThemedText variant="small" className="mb-3 font-semibold text-gray-600 dark:text-darkTextSecondary">
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
                              className={`px-4 py-3 rounded-xl border-2 min-w-[90px] items-center ${isDisabled
                                  ? 'border-gray-100 bg-gray-50 opacity-50'
                                  : isSelected
                                    ? 'border-burgundy bg-burgundy/10'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                              <ThemedText
                                variant="body"
                                className={`${isDisabled
                                    ? 'text-textSecondary dark:text-darkTextSecondary'
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
                        <Ionicons name="checkmark-circle" size={20} color={BrandColors.secondary} />
                        <View className="flex-1 ml-3">
                          <ThemedText variant="small" className="font-semibold text-secondary">
                            Pickup Scheduled
                          </ThemedText>
                          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary mt-0.5">
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

        {/* Add Place Modal */}
        <Modal
          visible={showAddPlaceModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddPlaceModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="flex-row justify-between items-center mb-5">
                <ThemedText variant="h2">Add Saved Place</ThemedText>
                <TouchableOpacity onPress={() => setShowAddPlaceModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              {/* Name */}
              <ThemedText variant="small" className="mb-1 text-textSecondary dark:text-darkTextSecondary">Name</ThemedText>
              <TextInput
                value={newPlaceTitle}
                onChangeText={setNewPlaceTitle}
                placeholder="e.g. Home, Office, Gym"
                placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                className={`border rounded-xl px-4 py-3 mb-4 ${inputClass}`}
              />

              {/* Address search */}
              <ThemedText variant="small" className="mb-1 text-textSecondary dark:text-darkTextSecondary">Address</ThemedText>
              <GooglePlacesAutocomplete
                placeholder="Search address"
                value={newPlaceAddress}
                apiKey={appConfig.googlePlacesApiKey}
                isDarkMode={isDarkMode}
                onPlaceSelected={async (place) => {
                  try {
                    const details = await getPlaceDetails(place.place_id, appConfig.googlePlacesApiKey);
                    const addr = place.structured_formatting?.main_text ? place.description : details.address;
                    setNewPlaceAddress(addr);
                    setNewPlaceLat(details.lat);
                    setNewPlaceLng(details.lng);
                  } catch {
                    setNewPlaceAddress(place.description);
                    setNewPlaceLat(null);
                    setNewPlaceLng(null);
                  }
                }}
              />

              {/* Type selector */}
              <ThemedText variant="small" className="mt-4 mb-2 text-textSecondary dark:text-darkTextSecondary">Type</ThemedText>
              <View className="flex-row mb-6">
                {(['home', 'work', 'favorite'] as LocationType[]).map((type) => {
                  const active = newPlaceType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewPlaceType(type)}
                      className={`flex-row items-center mr-3 px-3 py-2 rounded-full border ${active
                          ? 'border-secondary bg-secondary/10'
                          : 'border-gray-300 dark:border-darkBorder'
                        }`}
                    >
                      <Ionicons
                        name={type === 'home' ? 'home' : type === 'work' ? 'business' : 'star'}
                        size={14}
                        color={active ? BrandColors.secondary : isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <ThemedText
                        variant="tiny"
                        className={`ml-1 capitalize ${active ? 'text-secondary font-semibold' : 'text-textSecondary dark:text-darkTextSecondary'}`}
                      >
                        {type}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <PrimaryButton
                title="Save Place"
                onPress={handleAddPlace}
                loading={isSavingPlace}
                disabled={isSavingPlace}
                className="w-full"
              />
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
                {isFetchingFavorites ? (
                  <ActivityIndicator size="small" color={iconColor} className="mt-4" />
                ) : favoriteLocations.length === 0 ? (
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center mt-4">
                    No saved places
                  </ThemedText>
                ) : (
                  favoriteLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      onPress={() => selectSavedLocation(location)}
                      className="mb-3 p-4 border border-gray-200 dark:border-darkBorder rounded-xl"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name={getFavoriteIcon(location.title)} size={20} color={iconColor} />
                        <View className="ml-3">
                          <ThemedText variant="body">{location.title}</ThemedText>
                          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                            {location.address}
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Credits Application Modal */}
        <Modal
          visible={showCreditsModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowCreditsModal(false);
            if (pendingBookingId) navigateToSearching(pendingBookingId);
          }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDarkMode ? 'bg-darkSurface' : 'bg-white'} rounded-t-3xl p-6`}>
              {/* Handle bar */}
              <View className="items-center mb-4">
                <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              <ThemedText variant="h2" className="mb-1">Apply Credits</ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mb-4">
                You have ₹{Number(loyaltyProfile?.credit_balance).toFixed(2)} credits available
              </ThemedText>

              {/* Preset Buttons */}
              <View className="flex-row mb-4">
                {[50, 100, 200].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setCreditsInput(preset.toString())}
                    className="flex-1 mx-1 py-2 border border-gray-300 dark:border-darkBorder rounded-lg"
                  >
                    <ThemedText variant="small" className="text-center">₹{preset}</ThemedText>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() =>
                    setCreditsInput(Number(loyaltyProfile?.credit_balance).toFixed(2) || '0')
                  }
                  className="flex-1 mx-1 py-2 bg-secondary/20 border border-secondary rounded-lg"
                >
                  <ThemedText variant="small" className="text-center text-secondary font-semibold">Max</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Input */}
              <TextInput
                className={`border border-gray-300 dark:border-darkBorder rounded-xl p-4 mb-4 text-lg ${isDarkMode ? 'bg-darkSurface text-darkText' : 'bg-white text-textPrimary dark:text-darkText'
                  }`}
                placeholder="₹ Enter amount"
                placeholderTextColor="#9CA3AF"
                value={creditsInput}
                onChangeText={setCreditsInput}
                keyboardType="numeric"
              />

              {/* Apply Button */}
              <TouchableOpacity
                onPress={handleApplyCredits}
                disabled={isApplyingCredits}
                className="bg-burgundy py-4 rounded-xl mb-3 items-center"
              >
                {isApplyingCredits ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText className="text-white font-bold">Apply Credits</ThemedText>
                )}
              </TouchableOpacity>

              {/* Skip */}
              <TouchableOpacity
                onPress={() => {
                  setShowCreditsModal(false);
                  if (pendingBookingId) navigateToSearching(pendingBookingId);
                }}
                className="py-3 items-center"
              >
                <ThemedText className="text-textSecondary dark:text-darkTextSecondary">Skip for now</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
