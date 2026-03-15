import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, Alert, Linking, ScrollView, Image, Dimensions, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BookingApiService, { BookingDetail } from '../../services/api/BookingApiService';
import UniversalMapView, { MapMarker, MapRoute } from '../../components/shared/MapView';
import { appConfig } from '../../config/env';
import SlideToCancel from '../../components/customer/SlideToCancel';
import CancelReasonModal from '../../components/customer/CancelReasonModal';
import { BrandColors } from '../../constants/Colors';

// Helper to get full image URL
const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

type RideStatus = 'driver_coming' | 'driver_arrived' | 'in_progress' | 'completed';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_PANEL_HEIGHT = SCREEN_HEIGHT * 0.40;

export default function RideTrackingScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [rideStatus, setRideStatus] = useState<RideStatus>('driver_coming');
  const [eta, setEta] = useState(18);
  const [isSharing, setIsSharing] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [rideDetails, setRideDetails] = useState<BookingDetail | null>(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [tripDuration, setTripDuration] = useState(0);
  const tripStartRef = useRef<number>(Date.now());

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;

  // Trip duration timer - ticks every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTripDuration(Math.floor((Date.now() - tripStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Simulate ride status updates
    const timer = setTimeout(() => {
      if (rideStatus === 'driver_coming' && eta <= 5) {
        setRideStatus('driver_arrived');
      } else if (rideStatus === 'driver_coming') {
        setEta(prev => Math.max(1, prev - 1));
      }
    }, 60000); // Update every minute

    return () => clearTimeout(timer);
  }, [rideStatus, eta]);

  useEffect(() => {
    const bookingId = String(params.bookingId || '');
    if (!bookingId) return;

    let isMounted = true;
    const fetchRideDetails = async () => {
      try {
        const response = await BookingApiService.getRideDetails(bookingId);
        if (!isMounted) return;
        if (response.success && response.data) {
          setRideDetails(response.data);
        }
      } catch {
        // ignore for now
      }
    };

    fetchRideDetails();
    const interval = setInterval(fetchRideDetails, 5000); // Poll every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [params.bookingId]);

  const driverDetails = useMemo(() => {
    // Use embedded details from API response
    const driverName = rideDetails?.driver_details?.name || 'Chauffeur';
    const driverPhone = rideDetails?.driver_details?.mobile || 'NA';
    const driverRating = rideDetails?.driver_details?.overall_rating ?? 4.5;
    const driverPicture = getImageUrl(rideDetails?.driver_details?.profile_picture);
    const driverRides = rideDetails?.driver_details?.total_rides ?? 0;

    const bikerName = rideDetails?.biker_details?.name || 'Biker';
    const bikerRating = rideDetails?.biker_details?.overall_rating ?? 4.5;
    const bikerPicture = getImageUrl(rideDetails?.biker_details?.profile_picture);
    const bikerPhone = rideDetails?.biker_details?.mobile;

    return {
      name: driverName,
      rating: driverRating,
      experience: driverRides > 0 ? `${driverRides} rides` : 'Experienced',
      phone: driverPhone,
      picture: driverPicture,
      bikerName,
      bikerRating,
      bikerPicture,
      vehicleInfo: rideDetails?.driver_details?.vehicle_info || 'Your vehicle',
      location: 'En route to your location',
    };
  }, [rideDetails]);

  // Map coordinates and markers
  const pickupCoordinate = useMemo(() => {
    if (!rideDetails?.pickup_lat || !rideDetails?.pickup_long) return null;
    const latitude = Number(rideDetails.pickup_lat);
    const longitude = Number(rideDetails.pickup_long);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  }, [rideDetails?.pickup_lat, rideDetails?.pickup_long]);

  const dropoffCoordinate = useMemo(() => {
    if (!rideDetails?.dropoff_lat || !rideDetails?.dropoff_long) return null;
    const latitude = Number(rideDetails.dropoff_lat);
    const longitude = Number(rideDetails.dropoff_long);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  }, [rideDetails?.dropoff_lat, rideDetails?.dropoff_long]);

  const initialMapRegion = useMemo(() => {
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

  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];
    if (pickupCoordinate) {
      markers.push({
        id: 'pickup',
        coordinate: pickupCoordinate,
        title: 'Pickup',
        description: rideDetails?.pickup_address || 'Pickup Location',
        type: 'pickup',
      });
    }
    if (dropoffCoordinate) {
      markers.push({
        id: 'dropoff',
        coordinate: dropoffCoordinate,
        title: 'Destination',
        description: rideDetails?.dropoff_address || 'Destination',
        type: 'dropoff',
      });
    }
    return markers;
  }, [pickupCoordinate, dropoffCoordinate, rideDetails]);

  const mapRoute: MapRoute | undefined = useMemo(() => {
    if (!pickupCoordinate || !dropoffCoordinate) return undefined;
    return {
      origin: pickupCoordinate,
      destination: dropoffCoordinate,
      strokeColor: BrandColors.secondary,
      strokeWidth: 4,
    };
  }, [pickupCoordinate, dropoffCoordinate]);

  const handleCallDriver = () => {
    if (!driverDetails.phone || driverDetails.phone === 'NA') return;
    Linking.openURL(`tel:${driverDetails.phone}`);
  };

  const handleMessageDriver = () => {
    Alert.alert('Message Driver', 'This would open messaging interface');
  };

  const handleShareTrip = () => {
    setIsSharing(true);
  };

  const handleSOS = () => {
    setShowSOS(true);
  };

  const handleSlideComplete = () => {
    setShowCancelReasonModal(true);
  };

  const handleCancelConfirmed = async (reason: string) => {
    const bookingId = String(params.bookingId || '');
    if (!bookingId) {
      Alert.alert('Error', 'Missing booking ID');
      setShowCancelReasonModal(false);
      return;
    }
    const response = await BookingApiService.cancelRide(bookingId, reason);
    setShowCancelReasonModal(false);
    if (response.success) {
      Alert.alert('Ride Cancelled', 'Your ride has been cancelled successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', response.error || 'Failed to cancel ride. Please try again.');
    }
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Would you like to end your ride now?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'End Trip',
          onPress: () => router.push('/(customer)/trip-completion')
        }
      ]
    );
  };

  const handleStartNavigation = () => {
    if (!dropoffCoordinate) {
      Alert.alert('Navigation', 'Destination coordinates are not available yet.');
      return;
    }
    const { latitude, longitude } = dropoffCoordinate;
    const label = encodeURIComponent(rideDetails?.dropoff_address || 'Destination');

    if (Platform.OS === 'ios') {
      // Try Apple Maps first, fallback to Google Maps
      const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
      Linking.canOpenURL(appleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(appleMapsUrl);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`);
        }
      });
    } else {
      // Android: Google Maps navigation
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

  if (showSOS) {
    return <SOSScreen onClose={() => setShowSOS(false)} />;
  }

  if (isSharing) {
    return <ShareTripScreen onClose={() => setIsSharing(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Full-Screen Map Background */}
      <UniversalMapView
        initialRegion={initialMapRegion}
        markers={mapMarkers}
        route={mapRoute}
        googleMapsApiKey={appConfig.googleMapsApiKey}
        showUserLocation={true}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Header Overlay */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={[styles.headerBar, { backgroundColor: isDarkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.92)' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={iconColor} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle}>
              {rideStatus === 'driver_coming' && 'Driver En Route'}
              {rideStatus === 'driver_arrived' && 'Driver Arrived'}
              {rideStatus === 'in_progress' && 'Ride in Progress'}
              {rideStatus === 'completed' && 'Trip Completed'}
            </ThemedText>
            <ThemedText style={styles.durationText}>Duration: {formatDuration(tripDuration)}</ThemedText>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color={iconColor} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomScrollContent}
          bounces={false}
        >
          {/* Single Unified Card — All Details */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF', borderWidth: 1, borderColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]}>
            {/* Biker Info (when driver is being transported) */}
            {rideStatus === 'driver_coming' && rideDetails?.biker_details && (
              <View style={[styles.bikerSection, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]}>
                <ThemedText style={styles.cardSubtitle}>
                  {driverDetails.name} is being transported by {driverDetails.bikerName} to your vehicle
                </ThemedText>
                <View style={styles.bikerRow}>
                  {driverDetails.bikerPicture ? (
                    <Image
                      source={{ uri: driverDetails.bikerPicture }}
                      style={styles.bikerAvatar}
                    />
                  ) : (
                    <View style={[styles.bikerAvatar, styles.bikerAvatarPlaceholder]}>
                      <Ionicons name="bicycle" size={18} color={BrandColors.info} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRatingRow}>
                      <ThemedText style={styles.bikerName}>🏍️ {driverDetails.bikerName}</ThemedText>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color={BrandColors.warning} />
                        <ThemedText style={styles.ratingText}>
                          {typeof driverDetails.bikerRating === 'number' ? driverDetails.bikerRating.toFixed(1) : driverDetails.bikerRating}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.bikerEta}>ETA: 15 min to your car</ThemedText>
                  </View>
                </View>
              </View>
            )}

            {/* Driver Info */}
            <View style={styles.driverRow}>
              {driverDetails.picture ? (
                <Image
                  source={{ uri: driverDetails.picture }}
                  style={styles.driverAvatar}
                />
              ) : (
                <View style={[styles.driverAvatar, { backgroundColor: isDarkMode ? '#444' : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="person" size={28} color={iconColor} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.driverName}>{driverDetails.name}</ThemedText>
                <View style={styles.nameRatingRow}>
                  <Ionicons name="star" size={14} color={BrandColors.warning} />
                  <ThemedText style={styles.driverMeta}>
                    {typeof driverDetails.rating === 'number' ? driverDetails.rating.toFixed(1) : driverDetails.rating} • {driverDetails.experience}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.contactBtns}>
                <TouchableOpacity onPress={handleCallDriver} style={[styles.contactBtn, { backgroundColor: 'rgba(114,47,55,0.1)' }]}>
                  <Ionicons name="call" size={18} color="#722F37" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessageDriver} style={[styles.contactBtn, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                  <Ionicons name="chatbubble" size={18} color={BrandColors.info} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Vehicle Info */}
            <View style={[styles.vehicleRow, { borderTopColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]}>
              <Ionicons name="car" size={18} color={iconColor} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <ThemedText style={styles.vehicleText}>{driverDetails.vehicleInfo}</ThemedText>
                <ThemedText style={styles.vehicleSubtext}>{driverDetails.location}</ThemedText>
              </View>
            </View>

            {/* Trip Details (for in-progress rides) */}
            {rideStatus === 'in_progress' && (
              <View style={[styles.tripSection, { borderTopColor: isDarkMode ? '#3A3A3A' : '#F0F0F0' }]}>
                <ThemedText style={styles.sectionTitle}>Trip Details</ThemedText>
                <View style={styles.tripRow}>
                  <ThemedText style={styles.tripLabel}>Duration</ThemedText>
                  <ThemedText style={styles.tripValue}>{formatDuration(tripDuration)}</ThemedText>
                </View>
                <View style={styles.tripRow}>
                  <ThemedText style={styles.tripLabel}>Route</ThemedText>
                  <ThemedText style={styles.tripValue}>Via US-101 N</ThemedText>
                </View>
                <View style={styles.tripRow}>
                  <ThemedText style={styles.tripLabel}>Speed</ThemedText>
                  <ThemedText style={styles.tripValue}>65 mph</ThemedText>
                </View>
                {/* In-progress update */}
                <View style={[styles.updateBox, { backgroundColor: isDarkMode ? '#333' : '#F9FAFB' }]}>
                  <ThemedText style={styles.updateLabel}>Latest update:</ThemedText>
                  <ThemedText style={styles.updateText}>"Taking 101 to avoid traffic on 280. ETA updated."</ThemedText>
                  <ThemedText style={styles.updateTime}>2 min ago</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Start Navigation Button */}
          <TouchableOpacity
            onPress={handleStartNavigation}
            style={styles.navigationBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <ThemedText style={styles.navigationBtnText}>Start Navigation</ThemedText>
          </TouchableOpacity>

          {/* Safety Actions */}
          <View style={styles.safetySection}>
            <TouchableOpacity onPress={handleShareTrip} style={[styles.safetyRow, { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF' }]}>
              <View style={styles.safetyLeft}>
                <Ionicons name="shield-checkmark" size={20} color={BrandColors.info} />
                <ThemedText style={styles.safetyText}>Share Trip with Contact</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={BrandColors.info} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSOS} style={[styles.safetyRow, { backgroundColor: isDarkMode ? '#2D1B1E' : '#FEF2F2' }]}>
              <View style={styles.safetyLeft}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <ThemedText style={styles.safetyText}>SOS Emergency</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL('tel:1091')} style={[styles.safetyRow, { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF' }]}>
              <View style={styles.safetyLeft}>
                <Ionicons name="call" size={20} color={BrandColors.info} />
                <ThemedText style={styles.safetyText}>Emergency Assistance</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={BrandColors.info} />
            </TouchableOpacity>
          </View>

          {/* Cancel / End Trip */}
          <View style={styles.actionSection}>
            {rideStatus === 'driver_coming' || rideStatus === 'driver_arrived' ? (
              <SlideToCancel onSlideComplete={handleSlideComplete} />
            ) : (
              <TouchableOpacity onPress={handleEndTrip} style={styles.endTripBtn}>
                <ThemedText style={styles.endTripBtnText}>End Trip</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {rideStatus === 'in_progress' && (
            <ThemedText style={styles.flexiNote}>
              🎵 For Flexi-Hire rides only
            </ThemedText>
          )}

          {/* Bottom safe area spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>

      <CancelReasonModal
        visible={showCancelReasonModal}
        bookingId={String(params.bookingId || '')}
        onCancel={handleCancelConfirmed}
        onDismiss={() => setShowCancelReasonModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Floating Header
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
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },

  // Bottom Panel
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
  bottomScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  bikerSection: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  tripSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  // Biker Info
  bikerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: BrandColors.secondary,
  },
  bikerAvatarPlaceholder: {
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 3,
    color: '#6B7280',
  },
  bikerEta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Driver Details
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: BrandColors.secondary,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
  },
  driverMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  contactBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  vehicleSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },

  // Trip Details
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tripLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  tripValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  updateBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  updateLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  updateText: {
    fontSize: 13,
    marginTop: 2,
  },
  updateTime: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  // Navigation Button
  navigationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.info,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 8,
    shadowColor: BrandColors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navigationBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Safety Section
  safetySection: {
    gap: 8,
    marginBottom: 12,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  safetyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  safetyText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Action Section
  actionSection: {
    marginBottom: 8,
  },
  endTripBtn: {
    backgroundColor: '#722F37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  endTripBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  flexiNote: {
    fontSize: 12,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 4,
  },
});

// SOS Emergency Screen Component
const SOSScreen = ({ onClose }: { onClose: () => void }) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const emergencyContacts = [
    { icon: 'call', title: 'CALL EMERGENCY', subtitle: '(Police: 100)', color: '#722F37' },
    { icon: 'medical', title: 'MEDICAL EMERGENCY', subtitle: '(Ambulance: 108)', color: '#722F37' },
    { icon: 'flame', title: 'FIRE EMERGENCY', subtitle: '(Fire: 101)', color: '#722F37' },
    { icon: 'headset', title: 'CHAUFFIT SUPPORT', subtitle: '(24/7 Hotline)', color: '#722F37' },
  ];

  const handleEmergencyCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View className="flex-1 bg-black/50 justify-center px-6">
      <ThemedCard variant="elevated" className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <ThemedText variant="h2" className="text-burgundy">🚨 EMERGENCY SOS</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <ThemedText variant="h3" className="text-center mb-6">IMMEDIATE HELP</ThemedText>

        {emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleEmergencyCall(contact.subtitle.match(/\d+/)?.[0] || '')}
            className="p-4 mb-3 border-2 rounded-xl"
            style={{ borderColor: contact.color }}
          >
            <ThemedText className="text-center font-bold" style={{ color: contact.color }}>
              {contact.icon === 'call' && '📞'} {contact.title}
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary mt-1">
              {contact.subtitle}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <ThemedText variant="small" className="text-center mb-2">
            📍 Your location is being shared with emergency contacts:
          </ThemedText>
          <ThemedText variant="small" className="text-center">
            • Priya Sharma (Wife){'\n'}• Arjun Sharma (Brother)
          </ThemedText>
          <ThemedText variant="tiny" className="text-center text-textSecondary dark:text-darkTextSecondary mt-2">
            Trip details automatically sent to emergency services and Chauffit.
          </ThemedText>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="mt-4 p-3 bg-blue-600 rounded-xl"
        >
          <ThemedText className="text-center text-white font-bold">I'm Safe Now</ThemedText>
        </TouchableOpacity>
      </ThemedCard>
    </View>
  );
};

// Share Trip Screen Component  
const ShareTripScreen = ({ onClose }: { onClose: () => void }) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['priya']);

  const emergencyContacts = [
    { id: 'priya', name: 'Priya Sharma (Wife)', phone: '+91 9876543210' },
    { id: 'arjun', name: 'Arjun Sharma (Brother)', phone: '+91 9876543211' },
    { id: 'kavya', name: 'Kavya Gupta (Friend)', phone: '+91 9876543212' },
  ];

  const shareOptions = [
    { icon: 'chatbubble', title: 'Send SMS', color: BrandColors.info },
    { icon: 'mail', title: 'Send Email', color: '#722F37' },
    { icon: 'logo-whatsapp', title: 'WhatsApp', color: BrandColors.info },
    { icon: 'link', title: 'Share via Link', color: '#722F37' },
  ];

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <View className="flex-1 bg-black/50 justify-end">
      <View className={`${isDarkMode ? 'bg-darkBackground' : 'bg-white'} rounded-t-3xl p-6 max-h-[80%]`}>
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="h2">Share Trip</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mb-6">
          Share your ride details with friends and family for safety
        </ThemedText>

        <ThemedText variant="h3" className="mb-3">📱 Emergency Contacts</ThemedText>
        {emergencyContacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            onPress={() => toggleContact(contact.id)}
            className="flex-row items-center p-3 mb-2 border border-border dark:border-darkBorder rounded-xl"
          >
            <View className={`w-6 h-6 rounded border-2 mr-3 ${selectedContacts.includes(contact.id)
              ? 'bg-burgundy border-burgundy'
              : 'border-gray-400'
              }`}>
              {selectedContacts.includes(contact.id) && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </View>
            <View className="flex-1">
              <ThemedText>{contact.name}</ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">{contact.phone}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}

        <ThemedText variant="h3" className="mb-3 mt-6">💬 Share Options</ThemedText>
        <View className="flex-row flex-wrap">
          {shareOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center p-3 m-1 border border-border dark:border-darkBorder rounded-xl flex-1"
              style={{ minWidth: '45%' }}
            >
              <Ionicons name={option.icon as any} size={20} color={option.color} />
              <ThemedText variant="small" className="ml-2">{option.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <ThemedText variant="h3" className="mb-2">ℹ️ What's Shared:</ThemedText>
          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
            • Real-time location{'\n'}
            • Driver details{'\n'}
            • Vehicle information{'\n'}
            • Estimated arrival time{'\n'}
            • Emergency contact info
          </ThemedText>
        </View>

        <PrimaryButton
          title="Start Sharing"
          onPress={() => {
            Alert.alert('Sharing Started', 'Your trip details are now being shared with selected contacts.');
            onClose();
          }}
          className="mt-4"
        />
      </View>
    </View>
  );
};
