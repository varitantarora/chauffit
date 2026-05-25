import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import type { AdminPerKmRate, AdminPerMinRate, AdminHourlyHireRate, AdminSurgeConfig } from '../../services/api/AdminApiService';

const TIER_LABELS: Record<string, string> = {
  STANDARD: 'Standard Chauffeur',
  EXECUTIVE: 'Executive Chauffeur',
};

// Deprecated: kept for backward compat
const SEGMENT_LABELS: Record<string, string> = {
  HATCHBACK: 'Hatchback',
  MICRO_SUV: 'Micro SUV',
  MID_SUV: 'Mid SUV',
  SEDAN: 'Sedan',
  FULL_SUV: 'Full SUV',
  LUXURY: 'Luxury',
  STANDARD: 'Standard Chauffeur',
  EXECUTIVE: 'Executive Chauffeur',
};

function formatSegment(segment: string): string {
  return TIER_LABELS[segment] || SEGMENT_LABELS[segment] || segment.replace(/_/g, ' ');
}

export default function PricingSettings() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const {
    activeRateCard,
    pricingLoading,
    pricingError,
    fetchPricingSettings,
    savePricingSettings,
    hourlyHireSettings,
    hourlyHireLoading,
    fetchHourlyHireSettings,
    updateHourlyHireSettings,
  } = useAdminStore();

  const [hhEnabled, setHhEnabled] = useState(false);
  const [hhDailyCap, setHhDailyCap] = useState('0');
  const [hhMinHours, setHhMinHours] = useState('1');

  const [rcCode, setRcCode] = useState('');
  const [rcCity, setRcCity] = useState('');
  const [rcCurrency, setRcCurrency] = useState('');
  const [rcDriverShare, setRcDriverShare] = useState('0');
  const [rcPlatformShare, setRcPlatformShare] = useState('0');
  const [perKmRates, setPerKmRates] = useState<AdminPerKmRate[]>([]);
  const [perMinRates, setPerMinRates] = useState<AdminPerMinRate[]>([]);
  const [hourlyRates, setHourlyRates] = useState<AdminHourlyHireRate[]>([]);
  const [surgeConfigs, setSurgeConfigs] = useState<AdminSurgeConfig[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricingSettings();
    fetchHourlyHireSettings();
  }, []);

  useEffect(() => {
    if (activeRateCard) {
      setRcCode(activeRateCard.code || '');
      setRcCity(activeRateCard.city || '');
      setRcCurrency(activeRateCard.currency || '');
      setRcDriverShare(activeRateCard.driver_share || '0');
      setRcPlatformShare(activeRateCard.platform_share || '0');
      setPerKmRates(activeRateCard.per_km_rates?.map((r) => ({ ...r })) || []);
      setPerMinRates(activeRateCard.per_min_rates?.map((r) => ({ ...r })) || []);
      setHourlyRates(activeRateCard.hourly_rates?.map((r) => ({ ...r })) || []);
      setSurgeConfigs(activeRateCard.surge_configs?.map((s) => ({ ...s })) || []);
    }
  }, [activeRateCard]);

  useEffect(() => {
    if (hourlyHireSettings) {
      setHhEnabled(hourlyHireSettings.is_enabled);
      setHhDailyCap(String(hourlyHireSettings.daily_cap));
      setHhMinHours(String(hourlyHireSettings.min_hours));
    }
  }, [hourlyHireSettings]);

  const onRefresh = useCallback(() => {
    fetchPricingSettings();
    fetchHourlyHireSettings();
  }, []);

  const handleSavePricing = async () => {
    if (!activeRateCard) return;
    setSaving(true);
    const success = await savePricingSettings(activeRateCard.id, {
      code: rcCode,
      city: rcCity,
      currency: rcCurrency,
      driver_share: rcDriverShare,
      platform_share: rcPlatformShare,
      per_km_rates: perKmRates,
      per_min_rates: perMinRates,
      hourly_rates: hourlyRates,
      surge_configs: surgeConfigs,
    });
    if (success) {
      Alert.alert('Saved', 'Pricing settings updated successfully.');
    } else {
      Alert.alert('Error', 'Failed to save pricing settings.');
    }
    setSaving(false);
  };

  const handleSaveHourlyHireOps = async () => {
    setSaving(true);
    const success = await updateHourlyHireSettings({
      is_enabled: hhEnabled,
      daily_cap: parseInt(hhDailyCap) || 0,
      min_hours: parseInt(hhMinHours) || 1,
    });
    if (!success) {
      Alert.alert('Error', 'Failed to save hourly hire settings.');
    }
    setSaving(false);
  };

  const updatePerKmRate = (idx: number, field: 'base_fare' | 'per_km', value: string) => {
    setPerKmRates((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };
  const updatePerMinRate = (idx: number, field: 'base_fare' | 'per_min', value: string) => {
    setPerMinRates((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };
  const updateHourlyRate = (idx: number, field: 'base_1h' | 'per_hour_after_1h', value: string) => {
    setHourlyRates((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };
  const updateSurge = (idx: number, field: 'multiplier' | 'min_multiplier' | 'max_multiplier', value: string) => {
    setSurgeConfigs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const inputStyle = {
    backgroundColor: colors.background,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={pricingLoading || hourlyHireLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-6">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <ThemedText variant="h2">5. Pricing / Fare Settings</ThemedText>
        </View>

        {pricingLoading && !activeRateCard && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.burgundy} />
            <ThemedText variant="small" className="mt-2">Loading pricing data...</ThemedText>
          </View>
        )}

        {pricingError && !activeRateCard && (
          <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
            <ThemedText className="text-red-500">{pricingError}</ThemedText>
            <PrimaryButton title="Retry" onPress={fetchPricingSettings} className="mt-3" />
          </View>
        )}

        {!pricingLoading && !activeRateCard && !pricingError && (
          <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
            <ThemedText variant="small" className="text-center">No rate card found. Create one in the backend first.</ThemedText>
          </View>
        )}

        {activeRateCard && (
          <>
            {/* 5.1 Rate Card Info */}
            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <ThemedText variant="h4" className="mb-3">5.1 Rate Card</ThemedText>

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">Code</ThemedText>
                  <TextInput
                    value={rcCode}
                    onChangeText={setRcCode}
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">City</ThemedText>
                  <TextInput
                    value={rcCity}
                    onChangeText={setRcCity}
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View className="mb-3">
                <ThemedText variant="tiny" className="mb-0.5">Currency</ThemedText>
                <TextInput
                  value={rcCurrency}
                  onChangeText={setRcCurrency}
                  className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                  style={inputStyle}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">Driver Share (decimal)</ThemedText>
                  <TextInput
                    value={rcDriverShare}
                    onChangeText={setRcDriverShare}
                    keyboardType="decimal-pad"
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">Platform Share (decimal)</ThemedText>
                  <TextInput
                    value={rcPlatformShare}
                    onChangeText={setRcPlatformShare}
                    keyboardType="decimal-pad"
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Per-KM Rates */}
            {perKmRates.length > 0 && (
              <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
                <ThemedText variant="h4" className="mb-3">Per-KM Rates</ThemedText>
                {perKmRates.map((rate, idx) => (
                  <View key={rate.vehicle_segment} className="mb-3">
                    <ThemedText variant="small" className="mb-1 font-semibold">{formatSegment(rate.vehicle_segment)}</ThemedText>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <ThemedText variant="tiny" className="mb-0.5">Base Fare</ThemedText>
                        <TextInput
                          value={rate.base_fare}
                          onChangeText={(v) => updatePerKmRate(idx, 'base_fare', v)}
                          keyboardType="decimal-pad"
                          className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                          style={inputStyle}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText variant="tiny" className="mb-0.5">Per KM</ThemedText>
                        <TextInput
                          value={rate.per_km}
                          onChangeText={(v) => updatePerKmRate(idx, 'per_km', v)}
                          keyboardType="decimal-pad"
                          className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                          style={inputStyle}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Per-Minute Rates */}
            {perMinRates.length > 0 && (
              <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
                <ThemedText variant="h4" className="mb-3">Per-Minute Rates</ThemedText>
                {perMinRates.map((rate, idx) => (
                  <View key={rate.vehicle_segment} className="mb-3">
                    <ThemedText variant="small" className="mb-1 font-semibold">{formatSegment(rate.vehicle_segment)}</ThemedText>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <ThemedText variant="tiny" className="mb-0.5">Base Fare</ThemedText>
                        <TextInput
                          value={rate.base_fare}
                          onChangeText={(v) => updatePerMinRate(idx, 'base_fare', v)}
                          keyboardType="decimal-pad"
                          className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                          style={inputStyle}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText variant="tiny" className="mb-0.5">Per Min</ThemedText>
                        <TextInput
                          value={rate.per_min}
                          onChangeText={(v) => updatePerMinRate(idx, 'per_min', v)}
                          keyboardType="decimal-pad"
                          className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                          style={inputStyle}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 5.2 Hourly Hire Settings */}
            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <ThemedText variant="h4" className="mb-3">5.2 Hourly Hire Settings</ThemedText>

              <View className="flex-row items-center justify-between mb-3">
                <ThemedText>Enable Hourly Hire</ThemedText>
                <Switch value={hhEnabled} onValueChange={setHhEnabled} trackColor={{ true: colors.burgundy }} />
              </View>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">Min Hours</ThemedText>
                  <TextInput
                    value={hhMinHours}
                    onChangeText={setHhMinHours}
                    keyboardType="number-pad"
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText variant="tiny" className="mb-0.5">Daily Cap</ThemedText>
                  <TextInput
                    value={hhDailyCap}
                    onChangeText={setHhDailyCap}
                    keyboardType="number-pad"
                    className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                    style={inputStyle}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <PrimaryButton title="Save Hourly Hire Ops" onPress={handleSaveHourlyHireOps} loading={saving && hourlyHireLoading} />

              {hourlyRates.length > 0 && (
                <View className="mt-4 pt-4 border-t border-border dark:border-darkBorder">
                  <ThemedText variant="small" className="mb-2 font-semibold">Hourly Rates by Segment</ThemedText>
                  {hourlyRates.map((rate, idx) => (
                    <View key={rate.vehicle_segment} className="mb-3">
                      <ThemedText variant="small" className="mb-1 font-semibold">{formatSegment(rate.vehicle_segment)}</ThemedText>
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <ThemedText variant="tiny" className="mb-0.5">Base (1h)</ThemedText>
                          <TextInput
                            value={rate.base_1h}
                            onChangeText={(v) => updateHourlyRate(idx, 'base_1h', v)}
                            keyboardType="decimal-pad"
                            className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                            style={inputStyle}
                            placeholderTextColor={colors.textSecondary}
                          />
                        </View>
                        <View className="flex-1">
                          <ThemedText variant="tiny" className="mb-0.5">Per Hour After</ThemedText>
                          <TextInput
                            value={rate.per_hour_after_1h}
                            onChangeText={(v) => updateHourlyRate(idx, 'per_hour_after_1h', v)}
                            keyboardType="decimal-pad"
                            className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                            style={inputStyle}
                            placeholderTextColor={colors.textSecondary}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Surge Charges */}
            {surgeConfigs.length > 0 && (
              <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
                <ThemedText variant="h4" className="mb-3">Surge Charges</ThemedText>
                {surgeConfigs.map((surge, idx) => (
                  <View key={surge.surge_type} className="mb-3">
                    <ThemedText variant="small" className="mb-1 font-semibold">
                      {surge.surge_type === 'NIGHT' ? 'Night' : surge.surge_type === 'TRAFFIC' ? 'Traffic' : 'Hourly'}
                    </ThemedText>
                    {surge.surge_type === 'TRAFFIC' ? (
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <ThemedText variant="tiny" className="mb-0.5">Min Multiplier</ThemedText>
                          <TextInput
                            value={surge.min_multiplier || ''}
                            onChangeText={(v) => updateSurge(idx, 'min_multiplier', v)}
                            keyboardType="decimal-pad"
                            className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                            style={inputStyle}
                            placeholderTextColor={colors.textSecondary}
                          />
                        </View>
                        <View className="flex-1">
                          <ThemedText variant="tiny" className="mb-0.5">Max Multiplier</ThemedText>
                          <TextInput
                            value={surge.max_multiplier || ''}
                            onChangeText={(v) => updateSurge(idx, 'max_multiplier', v)}
                            keyboardType="decimal-pad"
                            className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                            style={inputStyle}
                            placeholderTextColor={colors.textSecondary}
                          />
                        </View>
                      </View>
                    ) : (
                      <View>
                        <ThemedText variant="tiny" className="mb-0.5">Multiplier</ThemedText>
                        <TextInput
                          value={surge.multiplier}
                          onChangeText={(v) => updateSurge(idx, 'multiplier', v)}
                          keyboardType="decimal-pad"
                          className="border border-border dark:border-darkBorder rounded-xl px-3 py-2"
                          style={inputStyle}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Save Pricing Button */}
            <View className="mb-8">
              <PrimaryButton title="Save Pricing Settings" onPress={handleSavePricing} loading={saving && pricingLoading} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
