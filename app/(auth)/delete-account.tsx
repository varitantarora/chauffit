import React, { useState, useRef, useEffect } from 'react';
import { TextInput, TouchableOpacity, Alert, View, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import AuthApiService from '../../services/api/AuthApiService';
import { BrandColors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DeleteAccount() {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
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
  }, [timer]);

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < numericValue.length; i++) {
      newOtp[i] = numericValue[i];
    }
    setOtp(newOtp);
  };

  const focusInput = () => {
    const input = inputRefs.current[0];
    if (input) {
      input.blur();
      setTimeout(() => input.focus(), 50);
    }
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '';
    const digits = phone.startsWith('+91') ? phone.slice(3) : phone;
    if (digits.length >= 10) {
      return `+91 ${digits.slice(0, 2)}XXX XXX${digits.slice(-2)}`;
    }
    return phone;
  };

  const handleSendOTP = async () => {
    setSendingOTP(true);
    try {
      const response = await AuthApiService.sendDeleteAccountOTP();
      if (response.success) {
        setOtpSent(true);
        setCanResend(false);
        setTimer(response.data?.expires_in || 600);
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
      } else {
        Alert.alert('Error', response.error || 'Failed to send OTP');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleDeleteAccount = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await AuthApiService.deleteAccount({ otp: otpValue });
              if (response.success) {
                await logout();
                router.replace('/(auth)/phone-login');
              } else {
                Alert.alert('Error', response.error || 'Failed to delete account');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
              }
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
              setOtp(['', '', '', '', '', '']);
              inputRefs.current[0]?.focus();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Delete Account</ThemedText>
        </View>

        <Pressable className="flex-1 justify-center" onPress={Keyboard.dismiss}>
          {/* Warning Icon */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-red-500/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="warning" size={40} color="#EF4444" />
            </View>
            <ThemedText variant="h3" className="text-center mb-2 text-red-500">
              This Action Cannot Be Undone
            </ThemedText>
            <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary px-4">
              Your account and all associated data will be permanently deleted.
              {user?.phone ? ` OTP will be sent to ${formatPhoneNumber(user.phone)}.` : ''}
            </ThemedText>
          </View>

          {!otpSent ? (
            /* Send OTP Button */
            <PrimaryButton
              title="Send OTP to Delete Account"
              onPress={handleSendOTP}
              loading={sendingOTP}
            />
          ) : (
            <>
              {/* OTP Input */}
              <Pressable onPress={focusInput} className="flex-row justify-between mb-8 px-4 relative">
                <TextInput
                  ref={(ref) => { inputRefs.current[0] = ref; }}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0 }}
                  value={otp.join('')}
                  onChangeText={handleOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  textContentType="oneTimeCode"
                  caretHidden={false}
                  pointerEvents="auto"
                />
                {otp.map((digit, index) => {
                  const isFocused = otp.join('').length === index;
                  return (
                    <View
                      key={index}
                      className="w-12 h-16 items-center justify-center rounded-xl border-2"
                      style={{
                        borderColor: isFocused ? '#EF4444' : (digit ? '#EF4444' : (isDarkMode ? '#3A3A3A' : '#E5E5E5')),
                        backgroundColor: digit ? 'rgba(239, 68, 68, 0.1)' : (isDarkMode ? '#1C1C1C' : '#FFFFFF'),
                      }}
                    >
                      <ThemedText className="text-2xl font-bold" style={{ color: isDarkMode ? '#d9d1c6' : '#314b4c' }}>
                        {digit}
                      </ThemedText>
                      {isFocused && <View className="absolute bottom-3 w-4 h-0.5 bg-red-500" />}
                    </View>
                  );
                })}
              </Pressable>

              {/* Timer and Resend */}
              <View className="items-center mb-8">
                {timer > 0 && !canResend ? (
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                    Resend code in {timer}s
                  </ThemedText>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP} disabled={sendingOTP}>
                    <ThemedText variant="small" className="text-secondary font-semibold">
                      {sendingOTP ? 'Sending...' : 'Resend Code'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Delete Button */}
              <PrimaryButton
                title="Delete My Account"
                onPress={handleDeleteAccount}
                loading={loading}
                disabled={otp.join('').length !== OTP_LENGTH}
              />
            </>
          )}
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}
