import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useI18nStore } from '../../../store/i18nStore';

interface EarningsCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  showTrend?: boolean;
  trendValue?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export function EarningsCard({
  title,
  amount,
  subtitle,
  icon,
  iconColor = '#bd8c5e',
  onPress,
  showTrend = false,
  trendValue = 0,
  trendDirection = 'neutral'
}: EarningsCardProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const t = useI18nStore((state) => state.t);

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={onPress ? "mb-4" : "mb-4"}
    >
      <ThemedCard className={`p-4 ${onPress ? 'shadow-sm' : ''}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              {icon && (
                <Ionicons 
                  name={icon as any} 
                  size={20} 
                  color={iconColor} 
                  style={{ marginRight: 8 }}
                />
              )}
              <ThemedText variant="secondary" className="text-sm">
                {title}
              </ThemedText>
            </View>
            
            <ThemedText className="text-2xl font-bold">
              ₹{amount.toLocaleString('en-IN')}
            </ThemedText>
            
            {subtitle && (
              <ThemedText variant="caption" className="mt-1">
                {subtitle}
              </ThemedText>
            )}
            
            {showTrend && (
              <View className="flex-row items-center mt-2">
                <Ionicons 
                  name={getTrendIcon() as any} 
                  size={14} 
                  color={getTrendColor()} 
                />
                <ThemedText
                  variant="caption"
                  className="ml-1"
                  style={{ color: getTrendColor() }}
                >
                  {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
                  {Math.abs(trendValue)}{t('vsLastWeek')}
                </ThemedText>
              </View>
            )}
          </View>
          
          {onPress && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? '#d9d1c6' : '#314b4c'} 
            />
          )}
        </View>
      </ThemedCard>
    </CardComponent>
  );
}

// Earnings summary card with multiple metrics
export function EarningsSummaryCard({ onViewDetails }: { onViewDetails?: () => void }) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const t = useI18nStore((state) => state.t);
  const { useEarningsStore } = require('../../../store/earningsStore');
  const { earnings } = useEarningsStore();

  return (
    <ThemedCard className="mb-4 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText variant="title" className="text-lg font-bold">
          {t('earningsOverview')}
        </ThemedText>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails}>
            <ThemedText className="text-burgundy">{t('viewDetails')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold text-burgundy">
            ₹{(earnings.todayEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">{t('today')}</ThemedText>
        </View>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold">
            ₹{(earnings.weeklyEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">{t('thisWeek')}</ThemedText>
        </View>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold">
            ₹{(earnings.monthlyEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">{t('thisMonth')}</ThemedText>
        </View>
      </View>

      {earnings.pendingAmount > 0 && (
        <View className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#f59e0b" />
              <ThemedText variant="caption" className="text-warning font-semibold ml-2">
                {t('pendingSettlement')}
              </ThemedText>
            </View>
            <ThemedText className="font-bold text-warning">
              ₹{(earnings.pendingAmount || 0).toLocaleString('en-IN')}
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedCard>
  );
}

// Weekly progress card - Uses real data from earnings store and stats
interface WeeklyProgressCardProps {
  weeklyEarnings?: number;
  weeklyTarget?: number;
  weeklyRides?: number;
  weeklyRidesTarget?: number;
  onlineHours?: number;
  onlineHoursTarget?: number;
}

export function WeeklyProgressCard({
  weeklyEarnings = 0,
  weeklyTarget = 67000,
  weeklyRides = 0,
  weeklyRidesTarget = 80,
  onlineHours = 0,
  onlineHoursTarget = 50
}: WeeklyProgressCardProps) {
  const t = useI18nStore((state) => state.t);
  // Use real data from props, fall back to store values
  const { useEarningsStore } = require('../../../store/earningsStore');
  const { earnings, weeklyTarget: storeWeeklyTarget } = useEarningsStore();

  // Use provided props or fall back to store
  const actualEarnings = weeklyEarnings || earnings.weeklyEarnings || 0;
  const actualTarget = weeklyTarget || storeWeeklyTarget || 67000;

  const earningsProgress = actualTarget > 0 ? (actualEarnings / actualTarget) * 100 : 0;
  const ridesProgress = weeklyRidesTarget > 0 ? (weeklyRides / weeklyRidesTarget) * 100 : 0;
  const hoursProgress = onlineHoursTarget > 0 ? (onlineHours / onlineHoursTarget) * 100 : 0;

  return (
    <ThemedCard className="mb-4 p-4">
      <ThemedText variant="title" className="text-lg font-bold mb-4">
        {t('weeklyProgress')}
      </ThemedText>

      {/* Earnings Progress */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">{t('earnings')}</ThemedText>
          <ThemedText className="font-bold">
            ₹{Math.round(actualEarnings).toLocaleString('en-IN')} / ₹{actualTarget.toLocaleString('en-IN')}
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View
            className="bg-burgundy rounded-full h-3"
            style={{ width: `${Math.min(earningsProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {Math.round(earningsProgress)}{t('percentComplete')}
        </ThemedText>
      </View>

      {/* Rides Progress */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">{t('rides')}</ThemedText>
          <ThemedText className="font-bold">
            {weeklyRides} / {weeklyRidesTarget}
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View
            className="bg-success rounded-full h-3"
            style={{ width: `${Math.min(ridesProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {weeklyRidesTarget > 0 ? Math.round(ridesProgress) : 0}{t('percentComplete')}
        </ThemedText>
      </View>

      {/* Hours Progress */}
      <View>
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">{t('onlineHours')}</ThemedText>
          <ThemedText className="font-bold">
            {onlineHours}h / {onlineHoursTarget}h
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View
            className="bg-secondary rounded-full h-3"
            style={{ width: `${Math.min(hoursProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {onlineHoursTarget > 0 ? Math.round(hoursProgress) : 0}{t('percentComplete')}
        </ThemedText>
      </View>
    </ThemedCard>
  );
}