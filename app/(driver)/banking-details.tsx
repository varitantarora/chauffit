import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface BankingDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: 'savings' | 'current';
  upiId: string;
  panNumber: string;
}

export default function BankingDetailsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [bankingDetails, setBankingDetails] = useState<BankingDetails>({
    accountHolderName: user?.name || '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountType: 'savings',
    upiId: '',
    panNumber: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock existing data (in real app this would come from API)
  const hasExistingData = false; // Set to true to show saved data

  const handleSave = async () => {
    // Validation
    if (!bankingDetails.accountHolderName.trim()) {
      Alert.alert('Missing Information', 'Please enter account holder name.');
      return;
    }

    if (!bankingDetails.accountNumber.trim() || bankingDetails.accountNumber.length < 9) {
      Alert.alert('Invalid Account Number', 'Please enter a valid account number.');
      return;
    }

    if (bankingDetails.accountNumber !== bankingDetails.confirmAccountNumber) {
      Alert.alert('Account Number Mismatch', 'Account numbers do not match.');
      return;
    }

    if (!bankingDetails.ifscCode.trim() || bankingDetails.ifscCode.length !== 11) {
      Alert.alert('Invalid IFSC Code', 'Please enter a valid IFSC code.');
      return;
    }

    if (!bankingDetails.bankName.trim()) {
      Alert.alert('Missing Information', 'Please enter bank name.');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Banking details saved successfully!');
      setIsEditing(false);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save banking details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-gray-200';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Banking Details</ThemedText>
          </View>
          
          {!isEditing && hasExistingData && (
            <TouchableOpacity onPress={handleEdit}>
              <Ionicons name="create" size={24} color="#BD8C5E" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Bank Account Information
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600">
                Add your bank details to receive payments for completed rides. All information is encrypted and secure.
              </ThemedText>
            </View>

            {/* Security Notice */}
            <ThemedCard variant="elevated" className="mb-6 p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold mb-1">
                    Your Data is Secure
                  </ThemedText>
                  <ThemedText variant="small" className="text-gray-600">
                    All banking information is encrypted with bank-grade security and never shared with third parties.
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Account Details Form */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Account Details
              </ThemedText>
              
              {/* Account Holder Name */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Account Holder Name *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="Full name as per bank records"
                  placeholderTextColor="#999"
                  value={bankingDetails.accountHolderName}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, accountHolderName: text }))}
                  editable={isEditing || !hasExistingData}
                  autoCapitalize="words"
                />
              </View>

              {/* Account Number */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Account Number *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="Enter your bank account number"
                  placeholderTextColor="#999"
                  value={bankingDetails.accountNumber}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, accountNumber: text.replace(/[^0-9]/g, '') }))}
                  editable={isEditing || !hasExistingData}
                  keyboardType="numeric"
                  maxLength={18}
                  secureTextEntry={!isEditing && hasExistingData}
                />
              </View>

              {/* Confirm Account Number */}
              {(isEditing || !hasExistingData) && (
                <View className="mb-4">
                  <ThemedText variant="small" className="mb-2 text-gray-600">
                    Confirm Account Number *
                  </ThemedText>
                  <TextInput
                    className={`p-3 rounded-xl border ${inputClass}`}
                    placeholder="Re-enter your account number"
                    placeholderTextColor="#999"
                    value={bankingDetails.confirmAccountNumber}
                    onChangeText={(text) => setBankingDetails(prev => ({ ...prev, confirmAccountNumber: text.replace(/[^0-9]/g, '') }))}
                    keyboardType="numeric"
                    maxLength={18}
                  />
                </View>
              )}

              {/* IFSC Code */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  IFSC Code *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="e.g., SBIN0001234"
                  placeholderTextColor="#999"
                  value={bankingDetails.ifscCode}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, ifscCode: text.toUpperCase() }))}
                  editable={isEditing || !hasExistingData}
                  autoCapitalize="characters"
                  maxLength={11}
                />
              </View>

              {/* Bank Name */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Bank Name *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="e.g., State Bank of India"
                  placeholderTextColor="#999"
                  value={bankingDetails.bankName}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, bankName: text }))}
                  editable={isEditing || !hasExistingData}
                  autoCapitalize="words"
                />
              </View>

              {/* Account Type */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Account Type *
                </ThemedText>
                <View className="flex-row">
                  {['savings', 'current'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setBankingDetails(prev => ({ ...prev, accountType: type as 'savings' | 'current' }))}
                      disabled={!isEditing && hasExistingData}
                      className={`flex-1 p-3 rounded-xl border mr-2 ${
                        bankingDetails.accountType === type 
                          ? 'bg-burgundy border-burgundy' 
                          : inputClass
                      }`}
                    >
                      <ThemedText 
                        className={`text-center capitalize ${bankingDetails.accountType === type ? 'text-white' : ''}`}
                      >
                        {type}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ThemedCard>

            {/* Additional Details */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Additional Information
              </ThemedText>

              {/* UPI ID */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  UPI ID (Optional)
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="your-upi@paytm"
                  placeholderTextColor="#999"
                  value={bankingDetails.upiId}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, upiId: text.toLowerCase() }))}
                  editable={isEditing || !hasExistingData}
                  keyboardType="email-address"
                />
              </View>

              {/* PAN Number */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  PAN Number *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="ABCDE1234F"
                  placeholderTextColor="#999"
                  value={bankingDetails.panNumber}
                  onChangeText={(text) => setBankingDetails(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
                  editable={isEditing || !hasExistingData}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            </ThemedCard>

            {/* Payment Schedule Info */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Payment Schedule
              </ThemedText>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="#BD8C5E" />
                  <ThemedText variant="small" className="ml-3 text-gray-700">
                    Payments are processed every Tuesday and Friday
                  </ThemedText>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#BD8C5E" />
                  <ThemedText variant="small" className="ml-3 text-gray-700">
                    Funds typically arrive within 24-48 hours
                  </ThemedText>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="card" size={20} color="#BD8C5E" />
                  <ThemedText variant="small" className="ml-3 text-gray-700">
                    Minimum payout amount: ₹100
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Action Buttons */}
            {isEditing || !hasExistingData ? (
              <View className="flex-row space-x-3">
                <PrimaryButton
                  title={isSaving ? "Saving..." : "Save Details"}
                  onPress={handleSave}
                  disabled={isSaving}
                  className="flex-1 mr-2"
                />
                {isEditing && (
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 border border-gray-300 py-3 rounded-xl ml-2"
                  >
                    <ThemedText className="text-center text-gray-600">Cancel</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center">
                <View className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <ThemedText className="text-green-600 font-semibold">
                    Banking details verified ✓
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Help Section */}
            <View className="mt-6">
              <ThemedText variant="small" className="text-gray-500 text-center mb-2">
                Need help setting up your banking details?
              </ThemedText>
              <TouchableOpacity 
                onPress={() => router.push('/(driver)/support')}
                className="items-center"
              >
                <ThemedText variant="small" className="text-burgundy underline">
                  Contact Support
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}