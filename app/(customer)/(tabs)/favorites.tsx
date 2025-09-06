import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'other';
  icon: string;
}

export default function FavoritesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'other' as const });

  const iconColor = isDarkMode ? '#BD8C5E' : '#720C17';

  const [favorites, setFavorites] = useState<FavoriteLocation[]>([
    {
      id: '1',
      name: 'Home',
      address: 'Sector 56, Phase IV, Gurgaon',
      type: 'home',
      icon: 'home'
    },
    {
      id: '2', 
      name: 'Office',
      address: 'Cyber Hub, DLF Phase 3, Gurgaon',
      type: 'work',
      icon: 'business'
    },
    {
      id: '3',
      name: 'Airport',
      address: 'IGI Airport Terminal 3, Delhi',
      type: 'other',
      icon: 'airplane'
    },
    {
      id: '4',
      name: 'Mall',
      address: 'DLF Mall of India, Sector 18, Noida',
      type: 'other',
      icon: 'storefront'
    }
  ]);

  const locationTypes = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'work', label: 'Work', icon: 'business' },
    { key: 'other', label: 'Other', icon: 'location' }
  ];

  const addFavorite = () => {
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      Alert.alert('Error', 'Please enter both name and address');
      return;
    }

    const favorite: FavoriteLocation = {
      id: Date.now().toString(),
      name: newLocation.name.trim(),
      address: newLocation.address.trim(),
      type: newLocation.type,
      icon: locationTypes.find(t => t.key === newLocation.type)?.icon || 'location'
    };

    setFavorites([...favorites, favorite]);
    setNewLocation({ name: '', address: '', type: 'other' });
    setShowAddForm(false);
  };

  const removeFavorite = (id: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setFavorites(favorites.filter(f => f.id !== id))
        }
      ]
    );
  };

  const bookToLocation = (location: FavoriteLocation) => {
    // You could pass the location data to booking screen
    router.push('/(customer)/booking');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row justify-between items-center">
            <View>
              <ThemedText variant="h1">Favorite Places</ThemedText>
              <ThemedText variant="small" className="mt-1">
                Quick access to your saved locations
              </ThemedText>
            </View>
            <TouchableOpacity 
              onPress={() => setShowAddForm(true)}
              className="bg-secondary/10 p-2 rounded-full"
            >
              <Ionicons name="add" size={24} color="#BD8C5E" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Add New Location Form */}
          {showAddForm && (
            <View className="px-6 py-4 border-b border-border dark:border-darkBorder">
              <ThemedCard className="p-4">
                <ThemedText variant="h3" className="mb-4">Add New Favorite</ThemedText>
                
                {/* Name Input */}
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2">Location Name</ThemedText>
                  <View className={`flex-row items-center px-4 py-3 rounded-xl border ${
                    isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
                  }`}>
                    <TextInput
                      className={`flex-1 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                      placeholder="e.g., Home, Office, Gym..."
                      placeholderTextColor={iconColor}
                      value={newLocation.name}
                      onChangeText={(text) => setNewLocation({...newLocation, name: text})}
                    />
                  </View>
                </View>

                {/* Address Input */}
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2">Address</ThemedText>
                  <View className={`flex-row items-center px-4 py-3 rounded-xl border ${
                    isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
                  }`}>
                    <TextInput
                      className={`flex-1 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                      placeholder="Enter full address..."
                      placeholderTextColor={iconColor}
                      value={newLocation.address}
                      onChangeText={(text) => setNewLocation({...newLocation, address: text})}
                    />
                  </View>
                </View>

                {/* Type Selection */}
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2">Category</ThemedText>
                  <View className="flex-row">
                    {locationTypes.map((type) => (
                      <TouchableOpacity
                        key={type.key}
                        onPress={() => setNewLocation({...newLocation, type: type.key as any})}
                        className={`flex-1 mr-2 last:mr-0 py-3 rounded-xl border ${
                          newLocation.type === type.key 
                            ? 'bg-primary border-primary' 
                            : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                        }`}
                      >
                        <View className="items-center">
                          <Ionicons 
                            name={type.icon as any} 
                            size={20} 
                            color={newLocation.type === type.key ? '#ffffff' : '#BD8C5E'} 
                          />
                          <ThemedText 
                            className={`mt-1 text-sm ${
                              newLocation.type === type.key ? 'text-white' : ''
                            }`}
                          >
                            {type.label}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    onPress={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl bg-surface dark:bg-darkSurface"
                  >
                    <ThemedText className="text-center font-semibold">Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={addFavorite}
                    className="flex-1 py-3 rounded-xl bg-secondary"
                  >
                    <ThemedText className="text-center font-semibold text-white">Add Favorite</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Favorites List */}
          <View className="px-6 py-4">
            {favorites.length > 0 ? (
              favorites.map((favorite) => (
                <ThemedCard key={favorite.id} className="mb-4 p-4">
                  <View className="flex-row items-center">
                    <View className="bg-primary/10 p-3 rounded-full">
                      <Ionicons name={favorite.icon as any} size={24} color="#BD8C5E" />
                    </View>
                    
                    <View className="ml-4 flex-1">
                      <ThemedText className="font-bold text-lg">{favorite.name}</ThemedText>
                      <ThemedText variant="secondary" className="mt-1">
                        {favorite.address}
                      </ThemedText>
                      <View className="flex-row items-center mt-2">
                        <View className="bg-surface dark:bg-darkSurface px-2 py-1 rounded">
                          <ThemedText variant="caption" className="capitalize">
                            {favorite.type}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    
                    <View className="items-end space-y-2">
                      <TouchableOpacity 
                        onPress={() => bookToLocation(favorite)}
                        className="bg-secondary px-3 py-2 rounded-lg"
                      >
                        <ThemedText className="text-white font-semibold">Book</ThemedText>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => removeFavorite(favorite.id)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#720C17" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ThemedCard>
              ))
            ) : (
              <View className="items-center py-12">
                <Ionicons name="heart-outline" size={64} color={iconColor} />
                <ThemedText variant="title" className="mt-4 mb-2">
                  No Favorites Yet
                </ThemedText>
                <ThemedText variant="secondary" className="text-center mb-6">
                  Add your frequently visited places{'\n'}for quick and easy booking.
                </ThemedText>
                <PrimaryButton
                  title="Add Your First Favorite"
                  onPress={() => setShowAddForm(true)}
                />
              </View>
            )}
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}