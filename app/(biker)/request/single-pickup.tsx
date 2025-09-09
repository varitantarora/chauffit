import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';

interface PickupRequest {
  id: string;
  driverName: string;
  driverRating: number;
  driverProfession: string;
  pickupLocation: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  dropoffLocation: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  distance: number;
  estimatedTime: number;
  payment: number;
  customerRide: {
    destination: string;
    vehicleType: string;
    vehicleModel: string;
  };
  driverNotes?: string;
  driverPhone: string;
  expiresAt: Date;
}

export default function SinglePickupRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { acceptTask, declineTask } = useTaskStore();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);

  // Mock data - in real app, fetch based on requestId
  const pickupRequest: PickupRequest = {
    id: requestId || '1',
    driverName: 'Raju R.',
    driverRating: 4.9,
    driverProfession: 'Professional Chauffeur',
    pickupLocation: {
      name: 'Caltrain Palo Alto',
      address: 'Platform 2, North End',
      coordinates: { latitude: 37.4439, longitude: -122.1647 }
    },
    dropoffLocation: {
      name: '123 Main St',
      address: 'Palo Alto (BMW X5 location)',
      coordinates: { latitude: 37.4419, longitude: -122.1430 }
    },
    distance: 2.3,
    estimatedTime: 8,
    payment: 12.50,
    customerRide: {
      destination: 'SF Financial District',
      vehicleType: 'Premium BMW X5',
      vehicleModel: 'BMW X5'
    },
    driverNotes: 'Please meet at north entrance',
    driverPhone: '+1 (555) 123-4567',
    expiresAt: new Date(Date.now() + 60000) // 1 minute for demo
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(pickupRequest.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        Alert.alert(
          'Request Expired',
          'This pickup request has expired.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      acceptTask(pickupRequest.id, 'driver_pickup');
      
      Alert.alert(
        'Pickup Accepted!',
        'You have accepted this pickup request. Navigate to the driver location.',
        [
          {
            text: 'Start Navigation',
            onPress: () => router.push({
              pathname: '/(biker)/navigation/en-route',
              params: { requestId: pickupRequest.id }
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to accept pickup request. Please try again.');
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Pickup?',
      'Are you sure you want to decline this pickup request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            declineTask(pickupRequest.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleCallDriver = () => {
    const phoneNumber = pickupRequest.driverPhone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewRoute = () => {
    const pickup = pickupRequest.pickupLocation.coordinates;
    const dropoff = pickupRequest.dropoffLocation.coordinates;
    
    Alert.alert(
      'Open Navigation App',
      'Choose your preferred navigation app to view the route',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = `https://www.google.com/maps/dir/${pickup.latitude},${pickup.longitude}/${dropoff.latitude},${dropoff.longitude}`;
            Linking.openURL(url);
          }
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `maps://app?saddr=${pickup.latitude},${pickup.longitude}&daddr=${dropoff.latitude},${dropoff.longitude}`;
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
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
              Pickup Request
            </ThemedText>
            <View className="bg-danger/10 px-3 py-1 rounded-full">
              <ThemedText className="text-danger font-bold text-sm">
                Expires in {formatTime(timeLeft)}
              </ThemedText>
            </View>
          </View>
          <View className="w-6" />
        </View>

        <View className="flex-1 p-6">
          {/* Driver Information */}
          <ThemedCard className="p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                  <ThemedText className="font-bold text-secondary text-lg">
                    {pickupRequest.driverName.charAt(0)}
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-bold text-lg">
                    Driver: {pickupRequest.driverName} (⭐ {pickupRequest.driverRating})
                  </ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    {pickupRequest.driverProfession}
                  </ThemedText>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={handleCallDriver}
                className="w-10 h-10 bg-success rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Pickup Location */}
            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 bg-success rounded-full mr-2" />
                <ThemedText className="font-semibold text-success">PICKUP LOCATION</ThemedText>
              </View>
              <ThemedText className="font-bold text-lg">
                📍 {pickupRequest.pickupLocation.name}
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary">
                {pickupRequest.pickupLocation.address}
              </ThemedText>
            </View>

            {/* Drop-off Location */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 border-2 border-danger rounded-full mr-2" />
                <ThemedText className="font-semibold text-danger">DROP-OFF LOCATION</ThemedText>
              </View>
              <ThemedText className="font-bold text-lg">
                🎯 {pickupRequest.dropoffLocation.name}
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary">
                {pickupRequest.dropoffLocation.address}
              </ThemedText>
            </View>

            {/* Trip Details */}
            <View className="flex-row justify-between items-center mb-4 p-3 bg-surface dark:bg-darkSurface rounded-lg">
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {pickupRequest.distance} miles
                </ThemedText>
                <ThemedText variant="caption">Distance</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {pickupRequest.estimatedTime} min
                </ThemedText>
                <ThemedText variant="caption">Est. time</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg text-burgundy">
                  ₹{pickupRequest.payment.toFixed(2)}
                </ThemedText>
                <ThemedText variant="caption">Payment + tips</ThemedText>
              </View>
            </View>

            {/* Customer Ride Info */}
            <View className="p-3 bg-warning/10 rounded-lg">
              <ThemedText className="font-semibold text-warning mb-1">
                🚗 Customer ride: {pickupRequest.customerRide.destination}
              </ThemedText>
              <ThemedText variant="caption" className="text-warning">
                ({pickupRequest.customerRide.vehicleType} service)
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Driver Notes */}
          {pickupRequest.driverNotes && (
            <ThemedCard className="p-4 mb-6 bg-info/10 border border-info/20">
              <ThemedText className="font-semibold mb-2">Driver notes:</ThemedText>
              <ThemedText className="text-info italic">
                "{pickupRequest.driverNotes}"
              </ThemedText>
            </ThemedCard>
          )}

          {/* Contact Available */}
          <View className="items-center mb-6">
            <View className="flex-row items-center">
              <Ionicons name="phone-portrait" size={16} color="#10b981" />
              <ThemedText className="text-success font-semibold ml-2">
                📱 Driver contact available
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleDecline}
              className="flex-1 py-4 items-center border border-danger/30 rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="font-semibold text-danger">
                ❌ DECLINE
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAccept}
              disabled={isAccepting || timeLeft === 0}
              className={`flex-2 py-4 items-center rounded-lg ${
                isAccepting || timeLeft === 0 
                  ? 'bg-gray-400' 
                  : 'bg-success'
              }`}
              style={{ flex: 2 }}
              activeOpacity={0.7}
            >
              <ThemedText className="font-semibold text-white">
                {isAccepting ? 'Accepting...' : '✅ ACCEPT'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleViewRoute}
            className="py-3 items-center bg-secondary/20 border border-secondary rounded-lg"
            activeOpacity={0.7}
          >
            <ThemedText className="text-secondary font-semibold">
              🗺️ View Route
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}