import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';

export default function DisputeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { selectedDispute, fetchDisputeDetail, resolveDispute } = useAdminStore();
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchDisputeDetail(id);
  }, [id]);

  const handleResolve = async () => {
    if (!id || !resolution.trim()) {
      Alert.alert('Error', 'Please enter a resolution');
      return;
    }
    setLoading(true);
    const success = await resolveDispute(id, resolution.trim(), 'resolved');
    if (success) {
      await fetchDisputeDetail(id);
      setResolution('');
    }
    setLoading(false);
  };

  const dispute = selectedDispute;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Dispute Detail</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {dispute ? (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="h2" className="flex-1 mr-2" numberOfLines={1}>Dispute</ThemedText>
              <StatusBadge status={dispute.status} />
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Reason" value={dispute.reason} />
              <InfoRow label="Description" value={dispute.description} />
              {dispute.booking_reference && <InfoRow label="Booking Ref" value={`#${dispute.booking_reference}`} />}
              <InfoRow label="Raised By" value={dispute.raised_by?.full_name || 'N/A'} />
              <InfoRow label="Created" value={new Date(dispute.created_at).toLocaleString()} />
              {dispute.resolution && <InfoRow label="Resolution" value={dispute.resolution} />}
              {dispute.resolved_at && <InfoRow label="Resolved At" value={new Date(dispute.resolved_at).toLocaleString()} isLast />}
            </View>

            {dispute.status !== 'resolved' && (
              <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-8">
                <ThemedText variant="h3" className="mb-3">Resolve Dispute</ThemedText>
                <TextInput
                  value={resolution}
                  onChangeText={setResolution}
                  placeholder="Enter resolution details..."
                  multiline
                  numberOfLines={4}
                  className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 mb-3 text-textPrimary dark:text-darkText"
                  style={{ backgroundColor: colors.background, textAlignVertical: 'top', minHeight: 100 }}
                  placeholderTextColor={colors.textSecondary}
                />
                <PrimaryButton title="Resolve Dispute" onPress={handleResolve} loading={loading} variant="secondary" />
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading dispute details...</ThemedText>
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
      <ThemedText className="font-medium flex-1 text-right ml-4" numberOfLines={3}>{value}</ThemedText>
    </View>
  );
}
