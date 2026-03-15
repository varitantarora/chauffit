import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { BrandColors, LightColors, DarkColors, useThemeColors } from '../../constants/Colors';
import type { AdminDriver } from '../../services/api/AdminApiService';

export default function AllDrivers() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { drivers, driversLoading, fetchDrivers, updateDriverStatus } = useAdminStore();
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const onRefresh = useCallback(() => {
    fetchDrivers();
  }, []);

  const handleStatusChange = (driver: AdminDriver, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      active: 'Active',
      suspended: 'Suspended',
      inactive: 'Inactive',
    };

    Alert.alert(
      'Change Driver Status',
      `Change ${driver.user_details.full_name || `${driver.user_details.first_name} ${driver.user_details.last_name}`} to ${statusLabels[newStatus]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setUpdating(driver.id);
            const success = await updateDriverStatus(driver.id, newStatus);
            setUpdating(null);
            if (success) {
              Alert.alert('Success', 'Driver status updated successfully.');
            } else {
              Alert.alert('Error', 'Failed to update driver status.');
            }
          },
        },
      ]
    );
  };

  const handleStatusOptions = (driver: AdminDriver) => {
    Alert.alert('Update Status', `Select new status for ${driver.user_details.full_name || `${driver.user_details.first_name} ${driver.user_details.last_name}`}:`, [
      {
        text: 'Make Active',
        onPress: () => handleStatusChange(driver, 'active'),
      },
      {
        text: 'Suspend',
        onPress: () => handleStatusChange(driver, 'suspended'),
      },
      {
        text: 'Deactivate',
        onPress: () => handleStatusChange(driver, 'inactive'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const statusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return BrandColors.success;
      case 'suspended':
        return BrandColors.warning;
      case 'inactive':
        return BrandColors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const renderDriver = ({ item }: { item: AdminDriver }) => (
    <Pressable
      onPress={() => handleStatusOptions(item)}
      className="flex-row items-center p-4 mb-2 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.burgundy + '15' }}>
        <Ionicons name="car" size={20} color={colors.burgundy} />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">
          {item.user_details.full_name || `${item.user_details.first_name} ${item.user_details.last_name}`}
        </ThemedText>
        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">{item.user_details.email}</ThemedText>
      </View>
      <View className="mr-2" style={{ backgroundColor: statusColor(item.current_status) + '20' }}>
        <ThemedText
          variant="tiny"
          className="px-2.5 py-1 rounded-full font-semibold"
          style={{ color: statusColor(item.current_status) }}
        >
          {item.current_status_display || item.current_status}
        </ThemedText>
      </View>
      {updating === item.id ? (
        <ActivityIndicator size="small" color={colors.burgundy} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">All Drivers</ThemedText>
      </View>
      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          driversLoading ? null : (
            <View className="items-center py-12">
              <ThemedText variant="small">No drivers found</ThemedText>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={driversLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      />
      {driversLoading && drivers.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.burgundy} />
          <ThemedText variant="small" className="mt-2">Loading drivers...</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}
