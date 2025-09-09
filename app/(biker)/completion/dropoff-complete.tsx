import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';
import * as ImagePicker from 'expo-image-picker';

export default function DropoffCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  const earnings = parseFloat(params.earnings as string) || 15.50;
  const tips = parseFloat(params.tips as string) || 3.00;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { completeTask } = useTaskStore();
  
  const [rating, setRating] = useState(5);
  const [dropoffPhoto, setDropoffPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tripSummary = {
    driverName: 'Marcus Rodriguez',
    deliveredTo: '123 Main St',
    vehicleInfo: 'BMW X5 (ABC123)',
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    distance: 2.3,
    duration: 8,
    basePay: earnings - tips,
    driverTip: tips,
    totalEarned: earnings,
    nextPickup: {
      name: 'Lisa M.',
      distance: '2.1 mi away'
    }
  };

  const takeDropoffPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take drop-off photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDropoffPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleContinueToNext = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      completeTask(requestId, { rating, dropoffPhoto });
      
      Alert.alert(
        'Great Job!',
        'Moving to next pickup location.',
        [
          {
            text: 'Navigate to Lisa M.',
            onPress: () => router.push({
              pathname: '/(biker)/navigation/en-route',
              params: { requestId: 'next_pickup_2' }
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to proceed to next pickup. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end your pickup session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          onPress: () => {
            completeTask(requestId, { rating, dropoffPhoto });
            router.replace('/(biker)');
          }
        }
      ]
    );
  };

  const handleTakeBreak = () => {
    Alert.alert(
      'Take a Break?',
      'You can pause for a few minutes before continuing to the next pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Break',
          onPress: () => {
            completeTask(requestId, { rating, dropoffPhoto });
            Alert.alert('Break Time', 'Take your time! When ready, you can continue with the next pickup.', [
              { text: 'OK', onPress: () => router.replace('/(biker)') }
            ]);
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
          <ThemedText variant="title" className="font-bold">
            Drop-off Complete
          </ThemedText>
          <View className="w-6" />
        </View>

        <View className="flex-1 p-6">
          {/* Success Message */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-success rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
            <ThemedText className="text-2xl font-bold text-success mb-2">
              ✅ {tripSummary.driverName} transported successfully
            </ThemedText>
          </View>

          {/* Pickup Completion */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-bold text-lg text-center mb-4">
              PICKUP COMPLETION
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText>Driver:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.driverName}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Transported to:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.deliveredTo}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Vehicle:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.vehicleInfo}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Time:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.time}</ThemedText>
              </View>
            </View>

            {/* Drop-off Photo Section */}
            <View className="mt-4 p-3 bg-surface dark:bg-darkSurface rounded-lg">
              {dropoffPhoto ? (
                <View className="items-center">
                  <Image 
                    source={{ uri: dropoffPhoto }} 
                    className="w-full h-32 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="text-success ml-2">📷 Completion photo taken</ThemedText>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={takeDropoffPhoto}
                  className="items-center py-4"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={32} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <ThemedText className="text-secondary font-semibold mt-2">
                    Take Completion Photo
                  </ThemedText>
                  <ThemedText variant="caption" className="text-secondary text-center">
                    Document successful transport
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View className="mt-3 space-y-1">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText className="text-success ml-2">✅ Customer notified</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText className="text-success ml-2">✅ Transport completed</ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Trip Summary */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-bold text-lg text-center mb-4">
              TRIP SUMMARY
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText>Distance:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.distance} miles</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Duration:</ThemedText>
                <ThemedText className="font-semibold">{tripSummary.duration} minutes</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Base pay:</ThemedText>
                <ThemedText className="font-semibold">₹{tripSummary.basePay.toFixed(2)}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Driver tip:</ThemedText>
                <ThemedText className="font-semibold text-success">+₹{tripSummary.driverTip.toFixed(2)}</ThemedText>
              </View>
              
              <View className="border-t border-border dark:border-darkBorder pt-3">
                <View className="flex-row justify-between">
                  <ThemedText className="font-bold text-lg">TOTAL EARNED:</ThemedText>
                  <ThemedText className="font-bold text-lg text-burgundy">
                    ₹{tripSummary.totalEarned.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
              
              <View className="flex-row items-center justify-center mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText className="text-success ml-2">✅ Payment processed</ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Rating Section */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-semibold text-center mb-4">
              Rate this pickup experience:
            </ThemedText>
            
            <View className="flex-row justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ThemedCard>
        </View>

        {/* Bottom Actions */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          {/* Next Pickup Button */}
          {tripSummary.nextPickup && (
            <TouchableOpacity
              onPress={handleContinueToNext}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg items-center mb-4 ${
                isProcessing ? 'bg-gray-400' : 'bg-burgundy'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={isProcessing ? "hourglass" : "arrow-forward-circle"} 
                  size={20} 
                  color="white" 
                />
                <ThemedText className="text-white font-bold text-lg ml-2">
                  {isProcessing 
                    ? 'Processing...' 
                    : `CONTINUE TO NEXT PICKUP`
                  }
                </ThemedText>
              </View>
              {tripSummary.nextPickup && !isProcessing && (
                <ThemedText className="text-white/80 text-sm">
                  {tripSummary.nextPickup.name} • {tripSummary.nextPickup.distance}
                </ThemedText>
              )}
            </TouchableOpacity>
          )}

          {/* Secondary Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleEndSession}
              className="flex-1 py-3 items-center bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="stop-circle" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                <ThemedText className="font-semibold ml-2">End Session</ThemedText>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleTakeBreak}
              className="flex-1 py-3 items-center bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-lg"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="cafe" size={16} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                <ThemedText className="font-semibold ml-2">Take Break</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}