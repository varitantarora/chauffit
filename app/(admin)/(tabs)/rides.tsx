import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, View, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { FilterPills } from '../../../components/admin/FilterPills';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';
import { AdminRide } from '../../../services/api/AdminApiService';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Requested', value: 'requested' },
  { label: 'In Progress', value: 'trip_started' },
  { label: 'Completed', value: 'trip_completed' },
  { label: 'Cancelled', value: 'cancelled_by_customer' },
];

export default function AdminRides() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { rides, ridesLoading, fetchRides } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback((status: string, search: string) => {
    const params: { status?: string; search?: string } = {};
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();
    fetchRides(Object.keys(params).length > 0 ? params : undefined);
  }, [fetchRides]);

  useEffect(() => {
    doFetch(statusFilter, searchQuery);
  }, [statusFilter]);

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      doFetch(statusFilter, text);
    }, 500);
  };

  const onRefresh = useCallback(() => {
    doFetch(statusFilter, searchQuery);
  }, [statusFilter, searchQuery, doFetch]);

  const renderRide = ({ item }: { item: AdminRide }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/ride-detail', params: { id: item.id } })}
      className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      {/* Header: Booking ref + Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: colors.burgundy + '15' }}>
            <Ionicons name="car" size={16} color={colors.burgundy} />
          </View>
          <ThemedText className="font-bold">#{item.booking_reference}</ThemedText>
        </View>
        <StatusBadge status={item.booking_status} />
      </View>

      {/* People details */}
      <View className="mb-3">
        <View className="flex-row items-center mb-1.5">
          <Ionicons name="person" size={14} color={colors.textSecondary} />
          <ThemedText variant="small" className="ml-2">
            Customer: <ThemedText className="font-semibold">{item.customer_name || 'N/A'}</ThemedText>
          </ThemedText>
        </View>
        <View className="flex-row items-center mb-1.5">
          <Ionicons name="car-sport" size={14} color={colors.textSecondary} />
          <ThemedText variant="small" className="ml-2">
            Driver: <ThemedText className="font-semibold">{item.driver_name || 'Not assigned'}</ThemedText>
          </ThemedText>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="bicycle" size={14} color={colors.textSecondary} />
          <ThemedText variant="small" className="ml-2">
            Biker: <ThemedText className="font-semibold">{item.biker_name || 'Not assigned'}</ThemedText>
          </ThemedText>
        </View>
      </View>

      {/* Footer: Trip type, fare, date */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border dark:border-darkBorder">
        <ThemedText variant="tiny">{item.trip_type_display || item.trip_type}</ThemedText>
        <ThemedText className="font-bold text-secondary">₹{item.estimated_fare}</ThemedText>
        <ThemedText variant="tiny">{new Date(item.created_at).toLocaleDateString()}</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-4 pt-4">
        <ThemedText variant="h2" className="mb-3">Rides</ThemedText>

        {/* Search bar */}
        <View
          className="flex-row items-center rounded-xl px-3 mb-3 border border-border dark:border-darkBorder"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search by booking ID, customer or driver name"
            placeholderTextColor={colors.textSecondary}
            className="flex-1 py-2.5 px-2"
            style={{ color: colors.textPrimary, fontSize: 14 }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => { setSearchQuery(''); doFetch(statusFilter, ''); }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <FilterPills options={statusFilters} selected={statusFilter} onSelect={setStatusFilter} />
      </View>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={ridesLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !ridesLoading ? (
            <View className="items-center py-12">
              <Ionicons name="car-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No rides found</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
