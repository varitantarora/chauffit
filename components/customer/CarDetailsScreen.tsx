import React, { useEffect, useMemo, useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../common/ThemedView';
import { ThemedText } from '../common/ThemedText';
import { PrimaryButton } from '../common/PrimaryButton';
import { SearchableDropdown } from '../common/SearchableDropdown';
import { useAuthStore } from '../../store/authStore';
import { useCarStore } from '../../store/carStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomerVehicleType } from '../../services/api/CustomerCarApiService';
import MetaApiService, { EnumOption } from '../../services/api/MetaApiService';
import { BrandColors } from '../../constants/Colors';
import { CAR_BRANDS, getModelsForBrand } from '../../constants/carBrandsData';

interface CarDetailsScreenProps {
  postSaveRoute?: string;
  allowSkip?: boolean;
}

const fallbackVehicleTypeOptions: { label: string; value: CustomerVehicleType }[] = [
  { label: 'Luxury Sedan', value: 'luxury_sedan' },
  { label: 'Executive SUV', value: 'executive_suv' },
  { label: 'Limousine', value: 'limousine' },
  { label: 'Mercedes Sprinter', value: 'mercedes_sprinter' },
];

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, ' ')
    .split(' ')
    .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(' ');

const extractVehicleTypeOptions = (
  data: Record<string, any> | undefined
): { label: string; value: CustomerVehicleType }[] => {
  if (!data || typeof data !== 'object') return [];

  let found: EnumOption[] | string[] | undefined;

  const visit = (value: any) => {
    if (!value || found) return;
    if (Array.isArray(value)) {
      found = value as EnumOption[] | string[];
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, child]) => {
        const normalized = key.toLowerCase();
        if (normalized.includes('customercar') && normalized.includes('vehicle_type')) {
          if (Array.isArray(child)) {
            found = child as EnumOption[] | string[];
            return;
          }
        }
        visit(child);
      });
    }
  };

  visit(data);

  if (!found) return [];

  return (found as EnumOption[] | string[])
    .map((item) => {
      if (typeof item === 'string') {
        return { value: item as CustomerVehicleType, label: toTitleCase(item) };
      }
      const value = (item.value || item.label || item.display || '') as CustomerVehicleType;
      if (!value) return null;
      const label = item.label || item.display || toTitleCase(value);
      return { value, label };
    })
    .filter((option): option is { label: string; value: CustomerVehicleType } => Boolean(option));
};

export default function CarDetailsScreen({ postSaveRoute, allowSkip = false }: CarDetailsScreenProps) {
  const params = useLocalSearchParams<{ carId?: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const addCar = useCarStore((state) => state.addCar);
  const updateCar = useCarStore((state) => state.updateCar);
  const getCarById = useCarStore((state) => state.getCarById);
  const loadUserCars = useCarStore((state) => state.loadUserCars);
  const router = useRouter();

  const existingCar = useMemo(() => (params.carId ? getCarById(params.carId) : undefined), [params.carId, getCarById]);
  const [loading, setLoading] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<{ label: string; value: CustomerVehicleType }[]>(
    fallbackVehicleTypeOptions
  );

  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    color: '',
    registrationNumber: '',
    vehicleType: 'luxury_sedan' as CustomerVehicleType,
    transmission: 'automatic' as 'manual' | 'automatic',
  });

  // Models available based on selected make
  const availableModels = useMemo(() => getModelsForBrand(carForm.make), [carForm.make]);

  useEffect(() => {
    if (!params.carId) return;
    if (existingCar) {
      setCarForm({
        make: existingCar.make,
        model: existingCar.model,
        color: existingCar.color,
        registrationNumber: existingCar.registrationNumber,
        vehicleType: (existingCar.vehicleType || 'luxury_sedan') as CustomerVehicleType,
        transmission: existingCar.transmission || 'automatic',
      });
      return;
    }

    loadUserCars('');
  }, [params.carId, existingCar, loadUserCars]);

  useEffect(() => {
    const loadVehicleTypes = async () => {
      const response = await MetaApiService.getEnums();
      if (!response.success || !response.data) return;

      const options = extractVehicleTypeOptions(response.data);
      if (options.length === 0) return;
      setVehicleOptions(options);
    };

    loadVehicleTypes();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setCarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMakeChange = (value: string) => {
    // When make changes, reset model
    setCarForm((prev) => ({ ...prev, make: value, model: '' }));
  };

  const handleSaveCar = async () => {
    const { make, model, color, registrationNumber, vehicleType, transmission } = carForm;

    if (!make || !model || !color || !registrationNumber || !vehicleType) {
      Alert.alert('Error', 'Please fill in all car details');
      return;
    }

    setLoading(true);

    try {
      if (params.carId) {
        await updateCar(params.carId, {
          make,
          model,
          color,
          registrationNumber: registrationNumber.toUpperCase(),
          transmission,
        });
      } else {
        await addCar({
          make,
          model,
          color,
          registrationNumber: registrationNumber.toUpperCase(),
          vehicleType,
          transmission,
        });
      }

      setLoading(false);

      if (postSaveRoute) {
        router.replace(postSaveRoute);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(customer)/(tabs)');
      }
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
        { text: 'Cancel', style: 'cancel' },
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
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color={iconColor} />
              </TouchableOpacity>
              <ThemedText variant="h2">{params.carId ? 'Edit Car' : 'Car Details'}</ThemedText>
            </View>

            {allowSkip && (
              <TouchableOpacity onPress={handleSkipStep}>
                <ThemedText variant="small" className="text-secondary">
                  Skip
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Welcome Message */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="car-sport" size={32} color={BrandColors.secondary} />
            </View>
            <ThemedText variant="h3" className="text-center mb-2">
              {params.carId ? 'Update Your Vehicle' : 'Add Your Vehicle'}
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary px-4">
              Your car details help chauffeurs identify your vehicle quickly.
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

            {/* Model - Searchable Dropdown */}
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

            <View className="mb-4">
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

            {!params.carId && (
              <View className="mb-6">
                <ThemedText variant="small" className="mb-2 font-semibold">
                  Vehicle Type *
                </ThemedText>
                <View className="flex-row flex-wrap">
                  {vehicleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleInputChange('vehicleType', option.value)}
                      className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
                        carForm.vehicleType === option.value
                          ? 'bg-burgundy border-burgundy'
                          : 'border-border dark:border-darkBorder'
                      }`}
                    >
                      <ThemedText className={carForm.vehicleType === option.value ? 'text-white' : ''}>
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <PrimaryButton
              title={params.carId ? 'Save Changes' : 'Save Car'}
              onPress={handleSaveCar}
              loading={loading}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
