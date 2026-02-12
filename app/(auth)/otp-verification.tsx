import React, { useState, useRef, useEffect } from 'react';
import { TextInput, TouchableOpacity, Alert, View, Pressable, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserRole } from '../../types/navigation';
import AuthApiService from '../../services/api/AuthApiService';

export default function OTPVerification() {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const { phoneNumber, email, isLogin, name, role } = useLocalSearchParams<{
    phoneNumber?: string;
    email?: string;
    isLogin?: string;
    name?: string;
    role?: string;
  }>();

  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
  }, []);

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    // Create new array with characters from numericValue
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < numericValue.length; i++) {
      newOtp[i] = numericValue[i];
    }
    setOtp(newOtp);
    
    // We removed Keyboard.dismiss() here to allow users to backspace 
    // and correct the last digit without the keyboard closing.
  };

  const focusInput = () => {
    inputRefs.current[0]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);

    try {
      if (!phoneNumber) {
        Alert.alert('Error', 'Phone number is required');
        setLoading(false);
        return;
      }

      const normalizedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      const isLoginFlow = isLogin === 'true';

      let response;

      if (isLoginFlow) {
        // Login flow - use OTP login verify endpoint
        response = await AuthApiService.otpLoginVerify({
          phone_number: normalizedPhone,
          otp: otpValue,
        });
      } else if (name && role) {
        // Signup flow - use register with OTP endpoint
        response = await AuthApiService.registerWithOTP({
          phone_number: normalizedPhone,
          otp: otpValue,
          full_name: name,
          user_type: role as 'customer' | 'driver' | 'biker',
        });
      } else {
        // Fallback - use regular verify OTP
        response = await AuthApiService.verifyOTP({
          phone_number: normalizedPhone,
          otp: otpValue,
          otp_type: 'phone_verification',
        });
      }

      if (response.success) {
        // OTP verified successfully
        // If user data is in response, set it in auth store
        if (response.data?.user) {
          console.log('[Auth] OTP verify user_type:', response.data.user.user_type);
          const appUser = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.full_name || `${response.data.user.first_name} ${response.data.user.last_name}`,
            phone: response.data.user.phone_number,
            avatar: response.data.user.profile_picture,
          };

          const userRole = response.data.user.user_type as 'customer' | 'driver' | 'biker';

          // Set user and role in auth store
          const authStore = useAuthStore.getState();
          authStore.setUser(appUser);
          authStore.addRole(userRole);
          authStore.setActiveRole(userRole);

          // Set user metadata if available in response
          if (response.data.user.user_type) {
            useAuthStore.setState({ userType: response.data.user.user_type as UserRole });
          }
          if (response.data.user.created_at) {
            useAuthStore.setState({ userCreatedAt: response.data.user.created_at });
          }
          if (response.data.user.is_verified !== undefined) {
            useAuthStore.setState({ userIsVerified: response.data.user.is_verified });
          }

          // Set is_online status based on status field (active = true, otherwise false)
          if (response.data.user.status !== undefined) {
            const isOnline = response.data.user.status === 'active';

            // Set online status based on user type
            if (userRole === 'biker') {
              useAuthStore.setState({ bikerIsOnline: isOnline });
            } else if (userRole === 'driver') {
              // Set in both authStore and jobStore for drivers (drivers use jobStore for isOnline)
              useAuthStore.setState({ driverIsOnline: isOnline });
              const { useJobStore } = await import('../../store/jobStore');
              useJobStore.getState().setOnlineStatus(isOnline);
            }
          }

          // Redirect will happen automatically via app/index.tsx based on activeRole
          router.replace('/');
        } else {
          // If no user data, fetch profile to get user_type
          const profileFetched = await useAuthStore.getState().fetchProfile();
          if (profileFetched) {
            // Redirect will happen automatically via app/index.tsx based on activeRole
            router.replace('/');
          } else {
            // New user - redirect based on role
            const userRole = role as 'customer' | 'driver' | 'biker';
            if (userRole === 'customer') {
              // Customer needs to add car details
              Alert.alert('Success', 'Phone number verified successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/(auth)/car-details');
                  }
                }
              ]);
            } else {
              // Driver and biker go directly to their respective app tabs
              // They will complete onboarding from there
              router.replace(userRole === 'driver' ? '/(driver)/(tabs)' : '/(biker)/(tabs)');
            }
          }
        }
      } else {
        Alert.alert('Error', response.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setResendLoading(true);

    try {
      const normalizedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      const isLoginFlow = isLogin === 'true';

      // Use appropriate endpoint based on flow
      const response = isLoginFlow
        ? await AuthApiService.otpLoginSend({
            phone_number: normalizedPhone,
          })
        : await AuthApiService.sendOTP({
            phone_number: normalizedPhone,
            otp_type: 'phone_verification',
          });

      if (response.success) {
        setResendLoading(false);
        setCanResend(false);
        setTimer(60);
        Alert.alert('Success', 'OTP has been resent to your phone number');

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
      } else {
        Alert.alert('Error', response.error || 'Failed to resend OTP. Please try again.');
        setResendLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone && phone.length >= 10) {
      return `+91 ${phone.slice(0, 2)}XXX XXX${phone.slice(-2)}`;
    }
    return phone;
  };

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

        <Pressable className="flex-1 justify-center" onPress={Keyboard.dismiss}>
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

          {/* OTP Input Container */}
          <Pressable onPress={focusInput} className="flex-row justify-between mb-8 px-4 relative">
            {/* Hidden Real Input */}
            <TextInput
              ref={(ref) => { inputRefs.current[0] = ref; }}
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
                  className="w-12 h-16 items-center justify-center rounded-xl border-2"
                  style={{
                    borderColor: isFocused ? '#BD8C5E' : (digit ? '#BD8C5E' : (isDarkMode ? '#3A3A3A' : '#E5E5E5')),
                    backgroundColor: digit ? 'rgba(189, 140, 94, 0.1)' : (isDarkMode ? '#1C1C1C' : '#FFFFFF'),
                    borderWidth: isFocused ? 2 : 2,
                  }}
                >
                  <ThemedText 
                    className="text-2xl font-bold"
                    style={{
                      color: isDarkMode ? '#d9d1c6' : '#314b4c',
                    }}
                  >
                    {digit}
                  </ThemedText>
                  
                  {/* Cursor Indicator for focused empty box */}
                  {isFocused && (
                    <View className="absolute bottom-3 w-4 h-0.5 bg-secondary" />
                  )}
                </View>
              );
            })}
          </Pressable>

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
            disabled={otp.join('').length !== OTP_LENGTH}
          />

          {/* Help Text */}
          <View className="mt-8 px-4">
            <ThemedText variant="tiny" className="text-center text-textSecondary">
              Didn't receive the code? Check your spam folder or contact support
            </ThemedText>
          </View>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}
