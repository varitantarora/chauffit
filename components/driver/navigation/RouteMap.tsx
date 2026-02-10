import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { Location } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService from '../../../services/api/DriverApiService';
import UniversalMapView, { MapMarker, MapRoute, MapViewRef } from '../../shared/MapView';
import { appConfig } from '../../../config/env';
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
  const mapRef = useRef<MapViewRef>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

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
        async (location) => {
          const newLocation: Location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: 'Current Location'
          };
          onLocationUpdate?.(newLocation);

          // Update location on backend
          try {
            await DriverApiService.updateLocation({
              latitude: location.coords.latitude.toString(),
              longitude: location.coords.longitude.toString(),
            });
          } catch (error) {
            console.error('Error updating location on backend:', error);
            // Don't show error to user, location tracking should continue
          }
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
    mapRef.current?.animateToCoordinate({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const fitToCoordinates = () => {
    const coordinates = [
      { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }
    ];
    if (dropoffLocation) {
      coordinates.push({ latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude });
    }
    if (currentLocation) {
      coordinates.push({ latitude: currentLocation.latitude, longitude: currentLocation.longitude });
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
  };

  // Build initial region centered on pickup
  const initialRegion = useMemo(() => ({
    latitude: pickupLocation.latitude,
    longitude: pickupLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [pickupLocation.latitude, pickupLocation.longitude]);

  // Build map markers
  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];

    // Pickup marker
    markers.push({
      id: 'pickup',
      coordinate: {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
      },
      title: 'Pickup Location',
      description: pickupLocation.address,
      type: 'pickup',
    });

    // Dropoff marker
    if (dropoffLocation) {
      markers.push({
        id: 'dropoff',
        coordinate: {
          latitude: dropoffLocation.latitude,
          longitude: dropoffLocation.longitude,
        },
        title: 'Dropoff Location',
        description: dropoffLocation.address,
        type: 'dropoff',
      });
    }

    // Current location marker (driver)
    if (currentLocation) {
      markers.push({
        id: 'current',
        coordinate: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        title: 'Your Location',
        description: 'Current position',
        type: 'driver',
      });
    }

    return markers;
  }, [pickupLocation, dropoffLocation, currentLocation]);

  // Build route for directions
  const mapRoute: MapRoute | undefined = useMemo(() => {
    // Use current location as origin if available, otherwise use pickup
    const origin = currentLocation
      ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude };

    // Use dropoff as destination if available, otherwise route to pickup
    const destination = dropoffLocation
      ? { latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude }
      : { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude };

    // Only show route if we have different points
    if (origin.latitude === destination.latitude && origin.longitude === destination.longitude) {
      return undefined;
    }

    return {
      origin,
      destination,
      strokeColor: '#3b82f6',
      strokeWidth: 4,
    };
  }, [pickupLocation, dropoffLocation, currentLocation]);

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
          <UniversalMapView
            ref={mapRef}
            initialRegion={initialRegion}
            markers={mapMarkers}
            route={mapRoute}
            showUserLocation={showCurrentLocation}
            googleMapsApiKey={appConfig.googleMapsApiKey}
            onRouteReady={(result) => {
              console.log('Route ready:', result);
              // Auto-fit to show entire route
              if (mapRoute) {
                const coordinates = [mapRoute.origin, mapRoute.destination];
                mapRef.current?.fitToCoordinates(coordinates, {
                  edgePadding: { top: 80, right: 80, bottom: 200, left: 80 },
                  animated: true,
                });
              }
            }}
          />

          {/* Map Controls */}
          {showControls && (
            <View className="absolute top-4 right-4 space-y-2">
              {/* Center on pickup */}
              <TouchableOpacity
                onPress={() => centerOnLocation(pickupLocation)}
                className="w-10 h-10 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-md"
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={20} color="#10b981" />
              </TouchableOpacity>

              {/* Center on current location */}
              {currentLocation && (
                <TouchableOpacity
                  onPress={() => centerOnLocation(currentLocation)}
                  className="w-10 h-10 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-md"
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}

              {/* Fit to route */}
              <TouchableOpacity
                onPress={fitToCoordinates}
                className="w-10 h-10 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-md"
                activeOpacity={0.7}
              >
                <Ionicons name="resize" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ThemedCard>
    </View>
  );
}
