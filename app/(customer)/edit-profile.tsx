import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import AuthApiService from '../../services/api/AuthApiService';

export default function CustomerEditProfile() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const updateUser = useAuthStore((state) => state.updateProfile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [initialName, setInitialName] = useState({ firstName: '', lastName: '' });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await AuthApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data;
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setInitialName({ firstName: profile.first_name || '', lastName: profile.last_name || '' });
          setProfilePicture(profile.profile_picture || null);
          updateUser({
            name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            avatar: profile.profile_picture,
          });
        } else {
          await fetchProfile();
          const user = useAuthStore.getState().user;
          const nameParts = user?.name?.split(' ') || [];
          const first = nameParts[0] || '';
          const last = nameParts.slice(1).join(' ') || '';
          setFirstName(first);
          setLastName(last);
          setInitialName({ firstName: first, lastName: last });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [fetchProfile, updateUser]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    const hasChanges =
      firstName.trim() !== initialName.firstName.trim() ||
      lastName.trim() !== initialName.lastName.trim() ||
      profilePictureFile !== null;

    if (!hasChanges) {
      router.back();
      return;
    }

    try {
      setSaving(true);
      const response = await AuthApiService.patchProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(profilePictureFile ? { profile_picture: profilePictureFile } : {}),
      });

      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to update profile');
        return;
      }

      // Refresh profile from API after update
      await fetchProfile();

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
        setProfilePictureFile({
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
        setProfilePictureFile({
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose a profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
      ]
    );
  };

  const removeProfilePicture = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProfilePicture(null);
            setProfilePictureFile(null);
          },
        },
      ]
    );
  };

  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary border-border';

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#BD8C5E" />
          <ThemedText className="mt-4">Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="h3">Edit Profile</ThemedText>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-6">
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-secondary/10 items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} className="w-28 h-28" />
                ) : (
                  <Ionicons name="person" size={42} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                )}
              </View>
              {profilePicture ? (
                <TouchableOpacity
                  onPress={removeProfilePicture}
                  className="absolute -bottom-1 -right-1 bg-danger rounded-full p-2"
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={showImagePickerOptions}
                  className="absolute -bottom-1 -right-1 bg-burgundy rounded-full p-2"
                >
                  <Ionicons name="camera" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={showImagePickerOptions} className="mt-4 flex-row items-center">
              <Ionicons
                name={profilePicture ? 'camera' : 'person-add'}
                size={18}
                color="#BD8C5E"
              />
              <ThemedText variant="small" className="text-secondary font-semibold ml-2">
                {profilePicture ? 'Change Photo' : 'Add Photo'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <ThemedText variant="small" className="mb-2 font-semibold">
              First Name *
            </ThemedText>
            <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
              <Ionicons name="person" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="First name"
                placeholderTextColor={isDarkMode ? '#d9d1c6' : '#9CA3AF'}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>

          <View className="mb-5">
            <ThemedText variant="small" className="mb-2 font-semibold">
              Last Name
            </ThemedText>
            <View className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}>
              <Ionicons name="person-outline" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Last name"
                placeholderTextColor={isDarkMode ? '#d9d1c6' : '#9CA3AF'}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#BD8C5E" />
              <View className="flex-1 ml-3">
                <ThemedText variant="small" className="font-semibold mb-1">
                  Profile name
                </ThemedText>
                <ThemedText variant="tiny" className="text-textSecondary leading-4">
                  This name is shown to drivers and bikers during your bookings.
                </ThemedText>
              </View>
            </View>
          </View>

          <PrimaryButton title="Save Changes" onPress={handleSave} loading={saving} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
