import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View, SafeAreaView, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { GoogleIcon } from '../../components/icons/GoogleIcon';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      // Show test OTP to user
      Alert.alert(
        'OTP Sent!', 
        'For testing purposes, use OTP: 123456\n\nIn production, you would receive this via SMS.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/(auth)/otp-verification',
                params: { phoneNumber }
              });
            }
          }
        ]
      );
    }, 1500);
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-border';

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
            <Text className={`font-semibold ${language === 'EN' ? 'text-burgundy' : 'text-gray-500'}`}>
              EN
            </Text>
          </TouchableOpacity>
          <Text className="text-gray-400 mx-1">|</Text>
          <TouchableOpacity
            onPress={() => setLanguage('HI')}
            className="px-2"
          >
            <Text className={`font-semibold ${language === 'HI' ? 'text-burgundy' : 'text-gray-500'}`}>
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
            Welcome to Chauffit
          </ThemedText>
          <ThemedText variant="small" className="text-center text-textSecondary">
            Your premium chauffeur service
          </ThemedText>
        </View>

        {/* Login Method Toggle */}
        <View className={`flex-row bg-surface rounded-xl p-1 mb-6 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
          <View className="flex-1 py-3 px-4 rounded-lg bg-primary shadow-sm">
            <ThemedText className="text-center font-semibold text-burgundy">
              Phone
            </ThemedText>
          </View>
          
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/email-login')}
            className="flex-1 py-3 px-4 rounded-lg"
          >
            <ThemedText className="text-center font-semibold text-textSecondary">
              Email
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Phone Number Input */}
        <View className={`flex-row items-center p-4 rounded-xl border mb-6 ${inputClass}`}>
          <ThemedText className="text-textSecondary mr-2">+91</ThemedText>
          <TextInput
            className="flex-1 text-base"
            placeholder="Enter phone number"
            placeholderTextColor={iconColor}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
            maxLength={10}
          />
          <Ionicons name="phone-portrait" size={20} color={iconColor} />
        </View>
        
        <PrimaryButton
          title="Send OTP"
          onPress={handlePhoneLogin}
          loading={loading}
        />

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className={`flex-1 h-px ${isDarkMode ? 'bg-darkBorder' : 'bg-gray-300'}`} />
          <ThemedText variant="small" className="mx-4 text-textSecondary">
            Or continue with
          </ThemedText>
          <View className={`flex-1 h-px ${isDarkMode ? 'bg-darkBorder' : 'bg-gray-300'}`} />
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-4 mb-6">
          {/* Google Button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Google Sign In', 'Google sign in will be implemented')}
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
              isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-gray-300 bg-white'
            }`}
          >
            <GoogleIcon width={20} height={20} />
            <ThemedText className="font-medium ml-2">Google</ThemedText>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Apple Sign In', 'Apple sign in will be implemented')}
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
              isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-gray-300 bg-white'
            }`}
          >
            <Ionicons 
              name="logo-apple" 
              size={20} 
              color={isDarkMode ? '#d9d1c6' : '#000000'} 
              style={{ marginRight: 8 }}
            />
            <ThemedText className="font-medium">Apple</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="mt-2"
        >
          <ThemedText variant="small" className="text-center text-secondary">
            Don't have an account? <ThemedText className="font-semibold">Sign up</ThemedText>
          </ThemedText>
        </TouchableOpacity>
        
        {/* Help Text */}
        <View className="mt-8 px-4">
          <ThemedText variant="tiny" className="text-center text-textSecondary leading-5">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}