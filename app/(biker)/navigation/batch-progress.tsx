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

interface BatchPickup {
  id: string;
  driverName: string;
  vehicle: string;
  location: string;
  earnings: number;
  status: 'completed' | 'current' | 'pending';
  eta?: number;
}

interface BatchProgress {
  id: string;
  currentPickup: number;
  totalPickups: number;
  pickups: BatchPickup[];
  earnedSoFar: number;
  remaining: number;
  totalValue: number;
  progressPercentage: number;
}

export default function BatchProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const batchId = params.batchId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { updateTaskStatus } = useTaskStore();
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.4419,
    longitude: -122.1838,
    address: 'Current Location'
  });

  // Mock batch data
  const batchProgress: BatchProgress = {
    id: batchId || 'batch_1',
    currentPickup: 2,
    totalPickups: 3,
    pickups: [
      {
        id: '1',
        driverName: 'Marcus R.',
        vehicle: 'BMW X5',
        location: 'Caltrain',
        earnings: 15.50,
        status: 'completed'
      },
      {
        id: '2',
        driverName: 'Lisa M.',
        vehicle: 'Tesla Model S',
        location: 'Shopping Center',
        earnings: 9.75,
        status: 'current',
        eta: 6
      },
      {
        id: '3',
        driverName: 'David K.',
        vehicle: 'Mercedes',
        location: 'Residence',
        earnings: 15.25,
        status: 'pending'
      }
    ],
    earnedSoFar: 15.50,
    remaining: 25.00,
    totalValue: 45.00,
    progressPercentage: 33
  };

  const currentPickupData = batchProgress.pickups.find(p => p.status === 'current');
  const nextPickup = batchProgress.pickups.find(p => p.status === 'pending');

  const handleContactDriver = () => {
    if (!currentPickupData) return;
    
    Alert.alert(
      'Contact Driver',
      `Contact ${currentPickupData.driverName}?`,
      [
        {
          text: 'Call Driver',
          onPress: () => Linking.openURL('tel:+1234567890')
        },
        {
          text: 'Send Message',
          onPress: () => Alert.alert('Message Sent', `Message sent to ${currentPickupData.driverName}`)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleNavigate = () => {
    if (!currentPickupData) return;
    
    Alert.alert(
      'Open Navigation',
      `Navigate to ${currentPickupData.location}?`,
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = 'https://www.google.com/maps/dir/?api=1&destination=Shopping+Center+Menlo+Park';
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleArrivedAtPickup = () => {
    if (!currentPickupData) return;
    
    Alert.alert(
      'Arrived at Pickup?',
      `Have you arrived to pick up ${currentPickupData.driverName}?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, I\'ve Arrived',
          onPress: () => {
            router.push({
              pathname: '/(biker)/navigation/pickup-confirmation',
              params: { requestId: currentPickupData.id }
            });
          }
        }
      ]
    );
  };

  const handleCancelBatch = () => {
    Alert.alert(
      'Cancel Batch?',
      'Are you sure you want to cancel the remaining pickups in this batch? You will still be paid for completed pickups.',
      [
        { text: 'Continue Batch', style: 'cancel' },
        {
          text: 'Cancel Batch',
          style: 'destructive',
          onPress: () => {
            updateTaskStatus(batchProgress.id, 'cancelled');
            router.replace('/(biker)');
          }
        }
      ]
    );
  };

  const handleTakeBreak = () => {
    Alert.alert(
      'Take Break After This?',
      'You can take a break after completing the current pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Break After This',
          onPress: () => Alert.alert('Break Scheduled', 'You will be prompted to take a break after this pickup.')
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
              Batch Progress ({batchProgress.currentPickup} of {batchProgress.totalPickups})
            </ThemedText>
            <ThemedText variant="caption" className="text-success">
              {currentPickupData?.eta && `ETA: ${currentPickupData.eta} minutes`}
            </ThemedText>
          </View>
          <View className="w-6" />
        </View>

        {/* Completed Status */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center p-3 bg-success/10 rounded-lg">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <ThemedText className="text-success font-semibold ml-2">
              ✅ {batchProgress.pickups[0].driverName} → {batchProgress.pickups[0].vehicle} • ₹{batchProgress.pickups[0].earnings.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        {/* Current Pickup */}
        {currentPickupData && (
          <View className="px-6 pt-4">
            <ThemedText className="font-bold text-lg mb-3">
              📍 NEXT: {currentPickupData.driverName} → {currentPickupData.vehicle}
            </ThemedText>
          </View>
        )}

        {/* Map Section */}
        <View className="flex-1 px-6">
          <RouteMap
            pickupLocation={currentLocation}
            dropoffLocation={{ latitude: 37.4619, longitude: -122.1838, address: 'Shopping Center' }}
            currentLocation={currentLocation}
            eta={currentPickupData?.eta ? `${currentPickupData.eta} min` : undefined}
            distance="2.1 mi away"
            mapHeight={250}
            showControls={true}
            onLocationUpdate={(location) => setCurrentLocation(location)}
          />
        </View>

        {/* Batch Details */}
        <View className="p-6">
          {/* Remaining Pickups */}
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-bold mb-3">REMAINING PICKUPS:</ThemedText>
            
            <View className="space-y-3">
              {batchProgress.pickups.filter(p => p.status !== 'completed').map((pickup, index) => (
                <View key={pickup.id} className="flex-row items-center">
                  <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                    pickup.status === 'current' ? 'bg-warning' : 'bg-secondary/20'
                  }`}>
                    <ThemedText className={`text-sm font-bold ${
                      pickup.status === 'current' ? 'text-white' : 'text-secondary'
                    }`}>
                      {pickup.status === 'current' ? '⏳' : pickup.id}
                    </ThemedText>
                  </View>
                  
                  <View className="flex-1">
                    <ThemedText className="font-semibold">
                      {pickup.driverName} → {pickup.vehicle}
                    </ThemedText>
                    <ThemedText variant="caption" className="text-secondary">
                      📍 {pickup.location} • ₹{pickup.earnings.toFixed(2)}
                    </ThemedText>
                    {pickup.status === 'current' && pickup.eta && (
                      <ThemedText variant="caption" className="text-warning">
                        ETA: {pickup.eta} minutes
                      </ThemedText>
                    )}
                    {pickup.status === 'pending' && nextPickup?.id === pickup.id && (
                      <ThemedText variant="caption" className="text-secondary">
                        After current: +8 minutes
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ThemedCard>

          {/* Progress Summary */}
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-bold mb-3">BATCH PROGRESS:</ThemedText>
            
            <View className="mb-3">
              <View className="flex-row justify-between mb-2">
                <ThemedText>Progress:</ThemedText>
                <ThemedText className="font-bold">{batchProgress.progressPercentage}%</ThemedText>
              </View>
              <View className="w-full h-3 bg-surface dark:bg-darkSurface rounded-full overflow-hidden">
                <View 
                  className="h-full bg-burgundy rounded-full"
                  style={{ width: `${batchProgress.progressPercentage}%` }}
                />
              </View>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <ThemedText>Earned so far:</ThemedText>
                <ThemedText className="font-bold text-success">
                  ₹{batchProgress.earnedSoFar.toFixed(2)}
                </ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText>Remaining:</ThemedText>
                <ThemedText className="font-bold">
                  ₹{batchProgress.remaining.toFixed(2)} + bonus
                </ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText className="font-bold">Total batch value:</ThemedText>
                <ThemedText className="font-bold text-burgundy">
                  ₹{batchProgress.totalValue.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleContactDriver}
              className="flex-1 flex-row items-center justify-center py-3 border border-info rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#3b82f6" />
              <ThemedText className="text-info font-semibold ml-2">
                Contact {currentPickupData?.driverName?.split(' ')[0]}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNavigate}
              className="flex-1 flex-row items-center justify-center py-3 border border-secondary rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={16} color="#bd8c5e" />
              <ThemedText className="text-secondary font-semibold ml-2">
                Navigate
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            onPress={handleArrivedAtPickup}
            className="w-full py-4 bg-success rounded-lg items-center mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <ThemedText className="text-white font-bold text-lg ml-2">
                I've Arrived at Pickup
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCancelBatch}
              className="flex-1 py-3 items-center border border-danger rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="text-danger font-semibold">
                ⚠️ Cancel Batch
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleTakeBreak}
              className="flex-1 py-3 items-center border border-secondary rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="text-secondary font-semibold">
                ☕ After This
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}