import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';

interface BatchDriver {
  id: string;
  name: string;
  vehicle: {
    model: string;
    location: string;
  };
  pickup: {
    location: string;
    coordinates: { latitude: number; longitude: number };
  };
  payment: number;
}

interface BatchPickupRequest {
  id: string;
  totalDrivers: number;
  drivers: BatchDriver[];
  summary: {
    totalDistance: number;
    totalTime: number;
    totalEarnings: number;
    efficiencyBonus: number;
    totalPayout: number;
  };
  routeOptimized: boolean;
  driversContacted: boolean;
  expiresAt: Date;
}

export default function BatchPickupRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { acceptTask, declineTask } = useTaskStore();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);

  // Mock batch pickup data
  const batchRequest: BatchPickupRequest = {
    id: requestId || 'batch_1',
    totalDrivers: 3,
    drivers: [
      {
        id: '1',
        name: 'Marcus R.',
        vehicle: { model: 'BMW X5', location: 'Palo Alto' },
        pickup: { 
          location: 'Caltrain',
          coordinates: { latitude: 37.4439, longitude: -122.1647 }
        },
        payment: 12.50
      },
      {
        id: '2',
        name: 'Lisa M.',
        vehicle: { model: 'Tesla S', location: 'Menlo Park' },
        pickup: { 
          location: 'Shopping Center',
          coordinates: { latitude: 37.4419, longitude: -122.1838 }
        },
        payment: 9.75
      },
      {
        id: '3',
        name: 'David K.',
        vehicle: { model: 'Mercedes', location: 'Atherton' },
        pickup: { 
          location: 'Residence',
          coordinates: { latitude: 37.4688, longitude: -122.1956 }
        },
        payment: 15.25
      }
    ],
    summary: {
      totalDistance: 11.2,
      totalTime: 28,
      totalEarnings: 37.50,
      efficiencyBonus: 7.50,
      totalPayout: 45.00
    },
    routeOptimized: true,
    driversContacted: true,
    expiresAt: new Date(Date.now() + 90000) // 1.5 minutes for demo
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(batchRequest.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        Alert.alert(
          'Request Expired',
          'This batch pickup request has expired.',
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

  const handleAcceptBatch = async () => {
    setIsAccepting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      acceptTask(batchRequest.id, 'batch_pickup');
      
      Alert.alert(
        'Batch Accepted!',
        'You have accepted this batch pickup request. Navigate to the first driver location.',
        [
          {
            text: 'Start Batch Navigation',
            onPress: () => router.push({
              pathname: '/(biker)/navigation/batch-progress',
              params: { batchId: batchRequest.id }
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to accept batch request. Please try again.');
      setIsAccepting(false);
    }
  };

  const handleDeclineBatch = () => {
    Alert.alert(
      'Decline Batch?',
      'Are you sure you want to decline this batch pickup request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            declineTask(batchRequest.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleViewRoute = () => {
    Alert.alert(
      'Open Route in Maps',
      'This will show the optimized route for all 3 pickups',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            // Create waypoints for batch route
            const waypoints = batchRequest.drivers
              .map(driver => `${driver.pickup.coordinates.latitude},${driver.pickup.coordinates.longitude}`)
              .join('|');
            const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints}`;
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleContactDrivers = () => {
    Alert.alert(
      'Contact Drivers',
      'This will open the batch communication panel to message all drivers.',
      [
        {
          text: 'Open Communication',
          onPress: () => {
            // In real app, open communication screen
            Alert.alert('Communication', 'Batch communication feature coming soon!');
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
              Batch Pickup Request
            </ThemedText>
            <View className="bg-danger/10 px-3 py-1 rounded-full">
              <ThemedText className="text-danger font-bold text-sm">
                Expires in {formatTime(timeLeft)}
              </ThemedText>
            </View>
          </View>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Batch Overview */}
            <ThemedCard className="p-4 mb-6 bg-burgundy/5 border border-burgundy/20">
              <ThemedText className="font-bold text-burgundy text-lg mb-2">
                {batchRequest.totalDrivers} drivers need pickup in your area
              </ThemedText>
              <ThemedText className="text-burgundy">
                Efficient route planned
              </ThemedText>
            </ThemedCard>

            {/* Driver List */}
            <View className="mb-6">
              <ThemedText className="font-bold text-lg mb-4">Pickup Details</ThemedText>
              
              {batchRequest.drivers.map((driver, index) => (
                <ThemedCard key={driver.id} className="p-4 mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 bg-burgundy rounded-full items-center justify-center mr-3">
                        <ThemedText className="text-white font-bold">
                          {index + 1}
                        </ThemedText>
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-bold">
                          {driver.name} → {driver.vehicle.model} ({driver.vehicle.location})
                        </ThemedText>
                        <ThemedText variant="secondary" className="text-sm">
                          📍 {driver.pickup.location} • 💰 ₹{driver.payment.toFixed(2)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </ThemedCard>
              ))}
            </View>

            {/* Batch Summary */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold text-lg text-center mb-4">
                BATCH SUMMARY
              </ThemedText>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <ThemedText>Total distance:</ThemedText>
                  <ThemedText className="font-semibold">
                    {batchRequest.summary.totalDistance} miles
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between">
                  <ThemedText>Total time:</ThemedText>
                  <ThemedText className="font-semibold">
                    ~{batchRequest.summary.totalTime} minutes
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between">
                  <ThemedText>Total earnings:</ThemedText>
                  <ThemedText className="font-semibold">
                    ₹{batchRequest.summary.totalEarnings.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View className="flex-row justify-between">
                  <ThemedText>Efficiency bonus:</ThemedText>
                  <ThemedText className="font-semibold text-success">
                    +₹{batchRequest.summary.efficiencyBonus.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View className="border-t border-border dark:border-darkBorder pt-3">
                  <View className="flex-row justify-between">
                    <ThemedText className="font-bold text-lg">TOTAL PAYOUT:</ThemedText>
                    <ThemedText className="font-bold text-lg text-burgundy">
                      ₹{batchRequest.summary.totalPayout.toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>

            {/* Status Indicators */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons 
                  name={batchRequest.routeOptimized ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={batchRequest.routeOptimized ? "#10b981" : "#ef4444"} 
                />
                <ThemedText className={`font-semibold ml-2 ${
                  batchRequest.routeOptimized ? 'text-success' : 'text-danger'
                }`}>
                  Route optimization: {batchRequest.routeOptimized ? 'Efficient' : 'Not optimized'}
                </ThemedText>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons 
                  name={batchRequest.driversContacted ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={batchRequest.driversContacted ? "#10b981" : "#ef4444"} 
                />
                <ThemedText className={`font-semibold ml-2 ${
                  batchRequest.driversContacted ? 'text-success' : 'text-danger'
                }`}>
                  All drivers contacted: {batchRequest.driversContacted ? 'Confirmed' : 'Pending'}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleDeclineBatch}
              className="flex-1 py-4 items-center border border-danger/30 rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="font-semibold text-danger">
                ❌ DECLINE BATCH
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAcceptBatch}
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
                {isAccepting ? 'Accepting...' : '✅ ACCEPT BATCH'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleViewRoute}
              className="flex-1 py-3 items-center bg-secondary/20 border border-secondary rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="text-secondary font-semibold">
                🗺️ View Route
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleContactDrivers}
              className="flex-1 py-3 items-center bg-info/20 border border-info rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="text-info font-semibold">
                📞 Drivers
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}