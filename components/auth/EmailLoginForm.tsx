import React from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../common/PrimaryButton';

interface EmailLoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleEmailLogin: () => void;
  loading: boolean;
  inputClass: string;
  iconColor: string;
}

export const EmailLoginForm = React.memo(({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleEmailLogin, 
  loading, 
  inputClass, 
  iconColor 
}: EmailLoginFormProps) => {
  return (
    <>
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
  );
});