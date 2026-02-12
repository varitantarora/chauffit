import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import * as Location from 'expo-location';
import DriverRidesApiService, { BookingDetail } from '../../../services/api/DriverRidesApiService';

export default function OTPStartRideScreen() {
  const OTP_LENGTH = 4;
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { activeJob, updateJobStatus, syncActiveJobFromBooking } = useJobStore();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [getLocationLoading, setGetLocationLoading] = useState(false);
  const [testOtp, setTestOtp] = useState<string>(''); // For displaying test OTP from backend

  const otpRefs = React.useRef<TextInput[]>([]);

  // Get current location for pickup coordinates
  const getCurrentLocation = async () => {
    try {
      setGetLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude || 0,
        longitude: location.coords.longitude || 0,
      };
      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    } finally {
      setGetLocationLoading(false);
    }
  };

  // Send OTP to customer
  const handleSendOtp = async () => {
    if (!activeJob?.id) {
      Alert.alert('Error', 'No active ride found.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await DriverRidesApiService.sendOtp(activeJob.id);

      console.log('=== Send OTP Response ===');
      console.log('Success:', response.success);
      console.log('Data:', response.data);

      if (response.success) {
        setOtpSent(true);

        // Check if backend returned the OTP (for testing)
        const returnedOtp = response.data?.otp || (response.data as any)?.otp;
        if (returnedOtp) {
          setTestOtp(returnedOtp);
        }

        Alert.alert(
          'OTP Sent',
          returnedOtp
            ? `Test OTP: ${returnedOtp}\n\nA 4-digit OTP has been sent to the customer.`
            : 'A 4-digit OTP has been sent to the customer. Please ask them to share it with you.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Failed to Send OTP', response.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const focusOtpInput = (index: number) => {
    setTimeout(() => {
      otpRefs.current[index]?.focus();
    }, 10);
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    setOtp((prev) => {
      const next = [...prev];
      let nextIndex = index;
      const chars = numericValue.slice(0, OTP_LENGTH - index).split('');

      chars.forEach((char) => {
        if (nextIndex < OTP_LENGTH) {
          next[nextIndex] = char;
          nextIndex += 1;
        }
      });

      if (nextIndex >= OTP_LENGTH) {
        Keyboard.dismiss();
      } else {
        focusOtpInput(nextIndex);
      }

      return next;
    });
  };

  const handleOtpKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key !== 'Backspace') return;

    setOtp((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = '';
        return next;
      }
      if (index > 0) {
        next[index - 1] = '';
        focusOtpInput(index - 1);
      }
      return next;
    });
  };

  const handleOtpFocus = (index: number) => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === '');
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      focusOtpInput(firstEmptyIndex);
    }
  };

  const handleStartRide = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP.');
      return;
    }

    if (!activeJob?.id) {
      Alert.alert('Error', 'No active ride found.');
      return;
    }

    setIsVerifying(true);

    try {
      // Get current location for pickup coordinates
      const location = currentLocation || await getCurrentLocation();

      console.log('=== Starting ride with OTP ===');
      console.log('Ride ID:', activeJob.id);
      console.log('OTP:', otpString);
      console.log('Location:', location);

      // Call verify OTP and start trip API
      const response = await DriverRidesApiService.verifyOtpAndStart(
        activeJob.id,
        otpString,
        location?.latitude,
        location?.longitude
      );

      console.log('=== API Response ===');
      console.log('Success:', response.success);
      console.log('Error:', response.error);
      console.log('Data:', response.data);

      if (response.success && response.data) {
        // Update local job status
        syncActiveJobFromBooking(response.data as BookingDetail);
        updateJobStatus('started');

        Alert.alert(
          'Ride Started!',
          'The ride has been started successfully. AI monitoring is now active.',
          [
            {
              text: 'Continue',
              onPress: () => router.push({
                pathname: '/(driver)/job/active',
                params: { jobId: activeJob.id }
              })
            }
          ]
        );
      } else {
        console.error('=== API Error ===');
        console.error('Full response:', JSON.stringify(response, null, 2));
        Alert.alert(
          'Verification Failed',
          response.error || 'The OTP entered is incorrect. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear OTP on error
                setOtp(['', '', '', '']);
                focusOtpInput(0);
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('=== Exception Error ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      Alert.alert('Error', error?.message || 'Failed to start the ride. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCallCustomer = () => {
    if (activeJob?.customerPhone) {
      // In real app, this would initiate a phone call
      Alert.alert('Calling Customer', `Calling ${activeJob.customerPhone}`);
    }
  };

  const handleEmergency = () => {
    router.push('/(driver)/emergency');
  };

  // Send OTP automatically when screen loads
  useEffect(() => {
    if (activeJob?.id && !otpSent) {
      handleSendOtp();
    }
    // Get location on mount
    getCurrentLocation();
  }, []);

  if (!activeJob) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>No active ride found.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const isLoading = isSendingOtp || isVerifying || getLocationLoading;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Ready to Start Ride
          </ThemedText>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-6 pt-6">
          {/* Customer Info */}
          <ThemedCard className="p-4 mb-6">
            <View className="items-center mb-4">
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
                <Ionicons name="lock-closed" size={24} color="#720C17" />
                <ThemedText className="font-bold text-lg ml-2">ENTER OTP TO START RIDE</ThemedText>
              </View>

              {otpSent && (
                <View className="bg-success/10 px-4 py-2 rounded-full mb-4">
                  <ThemedText className="text-success text-sm font-semibold">
                    ✓ OTP sent to customer
                  </ThemedText>
                </View>
              )}

              {/* Test OTP Display (for development) */}
              {testOtp && (
                <View className="bg-warning/10 px-4 py-3 rounded-lg mb-4 border border-warning/30">
                  <ThemedText className="text-warning text-center font-bold text-sm">
                    🔑 TEST OTP: {testOtp}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-warning text-center mt-1">
                    (Use this OTP for testing)
                  </ThemedText>
                </View>
              )}

              <ThemedText variant="secondary" className="text-center mb-6">
                Customer will provide 4-digit OTP{'\n'}to confirm ride start
              </ThemedText>

              {/* OTP Input */}
              <View className="flex-row justify-center space-x-4 mb-6">
                {otp.map((digit, index) => (
                  <View key={index} className="w-14 h-14 border-2 border-burgundy rounded-lg bg-surface dark:bg-darkSurface">
                    <TextInput
                      ref={(ref) => {
                        if (ref) otpRefs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      onFocus={() => handleOtpFocus(index)}
                      maxLength={OTP_LENGTH}
                      keyboardType="numeric"
                      selectTextOnFocus
                      className="flex-1 text-center text-2xl font-bold text-burgundy"
                      style={{ color: isDarkMode ? '#d9d1c6' : '#720C17' }}
                      editable={!isLoading}
                    />
                  </View>
                ))}
              </View>

              <PrimaryButton
                title={
                  isSendingOtp ? "Sending OTP..." :
                  isVerifying ? "Verifying..." :
                  "START RIDE"
                }
                onPress={otpSent ? handleStartRide : handleSendOtp}
                disabled={isLoading || (otpSent && otp.join('').length < OTP_LENGTH)}
                className="w-full"
              />

              {!otpSent && (
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={isSendingOtp}
                  className="mt-3"
                >
                  <ThemedText className="text-burgundy text-center font-semibold">
                    Resend OTP
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ThemedCard>

          {/* AI Camera Monitoring */}
          <ThemedCard className="p-4 mb-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="videocam" size={20} color="#720C17" />
              <ThemedText className="font-bold ml-2">AI-MONITORED CAMERA</ThemedText>
            </View>

            <View className="bg-surface dark:bg-darkSurface rounded-lg p-4 mb-4">
              <View className="items-center py-8">
                <Ionicons name="videocam" size={48} color="#BD8C5E" />
                <ThemedText variant="secondary" className="text-center mt-2">
                  Camera Feed Active
                </ThemedText>
              </View>
            </View>

            <View className="space-y-2 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Front camera monitoring ON</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Auto-start on OTP confirm</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Behavior monitoring active</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Distraction detection: ON</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Fatigue monitoring: ON</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <ThemedText variant="caption" className="ml-2">Auto SOS on severe issues</ThemedText>
              </View>
            </View>

            <View className="flex-row items-center justify-center bg-success/10 p-3 rounded-lg">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <ThemedText className="text-success font-semibold ml-2">
                Status: All systems ready
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Warning */}
          <ThemedCard className="p-4 mb-6 border border-warning/30 bg-warning/5">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <ThemedText variant="caption" className="text-warning ml-2 flex-1">
                Camera monitoring is mandatory for all rides. Do not cover camera
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isSendingOtp}
              className="flex-1 py-3 items-center border border-secondary rounded-lg"
            >
              {isSendingOtp ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              ) : (
                <ThemedText className="text-secondary font-semibold">Resend OTP</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 py-3 items-center bg-success rounded-lg"
            >
              <ThemedText className="text-white font-semibold">📞 Customer</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEmergency}
              className="flex-1 py-3 items-center bg-danger rounded-lg"
            >
              <ThemedText className="text-white font-semibold">🚨 Emergency</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
