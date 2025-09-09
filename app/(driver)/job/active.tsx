import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { RouteMap } from '../../../components/driver/navigation/RouteMap';
import { useJobStore } from '../../../store/jobStore';
import { useEarningsStore } from '../../../store/earningsStore';
import { useAuthStore } from '../../../store/authStore';
import { ActiveJob, Location } from '../../../types/navigation';

export default function ActiveJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { 
    activeJob, 
    updateJobStatus, 
    updateCurrentLocation, 
    completeJob,
    cancelJob
  } = useJobStore();
  
  const { addJobEarnings } = useEarningsStore();
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [rideStartTime, setRideStartTime] = useState<Date | null>(null);
  const [rideDuration, setRideDuration] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Check if we have an activeJob, if not redirect back
    const currentActiveJob = useJobStore.getState().activeJob;
    if (!currentActiveJob) {
      router.back();
      return;
    }
    
    // Only update status if it's not already started
    if (currentActiveJob.status !== 'started') {
      updateJobStatus('started');
    }
    
    setRideStartTime(new Date());
    const timer = startRideTimer();
    const tracking = startLocationTracking();
    
    return () => {
      if (timer) clearInterval(timer);
      if (tracking) clearInterval(tracking);
    };
  }, []); // Empty dependency array to run only once

  const startRideTimer = () => {
    const interval = setInterval(() => {
      setRideDuration(prev => prev + 1);
    }, 1000);

    return interval;
  };

  const startLocationTracking = () => {
    // Mock location tracking
    const interval = setInterval(() => {
      const mockLocation: Location = {
        latitude: 28.4595 + (Math.random() - 0.5) * 0.01,
        longitude: 77.0266 + (Math.random() - 0.5) * 0.01,
        address: 'Current Location'
      };
      
      setCurrentLocation(mockLocation);
      updateCurrentLocation(mockLocation);
    }, 5000);

    return interval;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride?',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Ride',
          onPress: showRatingDialog
        }
      ]
    );
  };

  const showRatingDialog = () => {
    // In a real app, you would show a proper rating dialog
    Alert.alert(
      'Rate Customer',
      'How was your experience with this customer?',
      [
        {
          text: '5 Stars',
          onPress: () => completeRideWithRating(5)
        },
        {
          text: '4 Stars',
          onPress: () => completeRideWithRating(4)
        },
        {
          text: '3 Stars',
          onPress: () => completeRideWithRating(3)
        },
        {
          text: 'Skip Rating',
          onPress: () => completeRideWithRating()
        }
      ]
    );
  };

  const completeRideWithRating = async (customerRating?: number) => {
    if (!activeJob) return;
    
    setIsCompleting(true);
    
    try {
      // Calculate trip details
      const actualDuration = Math.floor(rideDuration / 60); // Convert to minutes
      const actualDistance = Math.round(Math.random() * 5 + activeJob.estimatedDistance || 10);
      const tips = Math.floor(Math.random() * 200); // Random tips
      
      // Add earnings
      addJobEarnings(activeJob.fare, tips, actualDistance, actualDuration);
      
      // Complete the job
      completeJob(tips, customerRating);
      
      Alert.alert(
        'Ride Completed!',
        `Great job! You earned ₹${(activeJob.fare + tips).toLocaleString('en-IN')} for this trip.`,
        [
          {
            text: 'View Earnings',
            onPress: () => {
              router.replace('/(driver)/earnings');
            }
          },
          {
            text: 'Find Next Ride',
            onPress: () => {
              router.replace('/(driver)');
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to complete the ride. Please try again.');
      setIsCompleting(false);
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'What type of emergency assistance do you need?',
      [
        {
          text: 'Call Police',
          onPress: () => Linking.openURL('tel:100')
        },
        {
          text: 'Medical Emergency',
          onPress: () => Linking.openURL('tel:108')
        },
        {
          text: 'Support',
          onPress: () => Linking.openURL('tel:+911234567890')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    if (!activeJob?.customerPhone) return;
    
    const phoneNumber = activeJob.customerPhone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride?',
      'Are you sure you want to cancel this ride? This action cannot be undone.',
      [
        { text: 'No, Continue', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelJob('Cancelled by driver');
            router.replace('/(driver)');
          }
        }
      ]
    );
  };

  if (!activeJob) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>No active job found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-success rounded-full mr-2" />
            <View>
              <ThemedText variant="title" className="font-bold">
                Ride in Progress
              </ThemedText>
              <ThemedText variant="caption" className="text-success">
                Duration: {formatDuration(rideDuration)}
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

        {/* Map */}
        <View className="flex-1">
          <RouteMap
            pickupLocation={activeJob.pickupLocation}
            dropoffLocation={activeJob.dropoffLocation}
            currentLocation={currentLocation || undefined}
            route={activeJob.route}
            eta={activeJob.eta}
            mapHeight={350}
            showCurrentLocation={true}
            onLocationUpdate={updateCurrentLocation}
          />
        </View>

        {/* Trip Info */}
        <View className="p-4">
          {/* Customer Info Card */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                  <ThemedText className="font-bold text-secondary text-lg">
                    {activeJob.customerName.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="font-bold text-lg">
                    {activeJob.customerName}
                  </ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    In vehicle • {formatDuration(rideDuration)}
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
            
            <View className="flex-row justify-between items-center">
              <ThemedText className="text-burgundy font-bold text-xl">
                ₹{activeJob.fare.toLocaleString('en-IN')}
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary">
                Trip fare
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Destination Info */}
          {activeJob.dropoffLocation && (
            <ThemedCard className="p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="flag" size={16} color="#ef4444" />
                <ThemedText variant="caption" className="text-secondary uppercase font-semibold ml-2">
                  DESTINATION
                </ThemedText>
              </View>
              <ThemedText className="font-bold text-lg">
                {activeJob.dropoffLocation.name || activeJob.dropoffLocation.address}
              </ThemedText>
              {activeJob.dropoffLocation.name && (
                <ThemedText variant="caption" className="text-secondary">
                  {activeJob.dropoffLocation.address}
                </ThemedText>
              )}
            </ThemedCard>
          )}

          {/* Trip Stats */}
          <ThemedCard className="p-4 mb-4">
            <View className="flex-row justify-around">
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {formatDuration(rideDuration)}
                </ThemedText>
                <ThemedText variant="caption">Duration</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg">
                  {Math.round(Math.random() * 10 + 5)} km
                </ThemedText>
                <ThemedText variant="caption">Distance</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="font-bold text-lg text-burgundy">
                  ₹{activeJob.fare.toLocaleString('en-IN')}
                </ThemedText>
                <ThemedText variant="caption">Fare</ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCancelRide}
              className="flex-1 py-4 items-center border border-danger/30 rounded-lg"
              activeOpacity={0.7}
            >
              <ThemedText className="font-semibold text-danger">
                Cancel Ride
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCompleteRide}
              disabled={isCompleting}
              className={`flex-2 py-4 items-center rounded-lg ${
                isCompleting ? 'bg-gray-400' : 'bg-success'
              }`}
              style={{ flex: 2 }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={isCompleting ? "hourglass" : "checkmark-circle"} 
                  size={20} 
                  color="white" 
                />
                <ThemedText className="text-white font-semibold ml-2">
                  {isCompleting ? 'Completing...' : 'Complete Ride'}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Emergency Contact */}
          <TouchableOpacity
            onPress={handleEmergency}
            className="mt-3 py-3 items-center bg-danger/10 border border-danger/20 rounded-lg"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#ef4444" />
              <ThemedText className="text-danger font-semibold ml-2">
                Emergency Contact
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}