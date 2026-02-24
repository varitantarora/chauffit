import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Linking, Alert } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ThemedText } from '../../common/ThemedText';
import { ThemedCard } from '../../common/ThemedCard';
import { Location as LocationType } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import BikerApiService from '../../../services/api/BikerApiService';
import { DarkMapStyle } from '../../../constants/MapStyles';

interface BikerMapProps {
  pickupLocation: LocationType;
  dropoffLocation?: LocationType;
  currentLocation?: LocationType;
  showRoute?: boolean;
  onLocationUpdate?: (location: LocationType) => void;
  style?: any;
  compact?: boolean;
}

export function BikerMap({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  showRoute = true,
  onLocationUpdate,
  style,
  compact = false
}: BikerMapProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(currentLocation || null);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Request location permissions and start tracking
  useEffect(() => {
    requestLocationPermissions();
  }, []);

  // Fit markers when map is ready
  useEffect(() => {
    if (mapReady && mapRef.current) {
      fitMarkersToMap();
    }
  }, [mapReady, pickupLocation, dropoffLocation, userLocation]);

  // Generate route when locations change
  useEffect(() => {
    if (showRoute && userLocation && pickupLocation) {
      generateRoute();
    }
  }, [userLocation, pickupLocation, dropoffLocation, showRoute]);

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Current Location'
      };

      setUserLocation(newLocation);
      onLocationUpdate?.(newLocation);

      // Start watching position
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (location) => {
          const updatedLocation: LocationType = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: 'Current Location'
          };
          setUserLocation(updatedLocation);
          onLocationUpdate?.(updatedLocation);
          
          // Update location on backend
          try {
            await BikerApiService.updateLocation({
              latitude: location.coords.latitude.toString(),
              longitude: location.coords.longitude.toString(),
            });
          } catch (error) {
            console.error('Error updating location on backend:', error);
            // Don't show error to user, location tracking should continue
          }
        }
      );
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const generateRoute = async () => {
    if (!userLocation || !pickupLocation) return;

    setIsLoadingRoute(true);
    try {
      // Simple route generation - in production, use Google Directions API
      const waypoints = [userLocation, pickupLocation];
      if (dropoffLocation) {
        waypoints.push(dropoffLocation);
      }

      // For now, create a simple line between points
      setRoute(waypoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      })));
    } catch (error) {
      console.error('Error generating route:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const fitMarkersToMap = () => {
    if (!mapRef.current) return;

    const coordinates = [];
    
    if (userLocation) {
      coordinates.push({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    }
    
    coordinates.push({
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude
    });
    
    if (dropoffLocation) {
      coordinates.push({
        latitude: dropoffLocation.latitude,
        longitude: dropoffLocation.longitude
      });
    }

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const openInGoogleMaps = () => {
    const destination = dropoffLocation || pickupLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=bicycling`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Google Maps is not available');
      }
    });
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const getInitialRegion = (): Region => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    return {
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  if (compact) {
    return (
      <View className="h-32 rounded-lg overflow-hidden" style={style}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={getInitialRegion()}
          onMapReady={() => setMapReady(true)}
          customMapStyle={isDarkMode ? DarkMapStyle : undefined}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsTraffic={false}
          showsCompass={false}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              }}
              title="Your Location"
            >
              <View className="bg-blue-500 w-4 h-4 rounded-full border-2 border-white" />
            </Marker>
          )}
          
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude
            }}
            title="Pickup Location"
            pinColor="#bd8c5e"
          />
          
          {dropoffLocation && (
            <Marker
              coordinate={{
                latitude: dropoffLocation.latitude,
                longitude: dropoffLocation.longitude
              }}
              title="Drop-off Location"
              pinColor="#720c17"
            />
          )}
          
          {showRoute && route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeColor="#bd8c5e"
              strokeWidth={3}
            />
          )}
        </MapView>
        
        <TouchableOpacity
          onPress={openInGoogleMaps}
          className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
        >
          <Ionicons name="navigate" size={16} color="#bd8c5e" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={style}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={getInitialRegion()}
        onMapReady={() => setMapReady(true)}
        customMapStyle={isDarkMode ? DarkMapStyle : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsTraffic={true}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }}
            title="Your Location"
            description="Current position"
          >
            <View className="bg-blue-500 w-6 h-6 rounded-full border-3 border-white shadow-md">
              <Ionicons name="bicycle" size={16} color="white" />
            </View>
          </Marker>
        )}
        
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude
          }}
          title="Pickup Location"
          description={pickupLocation.address}
          pinColor="#bd8c5e"
        />
        
        {dropoffLocation && (
          <Marker
            coordinate={{
              latitude: dropoffLocation.latitude,
              longitude: dropoffLocation.longitude
            }}
            title="Drop-off Location"
            description={dropoffLocation.address}
            pinColor="#720c17"
          />
        )}
        
        {showRoute && route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor="#bd8c5e"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      {/* Map controls */}
      <View className="absolute bottom-4 right-4 space-y-2">
        <TouchableOpacity
          onPress={centerOnUser}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg"
        >
          <Ionicons name="locate" size={20} color="#bd8c5e" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={openInGoogleMaps}
          className="bg-primary p-3 rounded-full shadow-lg"
        >
          <Ionicons name="navigate" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Navigation info */}
      <View className="absolute top-4 left-4 right-4">
        <ThemedCard className="p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <ThemedText className="font-semibold">
                {dropoffLocation ? 'To Drop-off' : 'To Pickup'}
              </ThemedText>
              <ThemedText variant="caption" className="text-gray-500">
                Follow the route for optimal navigation
              </ThemedText>
            </View>
            {isLoadingRoute && (
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="refresh" size={16} color="#bd8c5e" />
              </View>
            )}
          </View>
        </ThemedCard>
      </View>
    </View>
  );
}

