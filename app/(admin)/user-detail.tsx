import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AdminUser } from '../../services/api/AdminApiService';

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { selectedUser, fetchUserDetail, updateUserStatus } = useAdminStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchUserDetail(id);
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to set this user's status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newStatus === 'banned' ? 'destructive' : 'default',
          onPress: async () => {
            setLoading(true);
            await updateUserStatus(id, newStatus);
            await fetchUserDetail(id);
            setLoading(false);
          },
        },
      ]
    );
  };

  const user = selectedUser;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">User Detail</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {user ? (
          <>
            <View className="items-center py-6">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.burgundy + '20' }}>
                <Ionicons name="person" size={40} color={colors.burgundy} />
              </View>
              <ThemedText variant="h2">{user.full_name || `${user.first_name} ${user.last_name}`}</ThemedText>
              <ThemedText variant="small" className="mt-1">{user.email}</ThemedText>
              <View className="flex-row gap-2 mt-2">
                <StatusBadge status={user.user_type} />
                <StatusBadge status={user.status} />
              </View>
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Phone" value={user.phone_number || 'N/A'} />
              <InfoRow label="Verified" value={user.is_verified ? 'Yes' : 'No'} />
              <InfoRow label="Date of Birth" value={user.date_of_birth || 'N/A'} />
              <InfoRow label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'} isLast />
            </View>

            <ThemedText variant="h3" className="mb-3">Actions</ThemedText>
            <View className="gap-3 mb-8">
              {user.status !== 'active' && (
                <PrimaryButton title="Activate User" onPress={() => handleStatusUpdate('active')} loading={loading} variant="secondary" />
              )}
              {user.status !== 'suspended' && (
                <PrimaryButton title="Suspend User" onPress={() => handleStatusUpdate('suspended')} loading={loading} variant="outline" />
              )}
              {user.status !== 'banned' && (
                <PrimaryButton title="Ban User" onPress={() => handleStatusUpdate('banned')} loading={loading} />
              )}
            </View>
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading user details...</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View className={`flex-row justify-between py-3 ${isLast ? '' : 'border-b border-border dark:border-darkBorder'}`}>
      <ThemedText variant="small">{label}</ThemedText>
      <ThemedText className="font-medium">{value}</ThemedText>
    </View>
  );
}
