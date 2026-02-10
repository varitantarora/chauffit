import React, { useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Alert, Linking, ScrollView, Image } from 'react-native';
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

export default function RideTrackingScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [rideStatus, setRideStatus] = useState<RideStatus>('driver_coming');
  const [eta, setEta] = useState(18);
  const [isSharing, setIsSharing] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [rideDetails, setRideDetails] = useState<BookingDetail | null>(null);

  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';

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
      strokeColor: '#BD8C5E',
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

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? Cancellation charges may apply.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
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

  if (showSOS) {
    return <SOSScreen onClose={() => setShowSOS(false)} />;
  }

  if (isSharing) {
    return <ShareTripScreen onClose={() => setIsSharing(false)} />;
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">
            {rideStatus === 'driver_coming' && 'Driver En Route'}
            {rideStatus === 'driver_arrived' && 'Driver Arrived'}
            {rideStatus === 'in_progress' && 'Your ride is in progress'}
            {rideStatus === 'completed' && 'Trip Completed'}
          </ThemedText>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Status Header */}
          <View className="items-center py-6">
          {rideStatus === 'driver_coming' && (
            <>
              <ThemedText className="text-gray-600 mb-2">Driver arriving in</ThemedText>
              <ThemedText variant="h1" className="text-burgundy">⏰ {eta} minutes</ThemedText>
            </>
          )}
          {rideStatus === 'driver_arrived' && (
            <>
              <ThemedText className="text-gray-600 mb-2">Your driver has</ThemedText>
              <ThemedText variant="h1" className="text-blue-600">✅ Arrived</ThemedText>
            </>
          )}
          {rideStatus === 'in_progress' && (
            <>
              <ThemedText className="text-gray-600 mb-2">Arriving in</ThemedText>
              <ThemedText variant="h1" className="text-burgundy">⏰ 32 minutes</ThemedText>
            </>
          )}
        </View>

        {/* Map View with Live Tracking */}
        <View className="mx-6 mb-4 h-64 rounded-2xl overflow-hidden border border-border dark:border-darkBorder bg-white dark:bg-darkSurface">
          <UniversalMapView
            initialRegion={initialMapRegion}
            markers={mapMarkers}
            route={mapRoute}
            googleMapsApiKey={appConfig.googleMapsApiKey}
            showUserLocation={true}
            className="flex-1"
          />
        </View>

        {/* Driver/Biker Info */}
        {rideStatus === 'driver_coming' && rideDetails?.biker_details && (
          <ThemedCard variant="elevated" className="mx-6 mb-4">
            <ThemedText variant="small" className="text-gray-600 mb-3">
              {driverDetails.name} is being transported by {driverDetails.bikerName} (Biker) to your vehicle
            </ThemedText>

            <View className="flex-row items-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              {driverDetails.bikerPicture ? (
                <Image
                  source={{ uri: driverDetails.bikerPicture }}
                  className="w-12 h-12 rounded-full mr-3"
                  style={{ backgroundColor: '#BD8C5E' }}
                />
              ) : (
                <View className="w-12 h-12 bg-blue-100 rounded-full mr-3 items-center justify-center">
                  <Ionicons name="bicycle" size={20} color="#3B82F6" />
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <ThemedText>🏍️ {driverDetails.bikerName}</ThemedText>
                  <View className="flex-row items-center ml-2">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <ThemedText variant="small" className="ml-1">
                      {typeof driverDetails.bikerRating === 'number' ? driverDetails.bikerRating.toFixed(1) : driverDetails.bikerRating}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText variant="small" className="text-gray-600">
                  ETA: 15 min to your car
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        )}

        {/* Driver Details Card */}
        <ThemedCard variant="elevated" className="mx-6 mb-4">
          <View className="flex-row items-center">
            {driverDetails.picture ? (
              <Image
                source={{ uri: driverDetails.picture }}
                className="w-16 h-16 rounded-full mr-4"
                style={{ backgroundColor: '#BD8C5E' }}
              />
            ) : (
              <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 items-center justify-center">
                <Ionicons name="person" size={32} color={iconColor} />
              </View>
            )}
            <View className="flex-1">
              <ThemedText variant="h3">{driverDetails.name}</ThemedText>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <ThemedText variant="small" className="ml-1 text-gray-600">
                  {typeof driverDetails.rating === 'number' ? driverDetails.rating.toFixed(1) : driverDetails.rating} • {driverDetails.experience}
                </ThemedText>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleCallDriver}
                className="bg-burgundy/10 p-3 rounded-full mr-2"
              >
                <Ionicons name="call" size={20} color="#722F37" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessageDriver}
                className="bg-blue-100 p-3 rounded-full"
              >
                <Ionicons name="chatbubble" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          {rideStatus === 'in_progress' && (
            <View className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <ThemedText variant="small" className="text-gray-600">Latest update:</ThemedText>
              <ThemedText>"Taking 101 to avoid traffic on 280. ETA updated."</ThemedText>
              <ThemedText variant="small" className="text-gray-500 text-right mt-1">2 min ago</ThemedText>
            </View>
          )}

          <View className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
            <View className="flex-row items-center">
              <Ionicons name="car" size={20} color={iconColor} />
              <View className="ml-3 flex-1">
                <ThemedText>{driverDetails.vehicleInfo}</ThemedText>
                <ThemedText variant="small" className="text-gray-600">
                  Parked at: {driverDetails.location}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedCard>

        {/* Trip Details (for in-progress rides) */}
        {rideStatus === 'in_progress' && (
          <ThemedCard variant="elevated" className="mx-6 mb-4">
            <ThemedText variant="h3" className="mb-3">Trip Details</ThemedText>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <ThemedText variant="small" className="text-gray-600">Started</ThemedText>
                <ThemedText variant="small">2:35 PM</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText variant="small" className="text-gray-600">Route</ThemedText>
                <ThemedText variant="small">Via US-101 N</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText variant="small" className="text-gray-600">Speed</ThemedText>
                <ThemedText variant="small">65 mph</ThemedText>
              </View>
            </View>
          </ThemedCard>
        )}

        {/* Safety & Actions */}
        <View className="px-6 py-4">
          <TouchableOpacity 
            onPress={handleShareTrip}
            className="flex-row items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-3"
          >
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
              <ThemedText className="ml-3">Share Trip with Contact</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSOS}
            className="flex-row items-center justify-between p-4 bg-burgundy/10 dark:bg-burgundy/20 rounded-xl mb-3"
          >
            <View className="flex-row items-center">
              <Ionicons name="warning" size={24} color="#722F37" />
              <ThemedText className="ml-3">SOS Emergency</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#722F37" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Linking.openURL('tel:1091')}
            className="flex-row items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="call" size={24} color="#3B82F6" />
              <ThemedText className="ml-3">Emergency Assistance</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => Alert.alert('Report Issue', 'This would open issue reporting')}
              className="flex-1 py-3 mr-2 border border-gray-300 rounded-xl"
            >
              <ThemedText className="text-center text-gray-600">Report Issue</ThemedText>
            </TouchableOpacity>
            
            {rideStatus === 'driver_coming' || rideStatus === 'driver_arrived' ? (
              <TouchableOpacity 
                onPress={handleCancelRide}
                className="flex-1 py-3 ml-2 bg-burgundy rounded-xl"
              >
                <ThemedText className="text-center text-white">Cancel Ride</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleEndTrip}
                className="flex-1 py-3 ml-2 bg-burgundy rounded-xl"
              >
                <ThemedText className="text-center text-white">End Trip</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {rideStatus === 'in_progress' && (
            <ThemedText variant="small" className="text-center text-gray-500 mt-2">
              🎵 For Flexi-Hire rides only
            </ThemedText>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="px-6">
          <View className="h-6" />
        </View>
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

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
            <ThemedText variant="small" className="text-center text-gray-600 mt-1">
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
          <ThemedText variant="tiny" className="text-center text-gray-600 mt-2">
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
    { icon: 'chatbubble', title: 'Send SMS', color: '#3B82F6' },
    { icon: 'mail', title: 'Send Email', color: '#722F37' },
    { icon: 'logo-whatsapp', title: 'WhatsApp', color: '#3B82F6' },
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

        <ThemedText variant="small" className="text-gray-600 mb-6">
          Share your ride details with friends and family for safety
        </ThemedText>

        <ThemedText variant="h3" className="mb-3">📱 Emergency Contacts</ThemedText>
        {emergencyContacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            onPress={() => toggleContact(contact.id)}
            className="flex-row items-center p-3 mb-2 border border-gray-200 rounded-xl"
          >
            <View className={`w-6 h-6 rounded border-2 mr-3 ${
              selectedContacts.includes(contact.id) 
                ? 'bg-burgundy border-burgundy' 
                : 'border-gray-400'
            }`}>
              {selectedContacts.includes(contact.id) && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </View>
            <View className="flex-1">
              <ThemedText>{contact.name}</ThemedText>
              <ThemedText variant="small" className="text-gray-600">{contact.phone}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}

        <ThemedText variant="h3" className="mb-3 mt-6">💬 Share Options</ThemedText>
        <View className="flex-row flex-wrap">
          {shareOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center p-3 m-1 border border-gray-200 rounded-xl flex-1"
              style={{ minWidth: '45%' }}
            >
              <Ionicons name={option.icon as any} size={20} color={option.color} />
              <ThemedText variant="small" className="ml-2">{option.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <ThemedText variant="h3" className="mb-2">ℹ️ What's Shared:</ThemedText>
          <ThemedText variant="small" className="text-gray-600">
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
