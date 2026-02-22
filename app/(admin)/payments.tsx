import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, View, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { FilterPills } from '../../components/admin/FilterPills';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AdminPayment } from '../../services/api/AdminApiService';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

export default function Payments() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { payments, paymentsLoading, fetchPayments } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback((status: string, search: string) => {
    const params: { status?: string; search?: string } = {};
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();
    fetchPayments(Object.keys(params).length > 0 ? params : undefined);
  }, [fetchPayments]);

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

  const renderPayment = ({ item }: { item: AdminPayment }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/payment-detail', params: { id: item.id } })}
      className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      {/* Header: Amount + Status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.secondary + '20' }}>
            <Ionicons name="card" size={18} color={colors.secondary} />
          </View>
          <View>
            <ThemedText className="font-bold text-lg">₹{item.amount}</ThemedText>
            {item.net_amount && item.net_amount !== item.amount && (
              <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Net: ₹{item.net_amount}</ThemedText>
            )}
          </View>
        </View>
        <StatusBadge status={item.payment_status} />
      </View>

      {/* Details */}
      <View className="ml-12 mb-2">
        <View className="flex-row items-center mb-1">
          <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
          <ThemedText variant="small" className="ml-1.5">
            {item.customer_name || item.customer?.full_name || 'N/A'}
          </ThemedText>
        </View>
        {item.booking_reference && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="document-text-outline" size={13} color={colors.textSecondary} />
            <ThemedText variant="tiny" className="ml-1.5">Booking: #{item.booking_reference}</ThemedText>
          </View>
        )}
        {item.payment_reference && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="receipt-outline" size={13} color={colors.textSecondary} />
            <ThemedText variant="tiny" className="ml-1.5">Ref: {item.payment_reference}</ThemedText>
          </View>
        )}
      </View>

      {/* Footer: Type + Date */}
      <View className="flex-row items-center justify-between ml-12 pt-2 border-t border-border dark:border-darkBorder">
        {item.payment_type_display || item.payment_type ? (
          <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
            {item.payment_type_display || item.payment_type}
          </ThemedText>
        ) : (
          <View />
        )}
        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
          {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Payments</ThemedText>
      </View>

      <View className="px-4">
        {/* Search bar */}
        <View
          className="flex-row items-center rounded-xl px-3 mb-3 border border-border dark:border-darkBorder"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search by reference, customer name..."
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

        {/* Status filter pills */}
        <FilterPills options={statusFilters} selected={statusFilter} onSelect={setStatusFilter} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={paymentsLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !paymentsLoading ? (
            <View className="items-center py-12">
              <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No payments found</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
