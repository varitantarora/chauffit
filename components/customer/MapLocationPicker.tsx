import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../../constants/Colors';
import { DarkMapStyle } from '../../constants/MapStyles';

export interface MapPickerLocation {
  address: string;
  latitude: number;
  longitude: number;
}

interface MapLocationPickerProps {
  visible: boolean;
  onLocationSelected: (location: MapPickerLocation) => void;
  onClose: () => void;
  initialCoordinate?: { latitude: number; longitude: number };
  locationType: 'pickup' | 'dropoff';
  isDarkMode: boolean;
}

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;

const DEFAULT_COORDINATE = {
  latitude: 28.6139,
  longitude: 77.2090,
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

export function MapLocationPicker({
  visible,
  onLocationSelected,
  onClose,
  initialCoordinate,
  locationType,
  isDarkMode,
}: MapLocationPickerProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const geocodeTimeout = useRef<NodeJS.Timeout>();

  const [region, setRegion] = useState<Region>({
    latitude: initialCoordinate?.latitude ?? DEFAULT_COORDINATE.latitude,
    longitude: initialCoordinate?.longitude ?? DEFAULT_COORDINATE.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      const lat = initialCoordinate?.latitude ?? DEFAULT_COORDINATE.latitude;
      const lng = initialCoordinate?.longitude ?? DEFAULT_COORDINATE.longitude;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      setAddress('');
      reverseGeocode(lat, lng);

      // If no initial coordinate, try to get current location
      if (!initialCoordinate) {
        goToCurrentLocation();
      }
    }
  }, [visible]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (results.length > 0) {
        setAddress(formatAddress(results[0]));
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    if (geocodeTimeout.current) {
      clearTimeout(geocodeTimeout.current);
    }
    geocodeTimeout.current = setTimeout(() => {
      reverseGeocode(newRegion.latitude, newRegion.longitude);
    }, 500);
  }, [reverseGeocode]);

  const goToCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocating(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(newRegion, 800);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelected({
      address: address || 'Selected Location',
      latitude: region.latitude,
      longitude: region.longitude,
    });
    onClose();
  };

  const isPickup = locationType === 'pickup';
  const pinColor = isPickup ? BrandColors.burgundy : BrandColors.success;
  const confirmLabel = isPickup ? 'Confirm Pickup Location' : 'Confirm Drop-off Location';

  const bgCard = isDarkMode ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDarkMode ? '#D9D1C6' : '#000000';
  const textSecondary = isDarkMode ? '#999999' : '#666666';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1 }}>
        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          customMapStyle={isDarkMode ? DarkMapStyle : undefined}
        />

        {/* Center Pin Overlay */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name="location-sharp"
            size={44}
            color={pinColor}
            style={{ marginTop: -44 }}
          />
          {/* Pin shadow dot */}
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.3)',
              marginTop: -2,
            }}
          />
        </View>

        {/* Top Bar: Back button + Address */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: bgCard,
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: textSecondary, marginBottom: 2 }}>
                {isPickup ? 'Select Pickup Location' : 'Select Drop-off Location'}
              </Text>
              {isGeocoding ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={BrandColors.secondary} />
                  <Text style={{ fontSize: 14, color: textSecondary, marginLeft: 6 }}>
                    Finding address...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: textColor }}
                  numberOfLines={2}
                >
                  {address || 'Move map to select location'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* My Location Button */}
        <TouchableOpacity
          onPress={goToCurrentLocation}
          disabled={isLocating}
          style={{
            position: 'absolute',
            right: 16,
            bottom: insets.bottom + 100,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: bgCard,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={BrandColors.secondary} />
          ) : (
            <Ionicons name="locate" size={22} color={BrandColors.burgundy} />
          )}
        </TouchableOpacity>

        {/* Bottom: Confirm Button */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: bgCard,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          {address ? (
            <Text
              style={{
                fontSize: 13,
                color: textSecondary,
                marginBottom: 12,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {address}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isGeocoding}
            style={{
              backgroundColor: BrandColors.burgundy,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              opacity: isGeocoding ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
