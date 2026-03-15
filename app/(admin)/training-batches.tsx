import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, useThemeColors} from '../../constants/Colors';

// Google Places API types
interface PlaceAutocompletePrediction {
  place_id: string;
  description: string;
  main_text: string;
}

interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

interface PlaceDetails {
  geometry: PlaceGeometry;
  formatted_address: string;
}

export default function TrainingBatchesScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;

  const {
    trainingBatches,
    trainingBatchesLoading,
    fetchTrainingBatches,
    createTrainingBatch,
  } = useAdminStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    location_name: '',
    location_address: '',
    location_lat: '',
    location_long: '',
    date: '',
    start_time: '',
    end_time: '',
    capacity: '10',
  });
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceAutocompletePrediction[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTrainingBatches();
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    fetchTrainingBatches();
  }, [fetchTrainingBatches]);

  const searchLocations = useCallback((query: string) => {
    setLocationQuery(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setLocationSuggestions([]);
      return;
    }

    setLocationSearchLoading(true);

    // Debounce the search (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
          console.error('Google Places API key not configured');
          setLocationSearchLoading(false);
          return;
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`
        );

        const data = await response.json();

        if (data.predictions) {
          setLocationSuggestions(data.predictions);
        } else {
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setLocationSuggestions([]);
      } finally {
        setLocationSearchLoading(false);
      }
    }, 300);
  }, []);

  const selectLocation = useCallback(
    async (placeId: string, description: string) => {
      setLocationSearchLoading(true);
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
          console.error('Google Places API key not configured');
          setLocationSearchLoading(false);
          return;
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`
        );

        const data = await response.json();

        if (data.result) {
          const result = data.result as PlaceDetails;
          setFormData((prev) => ({
            ...prev,
            location_address: result.formatted_address,
            location_lat: result.geometry.location.lat.toString(),
            location_long: result.geometry.location.lng.toString(),
          }));
          setLocationQuery(description);
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error('Location details fetch error:', error);
      } finally {
        setLocationSearchLoading(false);
      }
    },
    []
  );

  const handleCreateBatch = async () => {
    if (
      !formData.location_name ||
      !formData.location_address ||
      !formData.location_lat ||
      !formData.location_long ||
      !formData.date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      Alert.alert('Error', 'Please fill in all fields, including selecting a location from suggestions');
      return;
    }

    setIsCreating(true);
    try {
      const success = await createTrainingBatch({
        location_name: formData.location_name,
        location_address: formData.location_address,
        location_lat: formData.location_lat,
        location_long: formData.location_long,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        capacity: parseInt(formData.capacity, 10),
      });

      if (success) {
        Alert.alert('Success', 'Training batch created successfully');
        setShowCreateModal(false);
        setFormData({
          location_name: '',
          location_address: '',
          location_lat: '',
          location_long: '',
          date: '',
          start_time: '',
          end_time: '',
          capacity: '10',
        });
        setLocationQuery('');
        setLocationSuggestions([]);
      } else {
        Alert.alert('Error', 'Failed to create training batch');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const renderBatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/training-batch-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <ThemedCard className="mb-4">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <ThemedText className="font-bold text-lg">{item.location_name}</ThemedText>
              <ThemedText variant="secondary" className="text-sm">{item.date}</ThemedText>
            </View>
            <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <ThemedText className="text-xs font-semibold text-green-700 dark:text-green-300">
                {item.is_active ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-start mb-3">
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <ThemedText variant="secondary" className="text-sm ml-2 flex-1">
              {item.location_address}
            </ThemedText>
          </View>

          {/* Time */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <ThemedText variant="secondary" className="text-sm ml-2">
              {item.start_time} - {item.end_time}
            </ThemedText>
          </View>

          {/* Capacity */}
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <ThemedText variant="secondary" className="text-sm ml-2">
              {item.capacity - item.spots_remaining} / {item.capacity} assigned
            </ThemedText>
          </View>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border dark:border-darkBorder flex-row items-center justify-between">
          <View>
            <ThemedText variant="h2" className="font-bold">
              Training Batches
            </ThemedText>
            <ThemedText variant="small">Manage driver training sessions</ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.burgundy }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {trainingBatchesLoading && trainingBatches.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.burgundy} />
          </View>
        ) : (
          <FlatList
            data={trainingBatches}
            renderItem={renderBatchCard}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 py-4"
            refreshControl={
              <RefreshControl refreshing={trainingBatchesLoading} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <Ionicons name="list" size={48} color={colors.textSecondary} />
                <ThemedText className="mt-2">No training batches yet</ThemedText>
              </View>
            }
          />
        )}
      </View>

      {/* Create Batch Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateModal(false);
          setFormData({
            location_name: '',
            location_address: '',
            location_lat: '',
            location_long: '',
            date: '',
            start_time: '',
            end_time: '',
            capacity: '10',
          });
          setLocationQuery('');
          setLocationSuggestions([]);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView className="flex-1 px-4 py-4">
            <View className="flex-row items-center justify-between mb-6">
              <ThemedText variant="h2" className="font-bold">
                Create Training Batch
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({
                    location_name: '',
                    location_address: '',
                    location_lat: '',
                    location_long: '',
                    date: '',
                    start_time: '',
                    end_time: '',
                    capacity: '10',
                  });
                  setLocationQuery('');
                  setLocationSuggestions([]);
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="mb-4">
              <ThemedText className="font-semibold mb-2">Location Name</ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  backgroundColor: colors.surface,
                }}
                placeholder="e.g., Gurgaon Training Center"
                placeholderTextColor={colors.textSecondary}
                value={formData.location_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, location_name: text })
                }
              />
            </View>

            <View className="mb-4">
              <ThemedText className="font-semibold mb-2">Location Address</ThemedText>
              <View className="relative">
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  }}
                  placeholder="Search for a location"
                  placeholderTextColor={colors.textSecondary}
                  value={locationQuery}
                  onChangeText={searchLocations}
                  editable={!locationSearchLoading}
                />
                {locationSearchLoading && (
                  <View className="absolute right-3 top-3">
                    <ActivityIndicator size="small" color={colors.burgundy} />
                  </View>
                )}

                {/* Location Suggestions Dropdown */}
                {locationSuggestions.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderTopWidth: 0,
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                      maxHeight: 200,
                      marginTop: -1,
                    }}
                  >
                    <ScrollView scrollEnabled={true}>
                      {locationSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={suggestion.place_id}
                          onPress={() =>
                            selectLocation(suggestion.place_id, suggestion.description)
                          }
                          className="px-4 py-3 border-b border-border dark:border-darkBorder"
                        >
                          <ThemedText className="text-sm">{suggestion.main_text}</ThemedText>
                          <ThemedText variant="secondary" className="text-xs mt-1">
                            {suggestion.description.replace(suggestion.main_text, '').trim()}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {formData.location_address && (
                <ThemedText variant="secondary" className="text-xs mt-2">
                  Selected: {formData.location_address}
                </ThemedText>
              )}
            </View>

            <View className="mb-4">
              <ThemedText className="font-semibold mb-2">Date (YYYY-MM-DD)</ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  backgroundColor: colors.surface,
                }}
                placeholder="2026-03-15"
                placeholderTextColor={colors.textSecondary}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <ThemedText className="font-semibold mb-2">Start Time (HH:MM)</ThemedText>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  }}
                  placeholder="09:00"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.start_time}
                  onChangeText={(text) =>
                    setFormData({ ...formData, start_time: text })
                  }
                />
              </View>
              <View className="flex-1">
                <ThemedText className="font-semibold mb-2">End Time (HH:MM)</ThemedText>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  }}
                  placeholder="17:00"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.end_time}
                  onChangeText={(text) =>
                    setFormData({ ...formData, end_time: text })
                  }
                />
              </View>
            </View>

            <View className="mb-6">
              <ThemedText className="font-semibold mb-2">Capacity</ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  backgroundColor: colors.surface,
                }}
                placeholder="10"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={formData.capacity}
                onChangeText={(text) =>
                  setFormData({ ...formData, capacity: text })
                }
              />
            </View>

            {/* Buttons */}
            <View className="gap-3 mb-4">
              <PrimaryButton
                title="Create Batch"
                onPress={handleCreateBatch}
                disabled={isCreating}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({
                    location_name: '',
                    location_address: '',
                    location_lat: '',
                    location_long: '',
                    date: '',
                    start_time: '',
                    end_time: '',
                    capacity: '10',
                  });
                  setLocationQuery('');
                  setLocationSuggestions([]);
                }}
                className="py-3 px-4 rounded-lg border border-border dark:border-darkBorder"
              >
                <ThemedText className="text-center font-semibold">Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
