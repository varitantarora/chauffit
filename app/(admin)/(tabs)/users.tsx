import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { FilterPills } from '../../../components/admin/FilterPills';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';
import { AdminUser } from '../../../services/api/AdminApiService';

const typeFilters = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'customer' },
  { label: 'Drivers', value: 'driver' },
  { label: 'Bikers', value: 'biker' },
  { label: 'Admins', value: 'admin' },
  { label: 'Super Admins', value: 'super_admin' },
];

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
];

export default function AdminUsers() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { users, usersLoading, fetchUsers } = useAdminStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params: any = {};
    if (typeFilter) params.user_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    fetchUsers(Object.keys(params).length > 0 ? params : undefined);
  }, [typeFilter, statusFilter]);

  const onRefresh = useCallback(() => {
    const params: any = {};
    if (typeFilter) params.user_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    fetchUsers(Object.keys(params).length > 0 ? params : undefined);
  }, [typeFilter, statusFilter]);

  const renderUser = ({ item }: { item: AdminUser }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/user-detail', params: { id: item.id } })}
      className="flex-row items-center p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.burgundy + '15' }}>
        <Ionicons name="person" size={20} color={colors.burgundy} />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">{item.full_name || `${item.first_name} ${item.last_name}`}</ThemedText>
        <ThemedText variant="tiny">{item.email}</ThemedText>
      </View>
      <View className="items-end gap-1">
        <StatusBadge status={item.user_type} />
        <StatusBadge status={item.status} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-4 pt-4">
        <ThemedText variant="h2" className="mb-4">Users</ThemedText>
        <FilterPills options={typeFilters} selected={typeFilter} onSelect={setTypeFilter} />
        <FilterPills options={statusFilters} selected={statusFilter} onSelect={setStatusFilter} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={usersLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !usersLoading ? (
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No users found</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
