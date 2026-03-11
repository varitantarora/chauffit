import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService from '../../../services/api/DriverApiService';

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
    applicationType: 'driver',
    licenseNumber: '',
    licenseExpiryDate: '',
    aadharNumber: '',
    experience: '',
    transmissionType: '',
    uniformSize: '',
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [licenseExpiry, setLicenseExpiry] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const parseExperience = (exp: string): number => {
    switch (exp) {
      case '0-2': return 2;
      case '3-5': return 5;
      case '6-10': return 10;
      case '10+': return 12;
      default: return 0;
    }
  };

  const handleContinue = async () => {
    // Validate all required fields
    if (!dateOfBirth) {
      Alert.alert('Missing Information', 'Please select your date of birth.');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter your license number.');
      return;
    }
    if (!licenseExpiry) {
      Alert.alert('Missing Information', 'Please select your license expiry date.');
      return;
    }
    if (!formData.aadharNumber.trim() || formData.aadharNumber.length !== 12) {
      Alert.alert('Missing Information', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!formData.experience) {
      Alert.alert('Missing Information', 'Please select your years of experience.');
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

    setLoading(true);
    try {
      const expYears = parseExperience(formData.experience);
      const licenseExpiryStr = format(licenseExpiry, 'yyyy-MM-dd');

      const response = await DriverApiService.createProfile({
        license_number: formData.licenseNumber,
        license_expiry_date: licenseExpiryStr,
        aadhar_number: formData.aadharNumber,
        years_of_experience: expYears,
        transmission_type: formData.transmissionType as any,
        uniform_size: formData.uniformSize as any,
        city: 'Gurgaon',
      });

      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to save profile. Please try again.');
        return;
      }

      router.push('/(driver)/onboarding/documents');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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

              {/* Date of Birth Picker */}
              <View>
                <ThemedText className="mb-2">Date of Birth *</ThemedText>
                <TouchableOpacity onPress={() => setShowDobPicker(true)}>
                  <View className={`p-4 rounded-xl border ${inputClass} items-center justify-between flex-row`}>
                    <ThemedText>
                      {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Select date'}
                    </ThemedText>
                    <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#d1d5db' : '#6b7280'} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* License Number */}
              <View>
                <ThemedText className="mb-2">License Number *</ThemedText>
                <TextInput
                  className={`p-4 rounded-xl border ${inputClass}`}
                  placeholder="e.g., DL01AA1234"
                  placeholderTextColor={placeholderColor}
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({...formData, licenseNumber: text})}
                />
              </View>

              {/* License Expiry Date Picker */}
              <View>
                <ThemedText className="mb-2">License Expiry Date *</ThemedText>
                <TouchableOpacity onPress={() => setShowExpiryPicker(true)}>
                  <View className={`p-4 rounded-xl border ${inputClass} items-center justify-between flex-row`}>
                    <ThemedText>
                      {licenseExpiry ? format(licenseExpiry, 'dd/MM/yyyy') : 'Select date'}
                    </ThemedText>
                    <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#d1d5db' : '#6b7280'} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Aadhaar Number */}
              <View>
                <ThemedText className="mb-2">Aadhaar Number * (12 digits)</ThemedText>
                <TextInput
                  className={`p-4 rounded-xl border ${inputClass}`}
                  placeholder="e.g., 123456789012"
                  placeholderTextColor={placeholderColor}
                  value={formData.aadharNumber}
                  onChangeText={(text) => {
                    const digits = text.replace(/[^0-9]/g, '').slice(0, 12);
                    setFormData({...formData, aadharNumber: digits});
                  }}
                  keyboardType="numeric"
                  maxLength={12}
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
              loading={loading}
              className="mb-6"
            />
          </View>
        </ScrollView>

        {/* Date of Birth Picker */}
        {showDobPicker && (
          Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/50">
                <ThemedView className="rounded-t-3xl">
                  <View className="flex-row justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
                    <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                      <ThemedText className="text-burgundy font-bold">Cancel</ThemedText>
                    </TouchableOpacity>
                    <ThemedText className="font-bold">Select Date</ThemedText>
                    <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                      <ThemedText className="text-burgundy font-bold">Done</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    textColor={isDarkMode ? '#ffffff' : '#000000'}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    onChange={(event, date) => {
                      if (date) setDateOfBirth(date);
                    }}
                  />
                </ThemedView>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              onChange={(event, date) => {
                setShowDobPicker(false);
                if (date) setDateOfBirth(date);
              }}
            />
          )
        )}

        {/* License Expiry Date Picker */}
        {showExpiryPicker && (
          Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/50">
                <ThemedView className="rounded-t-3xl">
                  <View className="flex-row justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
                    <TouchableOpacity onPress={() => setShowExpiryPicker(false)}>
                      <ThemedText className="text-burgundy font-bold">Cancel</ThemedText>
                    </TouchableOpacity>
                    <ThemedText className="font-bold">Select Date</ThemedText>
                    <TouchableOpacity onPress={() => setShowExpiryPicker(false)}>
                      <ThemedText className="text-burgundy font-bold">Done</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={licenseExpiry || new Date()}
                    mode="date"
                    display="spinner"
                    textColor={isDarkMode ? '#ffffff' : '#000000'}
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      if (date) setLicenseExpiry(date);
                    }}
                  />
                </ThemedView>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={licenseExpiry || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowExpiryPicker(false);
                if (date) setLicenseExpiry(date);
              }}
            />
          )
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
