import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const login = useAuthStore((state) => state.login);
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
      // Store phone number for OTP verification
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { phoneNumber }
      });
    }, 1500);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      login({
        id: '1',
        email: email,
        name: 'Rajesh Kumar',
        phone: phoneNumber,
      });
      setLoading(false);
      router.replace('/');
    }, 1500);
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-border';

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-burgundy rounded-full items-center justify-center mb-4">
            <Ionicons name="car" size={32} color="white" />
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
          <TouchableOpacity
            onPress={() => setLoginMethod('phone')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              loginMethod === 'phone'
                ? 'bg-primary shadow-sm'
                : ''
            }`}
          >
            <ThemedText 
              className={`text-center font-semibold ${
                loginMethod === 'phone' ? 'text-burgundy' : 'text-textSecondary'
              }`}
            >
              Phone
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setLoginMethod('email')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              loginMethod === 'email'
                ? 'bg-primary shadow-sm'
                : ''
            }`}
          >
            <ThemedText 
              className={`text-center font-semibold ${
                loginMethod === 'email' ? 'text-burgundy' : 'text-textSecondary'
              }`}
            >
              Email
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loginMethod === 'phone' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Email Login Form */}
            <View className={`flex-row items-center p-4 rounded-xl border mb-4 ${inputClass}`}>
              <Ionicons name="mail" size={20} color={iconColor} />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Email"
                placeholderTextColor={iconColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View className={`flex-row items-center p-4 rounded-xl border mb-6 ${inputClass}`}>
              <Ionicons name="lock-closed" size={20} color={iconColor} />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Password"
                placeholderTextColor={iconColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <PrimaryButton
              title="Login"
              onPress={handleEmailLogin}
              loading={loading}
            />
          </>
        )}
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="mt-6"
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