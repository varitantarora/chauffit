import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { UserRole } from '../../types/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const addRole = useAuthStore((state) => state.addRole);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      addRole(selectedRole);
      setActiveRole(selectedRole);
      login({
        id: '1',
        email: email,
        name: name,
        phone: phone,
      });
      setLoading(false);
      router.replace('/');
    }, 1500);
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-border';

  const roleButtonClass = (role: UserRole) => {
    const isSelected = selectedRole === role;
    return `p-4 rounded-xl border ${
      isSelected 
        ? 'bg-primary border-primary' 
        : isDarkMode 
          ? 'bg-darkSurface border-darkBorder' 
          : 'bg-white border-border'
    }`;
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView className="flex-1 px-6 py-8">
          <ThemedText variant="title" className="text-center mb-2">
            Join Chauffit
          </ThemedText>
          <ThemedText variant="secondary" className="text-center mb-8">
            Create your account
          </ThemedText>
          
          <ThemedText variant="secondary" className="mb-2">Select your role:</ThemedText>
          <ThemedView className="flex-row justify-between mb-6">
            {(['customer', 'driver', 'biker'] as UserRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setSelectedRole(role)}
                className={roleButtonClass(role)}
                style={{ flex: 1, marginHorizontal: 4 }}
              >
                <ThemedText 
                  className={`text-center capitalize ${
                    selectedRole === role ? 'text-white' : ''
                  }`}
                >
                  {role}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
          
          <TextInput
            className={`p-4 rounded-xl border mb-4 ${inputClass}`}
            placeholder="Full Name"
            placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
            value={name}
            onChangeText={setName}
          />
          
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
            className={`p-4 rounded-xl border mb-4 ${inputClass}`}
            placeholder="Phone Number"
            placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          
          <TextInput
            className={`p-4 rounded-xl border mb-4 ${inputClass}`}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            className={`p-4 rounded-xl border mb-6 ${inputClass}`}
            placeholder="Confirm Password"
            placeholderTextColor={isDarkMode ? '#d9d1c6' : '#314b4c'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <PrimaryButton
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
          />
          
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="mt-4"
          >
            <ThemedText variant="secondary" className="text-center">
              Already have an account? Login
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}