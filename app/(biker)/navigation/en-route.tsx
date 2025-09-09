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

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  location: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  dropoffLocation: {
    name: string;
    address: string;
    vehicleInfo: string;
    customerName: string;
  };
  description: string;
  estimatedTime: number;
  earnings: number;
  nextPickup?: {
    name: string;
    distance: string;
    earnings: number;
  };
}

export default function EnRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { updateTaskStatus } = useTaskStore();
  
  const [eta, setEta] = useState(6);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.4419,
    longitude: -122.1430,
    address: 'Current Location'
  });

  // Mock driver data
  const driverInfo: DriverInfo = {
    id: requestId || '1',
    name: 'Marcus Rodriguez',
    phone: '+1 (555) 123-4567',
    location: {
      name: 'Caltrain Palo Alto',
      address: 'Platform 2, North End',
      coordinates: { latitude: 37.4439, longitude: -122.1647 }
    },
    dropoffLocation: {
      name: '123 Main St, Palo Alto',
      address: '123 Main St, Palo Alto',
      vehicleInfo: 'BMW X5 (Black) • ABC123',
      customerName: 'Sarah C.'
    },
    description: 'At platform 2, north entrance wearing dark suit and has black briefcase',
    estimatedTime: 8,
    earnings: 12.50,
    nextPickup: {
      name: 'Lisa M.',
      distance: '2.1 mi away',
      earnings: 9.75
    }
  };

  useEffect(() => {
    // Simulate real-time ETA updates
    const interval = setInterval(() => {
      setEta(prev => Math.max(1, prev - 0.1));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleCallDriver = () => {
    const phoneNumber = driverInfo.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSendMessage = () => {
    Alert.alert(
      'Send Message',
      'Quick message options for driver communication',
      [
        {
          text: 'On my way (6 min)',
          onPress: () => Alert.alert('Message Sent', 'Driver notified: "On my way, arriving in 6 minutes"')
        },
        {
          text: 'Traffic delay',
          onPress: () => Alert.alert('Message Sent', 'Driver notified: "Slight traffic delay, will be there soon"')
        },
        {
          text: 'Custom message',
          onPress: () => Alert.alert('Custom Message', 'Custom message feature coming soon!')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleTrafficInfo = () => {
    Alert.alert(
      'Traffic Information',
      'Current traffic conditions:\n\n• Light traffic on main route\n• No major delays expected\n• Alternative routes available\n• Road conditions: Good',
      [{ text: 'OK' }]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
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

  const handleArrivedAtPickup = () => {
    Alert.alert(
      'Arrived at Pickup?',
      'Have you arrived at the driver pickup location?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, I\'ve Arrived',
          onPress: () => {
            updateTaskStatus(driverInfo.id, 'arrived');
            router.push({
              pathname: '/(biker)/navigation/pickup-confirmation',
              params: { requestId: driverInfo.id }
            });
          }
        }
      ]
    );
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
              En Route to Pickup
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-success rounded-full mr-2" />
              <ThemedText variant="caption" className="text-success">
                Arriving in {Math.ceil(eta)} minutes
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={handleEmergency}>
            <Ionicons name="warning" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Map Section */}
        <View className="flex-1">
          <RouteMap
            pickupLocation={driverInfo.location.coordinates}
            dropoffLocation={driverInfo.dropoffLocation}
            currentLocation={currentLocation}
            eta={`${Math.ceil(eta)} min`}
            distance="0.8 mi away"
            mapHeight={300}
            showControls={true}
            onLocationUpdate={(location) => setCurrentLocation(location)}
          />
        </View>

        {/* Driver Information */}
        <View className="p-4">
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText className="font-bold text-lg">
                DRIVER: {driverInfo.name}
              </ThemedText>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={handleCallDriver}
                  className="w-10 h-10 bg-success rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSendMessage}
                  className="w-10 h-10 bg-info rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-3 bg-info/10 rounded-lg mb-3">
              <ThemedText className="text-info italic">
                "{driverInfo.description}"
              </ThemedText>
              <ThemedText variant="caption" className="text-info mt-1">
                1 min ago
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Drop-off Information */}
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-bold text-burgundy mb-2">
              🎯 DROP-OFF DESTINATION
            </ThemedText>
            <ThemedText className="font-semibold">
              {driverInfo.dropoffLocation.name}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {driverInfo.dropoffLocation.vehicleInfo}
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              Customer: {driverInfo.dropoffLocation.customerName}
            </ThemedText>
          </ThemedCard>

          {/* Trip Summary */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText variant="caption" className="text-secondary">
                  Total trip time
                </ThemedText>
                <ThemedText className="font-bold">
                  ~{driverInfo.estimatedTime} minutes
                </ThemedText>
              </View>
              <View>
                <ThemedText variant="caption" className="text-secondary">
                  Earnings
                </ThemedText>
                <ThemedText className="font-bold text-burgundy">
                  ₹{driverInfo.earnings.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Next Pickup Info */}
          {driverInfo.nextPickup && (
            <ThemedCard className="p-4 mb-4 bg-warning/10 border border-warning/20">
              <ThemedText className="font-semibold text-warning mb-1">
                Next pickup: {driverInfo.nextPickup.name} (after this)
              </ThemedText>
              <ThemedText variant="caption" className="text-warning">
                📍 {driverInfo.nextPickup.distance} • +₹{driverInfo.nextPickup.earnings.toFixed(2)}
              </ThemedText>
            </ThemedCard>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleTrafficInfo}
              className="flex-1 flex-row items-center justify-center py-3 border border-secondary rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="car" size={16} color="#bd8c5e" />
              <ThemedText className="text-secondary font-semibold ml-2">
                Traffic Info
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleEmergency}
              className="flex-1 flex-row items-center justify-center py-3 border border-danger rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="warning" size={16} color="#ef4444" />
              <ThemedText className="text-danger font-semibold ml-2">
                Emergency
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Arrived Button */}
          <TouchableOpacity
            onPress={handleArrivedAtPickup}
            className="w-full py-4 bg-success rounded-lg items-center"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <ThemedText className="text-white font-bold text-lg ml-2">
                I've Arrived at Pickup
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}