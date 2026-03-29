import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SearchableDropdown } from '../../components/common/SearchableDropdown';
import { useAuthStore } from '../../store/authStore';
import { useCarStore } from '../../store/carStore';
import { useRouter } from 'expo-router';
import { BrandColors } from '../../constants/Colors';
import { CAR_BRANDS, getModelsForBrand } from '../../constants/carBrandsData';
import { useMemo } from 'react';

export default function CarDetails() {
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    color: '',
    registrationNumber: '',
    transmission: 'automatic' as 'manual' | 'automatic',
  });
  const [loading, setLoading] = useState(false);

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const addCar = useCarStore((state) => state.addCar);
  const router = useRouter();

  // Models available based on selected make
  const availableModels = useMemo(() => getModelsForBrand(carForm.make), [carForm.make]);

  const handleInputChange = (field: string, value: string) => {
    setCarForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMakeChange = (value: string) => {
    // When make changes, reset model
    setCarForm(prev => ({ ...prev, make: value, model: '' }));
  };

  const handleSaveCar = async () => {
    const { make, model, color, registrationNumber, transmission } = carForm;

    if (!make || !model || !color || !registrationNumber) {
      Alert.alert('Error', 'Please fill in all car details');
      return;
    }

    setLoading(true);

    try {
      await addCar({
        make,
        model,
        color,
        registrationNumber: registrationNumber.toUpperCase(),
        isDefault: true,
        transmission,
      });
      
      setLoading(false);
      router.replace('/(customer)/(tabs)');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save car details. Please try again.');
    }
  };

  const handleSkipStep = () => {
    Alert.alert(
      'Skip Car Details',
      'You can add your car details later from your profile. Continue without adding car details?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          style: 'default',
          onPress: () => router.replace('/(customer)/(tabs)'),
        },
      ]
    );
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary dark:text-darkText border-border';

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mt-4 mb-8">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-4"
              >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
              </TouchableOpacity>
              <ThemedText variant="h2">Car Details</ThemedText>
            </View>
            
            <TouchableOpacity onPress={handleSkipStep}>
              <ThemedText variant="small" className="text-secondary">
                Skip
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Welcome Message */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="car-sport" size={32} color={BrandColors.secondary} />
            </View>
            <ThemedText variant="h3" className="text-center mb-2">
              Add Your Vehicle
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary px-4">
              Help us provide better service by adding your car details
            </ThemedText>
          </View>

          {/* Car Form */}
          <View className="mb-8">
            {/* Car Make - Searchable Dropdown */}
            <SearchableDropdown
              label="Car Make *"
              placeholder="Select car brand"
              options={CAR_BRANDS}
              selectedValue={carForm.make}
              onSelect={handleMakeChange}
              iconName="car"
            />

            {/* Car Model - Searchable Dropdown */}
            <SearchableDropdown
              label="Model *"
              placeholder={carForm.make ? 'Select model' : 'Select car make first'}
              options={availableModels}
              selectedValue={carForm.model}
              onSelect={(value) => handleInputChange('model', value)}
              iconName="speedometer"
              disabled={!carForm.make}
            />

            {/* Color - Full Width */}
            <View className="mb-4">
              <ThemedText variant="small" className="mb-2 font-semibold">
                Color *
              </ThemedText>
              <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
                <Ionicons name="color-palette" size={20} color={iconColor} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Black"
                  placeholderTextColor={iconColor}
                  value={carForm.color}
                  onChangeText={(value) => handleInputChange('color', value)}
                />
              </View>
            </View>

            {/* Registration Number */}
            <View className="mb-4">
              <ThemedText variant="small" className="mb-2 font-semibold">
                Registration Number *
              </ThemedText>
              <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
                <Ionicons name="document-text" size={20} color={iconColor} />
                <TextInput
                  className="flex-1 ml-3 text-base font-mono"
                  placeholder="DL 01 AB 1234"
                  placeholderTextColor={iconColor}
                  value={carForm.registrationNumber}
                  onChangeText={(value) => handleInputChange('registrationNumber', value)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Transmission */}
            <View className="mb-6">
              <ThemedText variant="small" className="mb-2 font-semibold">
                Transmission
              </ThemedText>
              <View className="flex-row">
                {(['automatic', 'manual'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleInputChange('transmission', option)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      option === 'automatic' ? 'mr-2' : 'ml-2'
                    } ${
                      carForm.transmission === option
                        ? 'bg-burgundy border-burgundy'
                        : 'border-border dark:border-darkBorder'
                    }`}
                  >
                    <Ionicons
                      name={option === 'automatic' ? 'settings' : 'cog'}
                      size={20}
                      color={carForm.transmission === option ? '#FFFFFF' : iconColor}
                    />
                    <ThemedText
                      className={`mt-1 ${carForm.transmission === option ? 'text-white' : ''}`}
                    >
                      {option === 'automatic' ? 'Automatic' : 'Manual'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Box */}
            <View className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color={BrandColors.secondary} className="mr-3" />
                <View className="flex-1 ml-3">
                  <ThemedText variant="small" className="font-semibold mb-1">
                    Why do we need this?
                  </ThemedText>
                  <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary leading-4">
                    Your car details help our chauffeurs identify your vehicle and provide personalized service. This information is kept secure and private.
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <PrimaryButton
              title="Save & Continue"
              onPress={handleSaveCar}
              loading={loading}
            />

            {/* Skip Option */}
            <TouchableOpacity
              onPress={handleSkipStep}
              className="mt-4 py-3"
            >
              <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary">
                I'll add this later
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}