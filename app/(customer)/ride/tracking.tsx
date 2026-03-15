import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Alert, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DarkMapStyle } from '../../../constants/MapStyles';
import { BrandColors } from '../../../constants/Colors';

export default function RideTracking() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.4595,
    longitude: 77.0266,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showActions, setShowActions] = useState(true);
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const {
    activeRideTracking,
    availableChauffeurs,
    startRideTracking,
    updateRideTracking,
  } = useBookingStore();
  
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  useEffect(() => {
    if (bookingId && !activeRideTracking) {
      startRideTracking(bookingId);
    }
  }, [bookingId]);

  useEffect(() => {
    // Simulate real-time tracking updates
    const interval = setInterval(() => {
      if (activeRideTracking) {
        // Simulate chauffeur movement
        const newLat = activeRideTracking.chauffeurLocation.latitude + (Math.random() - 0.5) * 0.001;
        const newLng = activeRideTracking.chauffeurLocation.longitude + (Math.random() - 0.5) * 0.001;
        
        updateRideTracking({
          ...activeRideTracking,
          chauffeurLocation: {
            ...activeRideTracking.chauffeurLocation,
            latitude: newLat,
            longitude: newLng,
          },
          lastUpdated: new Date(),
        });
        
        setMapRegion(prev => ({
          ...prev,
          latitude: newLat,
          longitude: newLng,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeRideTracking]);

  const handleCall = () => {
    const chauffeur = availableChauffeurs.find(c => c.id === '1'); // This would be the selected chauffeur
    if (chauffeur) {
      Linking.openURL(`tel:${chauffeur.phone}`);
    }
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately notify emergency services and your emergency contacts. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:112'),
        },
      ]
    );
  };

  const handleCompleteRide = () => {
    router.push({
      pathname: '/(customer)/ride/completed',
      params: { bookingId }
    });
  };

  const getStatusColor = () => {
    switch (activeRideTracking?.status) {
      case 'driver_coming':
        return BrandColors.warning;
      case 'driver_arrived':
        return BrandColors.success;
      case 'ride_started':
        return '#3B82F6';
      case 'ride_completed':
        return BrandColors.success;
      default:
        return BrandColors.secondary;
    }
  };

  const getStatusText = () => {
    switch (activeRideTracking?.status) {
      case 'driver_coming':
        return 'Chauffeur is on the way';
      case 'driver_arrived':
        return 'Chauffeur has arrived';
      case 'ride_started':
        return 'Ride in progress';
      case 'ride_completed':
        return 'Ride completed';
      default:
        return 'Tracking your ride';
    }
  };

  const chauffeur = availableChauffeurs.find(c => c.id === '1'); // This would be dynamic
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Map View */}
        <View className="flex-1 relative">
          <MapView
            key={isDarkMode ? 'dark' : 'light'}
            className="flex-1"
            region={mapRegion}
            onRegionChange={setMapRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            style={{ flex: 1 }}
            customMapStyle={isDarkMode ? DarkMapStyle : undefined}
          >
            {/* Chauffeur Marker */}
            {activeRideTracking && (
              <Marker
                coordinate={{
                  latitude: activeRideTracking.chauffeurLocation.latitude,
                  longitude: activeRideTracking.chauffeurLocation.longitude,
                }}
                title="Chauffeur"
                description="Your assigned chauffeur"
              >
                <View className="w-12 h-12 bg-burgundy rounded-full items-center justify-center border-4 border-white shadow-lg">
                  <Ionicons name="car" size={20} color="white" />
                </View>
              </Marker>
            )}

            {/* Customer Location Marker */}
            {activeRideTracking?.customerLocation && (
              <Marker
                coordinate={{
                  latitude: activeRideTracking.customerLocation.latitude,
                  longitude: activeRideTracking.customerLocation.longitude,
                }}
                title="Your Location"
                description="Pickup location"
              >
                <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center border-3 border-white shadow-lg">
                  <Ionicons name="person" size={16} color="white" />
                </View>
              </Marker>
            )}

            {/* Route Polyline */}
            {activeRideTracking?.route && (
              <Polyline
                coordinates={activeRideTracking.route.map(point => ({
                  latitude: point.latitude,
                  longitude: point.longitude,
                }))}
                strokeColor={BrandColors.secondary}
                strokeWidth={4}
              />
            )}
          </MapView>

          {/* Top Status Card */}
          <View className="absolute top-4 left-4 right-4">
            <View className={`${
              isDarkMode ? 'bg-darkSurface/95' : 'bg-white/95'
            } backdrop-blur-md rounded-2xl p-4 shadow-lg`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getStatusColor() }}
                    />
                    <ThemedText variant="body" className="font-semibold">
                      {getStatusText()}
                    </ThemedText>
                  </View>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    ETA: {activeRideTracking?.eta || '5 mins'}
                  </ThemedText>
                </View>
                
                <TouchableOpacity
                  onPress={() => setShowActions(!showActions)}
                  className="p-2"
                >
                  <Ionicons 
                    name={showActions ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={iconColor} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* My Location Button */}
          <TouchableOpacity
            onPress={() => {
              setMapRegion({
                ...mapRegion,
                latitude: activeRideTracking?.customerLocation?.latitude || 28.4595,
                longitude: activeRideTracking?.customerLocation?.longitude || 77.0266,
              });
            }}
            className={`absolute bottom-32 right-4 w-12 h-12 ${
              isDarkMode ? 'bg-darkSurface' : 'bg-white'
            } rounded-full items-center justify-center shadow-lg`}
          >
            <Ionicons name="locate" size={24} color={BrandColors.burgundy} />
          </TouchableOpacity>

          {/* SOS Button */}
          <TouchableOpacity
            onPress={handleSOS}
            className="absolute bottom-32 left-4 w-12 h-12 bg-danger rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="warning" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Panel */}
        {showActions && chauffeur && (
          <View className={`${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border-t border-border p-6`}>
            {/* Chauffeur Info */}
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: chauffeur.photo }}
                className="w-16 h-16 rounded-full mr-4"
                style={{ backgroundColor: '#f0f0f0' }}
              />
              
              <View className="flex-1">
                <ThemedText variant="h3" className="font-bold">
                  {chauffeur.name}
                </ThemedText>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row mr-3">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Ionicons
                        key={index}
                        name={index < Math.floor(chauffeur.rating) ? 'star' : 'star-outline'}
                        size={12}
                        color={BrandColors.secondary}
                      />
                    ))}
                  </View>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    {chauffeur.rating} • {chauffeur.experience}y exp
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={handleCall}
                className="flex-1 bg-success rounded-xl py-4 flex-row items-center justify-center"
              >
                <Ionicons name="call" size={20} color="white" />
                <ThemedText className="text-white font-semibold ml-2">
                  Call
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 border-2 border-burgundy rounded-xl py-4 flex-row items-center justify-center"
              >
                <Ionicons name="chatbubble" size={20} color={BrandColors.burgundy} />
                <ThemedText className="text-burgundy font-semibold ml-2">
                  Message
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Complete Ride Button (shown when ride is in progress) */}
            {activeRideTracking?.status === 'ride_started' && (
              <View className="mt-4">
                <PrimaryButton
                  title="Complete Ride"
                  onPress={handleCompleteRide}
                />
              </View>
            )}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}