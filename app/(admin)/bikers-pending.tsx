import React, { useEffect, useCallback } from 'react';
import { FlatList, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AdminBiker } from '../../services/api/AdminApiService';

export default function BikersPending() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { pendingBikers, bikersLoading, fetchPendingBikers } = useAdminStore();

  useEffect(() => {
    fetchPendingBikers();
  }, []);

  const onRefresh = useCallback(() => {
    fetchPendingBikers();
  }, []);

  const renderBiker = ({ item }: { item: AdminBiker }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/biker-verification', params: { id: item.id } })}
      className="flex-row items-center p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#F59E0B20' }}>
        <Ionicons name="bicycle" size={20} color="#F59E0B" />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">{item.user_details.full_name || `${item.user_details.first_name} ${item.user_details.last_name}`}</ThemedText>
        <ThemedText variant="tiny">{item.user_details.email}</ThemedText>
      </View>
      <StatusBadge status="pending" />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Pending Biker Verifications</ThemedText>
      </View>
      <FlatList
        data={pendingBikers}
        keyExtractor={(item) => item.id}
        renderItem={renderBiker}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={bikersLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !bikersLoading ? (
            <View className="items-center py-12">
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No pending verifications</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
