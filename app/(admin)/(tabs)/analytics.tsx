import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors, BrandColors } from '../../../constants/Colors';

type PeriodKey = '1m' | '3m' | '6m' | '12m';

const PERIOD_OPTIONS: { label: string; value: PeriodKey }[] = [
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '12 Months', value: '12m' },
];

// ---- Reusable metric tile ----
function MetricTile({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  colors,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  colors: typeof LightColors;
}) {
  return (
    <View
      className="flex-1 p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder min-w-[45%]"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: iconColor + '20' }}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <ThemedText variant="tiny" className="flex-1">{title}</ThemedText>
      </View>
      <ThemedText variant="h2">{value}</ThemedText>
      {subtitle && <ThemedText variant="tiny" className="mt-1" style={{ color: colors.textSecondary }}>{subtitle}</ThemedText>}
    </View>
  );
}

// ---- Bar component for breakdown ----
function BarRow({
  label,
  value,
  maxValue,
  color,
  colors,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  colors: typeof LightColors;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View className="flex-row items-center mb-2">
      <ThemedText variant="tiny" className="w-10" style={{ color: colors.textSecondary }}>{label}</ThemedText>
      <View className="flex-1 h-5 rounded-full mx-2 overflow-hidden" style={{ backgroundColor: color + '20' }}>
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
      <ThemedText variant="tiny" className="w-10 text-right">{value}%</ThemedText>
    </View>
  );
}

export default function AdminAnalytics() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { analytics, analyticsLoading, analyticsError, fetchAnalytics } = useAdminStore();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('1m');

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const onRefresh = useCallback(() => {
    fetchAnalytics(selectedPeriod);
  }, [fetchAnalytics, selectedPeriod]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={analyticsLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <View>
            <ThemedText variant="h2">Analytics</ThemedText>
            <ThemedText variant="small" style={{ color: colors.textSecondary }}>Driver & Biker Retention</ThemedText>
          </View>
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.burgundy }}>
            <Ionicons name="analytics" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {PERIOD_OPTIONS.map((opt) => {
            const active = selectedPeriod === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedPeriod(opt.value)}
                className="flex-1 py-2 rounded-xl items-center"
                style={{
                  backgroundColor: active ? colors.burgundy : (isDarkMode ? colors.surface : '#F3F4F6'),
                }}
              >
                <ThemedText
                  variant="tiny"
                  style={{
                    color: active ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: active ? '700' : '500',
                  }}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Loading / Error / Data */}
        {analyticsLoading && !analytics ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.burgundy} />
            <ThemedText variant="small" className="mt-3" style={{ color: colors.textSecondary }}>Loading analytics...</ThemedText>
          </View>
        ) : analyticsError && !analytics ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="alert-circle-outline" size={40} color={colors.textSecondary} />
            <ThemedText variant="small" className="mt-3" style={{ color: colors.textSecondary }}>{analyticsError}</ThemedText>
          </View>
        ) : analytics ? (
          <>
            {/* Retention Rate Section */}
            <ThemedText variant="h3" className="mb-3">Retention Rate</ThemedText>
            <View className="flex-row flex-wrap gap-3 mb-6">
              <MetricTile
                title="Driver Retention"
                value={`${analytics.driver_retention}%`}
                subtitle="Returning drivers"
                icon="car"
                iconColor={colors.burgundy}
                colors={colors}
              />
              <MetricTile
                title="Biker Retention"
                value={`${analytics.biker_retention}%`}
                subtitle="Returning bikers"
                icon="bicycle"
                iconColor="#8B5CF6"
                colors={colors}
              />
            </View>

            {/* Platform Usage Frequency */}
            <ThemedText variant="h3" className="mb-3">Platform Usage Frequency</ThemedText>
            <ThemedText variant="tiny" className="mb-3" style={{ color: colors.textSecondary }}>
              Avg sessions per month
            </ThemedText>
            <View className="flex-row flex-wrap gap-3 mb-6">
              <MetricTile
                title="Driver Sessions"
                value={`${analytics.driver_avg_sessions}`}
                subtitle="Avg / month"
                icon="repeat"
                iconColor={BrandColors.info}
                colors={colors}
              />
              <MetricTile
                title="Biker Sessions"
                value={`${analytics.biker_avg_sessions}`}
                subtitle="Avg / month"
                icon="repeat"
                iconColor={BrandColors.warning}
                colors={colors}
              />
            </View>

            {/* Total Usage Time */}
            <ThemedText variant="h3" className="mb-3">Total Usage Time</ThemedText>
            <View className="flex-row flex-wrap gap-3 mb-6">
              <MetricTile
                title="Driver Hours"
                value={`${analytics.driver_total_hours}h`}
                subtitle={`~${analytics.driver_avg_hours_per_month}h / month`}
                icon="time"
                iconColor={BrandColors.success}
                colors={colors}
              />
              <MetricTile
                title="Biker Hours"
                value={`${analytics.biker_total_hours}h`}
                subtitle={`~${analytics.biker_avg_hours_per_month}h / month`}
                icon="time"
                iconColor={BrandColors.secondary}
                colors={colors}
              />
            </View>

            {/* Monthly Breakdown - Retention */}
            <ThemedText variant="h3" className="mb-3">Monthly Retention Breakdown</ThemedText>
            <View
              className="p-4 rounded-2xl border mb-4 bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.burgundy }} />
                <ThemedText variant="tiny">Drivers</ThemedText>
                <View className="w-3 h-3 rounded-full mr-2 ml-4" style={{ backgroundColor: '#8B5CF6' }} />
                <ThemedText variant="tiny">Bikers</ThemedText>
              </View>
              {analytics.breakdown.map((row) => {
                const shortMonth = row.month.split(' ')[0];
                return (
                  <View key={row.month}>
                    <BarRow
                      label={shortMonth}
                      value={row.driver_retention}
                      maxValue={100}
                      color={colors.burgundy}
                      colors={colors}
                    />
                    <BarRow
                      label=""
                      value={row.biker_retention}
                      maxValue={100}
                      color="#8B5CF6"
                      colors={colors}
                    />
                  </View>
                );
              })}
            </View>

            {/* Monthly Breakdown - Usage Hours */}
            <ThemedText variant="h3" className="mb-3">Monthly Usage Hours</ThemedText>
            <View
              className="p-4 rounded-2xl border mb-8 bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: BrandColors.success }} />
                <ThemedText variant="tiny">Drivers</ThemedText>
                <View className="w-3 h-3 rounded-full mr-2 ml-4" style={{ backgroundColor: BrandColors.secondary }} />
                <ThemedText variant="tiny">Bikers</ThemedText>
              </View>
              {analytics.breakdown.map((row) => {
                const shortMonth = row.month.split(' ')[0];
                const maxHours = 60; // scale reference
                return (
                  <View key={row.month}>
                    <View className="flex-row items-center mb-2">
                      <ThemedText variant="tiny" className="w-10" style={{ color: colors.textSecondary }}>{shortMonth}</ThemedText>
                      <View className="flex-1 h-5 rounded-full mx-2 overflow-hidden" style={{ backgroundColor: BrandColors.success + '20' }}>
                        <View className="h-full rounded-full" style={{ width: `${Math.min(100, (row.driver_hours / maxHours) * 100)}%`, backgroundColor: BrandColors.success }} />
                      </View>
                      <ThemedText variant="tiny" className="w-10 text-right">{row.driver_hours}h</ThemedText>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <ThemedText variant="tiny" className="w-10" style={{ color: colors.textSecondary }}></ThemedText>
                      <View className="flex-1 h-5 rounded-full mx-2 overflow-hidden" style={{ backgroundColor: BrandColors.secondary + '20' }}>
                        <View className="h-full rounded-full" style={{ width: `${Math.min(100, (row.biker_hours / maxHours) * 100)}%`, backgroundColor: BrandColors.secondary }} />
                      </View>
                      <ThemedText variant="tiny" className="w-10 text-right">{row.biker_hours}h</ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
