import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, ScrollView, Alert, Image, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useRouter } from 'expo-router';
import { Chauffeur } from '../../../types/navigation';
import { BrandColors } from '../../../constants/Colors';

export default function SelectChauffeur() {
  const [refreshing, setRefreshing] = useState(false);
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const {
    selectedDuration,
    availableChauffeurs,
    loadingChauffeurs,
    selectedChauffeur,
    currentLocation,
    loadAvailableChauffeurs,
    searchChauffeurs,
    setSelectedChauffeur,
  } = useBookingStore();
  
  const router = useRouter();

  useEffect(() => {
    // Load chauffeurs when component mounts
    handleSearchChauffeurs();
  }, [selectedDuration]);

  const handleSearchChauffeurs = async () => {
    if (currentLocation && selectedDuration) {
      await searchChauffeurs(currentLocation, selectedDuration);
    } else {
      await loadAvailableChauffeurs();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleSearchChauffeurs();
    setRefreshing(false);
  };

  const handleChauffeurSelect = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleContinue = () => {
    if (!selectedChauffeur) {
      Alert.alert('Error', 'Please select a chauffeur');
      return;
    }

    router.push('/(customer)/booking/confirm');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={14}
        color={BrandColors.secondary}
      />
    ));
  };

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 mt-4 mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="flex-1">
            <ThemedText variant="h2">Select Chauffeur</ThemedText>
            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
              Duration: {selectedDuration}
            </ThemedText>
          </View>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={loadingChauffeurs || refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={loadingChauffeurs || refreshing ? iconColor + '80' : iconColor} 
            />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loadingChauffeurs && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={BrandColors.secondary} />
            <ThemedText variant="body" className="mt-4 text-textSecondary dark:text-darkTextSecondary">
              Finding available chauffeurs...
            </ThemedText>
          </View>
        )}

        {/* Chauffeurs List */}
        {!loadingChauffeurs && (
          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[BrandColors.secondary]}
                tintColor={BrandColors.secondary}
              />
            }
          >
            {availableChauffeurs.length === 0 ? (
              <View className="flex-1 items-center justify-center py-16">
                <View className="w-20 h-20 bg-textSecondary/20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="car" size={32} color={iconColor} />
                </View>
                <ThemedText variant="h3" className="text-center mb-2">
                  No Chauffeurs Available
                </ThemedText>
                <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary px-8">
                  All chauffeurs are currently busy. Please try again in a few minutes or adjust your duration.
                </ThemedText>
                <TouchableOpacity
                  onPress={handleRefresh}
                  className="mt-6 px-6 py-3 bg-secondary rounded-xl"
                >
                  <ThemedText className="text-white font-semibold">
                    Refresh
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-8">
                {availableChauffeurs.map((chauffeur) => (
                  <TouchableOpacity
                    key={chauffeur.id}
                    onPress={() => handleChauffeurSelect(chauffeur)}
                    className={`mb-4 p-4 rounded-2xl border-2 ${
                      selectedChauffeur?.id === chauffeur.id
                        ? 'border-secondary bg-secondary/10'
                        : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
                    }`}
                  >
                    {/* Chauffeur Header */}
                    <View className="flex-row items-center mb-4">
                      <View className="relative">
                        <Image
                          source={{ uri: chauffeur.photo }}
                          className="w-16 h-16 rounded-full"
                          style={{ backgroundColor: '#f0f0f0' }}
                        />
                        <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white items-center justify-center ${
                          chauffeur.isAvailable ? 'bg-success' : 'bg-textSecondary'
                        }`}>
                          <Ionicons 
                            name={chauffeur.isAvailable ? 'checkmark' : 'time'} 
                            size={12} 
                            color="white" 
                          />
                        </View>
                      </View>
                      
                      <View className="flex-1 ml-4">
                        <ThemedText variant="h3" className="font-bold">
                          {chauffeur.name}
                        </ThemedText>
                        
                        <View className="flex-row items-center mt-1 mb-2">
                          <View className="flex-row mr-3">
                            {renderStars(chauffeur.rating)}
                          </View>
                          <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                            {chauffeur.rating} • {chauffeur.experience}y exp
                          </ThemedText>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={14} color={BrandColors.secondary} />
                          <ThemedText variant="small" className="ml-1 font-semibold text-secondary">
                            Arriving in {chauffeur.eta}
                          </ThemedText>
                        </View>
                      </View>

                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedChauffeur?.id === chauffeur.id
                          ? 'border-secondary bg-secondary'
                          : 'border-textSecondary'
                      }`}>
                        {selectedChauffeur?.id === chauffeur.id && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                    </View>

                    {/* Certifications */}
                    <View className="flex-row flex-wrap mb-4">
                      {chauffeur.certifications.map((cert, index) => (
                        <View
                          key={index}
                          className="bg-primary/20 px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <ThemedText variant="tiny" className="text-burgundy font-medium">
                            {cert}
                          </ThemedText>
                        </View>
                      ))}
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={() => handleCall(chauffeur.phone)}
                        className="flex-1 bg-success rounded-xl py-3 flex-row items-center justify-center"
                      >
                        <Ionicons name="call" size={18} color="white" />
                        <ThemedText className="text-white font-semibold ml-2">
                          Call
                        </ThemedText>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        className="flex-1 border-2 border-burgundy rounded-xl py-3 flex-row items-center justify-center"
                      >
                        <Ionicons name="chatbubble" size={18} color={BrandColors.burgundy} />
                        <ThemedText className="text-burgundy font-semibold ml-2">
                          Message
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Bottom Actions */}
        {!loadingChauffeurs && availableChauffeurs.length > 0 && (
          <View className="px-6 pb-6 pt-4 border-t border-border">
            <PrimaryButton
              title="Continue with Selected Chauffeur"
              onPress={handleContinue}
              disabled={!selectedChauffeur}
            />
            
            {selectedChauffeur && (
              <View className="mt-4 p-4 bg-secondary/10 rounded-xl">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: selectedChauffeur.photo }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <ThemedText variant="body" className="font-semibold">
                      {selectedChauffeur.name}
                    </ThemedText>
                    <ThemedText variant="small" className="text-secondary">
                      ETA: {selectedChauffeur.eta}
                    </ThemedText>
                  </View>
                  <View className="flex-row">
                    {renderStars(selectedChauffeur.rating)}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}