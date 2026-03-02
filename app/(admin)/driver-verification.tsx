import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, Modal, TextInput, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import AdminApiService, { AdminDriver, AdminDocument } from '../../services/api/AdminApiService';

export default function DriverVerification() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { verifyDriver } = useAdminStore();
  const [driver, setDriver] = useState<AdminDriver | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState<{ type: 'driver' | 'document'; docId?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id) loadDriver();
  }, [id]);

  const loadDriver = async () => {
    if (!id) return;
    const res = await AdminApiService.getDriver(id);
    if (res.success && res.data) {
      setDriver(res.data);
    }
  };

  const handleVerify = (approve: boolean) => {
    if (!id) return;
    if (!approve) {
      setRejectionTarget({ type: 'driver' });
      setRejectionModalVisible(true);
    } else {
      Alert.alert(
        'Approve Driver',
        'This will verify the driver and mark them as ready for training. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'default',
            onPress: async () => {
              setLoading(true);
              const success = await verifyDriver(id, true);
              setLoading(false);
              if (success) router.back();
            },
          },
        ]
      );
    }
  };

  const handleDocVerify = (docId: string, approve: boolean) => {
    if (!approve) {
      setRejectionTarget({ type: 'document', docId });
      setRejectionModalVisible(true);
    } else {
      if (!id) return;
      Alert.alert('Approve Document', 'Approve this document?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await AdminApiService.verifyDriverDocument(id, docId, { verification_status: 'approved' });
            loadDriver();
          },
        },
      ]);
    }
  };

  const handleSubmitRejection = async () => {
    if (!rejectionTarget || !id) return;

    setRejectionModalVisible(false);

    if (rejectionTarget.type === 'driver') {
      setLoading(true);
      const success = await verifyDriver(id, false, rejectionReason || undefined);
      setLoading(false);
      if (success) router.back();
    } else if (rejectionTarget.type === 'document' && rejectionTarget.docId) {
      await AdminApiService.verifyDriverDocument(id, rejectionTarget.docId, {
        verification_status: 'rejected',
        rejection_reason: rejectionReason || undefined,
      });
      loadDriver();
    }

    setRejectionReason('');
    setRejectionTarget(null);
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
                <StatusBadge status={
                  driver.current_status === 'active' ? 'verified'
                  : driver.current_status === 'verified_ready_for_training' ? 'verified'
                  : driver.current_status === 'certified' ? 'verified'
                  : driver.current_status === 'rejected' ? 'rejected'
                  : driver.current_status === 'verification_failed' ? 'rejected'
                  : 'pending'
                } />
                <ThemedText variant="tiny" className="mt-1">{driver.current_status_display || driver.current_status}</ThemedText>
              </View>
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Phone" value={driver.user_details.phone_number || 'N/A'} />
              <InfoRow label="License" value={driver.license_number || 'N/A'} />
              <InfoRow label="License Expiry" value={driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'} />
              <InfoRow label="Aadhar Number" value={driver.aadhar_number ? driver.aadhar_number.slice(-4).padStart(driver.aadhar_number.length, '*') : 'N/A'} />
              <InfoRow label="Years of Experience" value={driver.years_of_experience ? String(driver.years_of_experience) : 'N/A'} />
              <InfoRow label="Background Check" value={driver.background_check_status_display || driver.background_check_status || 'N/A'} />
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
                      <StatusBadge status={doc.verification_status as any} />
                    </View>
                    {doc.document_url && (
                      <Image
                        source={{ uri: doc.document_url }}
                        style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
                        resizeMode="contain"
                      />
                    )}
                    {doc.document_number && <ThemedText variant="tiny">Number: {doc.document_number}</ThemedText>}
                    {doc.expiry_date && <ThemedText variant="tiny">Expires: {new Date(doc.expiry_date).toLocaleDateString()}</ThemedText>}
                    {doc.rejection_reason && <ThemedText variant="tiny" className="text-red-500 mt-1">Rejection: {doc.rejection_reason}</ThemedText>}
                    <View className="flex-row gap-3 mt-3">
                      {doc.document_url && (
                        <PrimaryButton
                          title="View Document"
                          onPress={() => Linking.openURL(doc.document_url!)}
                          variant="outline"
                          size="small"
                          className="flex-1"
                        />
                      )}
                      {doc.verification_status === 'pending' && (
                        <>
                          <PrimaryButton title="Approve" onPress={() => handleDocVerify(doc.id, true)} variant="secondary" size="small" className="flex-1" />
                          <PrimaryButton title="Reject" onPress={() => handleDocVerify(doc.id, false)} variant="outline" size="small" className="flex-1" />
                        </>
                      )}
                    </View>
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

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRejectionModalVisible(false);
          setRejectionReason('');
          setRejectionTarget(null);
        }}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="w-4/5 bg-white dark:bg-gray-900 rounded-2xl p-4">
            <ThemedText variant="h3" className="mb-3">
              {rejectionTarget?.type === 'driver' ? 'Reject Driver' : 'Reject Document'}
            </ThemedText>
            <ThemedText variant="small" className="mb-3 text-gray-600 dark:text-gray-400">
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
                  setRejectionTarget(null);
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
