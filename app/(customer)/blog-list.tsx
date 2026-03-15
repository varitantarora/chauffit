import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import BlogApiService, { BlogListItem, PaginatedBlogList } from '../../services/api/BlogApiService';
import { useAuthStore } from '../../store/authStore';
import { BrandColors, useThemeColors } from '../../constants/Colors';

export default function BlogListScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingMore = useRef(false);

  const fetchBlogs = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const response = await BlogApiService.listBlogs(page);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedBlogList;
        if (isRefresh) {
          setBlogs(paginatedData.results);
        } else if (page === 1) {
          setBlogs(paginatedData.results);
        } else {
          setBlogs((prev) => [...prev, ...paginatedData.results]);
        }
        setCurrentPage(page);
        setTotalPages(Math.ceil(paginatedData.count / 10)); // Assuming 10 per page
        setHasMore(!!paginatedData.next);
      } else {
        if (isRefresh) {
          setBlogs([]);
        }
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingMore.current = false;
    }
  }, []);

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore.current && hasMore && currentPage < totalPages) {
      loadingMore.current = true;
      fetchBlogs(currentPage + 1);
    }
  }, [currentPage, totalPages, hasMore, fetchBlogs]);

  const onRefresh = useCallback(async () => {
    await fetchBlogs(1, true);
  }, [fetchBlogs]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderBlogItem = ({ item }: { item: BlogListItem }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(customer)/blog-detail', params: { slug: item.slug } })}
      activeOpacity={0.7}
    >
      <ThemedCard className="mb-4">
        <View className="flex-row gap-3">
          {item.image ? (
            <Image source={{ uri: item.image }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
          ) : (
            <View className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-darkSurface items-center justify-center">
              <Ionicons name="image-outline" size={32} color={colors.border} />
            </View>
          )}
          <View className="flex-1">
            <ThemedText className="font-semibold text-sm mb-1" numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary mb-2">
              {item.author_name}
            </ThemedText>
            <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
              {item.published_at ? formatDate(item.published_at) : formatDate(item.created_at)}
            </ThemedText>
          </View>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore || currentPage >= totalPages) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={BrandColors.secondary} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h2" className="text-xl">All Blogs</ThemedText>
          </View>
        </View>

        {/* Blog List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={BrandColors.secondary} />
          </View>
        ) : blogs.length > 0 ? (
          <FlatList
            data={blogs}
            renderItem={renderBlogItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="document-outline" size={48} color={colors.border} />
            <ThemedText variant="title" className="mt-4 text-center">No Blogs Yet</ThemedText>
            <ThemedText variant="body" className="mt-2 text-center text-textSecondary dark:text-darkTextSecondary">
              Check back later for new articles
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
