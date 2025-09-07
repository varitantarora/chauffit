import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { Location } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import * as ExpoLocation from 'expo-location';

interface RouteMapProps {
  pickupLocation: Location;
  dropoffLocation?: Location;
  currentLocation?: Location;
  route?: Location[];
  showCurrentLocation?: boolean;
  onLocationUpdate?: (location: Location) => void;
  mapHeight?: number;
  showControls?: boolean;
  eta?: string;
  distance?: string;
}

export function RouteMap({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  route = [],
  showCurrentLocation = true,
  onLocationUpdate,
  mapHeight = 300,
  showControls = true,
  eta,
  distance
}: RouteMapProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [region, setRegion] = useState({
    latitude: pickupLocation.latitude,
    longitude: pickupLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Request location permissions and start tracking
  useEffect(() => {
    if (showCurrentLocation && onLocationUpdate) {
      requestLocationPermission();
    }
  }, [showCurrentLocation, onLocationUpdate]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to track your position during the ride.',
          [{ text: 'OK' }]
        );
        return;
      }
      startLocationTracking();
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      setIsTrackingLocation(true);
      
      // Start watching position
      const locationSubscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLocation: Location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: 'Current Location'
          };
          onLocationUpdate?.(newLocation);
        }
      );

      return () => {
        locationSubscription.remove();
        setIsTrackingLocation(false);
      };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTrackingLocation(false);
    }
  };

  const centerOnLocation = (location: Location) => {
    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const fitToCoordinates = () => {
    const coordinates = [pickupLocation];
    if (dropoffLocation) coordinates.push(dropoffLocation);
    if (currentLocation) coordinates.push(currentLocation);
    
    // This would typically use the map ref to fit coordinates
    // For now, we'll center on pickup location
    centerOnLocation(pickupLocation);
  };

  const toggleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const mapStyle = isDarkMode ? [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#746855" }]
    }
  ] : undefined;

  return (
    <View>
      {/* Route Info Card */}
      {(eta || distance) && (
        <ThemedCard className="mb-3 p-4">
          <View className="flex-row justify-between items-center">
            {eta && (
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#10b981" />
                <ThemedText className="ml-2 font-semibold text-success">
                  ETA: {eta}
                </ThemedText>
              </View>
            )}
            {distance && (
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#3b82f6" />
                <ThemedText className="ml-2 font-semibold text-blue-500">
                  {distance}
                </ThemedText>
              </View>
            )}
            {isTrackingLocation && (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-success rounded-full mr-2" />
                <ThemedText variant="caption" className="text-success">
                  Live tracking
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedCard>
      )}

      {/* Map Container */}
      <ThemedCard className="p-0 overflow-hidden">
        <View style={{ height: mapHeight }} className="relative">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
            mapType={mapType}
            customMapStyle={mapStyle}
            showsUserLocation={showCurrentLocation}
            showsMyLocationButton={false}
            showsCompass={false}
            rotateEnabled={true}
            pitchEnabled={false}
          >
            {/* Pickup Marker */}
            <Marker
              coordinate={{
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              }}
              title="Pickup Location"
              description={pickupLocation.address}
              pinColor="#10b981"
            >
              <View className="w-8 h-8 bg-success rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="location" size={16} color="white" />
              </View>
            </Marker>

            {/* Dropoff Marker */}
            {dropoffLocation && (
              <Marker
                coordinate={{
                  latitude: dropoffLocation.latitude,
                  longitude: dropoffLocation.longitude,
                }}
                title="Dropoff Location"
                description={dropoffLocation.address}
                pinColor="#ef4444"
              >
                <View className="w-8 h-8 bg-danger rounded-full items-center justify-center border-2 border-white">
                  <Ionicons name="flag" size={16} color="white" />
                </View>
              </Marker>
            )}

            {/* Current Location Marker */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Current Location"
                description="Your current position"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white">
                  <View className="w-2 h-2 bg-white rounded-full self-center mt-1" />
                </View>
              </Marker>
            )}

            {/* Route Polyline */}
            {route.length > 1 && (
              <Polyline
                coordinates={route.map(loc => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#3b82f6"
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>

          {/* Map Controls */}
          {showControls && (
            <View className="absolute top-4 right-4 space-y-2">
              {/* Center on pickup */}
              <TouchableOpacity
                onPress={() => centerOnLocation(pickupLocation)}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={20} color="#10b981" />
              </TouchableOpacity>

              {/* Center on current location */}
              {currentLocation && (
                <TouchableOpacity
                  onPress={() => centerOnLocation(currentLocation)}
                  className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}

              {/* Fit to route */}
              <TouchableOpacity
                onPress={fitToCoordinates}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                activeOpacity={0.7}
              >
                <Ionicons name="resize" size={18} color="#6b7280" />
              </TouchableOpacity>

              {/* Toggle map type */}
              <TouchableOpacity
                onPress={toggleMapType}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={mapType === 'satellite' ? 'map' : 'satellite'} 
                  size={18} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ThemedCard>
    </View>
  );
}