import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View, SafeAreaView, Text, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { GoogleIcon } from '../../components/icons/GoogleIcon';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import AuthApiService from '../../services/api/AuthApiService';
import { BrandColors } from '../../constants/Colors';

const translations = {
  EN: {
    welcome: 'Welcome to Chauffit',
    tagline: 'Your premium chauffeur service',
    phone: 'Phone',
    email: 'Email',
    phonePlaceholder: 'Enter phone number',
    sendOTP: 'Send OTP',
    orContinue: 'Or continue with',
    google: 'Google',
    apple: 'Apple',
    noAccount: "Don't have an account? ",
    signUp: 'Sign up',
    termsText: 'By continuing, you agree to our Terms of Service and Privacy Policy',
    otpSent: 'OTP Sent!',
    otpMessage: 'For testing purposes, use OTP: 123456\n\nIn production, you would receive this via SMS.',
    error: 'Error',
    invalidPhone: 'Please enter a valid phone number',
  },
  HI: {
    welcome: 'चॉफ़िट में आपका स्वागत है',
    tagline: 'आपकी प्रीमियम ड्राइवर सेवा',
    phone: 'फ़ोन',
    email: 'ईमेल',
    phonePlaceholder: 'फ़ोन नंबर दर्ज करें',
    sendOTP: 'OTP भेजें',
    orContinue: 'या जारी रखें',
    google: 'गूगल',
    apple: 'एप्पल',
    noAccount: 'खाता नहीं है? ',
    signUp: 'साइन अप करें',
    termsText: 'जारी रखकर, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं',
    otpSent: 'OTP भेजा गया!',
    otpMessage: 'परीक्षण के उद्देश्य से, OTP का उपयोग करें: 123456\n\nप्रोडक्शन में, आपको यह SMS के माध्यम से प्राप्त होगा।',
    error: 'त्रुटि',
    invalidPhone: 'कृपया एक मान्य फ़ोन नंबर दर्ज करें',
  },
};

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const t = translations[language];

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert(t.error, t.invalidPhone);
      return;
    }

    setLoading(true);

    try {
      // Use OTP login send endpoint for login
      const response = await AuthApiService.otpLoginSend({
        phone_number: `+91${phoneNumber}`,
      });

      if (response.success) {
        // Navigate to OTP verification screen with phone number
        router.push({
          pathname: '/(auth)/otp-verification',
          params: {
            phoneNumber: `+91${phoneNumber}`,
            isLogin: 'true',
          }
        });
      } else {
        Alert.alert(t.error, response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert(t.error, 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary dark:text-darkText border-border';

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6 justify-center">
        {/* Language Toggle */}
        <View className="absolute top-12 right-6 z-10 flex-row items-center">
          <TouchableOpacity
            onPress={() => setLanguage('EN')}
            className="px-2"
          >
            <Text className={`font-semibold ${language === 'EN' ? 'text-burgundy' : 'text-textSecondary dark:text-darkTextSecondary'}`}>
              EN
            </Text>
          </TouchableOpacity>
          <Text className="text-textSecondary dark:text-darkTextSecondary mx-1">|</Text>
          <TouchableOpacity
            onPress={() => setLanguage('HI')}
            className="px-2"
          >
            <Text className={`font-semibold ${language === 'HI' ? 'text-burgundy' : 'text-textSecondary dark:text-darkTextSecondary'}`}>
              हि
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mb-8">
          <View className="rounded-full items-center justify-center mb-4" style={{ width: 100, height: 100 }}>
            <Image
              source={require('../../assets/chauffit-logo.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>
          <ThemedText variant="h1" className="text-center mb-2">
            {t.welcome}
          </ThemedText>
          <ThemedText variant="small" className="text-center text-textSecondary dark:text-darkTextSecondary">
            {t.tagline}
          </ThemedText>
        </View>

        {/* Login Method Toggle */}
        <View className={`flex-row bg-surface rounded-xl p-1 mb-6 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <View className="flex-1 py-3 px-4 rounded-lg bg-primary shadow-sm">
            <ThemedText className="text-center font-semibold text-burgundy">
              {t.phone}
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/email-login')}
            className="flex-1 py-3 px-4 rounded-lg"
          >
            <ThemedText className="text-center font-semibold text-textSecondary dark:text-darkTextSecondary">
              {t.email}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Phone Number Input */}
        <View className={`flex-row items-center p-4 rounded-xl border mb-6 ${inputClass}`}>
          {/* Fixed Country Code */}
          <View className="flex-row items-center bg-secondary/10 px-3 py-2 rounded-lg mr-3">
            <Ionicons
              name="flag"
              size={16}
              color={BrandColors.secondary}
              className="mr-1"
            />
            <ThemedText className="text-secondary font-bold text-base">
              +91
            </ThemedText>
          </View>
          <TextInput
            className="flex-1 text-base"
            style={{
              textAlignVertical: 'center',
              paddingVertical: Platform.OS === 'ios' ? 0 : 0,
            }}
            placeholder={t.phonePlaceholder}
            placeholderTextColor={iconColor}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
            maxLength={10}
          />
          <Ionicons name="phone-portrait" size={20} color={iconColor} />
        </View>
        
        <PrimaryButton
          title={t.sendOTP}
          onPress={handlePhoneLogin}
          loading={loading}
        />

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className={`flex-1 h-px ${isDarkMode ? 'bg-darkBorder' : 'bg-gray-300'}`} />
          <ThemedText variant="small" className="mx-4 text-textSecondary dark:text-darkTextSecondary">
            {t.orContinue}
          </ThemedText>
          <View className={`flex-1 h-px ${isDarkMode ? 'bg-darkBorder' : 'bg-gray-300'}`} />
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-4 mb-6">
          {/* Google Button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Google Sign In', 'Google sign in will be implemented')}
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
              isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border dark:border-darkBorder bg-white'
            }`}
          >
            <GoogleIcon width={20} height={20} />
            <ThemedText className="font-medium ml-2">{t.google}</ThemedText>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Apple Sign In', 'Apple sign in will be implemented')}
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
              isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border dark:border-darkBorder bg-white'
            }`}
          >
            <Ionicons
              name="logo-apple"
              size={20}
              color={isDarkMode ? '#d9d1c6' : '#000000'}
              style={{ marginRight: 8 }}
            />
            <ThemedText className="font-medium">{t.apple}</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="mt-2"
        >
          <ThemedText variant="small" className="text-center text-secondary">
            {t.noAccount}<ThemedText className="font-semibold">{t.signUp}</ThemedText>
          </ThemedText>
        </TouchableOpacity>

        {/* Help Text */}
        <View className="mt-8 px-4">
          <ThemedText variant="tiny" className="text-center text-textSecondary dark:text-darkTextSecondary leading-5">
            {t.termsText}
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}