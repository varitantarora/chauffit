import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

export default function DriverLoginScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const login = useAuthStore((state) => state.login);
  const setRoleOnboardingCompleted = useAuthStore((state) => state.setRoleOnboardingCompleted);
  
  const [credentials, setCredentials] = useState({
    phoneOrEmail: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!credentials.phoneOrEmail.trim()) {
      Alert.alert('Required', 'Please enter your phone number or email');
      return;
    }
    
    if (!credentials.password.trim()) {
      Alert.alert('Required', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      login({
        id: 'driver_001',
        name: 'Rajesh Sharma',
        email: credentials.phoneOrEmail,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        userType: 'driver',
        rating: 4.9,
        totalTrips: 2347,
        joinDate: '2023-01-15',
        vehicleInfo: {
          type: 'sedan',
          make: 'Honda',
          model: 'City',
          year: '2022',
          color: 'White',
          licensePlate: 'DL01AB1234'
        },
        verificationStatus: {
          identity: true,
          background: true,
          vehicle: true,
          license: true
        }
      });

      // Mark driver onboarding as completed
      setRoleOnboardingCompleted('driver', true);

      Alert.alert(
        'Welcome Back!',
        'Logged in successfully. Ready to drive?',
        [{ text: 'Start Driving', onPress: () => router.replace('/(driver)') }]
      );
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    Alert.alert(
      'Quick Start Mode',
      'Quick start allows fast access for verified drivers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Quick Start',
          onPress: () => {
            login({
              id: 'driver_quick_001',
              name: 'Quick Access Driver',
              email: 'quick@driver.com',
              phone: '+91 98765 43999',
              avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
              userType: 'driver',
              rating: 4.7,
              totalTrips: 892,
              joinDate: '2023-06-10',
              vehicleInfo: {
                type: 'sedan',
                make: 'Maruti',
                model: 'Dzire',
                year: '2021',
                color: 'Silver',
                licensePlate: 'HR26CD5678'
              },
              verificationStatus: {
                identity: true,
                background: true,
                vehicle: true,
                license: true
              }
            });
            
            // Mark driver onboarding as completed
            setRoleOnboardingCompleted('driver', true);
            
            router.replace('/(driver)');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="items-center py-12 px-6">
            <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-6">
              <Ionicons name="car" size={48} color="white" />
            </View>
            
            <ThemedText className="text-4xl font-bold text-secondary mb-2">
              CHAUFFIT DRIVER
            </ThemedText>
            <ThemedText variant="secondary" className="text-center text-lg">
              Premium Driving Services
            </ThemedText>
            <ThemedText variant="secondary" className="text-center mb-8">
              Join Chauffit as a professional driver and start earning
            </ThemedText>
          </View>

          {/* Login Form */}
          <View className="flex-1 px-6">
            <View className="mb-6">
              <ThemedText className="mb-3 font-semibold">
                Phone Number or Email
              </ThemedText>
              <TextInput
                className={`p-4 rounded-xl border text-base ${
                  isDarkMode 
                    ? 'bg-darkSurface text-darkText border-darkBorder' 
                    : 'bg-white text-textPrimary dark:text-darkText border-border'
                }`}
                placeholder="Enter phone or email"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                value={credentials.phoneOrEmail}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, phoneOrEmail: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <ThemedText className="mb-3 font-semibold">
                Password
              </ThemedText>
              <TextInput
                className={`p-4 rounded-xl border text-base ${
                  isDarkMode 
                    ? 'bg-darkSurface text-darkText border-darkBorder' 
                    : 'bg-white text-textPrimary dark:text-darkText border-border'
                }`}
                placeholder="Enter password"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                value={credentials.password}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                secureTextEntry
              />
            </View>

            <PrimaryButton
              title="LOGIN"
              onPress={handleLogin}
              loading={isLoading}
              className="mb-6"
            />

            {/* Quick Access */}
            <TouchableOpacity
              onPress={handleQuickStart}
              className="py-4 items-center border border-secondary rounded-xl mb-6"
              activeOpacity={0.7}
            >
              <ThemedText className="text-secondary font-semibold text-lg">
                🚀 QUICK START (DEMO)
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary mt-1">
                Fast login for verified drivers
              </ThemedText>
            </TouchableOpacity>

            {/* New Driver Registration */}
            <TouchableOpacity
              onPress={() => router.push('/(driver)/onboarding/registration')}
              className="py-4 items-center"
              activeOpacity={0.7}
            >
              <ThemedText className="text-center">
                <ThemedText className="text-secondary">New to Chauffit? </ThemedText>
                <ThemedText className="text-secondary font-bold">Register as Driver</ThemedText>
              </ThemedText>
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-8 items-center">
              <ThemedText variant="caption" className="text-secondary text-center">
                By continuing, you agree to our Terms & Privacy Policy
              </ThemedText>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}