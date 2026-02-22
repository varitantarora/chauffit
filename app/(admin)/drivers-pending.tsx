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
import { AdminDriver } from '../../services/api/AdminApiService';

export default function DriversPending() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { pendingDrivers, driversLoading, fetchPendingDrivers } = useAdminStore();

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const onRefresh = useCallback(() => {
    fetchPendingDrivers();
  }, []);

  const renderDriver = ({ item }: { item: AdminDriver }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/driver-verification', params: { id: item.id } })}
      className="flex-row items-center p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#8B5CF620' }}>
        <Ionicons name="car" size={20} color="#8B5CF6" />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">{item.user_details.full_name || `${item.user_details.first_name} ${item.user_details.last_name}`}</ThemedText>
        <ThemedText variant="tiny">{item.user_details.email}</ThemedText>
        <ThemedText variant="tiny">License: {item.license_number || 'N/A'}</ThemedText>
      </View>
      <View className="items-end">
        <StatusBadge status="pending" />
        <ThemedText variant="tiny" className="mt-1">{item.documents?.length || 0} docs</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Pending Driver Verifications</ThemedText>
      </View>
      <FlatList
        data={pendingDrivers}
        keyExtractor={(item) => item.id}
        renderItem={renderDriver}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={driversLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !driversLoading ? (
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
