import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  TextInput,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../../constants/Colors';

// Place result type from Google Places API
interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  terms?: Array<{
    offset: number;
    value: string;
  }>;
}

interface GooglePlacesAutocompleteProps {
  placeholder: string;
  value: string;
  onPlaceSelected: (place: GooglePlace) => void;
  apiKey: string;
  isDarkMode?: boolean;
  icon?: string;
  onUseCurrentLocation?: () => void;
  isFetchingCurrentLocation?: boolean;
  autoFocus?: boolean;
  onChooseOnMap?: () => void;
}

export function GooglePlacesAutocomplete({
  placeholder,
  value,
  onPlaceSelected,
  apiKey,
  isDarkMode = false,
  icon = 'location',
  onUseCurrentLocation,
  isFetchingCurrentLocation = false,
  autoFocus = false,
  onChooseOnMap,
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value);
    setIsTyping(false);
  }, [value]);

  // Fetch predictions from Google Places API
  const fetchPredictions = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&key=${apiKey}&components=country:in`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        const places: GooglePlace[] = data.predictions.map((pred: any) => ({
          place_id: pred.place_id,
          description: pred.description,
          structured_formatting: pred.structured_formatting,
          terms: pred.terms,
        }));
        // Limit to 3 most matching places as per requirement
        setPredictions(places.slice(0, 3));
      } else if (data.status === 'ZERO_RESULTS') {
        setPredictions([]);
      } else {
        console.error('Google Places API error:', data.status, data.error_message);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced fetch
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isTyping && query && query.length >= 3) {
      timeoutRef.current = setTimeout(() => {
        fetchPredictions(query);
        setShowResults(true);
      }, 300);
    } else {
      setPredictions([]);
      setShowResults(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, isTyping, apiKey]);

  const selectPlace = (place: GooglePlace) => {
    setIsTyping(false);
    setQuery(place.description);
    setShowResults(false);
    setIsFocused(false);
    setPredictions([]);
    onPlaceSelected(place);
  };

  const handleClear = () => {
    setIsTyping(false);
    setQuery('');
    setPredictions([]);
    setShowResults(false);
  };

  const handleTextChange = (text: string) => {
    setIsTyping(true);
    setQuery(text);
  };

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary dark:text-darkText border-border dark:border-darkBorder';
  const resultsBgClass = isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border dark:border-darkBorder';

  const shouldShowDropdown =
    (isFocused && !!onUseCurrentLocation) ||
    (showResults && (isLoading || predictions.length > 0));

  return (
    <View>
      {/* Input Field */}
      <View
        className={`flex-row items-center px-2 py-1.5 rounded-xl border ${inputClass} ${
          shouldShowDropdown ? 'border-b-0 rounded-b-none' : ''
        }`}
      >
        <Ionicons name={icon as any} size={16} color={iconColor} />
        <TextInput
          className={`flex-1 ml-2 text-sm ${isDarkMode ? 'text-darkText' : 'text-textPrimary dark:text-darkText'}`}
          placeholder={placeholder}
          value={query}
          onChangeText={handleTextChange}
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          autoFocus={autoFocus}
          onFocus={() => {
            setIsFocused(true);
            if (predictions.length > 0) setShowResults(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowResults(false);
            }, 150);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={16} color="#999" />
          </TouchableOpacity>
        )}
        {onChooseOnMap && (
          <TouchableOpacity onPress={onChooseOnMap} style={{ marginLeft: 6 }}>
            <Ionicons name="map-outline" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Inline Results Dropdown - Uber style */}
      {shouldShowDropdown && (
        <View
          className={`border-x border-b rounded-b-xl ${resultsBgClass} shadow-lg z-10`}
          style={{ maxHeight: 250 }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {/* Use current location row */}
            {!!onUseCurrentLocation && (
              <TouchableOpacity
                onPress={() => {
                  onUseCurrentLocation();
                  setShowResults(false);
                  setIsFocused(false);
                }}
                disabled={isFetchingCurrentLocation}
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-800"
              >
                <View className="flex-row items-center">
                  {isFetchingCurrentLocation ? (
                    <ActivityIndicator size="small" color={BrandColors.secondary} />
                  ) : (
                    <Ionicons name="navigate" size={18} color={BrandColors.burgundy} />
                  )}
                  <View className="ml-3">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      Use current location
                    </Text>
                    {isFetchingCurrentLocation && (
                      <Text className="text-sm text-gray-500 dark:text-darkTextSecondary mt-0.5">
                        Getting your location...
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Loading State */}
            {isLoading && (
              <View className="p-4 flex-row items-center justify-center">
                <ActivityIndicator size="small" color={BrandColors.secondary} />
                <Text className="text-textSecondary dark:text-darkTextSecondary ml-2">Searching...</Text>
              </View>
            )}

            {/* Predictions List - Show max 3 */}
            {!isLoading && predictions.length > 0 && (
              <>
                {predictions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    onPress={() => selectPlace(item)}
                    className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800"
                  >
                    <View className="flex-row items-start">
                      <Ionicons name="location" size={18} color={BrandColors.secondary} style={{ marginTop: 1 }} />
                      <View className="flex-1 ml-3">
                        <Text className="text-base font-medium text-gray-900 dark:text-white">
                          {item.structured_formatting?.main_text || item.description.split(',')[0]}
                        </Text>
                        {item.structured_formatting?.secondary_text && (
                          <Text className="text-sm text-gray-500 dark:text-darkTextSecondary mt-0.5">
                            {item.structured_formatting.secondary_text}
                          </Text>
                        )}
                        {!item.structured_formatting && item.description.includes(',') && (
                          <Text className="text-sm text-gray-500 dark:text-darkTextSecondary mt-0.5">
                            {item.description.split(',').slice(1).join(',').trim()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
// Get place details using Google Places API
export async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{
  lat: number;
  lng: number;
  address: string;
}> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const { lat, lng } = data.result.geometry.location;
      return {
        lat,
        lng,
        address: data.result.formatted_address || data.result.name || '',
      };
    }
    throw new Error('Place not found');
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}
