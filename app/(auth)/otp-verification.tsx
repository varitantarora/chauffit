import React, { useState, useRef, useEffect } from 'react';
import { TextInput, TouchableOpacity, Alert, View, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  
  const otpRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-dismiss keyboard when all 6 digits are entered
    if (value && index === 5) {
      // Check if all digits are filled
      const allFilled = newOtp.every(digit => digit !== '');
      if (allFilled) {
        Keyboard.dismiss();
      }
    }
  };

  const handleBackspace = (value: string, index: number) => {
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }
    
    setLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      if (otpValue === '123456') {
        login({
          id: '1',
          email: `user@example.com`,
          name: 'Rajesh Kumar',
          phone: phoneNumber,
        });
        setLoading(false);
        // Check if user has cars, if not redirect to car details
        router.replace('/(auth)/car-details');
      } else {
        setLoading(false);
        Alert.alert('Error', 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    // Simulate resend OTP
    setTimeout(() => {
      setResendLoading(false);
      setCanResend(false);
      setTimer(60);
      Alert.alert('Success', 'OTP has been resent to your phone number');
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length >= 10) {
      return `+91 ${phone.slice(0, 2)}XXX XXX${phone.slice(-2)}`;
    }
    return phone;
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-border';

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Verify Phone Number</ThemedText>
        </View>

        <View className="flex-1 justify-center">
          {/* Illustration */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-secondary/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubble-ellipses" size={40} color="#BD8C5E" />
            </View>
            <ThemedText variant="h3" className="text-center mb-2">
              Enter Verification Code
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary px-4">
              We've sent a 6-digit code to {formatPhoneNumber(phoneNumber || '')}
            </ThemedText>
            <ThemedText variant="tiny" className="text-center text-secondary mt-2 px-4">
              Test OTP: 123456
            </ThemedText>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-8 px-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) otpRefs.current[index] = ref;
                }}
                className={`w-12 h-12 text-center text-xl font-bold rounded-xl border-2 ${
                  digit 
                    ? 'border-secondary bg-secondary/10' 
                    : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
                }`}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    handleBackspace(digit, index);
                  }
                }}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer and Resend */}
          <View className="items-center mb-8">
            {!canResend ? (
              <ThemedText variant="small" className="text-textSecondary">
                Resend code in {timer}s
              </ThemedText>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={resendLoading}
              >
                <ThemedText variant="small" className="text-secondary font-semibold">
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <PrimaryButton
            title="Verify & Continue"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={otp.join('').length !== 6}
          />

          {/* Help Text */}
          <View className="mt-8 px-4">
            <ThemedText variant="tiny" className="text-center text-textSecondary">
              Didn't receive the code? Check your spam folder or contact support
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}