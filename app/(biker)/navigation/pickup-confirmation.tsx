import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../../store/taskStore';

interface SafetyChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

interface DriverDetails {
  id: string;
  name: string;
  driverId: string;
  phone: string;
  photo: string;
  description: string;
  destination: {
    address: string;
    vehicleInfo: string;
    customerName: string;
  };
  estimatedTime: number;
  earnings: number;
}

export default function PickupConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { updateTaskStatus } = useTaskStore();
  
  const [safetyChecklist, setSafetyChecklist] = useState<SafetyChecklistItem[]>([
    { id: '1', label: 'Driver ID verified', checked: false, required: true },
    { id: '2', label: 'Helmet provided', checked: false, required: true },
    { id: '3', label: 'Safety briefing given', checked: false, required: true },
    { id: '4', label: 'Route confirmed', checked: false, required: true },
    { id: '5', label: 'Emergency contact shared', checked: false, required: true },
  ]);
  
  const [isStarting, setIsStarting] = useState(false);

  // Mock driver data
  const driverDetails: DriverDetails = {
    id: requestId || '1',
    name: 'Marcus Rodriguez',
    driverId: '#DR4521',
    phone: '+1 (555) 123-4567',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    description: 'Black suit, black briefcase',
    destination: {
      address: '123 Main St, Palo Alto',
      vehicleInfo: 'BMW X5 (Black) for Sarah C.',
      customerName: 'Sarah C.'
    },
    estimatedTime: 8,
    earnings: 12.50
  };

  const toggleChecklistItem = (id: string) => {
    setSafetyChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const allRequiredChecked = safetyChecklist
    .filter(item => item.required)
    .every(item => item.checked);

  const handleCallCustomer = () => {
    const destination = driverDetails.destination;
    Alert.alert(
      'Call Customer',
      `Call ${destination.customerName} to notify about driver pickup?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Customer',
          onPress: () => {
            // In real app, would call customer's number
            Alert.alert('Calling...', `Calling ${destination.customerName} at their registered number`);
          }
        }
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'What type of issue would you like to report?',
      [
        {
          text: 'Driver not found',
          onPress: () => handleNoShow()
        },
        {
          text: 'Safety concern',
          onPress: () => router.push('/(biker)/task/emergency')
        },
        {
          text: 'Wrong location',
          onPress: () => Alert.alert('Location Issue', 'Location correction feature coming soon!')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleNoShow = () => {
    Alert.alert(
      'Driver No-Show',
      'Driver not at pickup location? This will mark the pickup as unsuccessful.',
      [
        { text: 'Wait longer', style: 'cancel' },
        {
          text: 'Report No-Show',
          style: 'destructive',
          onPress: () => {
            updateTaskStatus(driverDetails.id, 'no_show');
            Alert.alert(
              'No-Show Reported',
              'The driver no-show has been reported. You will still receive partial compensation.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  const handleStartTransport = async () => {
    if (!allRequiredChecked) {
      Alert.alert(
        'Safety Check Required',
        'Please complete all safety checklist items before starting transport.'
      );
      return;
    }

    setIsStarting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateTaskStatus(driverDetails.id, 'transporting');
      
      Alert.alert(
        'Transport Started!',
        'Driver pickup confirmed. Navigate to destination now.',
        [
          {
            text: 'Start Navigation',
            onPress: () => router.push({
              pathname: '/(biker)/navigation/transporting',
              params: { requestId: driverDetails.id }
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start transport. Please try again.');
      setIsStarting(false);
    }
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
            Driver Pickup
          </ThemedText>
          <View className="w-6" />
        </View>

        <View className="flex-1 p-6">
          {/* Header Description */}
          <View className="mb-6">
            <ThemedText variant="title" className="text-xl font-bold mb-2">
              Confirm driver identity
            </ThemedText>
            <ThemedText variant="secondary">
              Verify driver details before starting transport
            </ThemedText>
          </View>

          {/* Driver Profile Card */}
          <ThemedCard className="p-4 mb-6">
            <View className="flex-row items-center mb-4">
              <Image 
                source={{ uri: driverDetails.photo }}
                className="w-16 h-16 rounded-full mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <ThemedText className="font-bold text-lg">
                  {driverDetails.name}
                </ThemedText>
                <ThemedText variant="secondary">
                  ID: {driverDetails.driverId}
                </ThemedText>
                <ThemedText variant="caption" className="text-secondary">
                  {driverDetails.description}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Safety Checklist */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-bold text-lg mb-4">
              SAFETY CHECKLIST:
            </ThemedText>
            
            <View className="space-y-3">
              {safetyChecklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleChecklistItem(item.id)}
                  className="flex-row items-center"
                  activeOpacity={0.7}
                >
                  <View className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${
                    item.checked 
                      ? 'bg-success border-success' 
                      : 'border-border dark:border-darkBorder'
                  }`}>
                    {item.checked && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <ThemedText className={`flex-1 ${item.checked ? 'text-success' : ''}`}>
                    {item.label}
                    {item.required && <ThemedText className="text-danger"> *</ThemedText>}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedCard>

          {/* Destination Confirmation */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-bold text-lg mb-3">
              DESTINATION CONFIRMATION:
            </ThemedText>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#720C17" />
                <ThemedText className="font-semibold ml-2">
                  🎯 {driverDetails.destination.address}
                </ThemedText>
              </View>
              
              <ThemedText variant="secondary" className="text-sm">
                {driverDetails.destination.vehicleInfo}
              </ThemedText>
              
              <View className="flex-row justify-between items-center mt-3 p-3 bg-surface dark:bg-darkSurface rounded-lg">
                <View>
                  <ThemedText variant="caption" className="text-secondary">
                    Estimated ride time
                  </ThemedText>
                  <ThemedText className="font-bold">
                    ⏱️ {driverDetails.estimatedTime} minutes
                  </ThemedText>
                </View>
                <View>
                  <ThemedText variant="caption" className="text-secondary">
                    This pickup
                  </ThemedText>
                  <ThemedText className="font-bold text-burgundy">
                    💰 ₹{driverDetails.earnings.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </ThemedCard>
        </View>

        {/* Bottom Actions */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          {/* Action Buttons Row */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 flex-row items-center justify-center py-3 border border-info rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#3b82f6" />
              <ThemedText className="text-info font-semibold ml-2">
                Call Customer
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleReportIssue}
              className="flex-1 flex-row items-center justify-center py-3 border border-warning rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="warning" size={16} color="#f59e0b" />
              <ThemedText className="text-warning font-semibold ml-2">
                Issue
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Start Transport Button */}
          <TouchableOpacity
            onPress={handleStartTransport}
            disabled={!allRequiredChecked || isStarting}
            className={`w-full py-4 rounded-lg items-center ${
              !allRequiredChecked || isStarting
                ? 'bg-gray-400' 
                : 'bg-success'
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isStarting ? "hourglass" : "play-circle"} 
                size={20} 
                color="white" 
              />
              <ThemedText className="text-white font-bold text-lg ml-2">
                {isStarting ? 'Starting...' : 'START TRANSPORT'}
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* No Show Link */}
          <TouchableOpacity 
            onPress={handleNoShow}
            className="mt-3 py-2 items-center"
            activeOpacity={0.7}
          >
            <ThemedText className="text-danger">
              Driver not here? Report No-Show
            </ThemedText>
          </TouchableOpacity>

          {!allRequiredChecked && (
            <ThemedText className="text-center text-secondary mt-2 text-sm">
              Complete all safety checks to continue
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}