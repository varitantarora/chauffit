import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { ThemedCard } from '../../components/common/ThemedCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import BikerApiService, { BikerProfile } from '../../services/api/BikerApiService';

export default function BikerEditProfileScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const refreshAuthProfile = useAuthStore((state) => state.fetchProfile);

  const [profile, setProfile] = useState<BikerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [languages, setLanguages] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await BikerApiService.getProfile();
        if (response.success && response.data) {
          const data = response.data;
          setProfile(data);
          setBio(data.bio || '');
          setYearsOfExperience(
            data.years_of_experience !== undefined && data.years_of_experience !== null
              ? String(data.years_of_experience)
              : ''
          );
          if (Array.isArray(data.languages_spoken)) {
            setLanguages(data.languages_spoken.join(', '));
          } else if (typeof data.languages_spoken === 'string') {
            setLanguages(data.languages_spoken);
          } else {
            setLanguages('');
          }
        } else {
          Alert.alert('Error', response.error || 'Failed to load biker profile');
          router.back();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load biker profile');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'Biker profile not found');
      return;
    }

    const parsedYears = yearsOfExperience.trim() === '' ? undefined : Number(yearsOfExperience);
    if (parsedYears !== undefined && (Number.isNaN(parsedYears) || parsedYears < 0 || parsedYears > 50)) {
      Alert.alert('Invalid value', 'Years of experience must be a number between 0 and 50');
      return;
    }

    const languagesList = languages
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      const response = await BikerApiService.patchProfile(profile.id, {
        bio: bio.trim() || undefined,
        years_of_experience: parsedYears,
        languages_spoken: languagesList.length > 0 ? languagesList : undefined,
      });

      if (response.success) {
        await refreshAuthProfile();
        Alert.alert('Profile Updated', 'Your biker profile was updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#BD8C5E" />
          <ThemedText className="mt-3">Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title">Edit Biker Profile</ThemedText>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-semibold mb-2">Bio</ThemedText>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us a little about your riding background"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              className="p-3 border border-border dark:border-darkBorder rounded-lg"
              style={{
                minHeight: 100,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#d9d1c6' : '#314b4c',
              }}
            />
          </ThemedCard>

          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-semibold mb-2">Years of Experience</ThemedText>
            <TextInput
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              placeholder="0 - 50"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              keyboardType="number-pad"
              className="p-3 border border-border dark:border-darkBorder rounded-lg"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#d9d1c6' : '#314b4c',
              }}
            />
          </ThemedCard>

          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-semibold mb-2">Languages (comma separated)</ThemedText>
            <TextInput
              value={languages}
              onChangeText={setLanguages}
              placeholder="English, Hindi"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              className="p-3 border border-border dark:border-darkBorder rounded-lg"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#d9d1c6' : '#314b4c',
              }}
            />
          </ThemedCard>
        </ScrollView>

        <View className="p-4 border-t border-border dark:border-darkBorder">
          <PrimaryButton
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
