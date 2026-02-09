import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  TextInput,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

export function GooglePlacesAutocomplete({
  placeholder,
  value,
  onPlaceSelected,
  apiKey,
  isDarkMode = false,
  icon = 'location',
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value);
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

      console.log('Google Places API response:', data);

      if (data.status === 'OK' && data.predictions) {
        const places: GooglePlace[] = data.predictions.map((pred: any) => ({
          place_id: pred.place_id,
          description: pred.description,
          structured_formatting: pred.structured_formatting,
          terms: pred.terms,
        }));
        setPredictions(places);
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

    if (isFocused && query && query.length >= 3) {
      timeoutRef.current = setTimeout(() => {
        fetchPredictions(query);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, isFocused, apiKey]);

  const selectPlace = (place: GooglePlace) => {
    setQuery(place.description);
    setShowResults(false);
    setIsFocused(false);
    onPlaceSelected(place);
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowResults(true);
  };

  const handleBlur = () => {
    // Delay to allow selection
    setTimeout(() => setIsFocused(false), 300);
  };

  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary border-gray-200';

  const renderPredictionItem = ({ item }: { item: GooglePlace }) => (
    <TouchableOpacity
      onPress={() => selectPlace(item)}
      className="p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-800"
    >
      <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>
        {item.structured_formatting?.main_text || item.description}
      </Text>
      {item.structured_formatting?.secondary_text && (
        <Text style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          {item.structured_formatting.secondary_text}
        </Text>
      )}
      {!item.structured_formatting && (
        <Text style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Input Field */}
      <View
        className={`flex-row items-center p-3 rounded-xl border ${inputClass} ${
          isFocused ? 'border-burgundy' : ''
        }`}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <TextInput
          className="flex-1 ml-3 text-base"
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#999"
          onSubmitEditing={() => {
            setShowResults(false);
            setIsFocused(false);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} onPressIn={handleFocus}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Modal */}
      <Modal
        visible={showResults && (isLoading || predictions.length > 0)}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          setShowResults(false);
          setIsFocused(false);
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50"
          onPress={() => {
            setShowResults(false);
            setIsFocused(false);
          }}
        >
          <View className="mt-16 mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg max-h-[70%] overflow-hidden">
            {/* Header */}
            <View className="p-3 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                Select a place
              </Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View className="p-8 items-center">
                <ActivityIndicator size="large" color="#BD8C5E" />
                <Text className="text-gray-500 mt-3">Searching places...</Text>
              </View>
            )}

            {/* Predictions List */}
            {!isLoading && predictions.length > 0 && (
              <FlatList
                data={predictions}
                keyExtractor={(item) => item.place_id}
                renderItem={renderPredictionItem}
                ListEmptyComponent={<View />}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* No Results */}
            {!isLoading && predictions.length === 0 && query.length >= 3 && (
              <View className="p-8 items-center">
                <Ionicons name="location-outline" size={40} color="#999" />
                <Text className="text-gray-500 mt-3">No places found</Text>
                <Text className="text-gray-400 text-sm mt-1">Try a different search term</Text>
              </View>
            )}

            {/* Empty State - Type to search */}
            {!isLoading && predictions.length === 0 && query.length < 3 && (
              <View className="p-8 items-center">
                <Ionicons name="search" size={40} color="#999" />
                <Text className="text-gray-500 mt-3">Type at least 3 characters</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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

    console.log('Google Place Details response:', data);

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
