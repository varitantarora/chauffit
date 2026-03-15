import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { TrainingCertificate } from '../../components/driver/profile/TrainingCertificate';
import { useAuthStore } from '../../store/authStore';
import { useI18nStore } from '../../store/i18nStore';
import DriverApiService, { TrainingSession } from '../../services/api/DriverApiService';
import { BrandColors } from '../../constants/Colors';

export default function TrainingCertificateScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const storedTrainingSession = useAuthStore((state) => state.trainingSession);
  const fetchDriverOnboardingStatus = useAuthStore((state) => state.fetchDriverOnboardingStatus);
  const t = useI18nStore((state) => state.t);

  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(
    storedTrainingSession
  );
  const [loading, setLoading] = useState(!storedTrainingSession);
  const [driverProfile, setDriverProfile] = useState<{ full_name: string; phone_number: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load driver profile for name & phone
      const profileRes = await DriverApiService.getProfile();
      if (profileRes.success && profileRes.data) {
        setDriverProfile({
          full_name: profileRes.data.full_name,
          phone_number: profileRes.data.phone_number,
        });
      }

      // If no cached training session, fetch fresh
      if (!storedTrainingSession) {
        await fetchDriverOnboardingStatus();
        const freshSession = useAuthStore.getState().trainingSession;
        if (!freshSession) {
          // Fall back to direct API call
          const sessionRes = await DriverApiService.getTrainingSchedule();
          if (sessionRes.success && sessionRes.data) {
            setTrainingSession(sessionRes.data);
          }
        } else {
          setTrainingSession(freshSession);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const driverName = driverProfile?.full_name || user?.name || 'Driver';
  const phoneNumber = driverProfile?.phone_number || user?.phone || '';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2D2D2D' : '#E5E5E5',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? '#d9d1c6' : '#314b4c'}
            />
          </TouchableOpacity>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', flex: 1 }}>
            {t('trainingCertificate')}
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#10B98120',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Ionicons name="shield-checkmark" size={14} color={BrandColors.success} />
            <ThemedText style={{ fontSize: 12, color: BrandColors.success, fontWeight: '700', marginLeft: 4 }}>
              {t('passed')}
            </ThemedText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          {loading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color={BrandColors.secondary} />
              <ThemedText style={{ marginTop: 16, color: BrandColors.secondary }}>
                {t('loadingCertificate')}
              </ThemedText>
            </View>
          ) : trainingSession ? (
            <>
              {/* Certificate Widget */}
              <TrainingCertificate
                driverName={driverName}
                phoneNumber={phoneNumber}
                trainingSession={trainingSession}
                isDarkMode={isDarkMode}
              />

              {/* Info note */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? '#1a2a1a' : '#f0fdf4',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#22543d' : '#86efac',
                }}
              >
                <Ionicons name="information-circle" size={20} color="#22c55e" />
                <ThemedText
                  style={{ fontSize: 13, marginLeft: 10, flex: 1, color: isDarkMode ? '#86efac' : '#166534' }}
                >
                  {t('certificateInfo')}
                </ThemedText>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Ionicons name="document-outline" size={56} color={BrandColors.secondary} />
              <ThemedText style={{ marginTop: 16, fontWeight: '700', fontSize: 16 }}>
                {t('certificateNotAvailable')}
              </ThemedText>
              <ThemedText style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>
                {t('certificateWillAppear')}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
