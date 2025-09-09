import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';

export default function OTPStartRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { activeJob, updateJobStatus } = useJobStore();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isStarting, setIsStarting] = useState(false);
  
  const otpRefs = React.useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-dismiss keyboard when all 4 digits are entered
    if (value && index === 3) {
      // Check if all digits are filled
      const allFilled = newOtp.every(digit => digit !== '');
      if (allFilled) {
        Keyboard.dismiss();
      }
    }
  };

  const handleStartRide = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP.');
      return;
    }

    // Mock OTP verification (in real app, verify with backend)
    if (otpString !== '5281') {
      Alert.alert('Invalid OTP', 'The OTP entered is incorrect. Please try again.');
      return;
    }

    setIsStarting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    } catch (error) {
      Alert.alert('Error', 'Failed to start the ride. Please try again.');
      setIsStarting(false);
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
                Vehicle: BMW X5 • MH12AB1234
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
              
              <ThemedText variant="secondary" className="text-center mb-6">
                Customer will provide 4-digit OTP{'\n'}to confirm ride start
              </ThemedText>

              {/* OTP Input */}
              <View className="flex-row space-x-4 mb-6">
                {otp.map((digit, index) => (
                  <View key={index} className="w-12 h-12 border-2 border-burgundy rounded-lg">
                    <TextInput
                      ref={(ref) => {
                        if (ref) otpRefs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                          otpRefs.current[index - 1]?.focus();
                        }
                      }}
                      maxLength={1}
                      keyboardType="numeric"
                      selectTextOnFocus
                      className="flex-1 text-center text-xl font-bold text-burgundy"
                      style={{ color: isDarkMode ? '#d9d1c6' : '#720C17' }}
                    />
                  </View>
                ))}
              </View>

              <PrimaryButton
                title={isStarting ? "Starting..." : "START RIDE"}
                onPress={handleStartRide}
                disabled={isStarting || otp.join('').length < 4}
                className="w-full"
              />
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
              onPress={() => Alert.alert('OTP Issues', 'Contact customer for the correct OTP or call support for assistance.')}
              className="flex-1 py-3 items-center border border-secondary rounded-lg"
            >
              <ThemedText className="text-secondary font-semibold">OTP Issues?</ThemedText>
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