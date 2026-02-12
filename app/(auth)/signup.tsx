import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { UserRole } from '../../types/navigation';
import AuthApiService from '../../services/api/AuthApiService';

export default function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const register = useAuthStore((state) => state.register);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill name and phone number');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // Send OTP for phone verification
      const response = await AuthApiService.sendOTP({
        phone_number: `+91${phone}`,
        otp_type: 'phone_verification',
      });

      if (response.success) {
        setOtpSent(true);
        // Navigate to OTP verification with role and name info
        router.push({
          pathname: '/(auth)/otp-verification',
          params: {
            phoneNumber: `+91${phone}`,
            name: name.trim(),
            role: selectedRole,
          }
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary border-border';

  // Role button styles - using proper color theme
  const roleButtonClass = (role: UserRole) => {
    const isSelected = selectedRole === role;
    // Using secondary color (#BD8C5E) for selected state with proper contrast
    if (isSelected) {
      return 'bg-secondary border-secondary';
    }
    // Unselected state - neutral colors
    return isDarkMode
      ? 'bg-darkSurface border-darkBorder'
      : 'bg-white border-border';
  };

  const roleTextClass = (role: UserRole) => {
    const isSelected = selectedRole === role;
    // Selected: white text for better contrast on secondary background
    // Unselected: dark/light text based on theme
    return isSelected ? 'text-white' : (isDarkMode ? 'text-darkText' : 'text-textPrimary');
  };

  const roleIconColor = (role: UserRole) => {
    const isSelected = selectedRole === role;
    // Selected: white icon, Unselected: based on theme
    return isSelected ? '#FFFFFF' : (isDarkMode ? '#d9d1c6' : '#314b4c');
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView className="flex-1 px-6 py-8">
          <ThemedText variant="title" className="text-center mb-2">
            Join Chauffit
          </ThemedText>
          <ThemedText variant="secondary" className="text-center mb-8">
            Create your account
          </ThemedText>

          {/* Role Selection */}
          <ThemedText variant="secondary" className="mb-3 font-semibold">
            Select your role:
          </ThemedText>
          <View className="flex-row justify-between mb-6">
            {(['customer', 'driver', 'biker'] as UserRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setSelectedRole(role)}
                className={roleButtonClass(role)}
                style={{ flex: 1, marginHorizontal: 4 }}
              >
                <View className="items-center py-3">
                  <Ionicons
                    name={
                      role === 'customer' ? 'car' :
                      role === 'driver' ? 'car-sport' : 'bicycle'
                    }
                    size={28}
                    color={roleIconColor(role)}
                    className="mb-2"
                  />
                  <ThemedText
                    className={`text-center capitalize font-semibold text-sm ${
                      roleTextClass(role)
                    }`}
                  >
                    {role}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <TextInput
              className={`p-4 rounded-xl border ${inputClass}`}
              placeholder="Full Name"
              placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number Input with Fixed +91 */}
          <View className={`flex-row items-center p-4 rounded-xl border mb-6 ${inputClass}`}>
            {/* Fixed Country Code */}
            <View className="flex-row items-center bg-secondary/10 px-3 py-2 rounded-lg mr-3">
              <Ionicons
                name="flag"
                size={16}
                color="#BD8C5E"
                className="mr-1"
              />
              <ThemedText className="text-secondary font-bold text-base">
                +91
              </ThemedText>
            </View>
            <TextInput
              className="flex-1 text-base"
              style={{
                paddingVertical: 0,
              }}
              placeholder="Phone Number"
              placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Ionicons
              name="phone-portrait"
              size={20}
              color={isDarkMode ? '#d9d1c6' : '#314b4c'}
              className="ml-2"
            />
          </View>

          {/* Info Section */}
          <View className="mb-6 p-4 bg-surface dark:bg-darkSurface rounded-lg">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#3b82f6"
                className="mr-3 mt-0.5"
              />
              <View className="flex-1">
                <ThemedText className="text-info font-semibold text-sm mb-1">
                  OTP Verification
                </ThemedText>
                <ThemedText className="text-secondary text-xs leading-5">
                  You will receive a 6-digit OTP on your phone to verify your number.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Send OTP Button */}
          <PrimaryButton
            title="Send OTP"
            onPress={handleSendOTP}
            loading={loading}
            disabled={!name || phone.length !== 10}
          />

          {/* Already have account link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/phone-login')}
            className="mt-6"
          >
            <ThemedText variant="secondary" className="text-center">
              Already have an account? Login
            </ThemedText>
          </TouchableOpacity>

          {/* Terms Text */}
          <View className="mt-6 px-4">
            <ThemedText variant="tiny" className="text-center text-textSecondary leading-5">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
