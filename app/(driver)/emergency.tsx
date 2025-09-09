import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { useAuthStore } from '../../store/authStore';

export default function EmergencySOSScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [sosActivated, setSosActivated] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(false);

  useEffect(() => {
    if (sosActivated && !notificationsSent) {
      // Simulate sending notifications
      setTimeout(() => {
        setNotificationsSent(true);
      }, 1000);
    }
  }, [sosActivated, notificationsSent]);

  const handleEmergencyCall = (number: string, service: string) => {
    Alert.alert(
      `Call ${service}`,
      `Are you sure you want to call ${service} (${number})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${number}`);
            setSosActivated(true);
          }
        }
      ]
    );
  };

  const handleChaufitSupport = () => {
    // Mock call to support
    Alert.alert('Calling Chauffit Support', 'Connecting to 24/7 driver hotline...');
    setSosActivated(true);
  };

  const handleStopVehicle = () => {
    Alert.alert(
      'Stop Vehicle Safely',
      'Please pull over to a safe location immediately and turn on your hazard lights.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleSafeNow = () => {
    Alert.alert(
      'Confirm Safety',
      'Are you sure you are safe now? This will notify all emergency contacts that the situation has been resolved.',
      [
        { text: 'Still Need Help', style: 'cancel' },
        {
          text: 'I\'m Safe',
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Safety Confirmed',
              'All emergency contacts have been notified that you are safe. Emergency services have been informed to cancel the alert.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  const handleFalseAlarm = () => {
    Alert.alert(
      'False Alarm',
      'Are you sure this was a false alarm? This will cancel all emergency notifications.',
      [
        { text: 'Keep Active', style: 'cancel' },
        {
          text: 'Cancel Alert',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Alert Cancelled',
              'Emergency alert has been cancelled. All contacts have been notified.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="items-center py-6 bg-danger">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 top-6"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <Ionicons name="warning" size={48} color="white" />
            <ThemedText className="text-white text-xl font-bold mt-2">
              EMERGENCY SOS
            </ThemedText>
            <ThemedText className="text-white/90 text-center mt-1">
              IMMEDIATE HELP
            </ThemedText>
          </View>
        </View>

        <View className="flex-1 px-6 py-6">
          {/* Emergency Services */}
          <View className="space-y-4 mb-8">
            <TouchableOpacity
              onPress={() => handleEmergencyCall('100', 'Police')}
              activeOpacity={0.8}
            >
              <ThemedCard className="p-4 border-2 border-danger bg-danger/10">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-danger rounded-full items-center justify-center mr-4">
                    <Ionicons name="shield" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-lg">CALL EMERGENCY SERVICES</ThemedText>
                    <ThemedText className="text-danger">(Police: 100)</ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleEmergencyCall('108', 'Medical Emergency')}
              activeOpacity={0.8}
            >
              <ThemedCard className="p-4 border-2 border-danger bg-danger/10">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-danger rounded-full items-center justify-center mr-4">
                    <Ionicons name="medical" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-lg">MEDICAL EMERGENCY</ThemedText>
                    <ThemedText className="text-danger">(Ambulance: 108)</ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleEmergencyCall('101', 'Fire Emergency')}
              activeOpacity={0.8}
            >
              <ThemedCard className="p-4 border-2 border-danger bg-danger/10">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-danger rounded-full items-center justify-center mr-4">
                    <Ionicons name="flame" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-lg">FIRE EMERGENCY</ThemedText>
                    <ThemedText className="text-danger">(Fire: 101)</ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleChaufitSupport}
              activeOpacity={0.8}
            >
              <ThemedCard className="p-4 border-2 border-burgundy bg-burgundy/10">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-burgundy rounded-full items-center justify-center mr-4">
                    <Ionicons name="call" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-bold text-lg">CHAUFFIT EMERGENCY</ThemedText>
                    <ThemedText className="text-burgundy">(24/7 Driver Hotline)</ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </TouchableOpacity>
          </View>

          {/* Auto-Notifications Status */}
          {sosActivated && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="notifications" size={20} color="#10b981" />
                <ThemedText className="font-bold ml-2">AUTO-NOTIFICATIONS SENT:</ThemedText>
              </View>

              <ThemedCard className="p-4 bg-success/10 border border-success/20">
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="ml-2">Chauffit dispatch center</ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="ml-2">Customer in your vehicle</ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="ml-2">Nearest police station</ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="ml-2">Your emergency contact</ThemedText>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <ThemedText className="ml-2">Insurance provider</ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Location & Vehicle Info */}
          {sosActivated && (
            <View className="space-y-4 mb-6">
              <ThemedCard className="p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={20} color="#BD8C5E" />
                  <ThemedText className="font-bold ml-2">LOCATION SHARED:</ThemedText>
                </View>
                <ThemedText variant="caption" className="text-secondary">
                  GPS coordinates automatically sent to all emergency services and customer safety contacts
                </ThemedText>
              </ThemedCard>

              <ThemedCard className="p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="car" size={20} color="#BD8C5E" />
                  <ThemedText className="font-bold ml-2">VEHICLE INFO SHARED:</ThemedText>
                </View>
                <ThemedText variant="caption" className="text-secondary">
                  License plate, make, model sent to authorities for identification
                </ThemedText>
              </ThemedCard>

              <ThemedCard className="p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="videocam" size={20} color="#BD8C5E" />
                  <ThemedText className="font-bold ml-2">VIDEO EVIDENCE:</ThemedText>
                </View>
                <ThemedText variant="caption" className="text-secondary">
                  AI camera footage automatically saved and shared with authorities
                </ThemedText>
              </ThemedCard>
            </View>
          )}

          {/* Additional Actions */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleStopVehicle}
              className="bg-warning py-4 rounded-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="stop-circle" size={24} color="white" />
                <ThemedText className="text-white font-bold ml-2 text-lg">
                  STOP VEHICLE SAFELY
                </ThemedText>
              </View>
            </TouchableOpacity>

            {sosActivated && (
              <>
                <TouchableOpacity
                  onPress={handleSafeNow}
                  className="bg-success py-4 rounded-lg"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <ThemedText className="text-white font-bold ml-2 text-lg">
                      I'M SAFE NOW
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFalseAlarm}
                  className="bg-gray-500 py-4 rounded-lg"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="close-circle" size={24} color="white" />
                    <ThemedText className="text-white font-bold ml-2 text-lg">
                      FALSE ALARM
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer Note */}
          {sosActivated && (
            <View className="mt-6 p-4 bg-surface dark:bg-darkSurface rounded-lg">
              <ThemedText variant="caption" className="text-center text-secondary">
                📍 Location automatically shared with emergency services & customer
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}