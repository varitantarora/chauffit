import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, BrandColors, useThemeColors} from '../../constants/Colors';
import AdminApiService, { AdminBiker } from '../../services/api/AdminApiService';

export default function BikerVerification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { verifyBiker } = useAdminStore();
  const [biker, setBiker] = useState<AdminBiker | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id) loadBiker();
  }, [id]);

  const loadBiker = async () => {
    if (!id) return;
    const res = await AdminApiService.getBiker(id);
    if (res.success && res.data) {
      setBiker(res.data);
    }
  };

  const handleVerify = (approve: boolean) => {
    if (!id) return;
    if (!approve) {
      setRejectionModalVisible(true);
    } else {
      Alert.alert(
        'Approve Biker',
        'Are you sure you want to approve this biker?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'default',
            onPress: async () => {
              setLoading(true);
              const success = await verifyBiker(id, true);
              setLoading(false);
              if (success) router.back();
            },
          },
        ]
      );
    }
  };

  const handleSubmitRejection = async () => {
    if (!id) return;
    setRejectionModalVisible(false);
    setLoading(true);
    const success = await verifyBiker(id, false, rejectionReason || undefined);
    setLoading(false);
    if (success) router.back();
    setRejectionReason('');
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
                <Ionicons name="bicycle" size={40} color={BrandColors.warning} />
              </View>
              <ThemedText variant="h2">{biker.user_details.full_name || `${biker.user_details.first_name} ${biker.user_details.last_name}`}</ThemedText>
              <ThemedText variant="small" className="mt-1">{biker.user_details.email}</ThemedText>
              <View className="flex-row gap-2 mt-2">
                <StatusBadge status={biker.current_status ? (biker.current_status === 'active' ? 'verified' : 'pending') : 'pending'} />
              </View>
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Phone" value={biker.user_details.phone_number || 'N/A'} />
              <InfoRow label="License" value={biker.license_number || 'N/A'} />
              <InfoRow label="Aadhar Number" value={biker.aadhar_number ? biker.aadhar_number.slice(-4).padStart(biker.aadhar_number.length, '*') : 'N/A'} />
              <InfoRow label="Years of Experience" value={biker.years_of_experience ? String(biker.years_of_experience) : 'N/A'} />
              <InfoRow label="Background Check" value={biker.background_check_status_display || biker.background_check_status || 'N/A'} />
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

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRejectionModalVisible(false);
          setRejectionReason('');
        }}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="w-4/5 bg-white dark:bg-gray-900 rounded-2xl p-4">
            <ThemedText variant="h3" className="mb-3">Reject Biker</ThemedText>
            <ThemedText variant="small" className="mb-3 text-gray-600 dark:text-darkTextSecondary">
              Please provide a rejection reason:
            </ThemedText>
            <TextInput
              placeholder="Enter rejection reason..."
              placeholderTextColor={colors.textSecondary}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                color: colors.textPrimary,
                backgroundColor: isDarkMode ? colors.darkSurface : colors.surface,
              }}
            />
            <View className="flex-row gap-3 mt-4">
              <PrimaryButton
                title="Cancel"
                onPress={() => {
                  setRejectionModalVisible(false);
                  setRejectionReason('');
                }}
                variant="outline"
                className="flex-1"
              />
              <PrimaryButton
                title="Submit"
                onPress={handleSubmitRejection}
                variant="secondary"
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
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
