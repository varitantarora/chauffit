import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LightColors } from '../../constants/Colors';

export interface LocationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'current' | 'saved' | 'recent' | 'search';
}

interface LocationPickerProps {
  className?: string;
  placeholder?: string;
  onLocationSelect: (location: LocationData) => void;
  onLocationChange?: (query: string) => void;
  savedLocations?: LocationData[];
  recentLocations?: LocationData[];
  showCurrentLocation?: boolean;
  allowCustomLocation?: boolean;
  indianAddressFormat?: boolean;
  style?: any;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  className = '',
  placeholder = 'Search for location...',
  onLocationSelect,
  onLocationChange,
  savedLocations = [],
  recentLocations = [],
  showCurrentLocation = true,
  allowCustomLocation = true,
  indianAddressFormat = true,
  style,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    onLocationChange?.(text);
    
    if (text.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(text);
    }, 500);

    setShowSuggestions(true);
  }, [onLocationChange]);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // In a real implementation, you would use Google Places API
      // For now, we'll simulate with mock data
      const mockResults: LocationData[] = [
        {
          id: '1',
          name: 'Connaught Place',
          address: 'Connaught Place, New Delhi, Delhi, India',
          latitude: 28.6315,
          longitude: 77.2167,
          type: 'search'
        },
        {
          id: '2',
          name: 'India Gate',
          address: 'India Gate, Rajpath, New Delhi, Delhi, India',
          latitude: 28.6129,
          longitude: 77.2295,
          type: 'search'
        },
        {
          id: '3',
          name: 'Cyber City',
          address: 'Cyber City, Gurugram, Haryana, India',
          latitude: 28.4953,
          longitude: 77.0892,
          type: 'search'
        },
      ].filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access is required to get your current location.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocoding to get address
      const reverseGeocoding = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocoding.length > 0) {
        const address = reverseGeocoding[0];
        const formattedAddress = formatIndianAddress(address);

        const currentLocationData: LocationData = {
          id: 'current',
          name: 'Current Location',
          address: formattedAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          type: 'current'
        };

        onLocationSelect(currentLocationData);
        setQuery(formattedAddress);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatIndianAddress = (address: any) => {
    if (!indianAddressFormat) {
      return `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim();
    }

    // Format address for Indian context
    const parts = [];
    if (address.name) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.subregion) parts.push(address.subregion);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.filter(Boolean).join(', ');
  };

  const handleLocationSelect = (location: LocationData) => {
    onLocationSelect(location);
    setQuery(location.address);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const getAllSuggestions = () => {
    const suggestions: LocationData[] = [];
    
    // Add search results
    suggestions.push(...searchResults);
    
    // Add recent locations if no search query
    if (!query.trim() && recentLocations.length > 0) {
      suggestions.push(...recentLocations.slice(0, 3));
    }
    
    // Add saved locations if no search query
    if (!query.trim() && savedLocations.length > 0) {
      suggestions.push(...savedLocations.slice(0, 3));
    }

    return suggestions;
  };

  const renderLocationItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => handleLocationSelect(item)}
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Ionicons 
          name={
            item.type === 'current' ? 'location' :
            item.type === 'saved' ? 'bookmark' :
            item.type === 'recent' ? 'time' :
            'search'
          }
          size={20} 
          color={LightColors.textSecondary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-black">
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`${className}`} style={style}>
      {/* Search Input */}
      <View className="relative">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-4 py-3">
          <Ionicons name="search" size={20} color={LightColors.textSecondary} />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder={placeholder}
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => setShowSuggestions(true)}
            placeholderTextColor={LightColors.textSecondary}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={LightColors.secondary} />
          )}
        </View>

        {/* Current Location Button */}
        {showCurrentLocation && (
          <TouchableOpacity
            className="flex-row items-center mt-2 px-4 py-3 bg-blue-50 rounded-lg"
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <Ionicons 
              name="location" 
              size={20} 
              color={LightColors.secondary}
            />
            <Text className="ml-3 text-base font-medium" style={{color: LightColors.secondary}}>
              {isGettingLocation ? 'Getting location...' : 'Use current location'}
            </Text>
            {isGettingLocation && (
              <ActivityIndicator 
                size="small" 
                color={LightColors.secondary} 
                className="ml-2"
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions List */}
      {showSuggestions && (
        <View className="mt-2 bg-white rounded-lg border border-gray-200 max-h-80">
          <FlatList
            data={getAllSuggestions()}
            keyExtractor={(item) => item.id}
            renderItem={renderLocationItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="px-4 py-8 items-center">
                <Text className="text-gray-500 text-center">
                  {query.trim() ? 'No locations found' : 'Start typing to search'}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

export default LocationPicker;