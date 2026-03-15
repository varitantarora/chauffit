import React, { useEffect, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';

export default function AdminSettings() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { dashboard, fetchDashboard } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    fetchDashboard();
  }, []);

  const menuSections: { title: string; items: { subtitle: string; icon: any; count?: number; route: string }[] }[] = [
    {
      title: '1. Driver Management',
      items: [
        { subtitle: '1.1 Driver Document Verifications', icon: 'car' as const, count: dashboard?.pending_driver_verifications || 0, route: '/(admin)/drivers-pending' },
        { subtitle: '1.2 Driver Training Management', icon: 'school' as const, route: '/(admin)/training-batches' },
        { subtitle: '1.3 Overall Driver Status Management', icon: 'settings' as const, route: '/(admin)/all-drivers' },
      ],
    },
    {
      title: '2. Biker Management',
      items: [
        { subtitle: '2.1 Biker Document Verification', icon: 'bicycle' as const, count: dashboard?.pending_biker_verifications || 0, route: '/(admin)/bikers-pending' },
        { subtitle: '2.2 Overall Biker Status Management', icon: 'settings' as const, route: '/(admin)/all-bikers' },
      ],
    },
    {
      title: '3. Other Services',
      items: [
        { subtitle: '3.1 Insurance Plans', icon: 'shield-checkmark' as const, route: '/(admin)/insurance-management' },
        { subtitle: '3.2 Amenities', icon: 'cafe' as const, route: '/(admin)/amenities-management' },
      ],
    },
    {
      title: '4. Support',
      items: [
        { subtitle: '4.1 Payments and Refunds', icon: 'card' as const, count: dashboard?.total_payments || 0, route: '/(admin)/payments' },
        { subtitle: '4.2 Disputes / Inquiries', icon: 'warning' as const, count: dashboard?.open_disputes || 0, route: '/(admin)/disputes' },
      ],
    },
    {
      title: '5. Pricing / Fare Settings',
      items: [
        { subtitle: '5.1 Rate Card, Rates & Surge', icon: 'pricetag' as const, route: '/(admin)/pricing-settings' },
      ],
    },
    {
      title: '6. App Config / Feature Flags',
      items: [
        { subtitle: '6.1 App Config / Feature Flags', icon: 'toggle' as const, route: '/(admin)/config-management' },
      ],
    },
    {
      title: '7. Marketing / Ads',
      items: [
        { subtitle: '7.1 Manage Advertisements', icon: 'megaphone' as const, route: '/(admin)/ads-management' },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        <ThemedText variant="h2" className="mt-4 mb-6">Settings</ThemedText>

        {menuSections.map((section) => (
          <View key={section.title} className="mb-6">
            <ThemedText variant="h3" className="mb-3">{section.title}</ThemedText>
            <View>
              {section.items.map((item) => (
                <Pressable
                  key={item.subtitle}
                  onPress={() => router.push(item.route as any)}
                  className="flex-row items-center p-4 mb-2 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
                >
                  <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.burgundy + '15' }}>
                    <Ionicons name={item.icon} size={18} color={colors.burgundy} />
                  </View>
                  <ThemedText className="flex-1">{item.subtitle}</ThemedText>
                  {item.count !== undefined && (
                    <View className="bg-burgundy px-2.5 py-0.5 rounded-full mr-2">
                      <ThemedText variant="tiny" className="text-white font-semibold">{item.count}</ThemedText>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
