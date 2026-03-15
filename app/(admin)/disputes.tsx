import React, { useEffect, useCallback } from 'react';
import { FlatList, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, useThemeColors} from '../../constants/Colors';
import { AdminDispute } from '../../services/api/AdminApiService';

export default function Disputes() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { disputes, disputesLoading, fetchDisputes } = useAdminStore();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const onRefresh = useCallback(() => {
    fetchDisputes();
  }, []);

  const renderDispute = ({ item }: { item: AdminDispute }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/dispute-detail', params: { id: item.id } })}
      className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="font-semibold flex-1 mr-2" numberOfLines={1}>{item.reason}</ThemedText>
        <StatusBadge status={item.status} />
      </View>
      <ThemedText variant="tiny" numberOfLines={2} className="mb-2">{item.description}</ThemedText>
      <View className="flex-row items-center justify-between">
        <ThemedText variant="tiny">{item.raised_by?.full_name || 'N/A'}</ThemedText>
        <ThemedText variant="tiny">{new Date(item.created_at).toLocaleDateString()}</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Disputes</ThemedText>
      </View>
      <FlatList
        data={disputes}
        keyExtractor={(item) => item.id}
        renderItem={renderDispute}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={disputesLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !disputesLoading ? (
            <View className="items-center py-12">
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No disputes</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
