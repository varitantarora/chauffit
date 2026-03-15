import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MarkdownDisplay from 'react-native-markdown-display';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import ConfigApiService from '../../services/api/ConfigApiService';
import { useAuthStore } from '../../store/authStore';
import { BrandColors, useThemeColors } from '../../constants/Colors';

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTnC() {
      try {
        const response = await ConfigApiService.getByKey('terms_and_conditions');
        if (response.success && response.data) {
          setContent(response.data.value);
        } else {
          setError(response.error || 'Failed to load Terms and Conditions');
        }
      } catch {
        setError('An error occurred while loading Terms and Conditions');
      } finally {
        setLoading(false);
      }
    }
    fetchTnC();
  }, []);

  const markdownStyles = {
    heading1: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: 'bold' as const,
      marginVertical: 12,
    },
    heading2: {
      color: BrandColors.secondary,
      fontSize: 22,
      fontWeight: 'bold' as const,
      marginVertical: 10,
    },
    heading3: {
      color: BrandColors.secondary,
      fontSize: 18,
      fontWeight: '600' as const,
      marginVertical: 8,
    },
    paragraph: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 22,
      marginVertical: 8,
    },
    link: {
      color: BrandColors.secondary,
      textDecorationLine: 'underline' as const,
    },
    code_inline: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      color: BrandColors.secondary,
      paddingHorizontal: 4,
      paddingVertical: 2,
      fontSize: 12,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      color: colors.textPrimary,
      padding: 12,
      borderRadius: 8,
      fontSize: 12,
      marginVertical: 8,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: BrandColors.secondary,
      paddingLeft: 12,
      marginLeft: 0,
      marginVertical: 8,
      color: colors.textSecondary,
    },
    list_item: {
      marginVertical: 4,
      color: colors.textPrimary,
    },
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 border-b border-border dark:border-darkBorder flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h2" className="text-lg">Terms and Conditions</ThemedText>
        </View>

        {/* States */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={BrandColors.secondary} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="alert-circle-outline" size={48} color={BrandColors.danger} />
            <ThemedText variant="title" className="mt-4 text-center">Oops!</ThemedText>
            <ThemedText variant="body" className="mt-2 text-center text-textSecondary dark:text-darkTextSecondary">
              {error}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 bg-secondary px-6 py-3 rounded-lg"
            >
              <ThemedText className="text-white font-semibold">Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        ) : content ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="px-4 py-6">
              <MarkdownDisplay style={markdownStyles}>{content}</MarkdownDisplay>
            </View>
            <View className="h-4" />
          </ScrollView>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}
