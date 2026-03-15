import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { BrandColors } from '../../../constants/Colors';

export default function BackgroundCheckScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const driverOnboardingStatus = useAuthStore((state) => state.driverOnboardingStatus);
  const fetchDriverOnboardingStatus = useAuthStore((state) => state.fetchDriverOnboardingStatus);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDriverOnboardingStatus();
    setRefreshing(false);
    // If status changed to one that needs a different screen, navigate
    const newStatus = useAuthStore.getState().driverOnboardingStatus;
    if (newStatus === 'training_scheduled') {
      router.replace('/(driver)/onboarding/training-scheduled');
    } else if (newStatus === 'certified') {
      router.replace('/(driver)/onboarding/onboarding-complete');
    } else if (newStatus === 'active') {
      router.replace('/(driver)/(tabs)');
    }
  }, [fetchDriverOnboardingStatus, router]);

  const getStatusMessage = () => {
    switch (driverOnboardingStatus) {
      case 'registered':
        return {
          title: 'Documents Under Review',
          subtitle: 'Your documents have been submitted and are awaiting review.',
          icon: 'document-text' as const,
          color: '#f59e0b',
        };
      case 'verification_in_progress':
        return {
          title: 'Verification In Progress',
          subtitle: 'Your documents are being verified. This usually takes 2-3 business days.',
          icon: 'time' as const,
          color: '#f59e0b',
        };
      case 'verification_failed':
        return {
          title: 'Verification Failed',
          subtitle: 'Some of your documents could not be verified. Please re-upload the required documents.',
          icon: 'alert-circle' as const,
          color: BrandColors.danger,
        };
      case 'verified_ready_for_training':
        return {
          title: 'Documents Verified!',
          subtitle: 'Your documents have been approved. Training is being scheduled for you.',
          icon: 'checkmark-circle' as const,
          color: BrandColors.success,
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          subtitle: 'Your account has been suspended. Please contact support for more information.',
          icon: 'ban' as const,
          color: BrandColors.danger,
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          subtitle: 'Unfortunately, your application has been rejected. Please contact support for more information.',
          icon: 'close-circle' as const,
          color: BrandColors.danger,
        };
      default:
        return {
          title: 'Application Status',
          subtitle: 'Your application is being processed.',
          icon: 'hourglass' as const,
          color: '#6b7280',
        };
    }
  };

  const statusInfo = getStatusMessage();
  const showReupload = driverOnboardingStatus === 'verification_failed';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            </TouchableOpacity>
            <ThemedText variant="title" className="font-bold">
              Application Status
            </ThemedText>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              ) : (
                <Ionicons name="refresh" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
              )}
            </TouchableOpacity>
          </View>

          <View className="px-6 pt-8">
            {/* Status Icon & Message */}
            <View className="items-center mb-8">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${statusInfo.color}20` }}
              >
                <Ionicons name={statusInfo.icon} size={48} color={statusInfo.color} />
              </View>
              <ThemedText variant="title" className="text-xl font-bold text-center mb-2">
                {statusInfo.title}
              </ThemedText>
              <ThemedText variant="secondary" className="text-center px-4">
                {statusInfo.subtitle}
              </ThemedText>
            </View>

            {/* Verification Status Header */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="shield-checkmark" size={20} color={BrandColors.secondary} />
              <ThemedText className="font-bold ml-2">VERIFICATION STATUS</ThemedText>
            </View>

            {/* Dynamic Steps Based on Status */}
            <View className="space-y-3 mb-6">
              <StatusStep
                title="Documents Submitted"
                status={driverOnboardingStatus === 'registered' ? 'in-progress' : 'completed'}
              />
              <StatusStep
                title="Identity Verification"
                status={
                  driverOnboardingStatus === 'verification_in_progress'
                    ? 'in-progress'
                    : driverOnboardingStatus === 'verification_failed'
                    ? 'failed'
                    : ['verified_ready_for_training', 'training_scheduled', 'certified', 'active'].includes(driverOnboardingStatus || '')
                    ? 'completed'
                    : 'pending'
                }
              />
              <StatusStep
                title="Background Verification"
                status={
                  driverOnboardingStatus === 'verification_in_progress'
                    ? 'pending'
                    : ['verified_ready_for_training', 'training_scheduled', 'certified', 'active'].includes(driverOnboardingStatus || '')
                    ? 'completed'
                    : driverOnboardingStatus === 'verification_failed'
                    ? 'failed'
                    : 'pending'
                }
              />
              <StatusStep
                title="Training Assignment"
                status={
                  driverOnboardingStatus === 'verified_ready_for_training'
                    ? 'in-progress'
                    : ['training_scheduled', 'certified', 'active'].includes(driverOnboardingStatus || '')
                    ? 'completed'
                    : 'pending'
                }
              />
            </View>

            {/* Re-upload button for failed verification */}
            {showReupload && (
              <PrimaryButton
                title="Re-upload Documents"
                onPress={() => router.push('/(driver)/onboarding/documents')}
                className="mb-6"
              />
            )}

            {/* Training Pending Card - shown when verified_ready_for_training */}
            {driverOnboardingStatus === 'verified_ready_for_training' && (
              <ThemedCard className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <View className="flex-row items-start">
                  <Ionicons name="school" size={24} color={BrandColors.success} />
                  <View className="ml-3 flex-1">
                    <ThemedText className="font-bold text-green-700 dark:text-green-300 mb-1">
                      🎓 TRAINING PENDING
                    </ThemedText>
                    <ThemedText variant="secondary" className="text-sm">
                      Your training session is being assigned. We'll notify you once scheduled.
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            )}

            {/* Original Documents Reminder - shown when verified_ready_for_training */}
            {driverOnboardingStatus === 'verified_ready_for_training' && (
              <ThemedCard className="p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="document-text" size={24} color={BrandColors.secondary} />
                  <View className="ml-3 flex-1">
                    <ThemedText className="font-bold mb-1">📄 Bring Original Documents</ThemedText>
                    <ThemedText variant="secondary" className="text-sm">
                      Please keep your original Driving License and Aadhaar Card ready for the training session verification.
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            )}

            {/* Timeline */}
            <ThemedCard className="p-4 mb-6">
              <View className="items-center">
                <ThemedText className="font-bold text-burgundy text-lg mb-2">
                  {driverOnboardingStatus === 'verified_ready_for_training'
                    ? 'Awaiting training assignment'
                    : 'Estimated completion: 7-10 days'}
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  We'll notify you via SMS & email
                </ThemedText>
              </View>
            </ThemedCard>

            {/* Support Options */}
            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity className="flex-1 bg-burgundy/10 py-3 px-4 rounded-lg border border-burgundy/20">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="call" size={16} color={BrandColors.burgundy} />
                  <ThemedText className="text-burgundy font-semibold ml-2">
                    Contact Support
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-secondary/10 py-3 px-4 rounded-lg border border-secondary/20">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="help-circle" size={16} color={BrandColors.secondary} />
                  <ThemedText className="text-secondary font-semibold ml-2">
                    FAQ
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

function StatusStep({
  title,
  status,
}: {
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
}) {
  const getIcon = () => {
    switch (status) {
      case 'completed': return { name: 'checkmark-circle' as const, color: BrandColors.success };
      case 'in-progress': return { name: 'time' as const, color: '#f59e0b' };
      case 'failed': return { name: 'close-circle' as const, color: BrandColors.danger };
      default: return { name: 'ellipse-outline' as const, color: '#6b7280' };
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  };

  const icon = getIcon();

  return (
    <ThemedCard className="p-4">
      <View className="flex-row items-center">
        <Ionicons name={icon.name} size={20} color={icon.color} />
        <View className="ml-3 flex-1">
          <ThemedText className="font-semibold">{title}</ThemedText>
          <ThemedText variant="caption" style={{ color: icon.color }}>
            {getLabel()}
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );
}
