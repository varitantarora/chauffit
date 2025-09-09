import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

export default function BikerLoginScreen() {
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
        id: 'biker_001',
        name: 'Alex Rodriguez',
        email: credentials.phoneOrEmail,
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        userType: 'biker',
        rating: 4.8,
        totalPickups: 1247,
        joinDate: '2023-01-15',
        vehicleInfo: {
          type: 'motorcycle',
          make: 'Honda',
          model: 'CBR600RR',
          year: '2023',
          color: 'Black',
          licensePlate: 'BIKER01'
        },
        verificationStatus: {
          identity: true,
          background: true,
          vehicle: true,
          license: true
        }
      });

      // Mark biker onboarding as completed
      setRoleOnboardingCompleted('biker', true);

      Alert.alert(
        'Welcome Back!',
        'Logged in successfully. Ready to hit the road?',
        [{ text: 'Start Riding', onPress: () => router.replace('/(biker)') }]
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
      'Quick start allows fast access for verified bikers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Quick Start',
          onPress: () => {
            login({
              id: 'biker_quick_001',
              name: 'Quick Access Biker',
              email: 'quick@biker.com',
              phone: '+1 (555) 999-8888',
              avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
              userType: 'biker',
              rating: 4.9,
              totalPickups: 892,
              joinDate: '2023-06-10',
              vehicleInfo: {
                type: 'motorcycle',
                make: 'Yamaha',
                model: 'MT-09',
                year: '2024',
                color: 'Blue',
                licensePlate: 'QUICK01'
              },
              verificationStatus: {
                identity: true,
                background: true,
                vehicle: true,
                license: true
              }
            });
            
            // Mark biker onboarding as completed
            setRoleOnboardingCompleted('biker', true);
            
            router.replace('/(biker)');
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
            <View className="w-24 h-24 bg-burgundy rounded-full items-center justify-center mb-6">
              <Ionicons name="bicycle" size={48} color="white" />
            </View>
            
            <ThemedText className="text-4xl font-bold text-burgundy mb-2">
              CHAUFFIT BIKER
            </ThemedText>
            <ThemedText variant="secondary" className="text-center text-lg">
              Driver Transportation App
            </ThemedText>
          </View>

          {/* Login Form */}
          <View className="flex-1 px-6">
            <View className="mb-4">
              <TextInput
                value={credentials.phoneOrEmail}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, phoneOrEmail: text }))}
                placeholder="Phone Number / Email"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full p-4 border-2 border-border dark:border-darkBorder rounded-lg text-lg"
                style={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#d9d1c6' : '#314b4c',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                }}
              />
            </View>

            <View className="mb-6">
              <TextInput
                value={credentials.password}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                placeholder="Password"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                secureTextEntry
                className="w-full p-4 border-2 border-border dark:border-darkBorder rounded-lg text-lg"
                style={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: isDarkMode ? '#d9d1c6' : '#314b4c',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                }}
              />
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity 
                onPress={() => setCredentials(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                className="flex-row items-center"
              >
                <View className={`w-5 h-5 border-2 border-burgundy rounded mr-3 items-center justify-center ${
                  credentials.rememberMe ? 'bg-burgundy' : ''
                }`}>
                  {credentials.rememberMe && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <ThemedText>Remember Me</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <ThemedText className="text-burgundy">Forgot Pass?</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <PrimaryButton
              title={isLoading ? "Logging in..." : "LOGIN"}
              onPress={handleLogin}
              disabled={isLoading}
              className="mb-6"
            />

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-border dark:bg-darkBorder" />
              <ThemedText className="mx-4 text-secondary">OR</ThemedText>
              <View className="flex-1 h-px bg-border dark:bg-darkBorder" />
            </View>

            {/* Quick Start Mode */}
            <TouchableOpacity
              onPress={handleQuickStart}
              className="bg-secondary/20 border-2 border-secondary rounded-lg p-4 mb-8"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="flash" size={20} color="#bd8c5e" />
                <ThemedText className="text-secondary font-bold text-lg ml-2">
                  Quick Start Mode
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="items-center mb-4">
              <TouchableOpacity onPress={() => router.push('/(biker)/onboarding/registration')}>
                <ThemedText className="text-center">
                  New biker? <ThemedText className="text-burgundy font-semibold">Join the Fleet</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Security Features */}
            <View className="items-center space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                <ThemedText className="text-sm text-secondary ml-2">Secure Biker Portal</ThemedText>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="phone-portrait" size={16} color="#10b981" />
                <ThemedText className="text-sm text-secondary ml-2">Fast login for efficiency</ThemedText>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}