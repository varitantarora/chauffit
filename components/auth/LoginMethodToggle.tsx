import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';

interface LoginMethodToggleProps {
  loginMethod: 'phone' | 'email';
  onMethodChange: (method: 'phone' | 'email') => void;
  isDarkMode: boolean;
}

export const LoginMethodToggle = React.memo(({ loginMethod, onMethodChange, isDarkMode }: LoginMethodToggleProps) => {
  return (
    <View className={`flex-row bg-surface rounded-xl p-1 mb-6 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
      <TouchableOpacity
        onPress={() => onMethodChange('phone')}
        className={`flex-1 py-3 px-4 rounded-lg ${
          loginMethod === 'phone'
            ? 'bg-primary shadow-sm'
            : ''
        }`}
      >
        <ThemedText 
          className={`text-center font-semibold ${
            loginMethod === 'phone' ? 'text-burgundy' : 'text-textSecondary dark:text-darkTextSecondary'
          }`}
        >
          Phone
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => onMethodChange('email')}
        className={`flex-1 py-3 px-4 rounded-lg ${
          loginMethod === 'email'
            ? 'bg-primary shadow-sm'
            : ''
        }`}
      >
        <ThemedText 
          className={`text-center font-semibold ${
            loginMethod === 'email' ? 'text-burgundy' : 'text-textSecondary dark:text-darkTextSecondary'
          }`}
        >
          Email
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
});