import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useCarStore } from '../../store/carStore';
import { useRouter } from 'expo-router';

export default function CarDetails() {
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    registrationNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [skipStep, setSkipStep] = useState(false);
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const addCar = useCarStore((state) => state.addCar);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const carMakes = [
    'BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda', 'Hyundai', 
    'Maruti Suzuki', 'Tata', 'Mahindra', 'Ford', 'Volkswagen', 'Other'
  ];
  
  const carColors = [
    'Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 
    'Brown', 'Green', 'Gold', 'Orange', 'Yellow', 'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setCarForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCar = async () => {
    const { make, model, year, color, registrationNumber } = carForm;
    
    if (!make || !model || !year || !color || !registrationNumber) {
      Alert.alert('Error', 'Please fill in all car details');
      return;
    }

    if (parseInt(year) < 1990 || parseInt(year) > currentYear + 1) {
      Alert.alert('Error', 'Please enter a valid year');
      return;
    }

    setLoading(true);
    
    try {
      await addCar({
        make,
        model,
        year: parseInt(year),
        color,
        registrationNumber: registrationNumber.toUpperCase(),
        isDefault: true, // First car is always default
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
    : 'bg-white text-textPrimary border-border';

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
              <Ionicons name="car-sport" size={32} color="#BD8C5E" />
            </View>
            <ThemedText variant="h3" className="text-center mb-2">
              Add Your Vehicle
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary px-4">
              Help us provide better service by adding your car details
            </ThemedText>
          </View>

          {/* Car Form */}
          <View className="mb-8">
            {/* Car Make */}
            <View className="mb-4">
              <ThemedText variant="small" className="mb-2 font-semibold">
                Car Make *
              </ThemedText>
              <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
                <Ionicons name="car" size={20} color={iconColor} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Toyota"
                  placeholderTextColor={iconColor}
                  value={carForm.make}
                  onChangeText={(value) => handleInputChange('make', value)}
                />
              </View>
            </View>

            {/* Car Model */}
            <View className="mb-4">
              <ThemedText variant="small" className="mb-2 font-semibold">
                Model *
              </ThemedText>
              <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
                <Ionicons name="speedometer" size={20} color={iconColor} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Fortuner"
                  placeholderTextColor={iconColor}
                  value={carForm.model}
                  onChangeText={(value) => handleInputChange('model', value)}
                />
              </View>
            </View>

            {/* Year and Color Row */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <ThemedText variant="small" className="mb-2 font-semibold">
                  Year *
                </ThemedText>
                <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
                  <Ionicons name="calendar" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3 text-base"
                    placeholder="2020"
                    placeholderTextColor={iconColor}
                    value={carForm.year}
                    onChangeText={(value) => handleInputChange('year', value)}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <View className="flex-1 ml-2">
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
            </View>

            {/* Registration Number */}
            <View className="mb-6">
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

            {/* Info Box */}
            <View className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#BD8C5E" className="mr-3" />
                <View className="flex-1 ml-3">
                  <ThemedText variant="small" className="font-semibold mb-1">
                    Why do we need this?
                  </ThemedText>
                  <ThemedText variant="tiny" className="text-textSecondary leading-4">
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
              <ThemedText variant="small" className="text-center text-textSecondary">
                I'll add this later
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}