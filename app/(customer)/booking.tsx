import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface Location {
  id: string;
  address: string;
  type: 'pickup' | 'stop' | 'destination';
}

export default function BookingScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', address: '', type: 'pickup' },
    { id: '2', address: '', type: 'destination' }
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const vehicles = [
    {
      id: '1',
      name: 'Executive Sedan',
      description: 'Perfect for business meetings and airport transfers',
      capacity: '1-3 passengers',
      price: 'From ₹1,500',
      features: ['Wi-Fi', 'Phone Charger', 'Water'],
      icon: 'car'
    },
    {
      id: '2',
      name: 'Luxury SUV',
      description: 'Spacious and comfortable for groups',
      capacity: '1-6 passengers',
      price: 'From ₹2,200',
      features: ['Wi-Fi', 'Phone Charger', 'Refreshments', 'Extra Space'],
      icon: 'car-sport'
    },
    {
      id: '3',
      name: 'Premium Van',
      description: 'Ideal for large groups and events',
      capacity: '7-14 passengers',
      price: 'From ₹2,800',
      features: ['Wi-Fi', 'Entertainment System', 'Refreshments', 'Luggage Space'],
      icon: 'bus'
    }
  ];

  const addStop = () => {
    if (locations.length < 5) {
      const newStop: Location = {
        id: Date.now().toString(),
        address: '',
        type: 'stop'
      };
      const newLocations = [...locations];
      newLocations.splice(-1, 0, newStop);
      setLocations(newLocations);
    }
  };

  const removeStop = (id: string) => {
    setLocations(locations.filter(location => location.id !== id));
  };

  const updateLocation = (id: string, address: string) => {
    setLocations(locations.map(location => 
      location.id === id ? { ...location, address } : location
    ));
  };

  const handleBookNow = () => {
    const pickup = locations.find(l => l.type === 'pickup')?.address;
    const destination = locations.find(l => l.type === 'destination')?.address;
    
    if (!pickup || !destination || !selectedVehicle) {
      Alert.alert('Missing Information', 'Please fill in pickup, destination, and select a vehicle.');
      return;
    }

    Alert.alert('Booking Confirmed!', 'Your chauffeur will arrive in 15-20 minutes.');
    router.back();
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'pickup': return 'location';
      case 'stop': return 'ellipse';
      case 'destination': return 'navigate';
      default: return 'location';
    }
  };

  const getLocationLabel = (type: string, index: number) => {
    switch (type) {
      case 'pickup': return 'Pickup Location';
      case 'stop': return `Stop ${index - 1}`;
      case 'destination': return 'Destination';
      default: return 'Location';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-border dark:border-darkBorder bg-white dark:bg-darkSurface">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#720C17" />
          </TouchableOpacity>
          <ThemedText variant="h2" className="ml-4">Book a Ride</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Location Inputs */}
          <View className="px-6 py-6">
            <ThemedText variant="h3" className="mb-4">Trip Details</ThemedText>
            
            {locations.map((location, index) => (
              <View key={location.id} className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons 
                    name={getLocationIcon(location.type) as any} 
                    size={20} 
                    color={location.type === 'pickup' ? '#10b981' : location.type === 'destination' ? '#ef4444' : '#bd8c5e'} 
                  />
                  <ThemedText variant="secondary" className="ml-2">
                    {getLocationLabel(location.type, index)}
                  </ThemedText>
                  {location.type === 'stop' && (
                    <TouchableOpacity 
                      onPress={() => removeStop(location.id)}
                      className="ml-auto"
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View className={`flex-row items-center px-4 py-3 rounded-xl border ${
                  isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
                }`}>
                  <TextInput
                    className={`flex-1 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                    placeholder={`Enter ${getLocationLabel(location.type, index).toLowerCase()}...`}
                    placeholderTextColor={iconColor}
                    value={location.address}
                    onChangeText={(text) => updateLocation(location.id, text)}
                  />
                </View>
                
                {/* Route connector */}
                {index < locations.length - 1 && (
                  <View className="ml-2 mt-2 mb-2">
                    <View className="w-0.5 h-6 bg-border dark:bg-darkBorder" />
                  </View>
                )}
              </View>
            ))}

            {/* Add Stop Button */}
            {locations.length < 5 && (
              <TouchableOpacity onPress={addStop} className="flex-row items-center mt-2">
                <Ionicons name="add-circle-outline" size={20} color="#720c17" />
                <ThemedText className="ml-2 text-secondary">Add a stop</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Vehicle Selection */}
          <View className="px-6 py-4">
            <ThemedText variant="h3" className="mb-4">Select Vehicle</ThemedText>
            
            {vehicles.map((vehicle) => (
              <TouchableOpacity 
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle.id)}
                className="mb-4"
              >
                <ThemedCard 
                  variant="premium" 
                  className={`${
                    selectedVehicle === vehicle.id ? 'border-2 border-secondary' : ''
                  }`}
                >
                  <View className="flex-row items-start">
                    <View className="bg-secondary/10 p-3 rounded-lg">
                      <Ionicons name={vehicle.icon as any} size={24} color="#BD8C5E" />
                    </View>
                    
                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <ThemedText variant="h3">{vehicle.name}</ThemedText>
                        <ThemedText className="font-bold text-secondary">{vehicle.price}</ThemedText>
                      </View>
                      
                      <ThemedText variant="small" className="mb-2">
                        {vehicle.description}
                      </ThemedText>
                      
                      <ThemedText variant="tiny" className="mb-2">
                        {vehicle.capacity}
                      </ThemedText>
                      
                      <View className="flex-row flex-wrap">
                        {vehicle.features.map((feature, index) => (
                          <View key={index} className="bg-secondary/10 px-2 py-1 rounded mr-2 mb-1">
                            <ThemedText className="text-secondary text-xs">{feature}</ThemedText>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    {selectedVehicle === vehicle.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#BD8C5E" />
                    )}
                  </View>
                </ThemedCard>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Instructions */}
          <View className="px-6 py-4">
            <ThemedText variant="h3" className="mb-4">Special Instructions</ThemedText>
            <View className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
            }`}>
              <TextInput
                className={`${isDarkMode ? 'text-darkText' : 'text-textPrimary'} min-h-[80px]`}
                placeholder="Any special requests or instructions for your chauffeur..."
                placeholderTextColor={iconColor}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-border dark:border-darkBorder">
          <PrimaryButton
            title="Book Now"
            onPress={handleBookNow}
          />
          <TouchableOpacity 
            onPress={() => router.push('/(customer)/schedule')}
            className="mt-3"
          >
            <View className="bg-secondary/10 border border-secondary py-4 rounded-xl">
              <ThemedText className="text-center font-semibold text-secondary">Schedule for Later</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}