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
import AdminApiService, { AdminBiker } from '../../services/api/AdminApiService';

export default function BikerVerification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { verifyBiker } = useAdminStore();
  const [biker, setBiker] = useState<AdminBiker | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) loadBiker();
  }, [id]);

  const loadBiker = async () => {
    const res = await AdminApiService.getPendingBikers();
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      const found = list.find((b: AdminBiker) => b.id === id);
      if (found) setBiker(found);
    }
  };

  const handleVerify = (approve: boolean) => {
    if (!id) return;
    Alert.alert(
      `${approve ? 'Approve' : 'Reject'} Biker`,
      `Are you sure you want to ${approve ? 'approve' : 'reject'} this biker?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await verifyBiker(id, approve, approve ? undefined : 'Rejected by admin');
            setLoading(false);
            if (success) router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Biker Verification</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {biker ? (
          <>
            <View className="items-center py-6">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: '#F59E0B20' }}>
                <Ionicons name="bicycle" size={40} color="#F59E0B" />
              </View>
              <ThemedText variant="h2">{biker.user_details.full_name || `${biker.user_details.first_name} ${biker.user_details.last_name}`}</ThemedText>
              <ThemedText variant="small" className="mt-1">{biker.user_details.email}</ThemedText>
              <View className="flex-row gap-2 mt-2">
                <StatusBadge status={biker.is_verified ? 'verified' : 'pending'} />
              </View>
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Phone" value={biker.user_details.phone_number || 'N/A'} />
              <InfoRow label="Total Tasks" value={String(biker.total_tasks)} />
              <InfoRow label="Rating" value={biker.average_rating ? String(biker.average_rating) : 'N/A'} />
              <InfoRow label="Online" value={biker.is_online ? 'Yes' : 'No'} isLast />
            </View>

            <View className="flex-row gap-3 mb-8 mt-4">
              <PrimaryButton title="Approve Biker" onPress={() => handleVerify(true)} loading={loading} variant="secondary" className="flex-1" />
              <PrimaryButton title="Reject Biker" onPress={() => handleVerify(false)} loading={loading} className="flex-1" />
            </View>
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading biker details...</ThemedText>
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
