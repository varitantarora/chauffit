import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MarkdownDisplay from 'react-native-markdown-display';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import BlogApiService, { BlogDetail } from '../../services/api/BlogApiService';
import { useAuthStore } from '../../store/authStore';
import { BrandColors, useThemeColors } from '../../constants/Colors';

export default function BlogDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!slug) {
      setError('Blog slug is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await BlogApiService.getBlogDetail(slug);

      if (response.success && response.data) {
        setBlog(response.data);
      } else {
        setError(response.error || 'Failed to load blog');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('An error occurred while loading the blog');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const markdownStyles = {
    heading1: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: 'bold',
      marginVertical: 12,
    },
    heading2: {
      color: BrandColors.secondary,
      fontSize: 22,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    heading3: {
      color: BrandColors.secondary,
      fontSize: 18,
      fontWeight: '600',
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
      textDecorationLine: 'underline',
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
          <ThemedText variant="h2" className="text-lg">Blog</ThemedText>
        </View>

        {/* Content */}
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
        ) : blog ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            {blog.image ? (
              <Image
                source={{ uri: blog.image }}
                className="w-full h-48"
                resizeMode="cover"
              />
            ) : null}

            {/* Blog Content */}
            <View className="px-4 py-6">
              {/* Title */}
              <ThemedText variant="h1" className="text-2xl font-bold mb-3">
                {blog.title}
              </ThemedText>

              {/* Author and Date */}
              <View className="flex-row items-center gap-3 mb-6 pb-4 border-b border-border dark:border-darkBorder">
                <View>
                  <ThemedText variant="caption" className="font-semibold">
                    {blog.author_name}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary mt-1">
                    {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
                  </ThemedText>
                </View>
              </View>

              {/* Markdown Content */}
              <MarkdownDisplay style={markdownStyles}>
                {blog.content}
              </MarkdownDisplay>
            </View>

            <View className="h-4" />
          </ScrollView>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}
