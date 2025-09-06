import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      login({
        id: '1',
        email: email,
        name: 'Rajesh Kumar',
      });
      setLoading(false);
      router.replace('/');
    }, 1500);
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-border';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6 justify-center">
        <ThemedText variant="title" className="text-center mb-2">
          Welcome to Chauffit
        </ThemedText>
        <ThemedText variant="secondary" className="text-center mb-8">
          Your premium chauffeur service
        </ThemedText>
        
        <TextInput
          className={`p-4 rounded-xl border mb-4 ${inputClass}`}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          className={`p-4 rounded-xl border mb-6 ${inputClass}`}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="mt-4"
        >
          <ThemedText variant="secondary" className="text-center">
            Don't have an account? Sign up
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}