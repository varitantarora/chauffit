import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import * as ImagePicker from 'expo-image-picker';

type VehicleType = 'motorcycle' | 'scooter' | 'bicycle' | 'ebike';

export default function VehicleRegistrationScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [vehicleData, setVehicleData] = useState({
    type: 'motorcycle' as VehicleType,
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    photo: null as string | null,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const vehicleTypes = [
    { key: 'motorcycle', label: 'Motorcycle', icon: 'bicycle' },
    { key: 'scooter', label: 'Scooter', icon: 'car-sport' },
    { key: 'bicycle', label: 'Bicycle', icon: 'bicycle' },
    { key: 'ebike', label: 'E-bike', icon: 'flash' },
  ] as const;

  const handleVehicleTypeSelect = (type: VehicleType) => {
    setVehicleData(prev => ({ ...prev, type }));
  };

  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to photos to upload vehicle image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVehicleData(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Validation
    if (!vehicleData.make.trim()) {
      Alert.alert('Required', 'Please enter vehicle make');
      return;
    }
    if (!vehicleData.model.trim()) {
      Alert.alert('Required', 'Please enter vehicle model');
      return;
    }
    if (!vehicleData.year.trim()) {
      Alert.alert('Required', 'Please enter vehicle year');
      return;
    }
    if (!vehicleData.color.trim()) {
      Alert.alert('Required', 'Please enter vehicle color');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Vehicle Registered!',
        'Your vehicle has been registered successfully. Proceed to document verification.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/(biker)/onboarding/documents')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center">
            <ThemedText variant="title" className="font-bold">
              Vehicle Setup
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              Step 1 of 3
            </ThemedText>
          </View>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Description */}
            <View className="mb-8">
              <ThemedText variant="title" className="text-2xl font-bold mb-2">
                Register your vehicle
              </ThemedText>
              <ThemedText variant="secondary">
                For efficient driver pickups
              </ThemedText>
            </View>

            {/* Vehicle Type Selection */}
            <View className="mb-6">
              <ThemedText className="font-bold text-lg mb-4">VEHICLE TYPE:</ThemedText>
              <View className="flex-row flex-wrap gap-3">
                {vehicleTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => handleVehicleTypeSelect(type.key)}
                    className={`flex-row items-center p-3 rounded-lg border-2 ${
                      vehicleData.type === type.key 
                        ? 'bg-burgundy/10 border-burgundy' 
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={vehicleData.type === type.key ? '#720C17' : (isDarkMode ? '#d9d1c6' : '#314b4c')} 
                    />
                    <ThemedText className={`ml-2 font-semibold ${
                      vehicleData.type === type.key ? 'text-burgundy' : ''
                    }`}>
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vehicle Details Form */}
            <ThemedCard className="p-4 mb-6">
              <View className="space-y-4">
                {/* Make */}
                <View>
                  <ThemedText className="font-semibold mb-2">Make *</ThemedText>
                  <TextInput
                    value={vehicleData.make}
                    onChangeText={(text) => setVehicleData(prev => ({ ...prev, make: text }))}
                    placeholder="Honda, Yamaha, etc."
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    className="w-full p-3 border border-border dark:border-darkBorder rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#d9d1c6' : '#314b4c'
                    }}
                  />
                </View>

                {/* Model */}
                <View>
                  <ThemedText className="font-semibold mb-2">Model *</ThemedText>
                  <TextInput
                    value={vehicleData.model}
                    onChangeText={(text) => setVehicleData(prev => ({ ...prev, model: text }))}
                    placeholder="CBR600RR, MT-09, etc."
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    className="w-full p-3 border border-border dark:border-darkBorder rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#d9d1c6' : '#314b4c'
                    }}
                  />
                </View>

                {/* Year */}
                <View>
                  <ThemedText className="font-semibold mb-2">Year *</ThemedText>
                  <TextInput
                    value={vehicleData.year}
                    onChangeText={(text) => setVehicleData(prev => ({ ...prev, year: text }))}
                    placeholder="2024"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    keyboardType="numeric"
                    maxLength={4}
                    className="w-full p-3 border border-border dark:border-darkBorder rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#d9d1c6' : '#314b4c'
                    }}
                  />
                </View>

                {/* License Plate */}
                <View>
                  <ThemedText className="font-semibold mb-2">License Plate</ThemedText>
                  <ThemedText variant="caption" className="text-secondary mb-2">(if applicable)</ThemedText>
                  <TextInput
                    value={vehicleData.licensePlate}
                    onChangeText={(text) => setVehicleData(prev => ({ ...prev, licensePlate: text.toUpperCase() }))}
                    placeholder="ABC123"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    autoCapitalize="characters"
                    className="w-full p-3 border border-border dark:border-darkBorder rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#d9d1c6' : '#314b4c'
                    }}
                  />
                </View>

                {/* Color */}
                <View>
                  <ThemedText className="font-semibold mb-2">Color *</ThemedText>
                  <TextInput
                    value={vehicleData.color}
                    onChangeText={(text) => setVehicleData(prev => ({ ...prev, color: text }))}
                    placeholder="Black, Blue, Red, etc."
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    className="w-full p-3 border border-border dark:border-darkBorder rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#d9d1c6' : '#314b4c'
                    }}
                  />
                </View>
              </View>
            </ThemedCard>

            {/* Vehicle Photo Upload */}
            <ThemedCard className="p-4 mb-8">
              <ThemedText className="font-semibold text-lg mb-4">Vehicle Photo</ThemedText>
              
              {vehicleData.photo ? (
                <View className="items-center">
                  <Image 
                    source={{ uri: vehicleData.photo }} 
                    className="w-full h-48 rounded-lg mb-4"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handlePhotoUpload}
                    className="bg-secondary/20 px-4 py-2 rounded-lg"
                    activeOpacity={0.7}
                  >
                    <ThemedText className="text-secondary font-semibold">Change Photo</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePhotoUpload}
                  className="border-2 border-dashed border-border dark:border-darkBorder rounded-lg p-8 items-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={48} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <ThemedText className="text-secondary font-semibold text-lg mt-2">
                    Upload Vehicle Photo
                  </ThemedText>
                  <ThemedText variant="caption" className="text-secondary text-center mt-1">
                    Take a clear photo of your vehicle{'\n'}for verification purposes
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedCard>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          <PrimaryButton
            title={isLoading ? "Registering..." : "CONTINUE"}
            onPress={handleContinue}
            disabled={isLoading}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}