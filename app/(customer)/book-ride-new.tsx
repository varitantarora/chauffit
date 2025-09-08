import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BookRideScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [pickupLocation, setPickupLocation] = useState('Current Location');
  const [destination, setDestination] = useState(params.destination as string || '');
  const [selectedVehicle, setSelectedVehicle] = useState('BMW X5 (Primary)');
  const [rideType, setRideType] = useState<'one-way' | 'round-trip' | 'hourly'>('one-way');
  const [scheduleTime, setScheduleTime] = useState('Now');
  const [showAmenities, setShowAmenities] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [estimatedFare, setEstimatedFare] = useState(750);
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-gray-200';

  const quickActions = [
    { icon: 'home', label: 'Home', address: '123 Main St, Delhi' },
    { icon: 'business', label: 'Work', address: '456 Office Plaza, Gurgaon' },
    { icon: 'airplane', label: 'Airport', address: 'IGI Airport Terminal 3' },
  ];

  const handleBooking = () => {
    if (!destination) {
      Alert.alert('Missing Information', 'Please enter a destination');
      return;
    }
    
    if (showAmenities) {
      setShowAmenities(false);
    } else {
      // Navigate to amenities selection
      setShowAmenities(true);
    }
  };

  const proceedToConfirmation = () => {
    router.push({
      pathname: '/(customer)/trip-insurance',
      params: { 
        pickup: pickupLocation,
        destination,
        vehicle: selectedVehicle,
        rideType,
        amenities: selectedAmenities.join(','),
        fare: estimatedFare
      }
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Book a Chauffeur</ThemedText>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Main Booking Card */}
            <ThemedCard variant="elevated" className="mb-4">
              {/* From Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">From</ThemedText>
                <TouchableOpacity className={`flex-row items-center p-3 rounded-xl border ${inputClass}`}>
                  <Ionicons name="location" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3"
                    placeholder="Pickup location"
                    value={pickupLocation}
                    onChangeText={setPickupLocation}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity>
                    <ThemedText variant="small" className="text-burgundy">Change</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* To Location */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">To</ThemedText>
                <TouchableOpacity className={`flex-row items-center p-3 rounded-xl border ${inputClass}`}>
                  <Ionicons name="navigate" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3"
                    placeholder="Select destination"
                    value={destination}
                    onChangeText={setDestination}
                    placeholderTextColor="#999"
                  />
                </TouchableOpacity>
              </View>

              {/* Vehicle Selection */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">Vehicle</ThemedText>
                <TouchableOpacity className={`flex-row items-center justify-between p-3 rounded-xl border ${inputClass}`}>
                  <View className="flex-row items-center">
                    <Ionicons name="car" size={20} color={iconColor} />
                    <ThemedText className="ml-3">{selectedVehicle}</ThemedText>
                  </View>
                  <TouchableOpacity>
                    <ThemedText variant="small" className="text-burgundy">Change</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* When */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">When</ThemedText>
                <View className="flex-row">
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-xl border mr-2 ${
                      scheduleTime === 'Now' ? 'bg-burgundy border-burgundy' : inputClass
                    }`}
                    onPress={() => setScheduleTime('Now')}
                  >
                    <ThemedText className={`text-center ${scheduleTime === 'Now' ? 'text-white' : ''}`}>
                      Now
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-xl border ${inputClass}`}
                    onPress={() => router.push('/(customer)/schedule')}
                  >
                    <ThemedText className="text-center">Schedule</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ride Type */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">Type</ThemedText>
                <View className="flex-row justify-between">
                  {[
                    { id: 'one-way', label: 'One-way' },
                    { id: 'round-trip', label: 'Round-trip' },
                    { id: 'hourly', label: 'Hourly' }
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setRideType(type.id as any)}
                      className={`flex-1 p-3 rounded-xl border mx-1 ${
                        rideType === type.id ? 'bg-burgundy border-burgundy' : inputClass
                      }`}
                    >
                      <ThemedText 
                        variant="small" 
                        className={`text-center ${rideType === type.id ? 'text-white' : ''}`}
                      >
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Additional Options */}
              <View className="flex-row justify-between mb-4">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={20} color={iconColor} />
                  <ThemedText variant="small" className="ml-2">Add Stop(s)</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => setShowAmenities(true)}
                >
                  <Ionicons name="options-outline" size={20} color={iconColor} />
                  <ThemedText variant="small" className="ml-2">Choose Amenities</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Fare Estimate */}
              <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mb-4">
                <View className="flex-row justify-between items-center">
                  <ThemedText variant="small">Fare Estimate</ThemedText>
                  <ThemedText variant="h3" className="text-burgundy">~₹{estimatedFare}</ThemedText>
                </View>
              </View>

              {/* Book Button */}
              <PrimaryButton
                title="BOOK NOW"
                onPress={handleBooking}
                className="w-full"
              />
            </ThemedCard>

            {/* Surge Pricing Alert */}
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl mb-4 flex-row items-center">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <ThemedText variant="small" className="ml-2 text-yellow-700 dark:text-yellow-400">
                Surge Pricing Active - 1.3x
              </ThemedText>
            </View>

            {/* Quick Actions */}
            <View className="mb-4">
              <ThemedText variant="h3" className="mb-3">Quick Actions</ThemedText>
              <View className="flex-row justify-between">
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setDestination(action.address)}
                    className="flex-1 mx-1"
                  >
                    <ThemedCard className="items-center py-3">
                      <Ionicons name={action.icon as any} size={24} color={iconColor} />
                      <ThemedText variant="small" className="mt-1">{action.label}</ThemedText>
                    </ThemedCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Upcoming Rides */}
            <ThemedCard className="mb-4">
              <ThemedText variant="h3" className="mb-3">📅 Upcoming Rides</ThemedText>
              <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <ThemedText variant="small" className="text-gray-600">Tomorrow 8:00 AM</ThemedText>
                <ThemedText>Home → Downtown Office</ThemedText>
                <View className="flex-row justify-between items-center mt-2">
                  <ThemedText variant="small" className="text-gray-600">
                    BMW X5 • Marcus R. (4.9⭐)
                  </ThemedText>
                  <TouchableOpacity>
                    <ThemedText variant="small" className="text-burgundy">Edit</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>

            {/* Recent Activity */}
            <View>
              <ThemedText variant="h3" className="mb-3">Recent Activity</ThemedText>
              <ThemedCard className="mb-2">
                <View className="flex-row justify-between">
                  <ThemedText variant="small">Yesterday • Home → Airport</ThemedText>
                  <ThemedText variant="small" className="text-gray-600">₹850</ThemedText>
                </View>
              </ThemedCard>
              <ThemedCard className="mb-2">
                <View className="flex-row justify-between">
                  <ThemedText variant="small">Monday • Work → Restaurant</ThemedText>
                  <ThemedText variant="small" className="text-gray-600">₹450</ThemedText>
                </View>
              </ThemedCard>
            </View>
          </View>
        </ScrollView>

        {/* Amenities Modal */}
        {showAmenities && (
          <AmenitiesModal
            isVisible={showAmenities}
            onClose={() => setShowAmenities(false)}
            onConfirm={(amenities) => {
              setSelectedAmenities(amenities);
              proceedToConfirmation();
            }}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// Amenities Modal Component
const AmenitiesModal = ({ isVisible, onClose, onConfirm, selectedAmenities, setSelectedAmenities }: any) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const amenities = {
    refreshments: [
      { id: 'water', label: 'Water Bottle', price: 10 },
      { id: 'cold-drinks', label: 'Cold Drinks', price: 25 },
      { id: 'snacks', label: 'Snacks/Chips', price: 30 },
      { id: 'fruits', label: 'Fresh Fruits', price: 40 },
    ],
    comfort: [
      { id: 'tissues', label: 'Tissues', price: 5 },
      { id: 'sanitizer', label: 'Hand Sanitizer', price: 10 },
      { id: 'wipes', label: 'Wet Wipes', price: 15 },
      { id: 'charger', label: 'Phone Charger', price: 20 },
    ],
    aromatherapy: [
      { id: 'lavender', label: 'Lavender Scent', price: 25 },
      { id: 'citrus', label: 'Citrus Fresh', price: 25 },
      { id: 'no-fragrance', label: 'No Fragrance', price: 0 },
    ],
    entertainment: [
      { id: 'spotify', label: 'Spotify Premium', price: 30 },
      { id: 'bluetooth', label: 'Bluetooth Audio', price: 0 },
      { id: 'newspaper', label: 'Newspaper/Magazine', price: 20 },
    ],
  };

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a: string) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(amenities).forEach((category) => {
      category.forEach((item) => {
        if (selectedAmenities.includes(item.id)) {
          total += item.price;
        }
      });
    });
    return total;
  };

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 flex-1 justify-end">
      <View className={`${isDarkMode ? 'bg-darkBackground' : 'bg-white'} rounded-t-3xl p-6 max-h-[80%]`}>
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="h2">Choose Amenities</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Refreshments */}
          <View className="mb-4">
            <ThemedText variant="h3" className="mb-2">💧 Refreshments</ThemedText>
            {amenities.refreshments.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleAmenity(item.id)}
                className="flex-row justify-between items-center py-3 border-b border-gray-200"
              >
                <View className="flex-row items-center">
                  <View className={`w-5 h-5 rounded border-2 mr-3 ${
                    selectedAmenities.includes(item.id) 
                      ? 'bg-burgundy border-burgundy' 
                      : 'border-gray-400'
                  }`}>
                    {selectedAmenities.includes(item.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <ThemedText>{item.label}</ThemedText>
                </View>
                <ThemedText variant="small">+₹{item.price}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Similar sections for comfort, aromatherapy, and entertainment */}
        </ScrollView>

        <View className="mt-4 pt-4 border-t border-gray-200">
          <View className="flex-row justify-between mb-4">
            <ThemedText variant="h3">Total Add-ons</ThemedText>
            <ThemedText variant="h3" className="text-burgundy">+₹{calculateTotal()}</ThemedText>
          </View>
          <PrimaryButton
            title="Save Preferences"
            onPress={() => onConfirm(selectedAmenities)}
          />
        </View>
      </View>
    </View>
  );
};