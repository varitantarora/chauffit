import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { BrandColors } from '../../constants/Colors';
import { GooglePlacesAutocomplete, getPlaceDetails } from '../../components/customer/GooglePlacesAutocomplete';
import { appConfig } from '../../config/env';
import LocationApiService, {
  FavoriteLocation,
  AddFavoriteRequest,
  LocationType,
} from '../../services/api/LocationApiService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getLocationIcon = (title: string, type: LocationType): React.ComponentProps<typeof Ionicons>['name'] => {
  const lower = title.toLowerCase();
  if (lower.includes('home') || type === 'home') return 'home';
  if (lower.includes('work') || lower.includes('office') || type === 'work') return 'briefcase';
  if (lower.includes('gym') || lower.includes('fitness')) return 'barbell';
  if (lower.includes('school') || lower.includes('college') || lower.includes('university')) return 'school';
  if (lower.includes('hospital') || lower.includes('clinic')) return 'medkit';
  if (lower.includes('airport') || lower.includes('flight')) return 'airplane';
  if (lower.includes('temple') || lower.includes('church') || lower.includes('mosque')) return 'business';
  if (lower.includes('restaurant') || lower.includes('cafe')) return 'restaurant';
  if (lower.includes('mall') || lower.includes('market') || lower.includes('shop')) return 'cart';
  return 'heart';
};

const getLocationColor = (type: LocationType): string => {
  switch (type) {
    case 'home': return '#10b981';
    case 'work': return '#3b82f6';
    default: return BrandColors.secondary;
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FavoritesScreen() {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const router = useRouter();

  const [locations, setLocations] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal state for add / edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FavoriteLocation | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formType, setFormType] = useState<LocationType>('favorite');
  const [formLatitude, setFormLatitude] = useState(0);
  const [formLongitude, setFormLongitude] = useState(0);

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  // ---------- Data fetching ----------

  const fetchLocations = useCallback(async () => {
    try {
      // Try the general endpoint first (returns home, work, favorite, recent)
      const allRes = await LocationApiService.getAllLocations();
      if (allRes.success && allRes.data && allRes.data.length > 0) {
        setLocations(allRes.data);
        return;
      }
      // Fallback to favorites-only endpoint if the general one fails or is empty
      const favRes = await LocationApiService.getFavorites();
      if (favRes.success && favRes.data) {
        setLocations(favRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch locations', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  }, [fetchLocations]);

  // ---------- CRUD helpers ----------

  const openAddModal = () => {
    setEditingLocation(null);
    setFormTitle('');
    setFormAddress('');
    setFormType('favorite');
    setFormLatitude(0);
    setFormLongitude(0);
    setModalVisible(true);
  };

  const openEditModal = (loc: FavoriteLocation) => {
    setEditingLocation(loc);
    setFormTitle(loc.title);
    setFormAddress(loc.address);
    setFormType(loc.location_type);
    setFormLatitude(loc.latitude ?? 0);
    setFormLongitude(loc.longitude ?? 0);
    setModalVisible(true);
  };

  const handlePlaceSelected = async (place: any) => {
    setFormAddress(place.description);
    try {
      const details = await getPlaceDetails(place.place_id, appConfig.googlePlacesApiKey);
      setFormLatitude(details.lat);
      setFormLongitude(details.lng);
    } catch (e) {
      console.error('Failed to get place details', e);
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formAddress.trim()) {
      Alert.alert('Missing Info', 'Please provide both a title and an address.');
      return;
    }

    setSaving(true);

    try {
      if (editingLocation) {
        // Update
        const res = await LocationApiService.updateFavorite(editingLocation.id, {
          title: formTitle.trim(),
          address: formAddress.trim(),
          latitude: formLatitude,
          longitude: formLongitude,
          location_type: formType,
        });
        if (res.success && res.data) {
          setLocations((prev) =>
            prev.map((l) => (l.id === editingLocation.id ? res.data! : l))
          );
          Alert.alert('Updated', 'Location updated successfully.');
        } else {
          Alert.alert('Error', res.error || 'Failed to update location.');
        }
      } else {
        // Add — use default coords; ideally you'd pick from a map or geocode
        const payload: AddFavoriteRequest = {
          title: formTitle.trim(),
          address: formAddress.trim(),
          latitude: formLatitude,
          longitude: formLongitude,
          location_type: formType,
        };
        const res = await LocationApiService.addFavorite(payload);
        if (res.success && res.data) {
          setLocations((prev) => [res.data!, ...prev]);
          Alert.alert('Saved', 'Location added to favorites.');
        } else {
          Alert.alert('Error', res.error || 'Failed to save location.');
        }
      }

      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (loc: FavoriteLocation) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to remove "${loc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await LocationApiService.deleteFavorite(loc.id);
              if (res.success) {
                setLocations((prev) => prev.filter((l) => l.id !== loc.id));
              } else {
                Alert.alert('Error', res.error || 'Failed to delete location.');
              }
            } catch {
              Alert.alert('Error', 'Could not delete location.');
            }
          },
        },
      ]
    );
  };

  // ---------- Type chip helpers ----------

  const typeOptions: { label: string; value: LocationType; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
    { label: 'Home', value: 'home', icon: 'home' },
    { label: 'Work', value: 'work', icon: 'briefcase' },
    { label: 'Favorite', value: 'favorite', icon: 'heart' },
  ];

  // ---------- Render ----------

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        {/* Header */}
        <View
          style={{
            backgroundColor: '#541201',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: '#541201',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <ThemedText style={{ color: '#ffffff', fontSize: 22, fontWeight: '800' }}>Favorites</ThemedText>
          </View>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={28} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={BrandColors.secondary} />
              <ThemedText variant="caption" className="mt-4">Loading your favorites…</ThemedText>
            </View>
          ) : locations.length === 0 ? (
            <ThemedCard className="items-center py-12 mt-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: isDarkMode ? 'rgba(189,140,94,0.15)' : 'rgba(114,12,23,0.08)' }}
              >
                <Ionicons name="heart-outline" size={40} color={iconColor} />
              </View>
              <ThemedText variant="body" className="font-semibold mb-2">
                No Saved Locations
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center mb-5 px-4">
                Add your favorite places for quick booking
              </ThemedText>
              <PrimaryButton title="Add Your First Location" onPress={openAddModal} variant="secondary" size="small" />
            </ThemedCard>
          ) : (
            locations.map((loc) => {
              const color = getLocationColor(loc.location_type);
              return (
                <ThemedCard key={loc.id} className="mb-3">
                  <View className="flex-row items-center">
                    {/* Icon */}
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Ionicons
                        name={getLocationIcon(loc.title, loc.location_type)}
                        size={24}
                        color={color}
                      />
                    </View>

                    {/* Info */}
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center mb-0.5">
                        <ThemedText variant="body" className="font-semibold">
                          {loc.title}
                        </ThemedText>
                        {loc.is_default && (
                          <View className="bg-burgundy px-2 py-0.5 rounded-full ml-2">
                            <ThemedText variant="tiny" className="text-white font-semibold">DEFAULT</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText
                        variant="small"
                        className="text-textSecondary dark:text-darkTextSecondary"
                        numberOfLines={2}
                      >
                        {loc.address}
                      </ThemedText>
                      <View className="flex-row items-center mt-1">
                        <View
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <ThemedText variant="tiny" style={{ color, fontWeight: '600', textTransform: 'capitalize' }}>
                            {loc.location_type}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row items-center">
                      <TouchableOpacity onPress={() => openEditModal(loc)} className="p-2">
                        <Ionicons name="create-outline" size={20} color={BrandColors.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(loc)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color={BrandColors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ThemedCard>
              );
            })
          )}
        </ScrollView>

        {/* Add / Edit Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View
                className="rounded-t-3xl px-6 pt-6 pb-10"
                style={{
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                }}
              >
                {/* Modal header */}
                <View className="flex-row items-center justify-between mb-6">
                  <ThemedText variant="h2">
                    {editingLocation ? 'Edit Location' : 'Add Location'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color={iconColor} />
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <ThemedText variant="small" className="font-semibold mb-1">Title</ThemedText>
                <TextInput
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="e.g. Home, Office, Gym"
                  placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
                  style={{
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#333' : '#ddd',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: isDarkMode ? '#d9d1c6' : '#222',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                    marginBottom: 16,
                  }}
                />

                {/* Address */}
                <ThemedText variant="small" className="font-semibold mb-1">Address</ThemedText>
                <View style={{ marginBottom: 16, zIndex: 10 }}>
                  <GooglePlacesAutocomplete
                    placeholder="Search for address"
                    value={formAddress}
                    apiKey={appConfig.googlePlacesApiKey}
                    isDarkMode={isDarkMode}
                    icon="location"
                    onPlaceSelected={handlePlaceSelected}
                  />
                </View>

                {/* Type chips */}
                <ThemedText variant="small" className="font-semibold mb-2">Type</ThemedText>
                <View className="flex-row mb-6">
                  {typeOptions.map((opt) => {
                    const selected = formType === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setFormType(opt.value)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          marginRight: 10,
                          backgroundColor: selected
                            ? (isDarkMode ? BrandColors.secondary : BrandColors.burgundy)
                            : (isDarkMode ? '#2a2a2a' : '#f0f0f0'),
                        }}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={16}
                          color={selected ? '#fff' : iconColor}
                          style={{ marginRight: 6 }}
                        />
                        <ThemedText
                          variant="small"
                          style={{
                            color: selected ? '#fff' : (isDarkMode ? '#d9d1c6' : '#333'),
                            fontWeight: '600',
                          }}
                        >
                          {opt.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Save button */}
                <PrimaryButton
                  title={saving ? 'Saving…' : editingLocation ? 'Update Location' : 'Save Location'}
                  onPress={handleSave}
                  disabled={saving}
                  variant="secondary"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
