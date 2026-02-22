import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';

export default function AdminSettings() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { dashboard, fetchDashboard, hourlyHireSettings, hourlyHireLoading, fetchHourlyHireSettings, updateHourlyHireSettings } = useAdminStore();

  const [isEnabled, setIsEnabled] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState('1.0');
  const [dailyCap, setDailyCap] = useState('0');
  const [minHours, setMinHours] = useState('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchHourlyHireSettings();
  }, []);

  useEffect(() => {
    if (hourlyHireSettings) {
      setIsEnabled(hourlyHireSettings.is_enabled);
      setSurgeMultiplier(String(hourlyHireSettings.surge_multiplier));
      setDailyCap(String(hourlyHireSettings.daily_cap));
      setMinHours(String(hourlyHireSettings.min_hours));
    }
  }, [hourlyHireSettings]);

  const onRefresh = useCallback(() => {
    fetchDashboard();
    fetchHourlyHireSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    await updateHourlyHireSettings({
      is_enabled: isEnabled,
      surge_multiplier: parseFloat(surgeMultiplier) || 1.0,
      daily_cap: parseInt(dailyCap) || 0,
      min_hours: parseInt(minHours) || 1,
    });
    setSaving(false);
  };

  const menuItems = [
    { title: 'Pending Driver Verifications', icon: 'car' as const, count: dashboard?.pending_driver_verifications || 0, route: '/(admin)/drivers-pending' },
    { title: 'Pending Biker Verifications', icon: 'bicycle' as const, count: dashboard?.pending_biker_verifications || 0, route: '/(admin)/bikers-pending' },
    { title: 'Payments', icon: 'card' as const, count: dashboard?.total_payments || 0, route: '/(admin)/payments' },
    { title: 'Biker Tasks', icon: 'list' as const, route: '/(admin)/tasks' },
    { title: 'Disputes', icon: 'warning' as const, count: dashboard?.open_disputes || 0, route: '/(admin)/disputes' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={hourlyHireLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        <ThemedText variant="h2" className="mt-4 mb-6">Settings</ThemedText>

        {/* Management Sections */}
        <ThemedText variant="h3" className="mb-3">Management</ThemedText>
        <View className="mb-6">
          {menuItems.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center p-4 mb-2 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
            >
              <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.burgundy + '15' }}>
                <Ionicons name={item.icon} size={18} color={colors.burgundy} />
              </View>
              <ThemedText className="flex-1">{item.title}</ThemedText>
              {item.count !== undefined && (
                <View className="bg-burgundy px-2.5 py-0.5 rounded-full mr-2">
                  <ThemedText variant="tiny" className="text-white font-semibold">{item.count}</ThemedText>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Hourly Hire Settings */}
        <ThemedText variant="h3" className="mb-3">Hourly Hire Settings</ThemedText>
        <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText>Enable Hourly Hire</ThemedText>
            <Switch value={isEnabled} onValueChange={setIsEnabled} trackColor={{ true: colors.burgundy }} />
          </View>

          <View className="mb-4">
            <ThemedText variant="small" className="mb-1">Surge Multiplier</ThemedText>
            <TextInput
              value={surgeMultiplier}
              onChangeText={setSurgeMultiplier}
              keyboardType="decimal-pad"
              className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
              style={{ backgroundColor: colors.background }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View className="mb-4">
            <ThemedText variant="small" className="mb-1">Daily Cap (rides)</ThemedText>
            <TextInput
              value={dailyCap}
              onChangeText={setDailyCap}
              keyboardType="number-pad"
              className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
              style={{ backgroundColor: colors.background }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View className="mb-4">
            <ThemedText variant="small" className="mb-1">Minimum Hours</ThemedText>
            <TextInput
              value={minHours}
              onChangeText={setMinHours}
              keyboardType="number-pad"
              className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
              style={{ backgroundColor: colors.background }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <PrimaryButton title="Save Settings" onPress={handleSaveSettings} loading={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
