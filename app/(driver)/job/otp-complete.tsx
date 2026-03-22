import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Alert, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useJobStore } from '../../../store/jobStore';
import { useEarningsStore } from '../../../store/earningsStore';
import { useAuthStore } from '../../../store/authStore';
import * as Location from 'expo-location';
import DriverRidesApiService, { DriverRideDetail } from '../../../services/api/DriverRidesApiService';
import { BrandColors } from '../../../constants/Colors';

export default function OTPCompleteRideScreen() {
  const OTP_LENGTH = 4;
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { activeJob, completeRideFromAPI, completeJob } = useJobStore();
  const { addJobEarnings } = useEarningsStore();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < numericValue.length; i++) {
      newOtp[i] = numericValue[i];
    }
    setOtp(newOtp);
  };

  const focusOtpInput = () => {
    otpRefs.current[0]?.focus();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: location.coords.latitude || 0,
        longitude: location.coords.longitude || 0,
      };
    } catch {
      return null;
    }
  };

  const showRatingDialog = (rideData: DriverRideDetail) => {
    Alert.alert(
      'Rate Customer',
      'How was your experience with this customer?',
      [
        { text: '5 Stars', onPress: () => finishRide(rideData, 5) },
        { text: '4 Stars', onPress: () => finishRide(rideData, 4) },
        { text: '3 Stars', onPress: () => finishRide(rideData, 3) },
        { text: 'Skip Rating', onPress: () => finishRide(rideData) },
      ]
    );
  };

  const finishRide = (rideData: DriverRideDetail, customerRating?: number) => {
    const toNum = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const netEarnings = toNum(rideData?.net_earnings)
      ?? toNum(rideData?.driver_earnings_breakdown?.net_earnings)
      ?? toNum(activeJob?.fare)
      ?? 0;

    const actualDistance = toNum(rideData?.actual_distance_km) || 0;
    const actualDuration = toNum(rideData?.actual_duration_minutes) || 0;
    const tips = toNum(rideData?.tip_amount) || 0;

    addJobEarnings(activeJob?.fare || 0, tips, actualDistance, actualDuration);
    completeJob(tips, customerRating);

    Alert.alert(
      'Ride Completed!',
      `Great job! You earned \u20B9${netEarnings.toLocaleString('en-IN')} for this trip.`,
      [
        {
          text: 'View Earnings',
          onPress: () => router.replace('/(driver)/(tabs)/earnings'),
        },
        {
          text: 'Find Next Ride',
          onPress: () => router.replace('/(driver)/(tabs)'),
        },
      ]
    );
  };

  const handleVerifyAndComplete = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit completion OTP.');
      return;
    }

    if (!activeJob?.id) {
      Alert.alert('Error', 'No active ride found.');
      return;
    }

    setIsVerifying(true);

    try {
      const location = await getCurrentLocation();

      const success = await completeRideFromAPI(activeJob.id, {
        dropoff_lat: location?.latitude?.toString() || '0',
        dropoff_long: location?.longitude?.toString() || '0',
        actual_distance_km: 0,
        actual_duration_minutes: 0,
        otp: otpString,
      });

      if (success) {
        // Fetch ride details for earnings info
        const detailsResponse = await DriverRidesApiService.getRideDetails(activeJob.id);
        const rideData = detailsResponse.data;

        if (rideData) {
          showRatingDialog(rideData);
        } else {
          finishRide({} as DriverRideDetail);
        }
      } else {
        Alert.alert(
          'Verification Failed',
          'The OTP entered is incorrect. Please check and try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setOtp(['', '', '', '']);
                focusOtpInput();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to complete the ride. Please try again.');
      setOtp(['', '', '', '']);
      focusOtpInput();
    } finally {
      setIsVerifying(false);
    }
  };

  if (!activeJob) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>No active ride found.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Complete Ride
          </ThemedText>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-6 pt-6">
          {/* Customer Info */}
          <ThemedCard className="p-4 mb-6">
            <View className="items-center mb-2">
              <ThemedText className="font-bold text-lg">Customer: {activeJob.customerName}</ThemedText>
              <ThemedText variant="secondary">
                Vehicle: {activeJob.vehicleMake || 'BMW'} {activeJob.vehicleModel || 'X5'} • {activeJob.vehiclePlate || 'MH01AB1234'}
              </ThemedText>
            </View>
          </ThemedCard>

          {/* OTP Section */}
          <ThemedCard className="p-6 mb-6">
            <View className="items-center">
              <View className="flex-row items-center mb-4">
                <Ionicons name="lock-closed" size={24} color="#10b981" />
                <ThemedText className="font-bold text-lg ml-2">ENTER OTP TO COMPLETE RIDE</ThemedText>
              </View>

              <ThemedText variant="secondary" className="text-center mb-6">
                Ask the customer to share their{'\n'}4-digit completion OTP
              </ThemedText>

              {/* OTP Input Container */}
              <Pressable onPress={focusOtpInput} className="flex-row justify-center space-x-4 mb-6 relative">
                {/* Hidden Real Input */}
                <TextInput
                  ref={(ref) => { if (ref) otpRefs.current[0] = ref; }}
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    opacity: 0,
                  }}
                  value={otp.join('')}
                  onChangeText={handleOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  textContentType="oneTimeCode"
                  autoFocus
                />

                {/* Visual Boxes */}
                {otp.map((digit, index) => {
                  const isFocused = otp.join('').length === index;
                  return (
                    <View
                      key={index}
                      className="w-14 h-16 border-2 rounded-lg bg-surface dark:bg-darkSurface items-center justify-center"
                      style={{
                        borderColor: isFocused ? '#10b981' : (digit ? '#10b981' : (isDarkMode ? '#3A3A3A' : '#D1D5DB')),
                      }}
                    >
                      <ThemedText
                        className="text-3xl font-bold"
                        style={{ color: '#10b981' }}
                      >
                        {digit}
                      </ThemedText>

                      {isFocused && (
                        <View className="absolute bottom-2 w-4 h-0.5" style={{ backgroundColor: '#10b981' }} />
                      )}
                    </View>
                  );
                })}
              </Pressable>

              <PrimaryButton
                title={isVerifying ? "Verifying..." : "COMPLETE RIDE"}
                onPress={handleVerifyAndComplete}
                disabled={isVerifying || otp.join('').length < OTP_LENGTH}
                className="w-full"
              />
            </View>
          </ThemedCard>

          {/* Info Card */}
          <ThemedCard className="p-4 mb-6 border border-info/30 bg-info/5">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <ThemedText variant="caption" className="ml-2 flex-1" style={{ color: '#3b82f6' }}>
                The customer received a 4-digit OTP when the ride started. Ask them to share it with you to verify ride completion.
              </ThemedText>
            </View>
          </ThemedCard>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
