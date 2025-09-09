import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { RouteMap } from '../../../components/driver/navigation/RouteMap';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';

interface TransportDetails {
  id: string;
  passengerName: string;
  destination: {
    address: string;
    vehicleInfo: string;
    coordinates: { latitude: number; longitude: number };
  };
  tripStats: {
    distance: number;
    duration: number;
    speed: number;
    traffic: string;
  };
  earnings: number;
  customerNotified: boolean;
  nextPickup?: {
    name: string;
    distance: string;
  };
}

export default function TransportingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { updateTaskStatus } = useTaskStore();
  const { addPickupEarnings } = useBikerEarningsStore();
  
  const [eta, setEta] = useState(4);
  const [tripProgress, setTripProgress] = useState({
    distanceCovered: 1.1,
    timeTaken: 4,
    currentSpeed: 35
  });
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.4429,
    longitude: -122.1538,
    address: 'Current Location'
  });
  const [isCompleting, setIsCompleting] = useState(false);

  // Mock transport data
  const transportDetails: TransportDetails = {
    id: requestId || '1',
    passengerName: 'Marcus Rodriguez',
    destination: {
      address: '123 Main St, Palo Alto',
      vehicleInfo: 'BMW X5 (Black) • ABC123',
      coordinates: { latitude: 37.4419, longitude: -122.1430 }
    },
    tripStats: {
      distance: 2.3,
      duration: 8,
      speed: 35,
      traffic: 'Light'
    },
    earnings: 12.50,
    customerNotified: true,
    nextPickup: {
      name: 'Lisa M.',
      distance: '2.1 mi'
    }
  };

  useEffect(() => {
    // Simulate real-time trip updates
    const interval = setInterval(() => {
      setEta(prev => Math.max(1, prev - 0.1));
      setTripProgress(prev => ({
        ...prev,
        distanceCovered: Math.min(transportDetails.tripStats.distance, prev.distanceCovered + 0.05),
        timeTaken: prev.timeTaken + 0.1
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleCallCustomer = () => {
    Alert.alert(
      'Call Customer',
      'Call the customer to provide arrival update?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Customer',
          onPress: () => {
            // In real app, would call customer's registered number
            Alert.alert('Calling...', 'Calling customer at their registered number');
          }
        }
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency SOS',
      'What type of emergency assistance do you need?',
      [
        {
          text: 'Call Emergency Services',
          onPress: () => Linking.openURL('tel:911')
        },
        {
          text: 'Contact Chauffit Support',
          onPress: () => Linking.openURL('tel:+1-800-SUPPORT')
        },
        {
          text: 'Report Safety Issue',
          onPress: () => router.push('/(biker)/task/emergency')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleViewRoute = () => {
    Alert.alert(
      'Route Options',
      'Choose route view option',
      [
        {
          text: 'Traffic Conditions',
          onPress: () => Alert.alert('Traffic', `Current conditions:\n\n• Speed: ${tripProgress.currentSpeed} mph\n• Traffic: ${transportDetails.tripStats.traffic}\n• Road conditions: Good\n• Alternative routes: 2 available`)
        },
        {
          text: 'Alternative Routes',
          onPress: () => Alert.alert('Routes', 'Alternative route suggestions:\n\n• Route A: +2 min, less traffic\n• Route B: +1 min, main road\n• Current route: Optimal')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCompleteDropoff = async () => {
    Alert.alert(
      'Complete Drop-off?',
      'Have you successfully delivered the driver to their destination?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setIsCompleting(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Add earnings
              const tips = Math.floor(Math.random() * 5) + 1; // Random tips 1-5
              addPickupEarnings(
                transportDetails.earnings,
                tips,
                Math.round(tripProgress.distanceCovered * 10) / 10,
                Math.round(tripProgress.timeTaken)
              );
              
              updateTaskStatus(transportDetails.id, 'completed');
              
              router.push({
                pathname: '/(biker)/completion/dropoff-complete',
                params: { 
                  requestId: transportDetails.id,
                  earnings: (transportDetails.earnings + tips).toString(),
                  tips: tips.toString()
                }
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to complete drop-off. Please try again.');
              setIsCompleting(false);
            }
          }
        }
      ]
    );
  };

  const progressPercentage = (tripProgress.distanceCovered / transportDetails.tripStats.distance) * 100;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-success rounded-full mr-2 animate-pulse" />
            <View>
              <ThemedText variant="title" className="font-bold">
                Transporting Driver
              </ThemedText>
              <ThemedText variant="caption" className="text-success">
                Arriving in {Math.ceil(eta)} minutes
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={handleEmergency}
            className="w-10 h-10 bg-danger rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="warning" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Map Section */}
        <View className="flex-1">
          <RouteMap
            pickupLocation={currentLocation}
            dropoffLocation={transportDetails.destination.coordinates}
            currentLocation={currentLocation}
            eta={`${Math.ceil(eta)} min`}
            distance={`${(transportDetails.tripStats.distance - tripProgress.distanceCovered).toFixed(1)} mi away`}
            mapHeight={350}
            showControls={true}
            onLocationUpdate={(location) => setCurrentLocation(location)}
          />
        </View>

        {/* Trip Information */}
        <View className="p-4">
          {/* Passenger Info */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
                  <ThemedText className="font-bold text-secondary text-lg">
                    {transportDetails.passengerName.charAt(0)}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText className="font-bold text-lg">
                    PASSENGER: {transportDetails.passengerName}
                  </ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    Professional & courteous
                  </ThemedText>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={handleCallCustomer}
                className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color="#bd8c5e" />
              </TouchableOpacity>
            </View>

            <View className="p-3 bg-success/10 rounded-lg">
              <View className="flex-row justify-between items-center">
                <ThemedText className="text-success font-semibold">
                  Trip status: Smooth riding
                </ThemedText>
                <View className="flex-row items-center">
                  <ThemedText className="text-success text-sm">
                    Speed: {tripProgress.currentSpeed} mph (safe)
                  </ThemedText>
                </View>
              </View>
              <ThemedText className="text-success text-sm mt-1">
                Traffic: {transportDetails.tripStats.traffic}
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Destination Info */}
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-bold text-burgundy mb-2">
              🎯 DESTINATION
            </ThemedText>
            <ThemedText className="font-semibold text-lg">
              {transportDetails.destination.address}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {transportDetails.destination.vehicleInfo}
            </ThemedText>
            
            {transportDetails.customerNotified && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText className="text-success text-sm ml-2">
                  📞 Customer notification sent
                </ThemedText>
              </View>
            )}
            <ThemedText variant="caption" className="text-success">
              "Driver arriving in {Math.ceil(eta)} minutes"
            </ThemedText>
          </ThemedCard>

          {/* Trip Progress */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <ThemedText className="font-bold">Trip Progress</ThemedText>
              <ThemedText className="text-burgundy font-bold">
                {Math.round(progressPercentage)}% Complete
              </ThemedText>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {Math.round(tripProgress.timeTaken)}/{transportDetails.tripStats.duration}
                </ThemedText>
                <ThemedText variant="caption">Trip time (min)</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {tripProgress.distanceCovered.toFixed(1)}/{transportDetails.tripStats.distance}
                </ThemedText>
                <ThemedText variant="caption">Distance (miles)</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg text-burgundy">
                  ₹{transportDetails.earnings.toFixed(2)}
                </ThemedText>
                <ThemedText variant="caption">Earning</ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Next Pickup Info */}
          {transportDetails.nextPickup && (
            <ThemedCard className="p-4 mb-4 bg-warning/10 border border-warning/20">
              <ThemedText className="font-semibold text-warning">
                Next: {transportDetails.nextPickup.name} pickup ({transportDetails.nextPickup.distance})
              </ThemedText>
            </ThemedCard>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleViewRoute}
              className="flex-1 flex-row items-center justify-center py-3 border border-secondary rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={16} color="#bd8c5e" />
              <ThemedText className="text-secondary font-semibold ml-2">
                Route
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 flex-row items-center justify-center py-3 border border-info rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#3b82f6" />
              <ThemedText className="text-info font-semibold ml-2">
                Customer
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleEmergency}
              className="flex-1 flex-row items-center justify-center py-3 border border-danger rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="warning" size={16} color="#ef4444" />
              <ThemedText className="text-danger font-semibold ml-2">
                SOS
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Complete Drop-off Button */}
          <TouchableOpacity
            onPress={handleCompleteDropoff}
            disabled={isCompleting}
            className={`w-full py-4 rounded-lg items-center ${
              isCompleting ? 'bg-gray-400' : 'bg-success'
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isCompleting ? "hourglass" : "checkmark-circle"} 
                size={20} 
                color="white" 
              />
              <ThemedText className="text-white font-bold text-lg ml-2">
                {isCompleting ? 'Completing...' : 'Complete Drop-off'}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}