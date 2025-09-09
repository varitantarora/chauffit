import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

export default function DriverRegistrationScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    applicationType: 'driver', // 'driver' or 'biker'
    experience: ''
  });

  const handleContinue = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.dateOfBirth) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    router.push('/(driver)/onboarding/documents');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-8 pb-6 items-center">
            <View className="w-16 h-16 bg-burgundy rounded-full items-center justify-center mb-4">
              <Ionicons name="car-sport" size={32} color="white" />
            </View>
            <ThemedText variant="title" className="text-2xl font-bold text-center">
              CHAUFFIT DRIVER
            </ThemedText>
            <ThemedText variant="secondary" className="text-center mt-2">
              Join Our Professional Network
            </ThemedText>
          </View>

          <View className="px-6">
            {/* Application Type */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold mb-4">Application Type:</ThemedText>
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => setFormData({...formData, applicationType: 'driver'})}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded-full border-2 ${
                    formData.applicationType === 'driver' ? 'border-burgundy bg-burgundy' : 'border-gray-400'
                  } mr-3`}>
                    {formData.applicationType === 'driver' && (
                      <View className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </View>
                  <ThemedText>Join as Driver</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({...formData, applicationType: 'biker'})}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded-full border-2 ${
                    formData.applicationType === 'biker' ? 'border-burgundy bg-burgundy' : 'border-gray-400'
                  } mr-3`}>
                    {formData.applicationType === 'biker' && (
                      <View className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </View>
                  <ThemedText>Join as Bike Runner</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedCard>

            {/* Form Fields */}
            <View className="space-y-4 mb-6">
              <View>
                <ThemedText className="mb-2">Legal Full Name *</ThemedText>
                <ThemedCard className="p-4">
                  <ThemedText 
                    className={formData.fullName ? '' : 'text-gray-500'}
                  >
                    {formData.fullName || 'Enter your full legal name'}
                  </ThemedText>
                </ThemedCard>
              </View>

              <View>
                <ThemedText className="mb-2">Phone Number *</ThemedText>
                <ThemedCard className="p-4">
                  <ThemedText 
                    className={formData.phoneNumber ? '' : 'text-gray-500'}
                  >
                    {formData.phoneNumber || '+91 XXXXX XXXXX'}
                  </ThemedText>
                </ThemedCard>
              </View>

              <View>
                <ThemedText className="mb-2">Email Address *</ThemedText>
                <ThemedCard className="p-4">
                  <ThemedText 
                    className={formData.email ? '' : 'text-gray-500'}
                  >
                    {formData.email || 'your.email@example.com'}
                  </ThemedText>
                </ThemedCard>
              </View>

              <View>
                <ThemedText className="mb-2">Date of Birth *</ThemedText>
                <ThemedCard className="p-4">
                  <ThemedText 
                    className={formData.dateOfBirth ? '' : 'text-gray-500'}
                  >
                    {formData.dateOfBirth || 'DD/MM/YYYY'}
                  </ThemedText>
                </ThemedCard>
              </View>
            </View>

            {/* Experience */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold mb-4">Years of professional driving:</ThemedText>
              <View className="flex-row flex-wrap">
                {['0-2', '3-5', '6-10', '10+'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    onPress={() => setFormData({...formData, experience: exp})}
                    className="mr-6 mb-3 flex-row items-center"
                  >
                    <View className={`w-5 h-5 rounded-full border-2 ${
                      formData.experience === exp ? 'border-burgundy bg-burgundy' : 'border-gray-400'
                    } mr-2`}>
                      {formData.experience === exp && (
                        <View className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </View>
                    <ThemedText>{exp}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Continue Button */}
            <PrimaryButton
              title="CONTINUE"
              onPress={handleContinue}
              className="mb-6"
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}