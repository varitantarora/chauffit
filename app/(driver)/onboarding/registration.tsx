import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
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
  const user = useAuthStore((state) => state.user);

  const inputClass = isDarkMode
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';
  const disabledClass = isDarkMode
    ? 'bg-gray-700 border-gray-600'
    : 'bg-gray-100 border-gray-200';
  const placeholderColor = isDarkMode ? '#9ca3af' : '#9ca3af';

  const [formData, setFormData] = useState({
    applicationType: 'driver', // 'driver' or 'biker'
    dateOfBirth: '',
    experience: '',
    transmissionType: '',
    uniformSize: '',
  });

  const handleContinue = () => {
    if (!formData.dateOfBirth) {
      Alert.alert('Missing Information', 'Please enter your date of birth.');
      return;
    }
    if (!formData.transmissionType) {
      Alert.alert('Missing Information', 'Please select your transmission type preference.');
      return;
    }
    if (!formData.uniformSize) {
      Alert.alert('Missing Information', 'Please select your uniform size.');
      return;
    }
    router.push('/(driver)/onboarding/documents');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

            {/* Pre-filled account info (read-only) */}
            <View className="space-y-4 mb-6">
              <View>
                <ThemedText className="mb-2">Full Name</ThemedText>
                <View className={`p-4 rounded-xl border ${disabledClass}`}>
                  <ThemedText>{user?.name || 'N/A'}</ThemedText>
                </View>
              </View>

              <View>
                <ThemedText className="mb-2">Phone Number</ThemedText>
                <View className={`p-4 rounded-xl border ${disabledClass}`}>
                  <ThemedText>{user?.phone || 'N/A'}</ThemedText>
                </View>
              </View>

              <View>
                <ThemedText className="mb-2">Email Address</ThemedText>
                <View className={`p-4 rounded-xl border ${disabledClass}`}>
                  <ThemedText>{user?.email || 'N/A'}</ThemedText>
                </View>
              </View>

              <View>
                <ThemedText className="mb-2">Date of Birth *</ThemedText>
                <TextInput
                  className={`p-4 rounded-xl border ${inputClass}`}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={placeholderColor}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                  keyboardType="numbers-and-punctuation"
                />
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

            {/* City */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold mb-4">City:</ThemedText>
              <View className={`p-4 rounded-xl border ${disabledClass}`}>
                <ThemedText className="text-gray-500">Gurgaon (Pilot)</ThemedText>
              </View>
            </ThemedCard>

            {/* Transmission Type */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold mb-4">Transmission Type: *</ThemedText>
              <View className="flex-row flex-wrap">
                {[
                  { key: 'manual', label: 'Manual' },
                  { key: 'automatic', label: 'Automatic' },
                  { key: 'both', label: 'Both' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setFormData({...formData, transmissionType: option.key})}
                    className="mr-6 mb-3 flex-row items-center"
                  >
                    <View className={`w-5 h-5 rounded-full border-2 ${
                      formData.transmissionType === option.key ? 'border-burgundy bg-burgundy' : 'border-gray-400'
                    } mr-2`}>
                      {formData.transmissionType === option.key && (
                        <View className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </View>
                    <ThemedText>{option.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Uniform Size */}
            <ThemedCard className="p-4 mb-6">
              <ThemedText className="font-bold mb-4">Uniform Size: *</ThemedText>
              <View className="flex-row flex-wrap">
                {['M', 'L', 'XL'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setFormData({...formData, uniformSize: size})}
                    className="mr-6 mb-3 flex-row items-center"
                  >
                    <View className={`w-5 h-5 rounded-full border-2 ${
                      formData.uniformSize === size ? 'border-burgundy bg-burgundy' : 'border-gray-400'
                    } mr-2`}>
                      {formData.uniformSize === size && (
                        <View className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </View>
                    <ThemedText>{size}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity className="mt-2">
                <ThemedText className="text-burgundy underline text-sm">View Size Chart</ThemedText>
              </TouchableOpacity>
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
