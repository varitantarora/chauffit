import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Dimensions, Alert, Text } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Region,
  LatLng,
  MarkerPressEvent,
  PROVIDER_GOOGLE
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LightColors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { DarkMapStyle } from '../../constants/MapStyles';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export interface MapMarker {
  id: string;
  coordinate: LatLng;
  title?: string;
  description?: string;
  type: 'pickup' | 'dropoff' | 'driver' | 'biker' | 'customer' | 'emergency';
  isMoving?: boolean;
  bearing?: number;
}

export interface MapRoute {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
}

interface UniversalMapViewProps {
  className?: string;
  initialRegion?: Region;
  markers?: MapMarker[];
  route?: MapRoute;
  animateRoute?: boolean;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coordinate: LatLng) => void;
  onRouteReady?: (result: any) => void;
  googleMapsApiKey?: string;
  style?: any;
  children?: React.ReactNode;
}

export interface MapViewRef {
  animateToRegion: (region: Region, duration?: number) => void;
  animateToCoordinate: (coordinate: LatLng, duration?: number) => void;
  fitToCoordinates: (coordinates: LatLng[], options?: any) => void;
  getCurrentLocation: () => Promise<LatLng | null>;
}

const UniversalMapView = forwardRef<MapViewRef, UniversalMapViewProps>(({
  className = '',
  initialRegion = {
    latitude: 28.6139, // Default to Delhi
    longitude: 77.2090,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  },
  markers = [],
  route,
  animateRoute = false,
  showUserLocation = true,
  followUserLocation = false,
  onMarkerPress,
  onMapPress,
  onRouteReady,
  googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  style,
  children
}, ref) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [region, setRegion] = useState<Region>(initialRegion);

  // Animated route state
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [displayCoords, setDisplayCoords] = useState<LatLng[]>([]);
  const routeAnimRef = useRef<NodeJS.Timeout | null>(null);
  const routeRestartRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (routeAnimRef.current) clearInterval(routeAnimRef.current);
      if (routeRestartRef.current) clearTimeout(routeRestartRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
    }
  }, [initialRegion]);

  // Log API key for debugging
  useEffect(() => {
    if (!googleMapsApiKey) {
      console.warn('⚠️ Google Maps API key not set. Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file');
    } else {
      console.log('✓ Google Maps API key is set');
    }
  }, [googleMapsApiKey]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (newRegion: Region, duration = 1000) => {
      mapRef.current?.animateToRegion(newRegion, duration);
    },
    animateToCoordinate: (coordinate: LatLng, duration = 1000) => {
      const newRegion = {
        ...coordinate,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(newRegion, duration);
    },
    fitToCoordinates: (coordinates: LatLng[], options = {}) => {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
        ...options,
      });
    },
    getCurrentLocation: async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required');
          return null;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (error) {
        console.error('Error getting location:', error);
        return null;
      }
    },
  }));

  useEffect(() => {
    if (followUserLocation) {
      getCurrentUserLocation();
    }
  }, [followUserLocation]);

  const getCurrentUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(userCoordinate);

      if (followUserLocation) {
        const newRegion = {
          ...userCoordinate,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const getMarkerColor = (type: MapMarker['type']) => {
    switch (type) {
      case 'pickup':
        return LightColors.secondary;
      case 'dropoff':
        return LightColors.success;
      case 'driver':
        return LightColors.primary;
      case 'biker':
        return LightColors.burgundy;
      case 'customer':
        return LightColors.textPrimary;
      case 'emergency':
        return LightColors.danger;
      default:
        return LightColors.textSecondary;
    }
  };

  const getMarkerIcon = (type: MapMarker['type']) => {
    // In a real implementation, you would return custom marker images
    return undefined; // Uses default marker
  };

  const handleMarkerPress = (event: MarkerPressEvent, marker: MapMarker) => {
    event.stopPropagation();
    onMarkerPress?.(marker);
  };

  return (
    <View className={`flex-1 ${className}`} style={[{ flex: 1 }, style]}>
      <MapView
        key={isDarkMode ? 'dark' : 'light'}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={false}
        onPress={(event) => {
          const coordinate = event.nativeEvent.coordinate;
          onMapPress?.(coordinate);
        }}
        onRegionChangeComplete={setRegion}
        onMapReady={() => console.log('✓ Native Map is ready')}
        mapType="standard"
        customMapStyle={isDarkMode ? DarkMapStyle : undefined}
      >
        {/* Render custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={getMarkerColor(marker.type)}
            image={getMarkerIcon(marker.type)}
            rotation={marker.bearing || 0}
            onPress={(event) => handleMarkerPress(event, marker)}
          />
        ))}

        {/* Render route if provided */}
        {route && googleMapsApiKey && (
          <>
            <MapViewDirections
              origin={route.origin}
              destination={route.destination}
              waypoints={route.waypoints}
              apikey={googleMapsApiKey}
              strokeWidth={animateRoute ? 0 : (route.strokeWidth || 4)}
              strokeColor={animateRoute ? 'transparent' : (route.strokeColor || LightColors.secondary)}
              optimizeWaypoints={true}
              onStart={(params) => {
                console.log('Route calculation started:', params);
              }}
              onReady={(result) => {
                console.log('Route ready:', result);
                onRouteReady?.(result);

                if (animateRoute) {
                  const coords = result.coordinates;
                  setRouteCoords(coords);
                  startRouteAnimation(coords);
                }

                // Auto-fit to show entire route
                if (mapRef.current) {
                  const coordinates = [route.origin, route.destination];
                  if (route.waypoints) {
                    coordinates.splice(1, 0, ...route.waypoints);
                  }
                  mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                }
              }}
              onError={(errorMessage) => {
                console.error('Route calculation error:', errorMessage);
              }}
            />
            {animateRoute && routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={isDarkMode ? '#555555' : '#aaaaaa'}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {animateRoute && displayCoords.length > 1 && (
              <Polyline
                coordinates={displayCoords}
                strokeColor={isDarkMode ? '#e0cfc0' : '#1a1a1a'}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </>
        )}

        {children}
      </MapView>

      {/* Show API key warning if not set */}
      {!googleMapsApiKey && (
        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            backgroundColor: 'rgba(255, 59, 48, 0.9)',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="warning" size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
            Google Maps API key not set - Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env
          </Text>
        </View>
      )}
    </View>
  );
});

UniversalMapView.displayName = 'UniversalMapView';

export default UniversalMapView;
