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
import DriverApiService from '../../services/api/DriverApiService';
import { appConfig } from '../../config/env';

export default function DriverEditProfile() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<any>(null);

  // Helper to get full image URL
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await DriverApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data;
          setDriverProfile(profile);
          setBio(profile.bio || '');
          setInitialBio(profile.bio || '');
        }
      } catch (error) {
        console.error('Error loading driver profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    const hasChanges = bio.trim() !== initialBio.trim() || profilePictureFile !== null;

    if (!hasChanges) {
      router.back();
      return;
    }

    try {
      setSaving(true);

      if (!driverProfile?.id) {
        Alert.alert('Error', 'Driver profile not found');
        return;
      }

      const updateData: any = {
        bio: bio.trim(),
      };

      if (profilePictureFile) {
        updateData.profile_picture = profilePictureFile;
      }

      const response = await DriverApiService.patchProfile(driverProfile.id, updateData);

      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to update profile');
        return;
      }

      // Update avatar in auth store with the new avatar URL from API response
      if (profilePictureFile && response.data) {
        const avatarUrl = (response.data as any).profile_picture_url || (response.data as any).avatar || (response.data as any).profile_picture;
        if (avatarUrl) {
          updateProfile({
            avatar: avatarUrl,
          });
        }
      }

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const displayAvatar = profilePicture || (user?.avatar ? getImageUrl(user.avatar) : null);

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
                {displayAvatar ? (
                  <Image source={{ uri: displayAvatar }} className="w-28 h-28" />
                ) : (
                  <Ionicons name="person" size={42} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                )}
              </View>
              {displayAvatar ? (
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
                name={displayAvatar ? 'camera' : 'person-add'}
                size={18}
                color="#BD8C5E"
              />
              <ThemedText variant="small" className="text-secondary font-semibold ml-2">
                {displayAvatar ? 'Change Photo' : 'Add Photo'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <ThemedText variant="small" className="mb-2 font-semibold">
              Bio
            </ThemedText>
            <View className={`p-4 rounded-xl border ${inputClass}`}>
              <TextInput
                className="text-base min-h-20"
                placeholder="Tell passengers about yourself..."
                placeholderTextColor={isDarkMode ? '#d9d1c6' : '#9CA3AF'}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#BD8C5E" />
              <View className="flex-1 ml-3">
                <ThemedText variant="small" className="font-semibold mb-1">
                  Profile information
                </ThemedText>
                <ThemedText variant="tiny" className="text-textSecondary leading-4">
                  Your profile photo and bio are shown to passengers when they book rides with you.
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
