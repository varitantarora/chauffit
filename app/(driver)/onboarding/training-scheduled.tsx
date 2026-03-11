import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Alert, Linking, Platform, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService, { TrainingSession } from '../../../services/api/DriverApiService';
import UniversalMapView, { MapMarker } from '../../../components/shared/MapView';

export default function TrainingScheduledScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [canReschedule, setCanReschedule] = useState(true);

  useEffect(() => {
    loadTraining();
  }, []);

  const loadTraining = async (silent = false) => {
    if (!silent) setLoading(true);
    const response = await DriverApiService.getTrainingSchedule();
    if (response.success && response.data) {
      setSession(response.data);

      // Check if within 3 hours of training start
      const batch = response.data.batch;
      const trainingStart = new Date(`${batch.date}T${batch.start_time}`);
      const now = new Date();
      const hoursUntil = (trainingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      setCanReschedule(hoursUntil > 3);
    }
    if (!silent) setLoading(false);
  };

  const handleReschedule = async () => {
    if (!canReschedule) {
      Alert.alert(
        'Cannot Reschedule',
        'You cannot reschedule within 3 hours of the training start time.'
      );
      return;
    }

    Alert.alert(
      'Request Reschedule',
      'Are you sure you want to reschedule? You will be assigned to the next available batch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule',
          onPress: async () => {
            setRescheduling(true);
            const response = await DriverApiService.requestReschedule();
            setRescheduling(false);
            if (response.success) {
              Alert.alert('Rescheduled', 'You will be assigned to the next available training batch.');
              // Refresh onboarding status
              const { fetchDriverOnboardingStatus } = useAuthStore.getState();
              await fetchDriverOnboardingStatus();
              router.replace('/(driver)/onboarding/background-check');
            } else {
              Alert.alert('Error', response.error || 'Failed to reschedule.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTraining(true);
    const { fetchDriverOnboardingStatus } = useAuthStore.getState();
    await fetchDriverOnboardingStatus();
    const newStatus = useAuthStore.getState().driverOnboardingStatus;
    if (newStatus === 'certified') {
      router.replace('/(driver)/onboarding/onboarding-complete');
    } else if (newStatus === 'active') {
      router.replace('/(driver)/(tabs)');
    }
    setRefreshing(false);
  }, []);

  const handleOpenNavigation = useCallback(() => {
    if (!session?.batch?.location_lat || !session?.batch?.location_long) return;
    const lat = parseFloat(session.batch.location_lat);
    const lng = parseFloat(session.batch.location_long);
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps://app?daddr=${lat},${lng}&dirflg=d`;
      Linking.canOpenURL(appleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(appleMapsUrl);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      });
    } else {
      const googleMapsUrl = `google.navigation:q=${lat},${lng}`;
      Linking.canOpenURL(googleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(googleMapsUrl);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      });
    }
  }, [session?.batch?.location_lat, session?.batch?.location_long]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Loading training details...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const batch = session?.batch;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Top-right refresh button */}
        <View className="flex-row justify-end px-4 pt-2">
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <ActivityIndicator size="small" color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            ) : (
              <Ionicons name="refresh" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            )}
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#BD8C5E']}
              tintColor="#BD8C5E"
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6 items-center">
            <View className="w-16 h-16 bg-burgundy rounded-full items-center justify-center mb-4">
              <Ionicons name="school" size={32} color="white" />
            </View>
            <ThemedText variant="title" className="text-2xl font-bold text-center">
              Training Scheduled
            </ThemedText>
            <ThemedText variant="secondary" className="text-center mt-2">
              Your in-person training has been scheduled
            </ThemedText>
          </View>

          <View className="px-6">
            {batch && (
              <>
                {/* Training Details */}
                <ThemedCard className="p-4 mb-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="calendar" size={20} color="#BD8C5E" />
                    <ThemedText className="font-bold ml-2">DATE & TIME</ThemedText>
                  </View>
                  <ThemedText className="text-lg font-semibold mb-1">
                    {new Date(batch.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </ThemedText>
                  <ThemedText variant="secondary">
                    {batch.start_time} - {batch.end_time}
                  </ThemedText>
                </ThemedCard>

                {/* Location */}
                <ThemedCard className="p-4 mb-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="location" size={20} color="#BD8C5E" />
                    <ThemedText className="font-bold ml-2">LOCATION</ThemedText>
                  </View>
                  <ThemedText className="text-lg font-semibold mb-1">
                    {batch.location_name}
                  </ThemedText>
                  <ThemedText variant="secondary">
                    {batch.location_address}
                  </ThemedText>
                </ThemedCard>

                {/* Map — Training Venue */}
                <ThemedCard className="mb-4 overflow-hidden">
                  {batch.location_lat && batch.location_long ? (
                    <View style={{ position: 'relative' }}>
                      <UniversalMapView
                        initialRegion={{
                          latitude: parseFloat(batch.location_lat),
                          longitude: parseFloat(batch.location_long),
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        markers={[{
                          id: 'training-venue',
                          coordinate: {
                            latitude: parseFloat(batch.location_lat),
                            longitude: parseFloat(batch.location_long),
                          },
                          title: batch.location_name,
                          description: batch.location_address,
                          type: 'pickup',
                        }]}
                        showUserLocation={false}
                        style={{ height: 192 }}
                      />
                      {/* Navigate button overlay */}
                      <TouchableOpacity
                        onPress={handleOpenNavigation}
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          backgroundColor: '#BD8C5E',
                          borderRadius: 24,
                          width: 44,
                          height: 44,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 4,
                          elevation: 4,
                        }}
                      >
                        <Ionicons name="navigate" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="h-48 bg-gray-200 dark:bg-gray-700 items-center justify-center">
                      <Ionicons name="map" size={48} color="#BD8C5E" />
                      <ThemedText variant="secondary" className="mt-2">Location not available</ThemedText>
                    </View>
                  )}
                </ThemedCard>
              </>
            )}

            {/* Reminder Card */}
            <ThemedCard className="p-4 mb-4 border-l-4 border-l-burgundy">
              <View className="flex-row items-start">
                <Ionicons name="document-text" size={20} color="#720C17" />
                <View className="ml-3 flex-1">
                  <ThemedText className="font-bold mb-1">Bring Original Documents</ThemedText>
                  <ThemedText variant="secondary" className="text-sm">
                    Please bring your original Driving License and Aadhaar Card for verification during training.
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Reschedule Button */}
            <PrimaryButton
              title={canReschedule ? 'Request Reschedule' : 'Cannot Reschedule (< 3 hrs)'}
              onPress={handleReschedule}
              loading={rescheduling}
              variant="outline"
              className="mb-6"
              disabled={!canReschedule}
            />

            {!canReschedule && (
              <ThemedText variant="caption" className="text-center mb-6 text-red-500">
                Rescheduling is not available within 3 hours of the training start time.
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
