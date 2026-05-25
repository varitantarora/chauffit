import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, Text, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

export default function BikerRegistrationScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Required', 'Please enter your last name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Required', 'Please enter your email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Required', 'Please enter a password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.agreeToTerms) {
      Alert.alert('Required', 'Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleRegistration = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Registration Successful!',
        'Welcome to the Chauffit Biker fleet! Let\'s set up your vehicle.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/(biker)/onboarding/vehicle-registration')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary dark:text-darkText border-border';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 py-4">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              </TouchableOpacity>
            </View>

            <View className="items-center px-6 mb-8">
              <View className="w-20 h-20 bg-burgundy rounded-full items-center justify-center mb-4">
                <Ionicons name="bicycle" size={32} color="white" />
              </View>
              <ThemedText className="text-3xl font-bold text-burgundy mb-2">
                Join the Fleet
              </ThemedText>
              <ThemedText variant="secondary" className="text-center">
                Start your journey as a Chauffit Biker
              </ThemedText>
            </View>

            {/* Registration Form */}
            <View className="px-6">
              <ThemedCard className="p-6 mb-6">
                <ThemedText variant="h3" className="mb-4">Personal Information</ThemedText>
                
                {/* Name Fields */}
                <View className="flex-row space-x-3 mb-4">
                  <View className="flex-1">
                    <ThemedText variant="small" className="mb-2 font-semibold">
                      First Name *
                    </ThemedText>
                    <TextInput
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      placeholder="John"
                      placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                      className={`p-4 rounded-xl border ${inputClass}`}
                    />
                  </View>
                  <View className="flex-1">
                    <ThemedText variant="small" className="mb-2 font-semibold">
                      Last Name *
                    </ThemedText>
                    <TextInput
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      placeholder="Doe"
                      placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                      className={`p-4 rounded-xl border ${inputClass}`}
                    />
                  </View>
                </View>

                {/* Contact Information */}
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2 font-semibold">
                    Email Address *
                  </ThemedText>
                  <TextInput
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="john.doe@example.com"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`p-4 rounded-xl border ${inputClass}`}
                  />
                </View>

                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2 font-semibold">
                    Phone Number *
                  </ThemedText>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    keyboardType="phone-pad"
                    className={`p-4 rounded-xl border ${inputClass}`}
                  />
                </View>

                {/* Password Fields */}
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2 font-semibold">
                    Password *
                  </ThemedText>
                  <TextInput
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Create a secure password"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    secureTextEntry
                    className={`p-4 rounded-xl border ${inputClass}`}
                  />
                </View>

                <View className="mb-6">
                  <ThemedText variant="small" className="mb-2 font-semibold">
                    Confirm Password *
                  </ThemedText>
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Confirm your password"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    secureTextEntry
                    className={`p-4 rounded-xl border ${inputClass}`}
                  />
                </View>

                {/* Terms Agreement */}
                <TouchableOpacity 
                  onPress={() => setFormData(prev => ({ ...prev, agreeToTerms: !prev.agreeToTerms }))}
                  className="flex-row items-start mb-6"
                >
                  <View className={`w-5 h-5 border-2 border-burgundy rounded mr-3 mt-1 items-center justify-center ${
                    formData.agreeToTerms ? 'bg-burgundy' : ''
                  }`}>
                    {formData.agreeToTerms && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <ThemedText variant="small" className="flex-1">
                    I agree to the <ThemedText className="text-burgundy">Terms of Service</ThemedText> and{' '}
                    <Text className="text-burgundy" onPress={() => Linking.openURL('https://chauffit.in/chauffit-privacy')}>Privacy Policy</Text>
                  </ThemedText>
                </TouchableOpacity>

                {/* Register Button */}
                <PrimaryButton
                  title={isLoading ? "Creating Account..." : "Create Account"}
                  onPress={handleRegistration}
                  disabled={isLoading}
                />
              </ThemedCard>

              {/* Login Link */}
              <View className="items-center mb-8">
                <TouchableOpacity onPress={() => router.back()}>
                  <ThemedText variant="small" className="text-center">
                    Already have an account? <ThemedText className="text-burgundy font-semibold">Sign In</ThemedText>
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}