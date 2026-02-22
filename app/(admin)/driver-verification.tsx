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
import AdminApiService, { AdminDriver } from '../../services/api/AdminApiService';

export default function DriverVerification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { verifyDriver } = useAdminStore();
  const [driver, setDriver] = useState<AdminDriver | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) loadDriver();
  }, [id]);

  const loadDriver = async () => {
    // Fetch via pending drivers or drivers list
    const res = await AdminApiService.getPendingDrivers();
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      const found = list.find((d: AdminDriver) => d.id === id);
      if (found) setDriver(found);
    }
  };

  const handleVerify = (approve: boolean) => {
    if (!id) return;
    const action = approve ? 'approve' : 'reject';
    Alert.alert(
      `${approve ? 'Approve' : 'Reject'} Driver`,
      `Are you sure you want to ${action} this driver?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await verifyDriver(id, approve, approve ? undefined : 'Rejected by admin');
            setLoading(false);
            if (success) router.back();
          },
        },
      ]
    );
  };

  const handleDocVerify = async (docId: string, approve: boolean) => {
    if (!id) return;
    await AdminApiService.verifyDriverDocument(id, docId, { is_verified: approve });
    loadDriver();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Driver Verification</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {driver ? (
          <>
            <View className="items-center py-6">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: '#8B5CF620' }}>
                <Ionicons name="car" size={40} color="#8B5CF6" />
              </View>
              <ThemedText variant="h2">{driver.user_details.full_name || `${driver.user_details.first_name} ${driver.user_details.last_name}`}</ThemedText>
              <ThemedText variant="small" className="mt-1">{driver.user_details.email}</ThemedText>
              <View className="flex-row gap-2 mt-2">
                <StatusBadge status={driver.is_verified ? 'verified' : 'pending'} />
              </View>
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Phone" value={driver.user_details.phone_number || 'N/A'} />
              <InfoRow label="License" value={driver.license_number || 'N/A'} />
              <InfoRow label="License Expiry" value={driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'} />
              <InfoRow label="Total Trips" value={String(driver.total_trips)} />
              <InfoRow label="Rating" value={driver.average_rating ? String(driver.average_rating) : 'N/A'} isLast />
            </View>

            {/* Documents */}
            {driver.documents && driver.documents.length > 0 && (
              <>
                <ThemedText variant="h3" className="mb-3">Documents</ThemedText>
                {driver.documents.map((doc) => (
                  <View key={doc.id} className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder">
                    <View className="flex-row items-center justify-between mb-2">
                      <ThemedText className="font-semibold capitalize">{doc.document_type.replace(/_/g, ' ')}</ThemedText>
                      <StatusBadge status={doc.is_verified ? 'verified' : 'pending'} />
                    </View>
                    {doc.document_number && <ThemedText variant="tiny">Number: {doc.document_number}</ThemedText>}
                    {doc.expiry_date && <ThemedText variant="tiny">Expires: {new Date(doc.expiry_date).toLocaleDateString()}</ThemedText>}
                    {!doc.is_verified && (
                      <View className="flex-row gap-3 mt-3">
                        <PrimaryButton title="Approve" onPress={() => handleDocVerify(doc.id, true)} variant="secondary" size="small" className="flex-1" />
                        <PrimaryButton title="Reject" onPress={() => handleDocVerify(doc.id, false)} variant="outline" size="small" className="flex-1" />
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            <View className="flex-row gap-3 mb-8 mt-4">
              <PrimaryButton title="Approve Driver" onPress={() => handleVerify(true)} loading={loading} variant="secondary" className="flex-1" />
              <PrimaryButton title="Reject Driver" onPress={() => handleVerify(false)} loading={loading} className="flex-1" />
            </View>
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading driver details...</ThemedText>
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
