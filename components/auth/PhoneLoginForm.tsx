import React from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { PrimaryButton } from '../common/PrimaryButton';

interface PhoneLoginFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handlePhoneLogin: () => void;
  loading: boolean;
  inputClass: string;
  iconColor: string;
}

export const PhoneLoginForm = React.memo(({ 
  phoneNumber, 
  setPhoneNumber, 
  handlePhoneLogin, 
  loading, 
  inputClass, 
  iconColor 
}: PhoneLoginFormProps) => {
  return (
    <>
      <View className={`flex-row items-center p-4 rounded-xl border mb-6 ${inputClass}`}>
        <ThemedText className="text-textSecondary dark:text-darkTextSecondary mr-2">+91</ThemedText>
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
  );
});