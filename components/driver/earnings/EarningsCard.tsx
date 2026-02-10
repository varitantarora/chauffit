import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { useAuthStore } from '../../../store/authStore';

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
                  {Math.abs(trendValue)}% vs last week
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
  const { useEarningsStore } = require('../../../store/earningsStore');
  const { earnings } = useEarningsStore();

  return (
    <ThemedCard className="mb-4 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText variant="title" className="text-lg font-bold">
          Earnings Overview
        </ThemedText>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails}>
            <ThemedText className="text-burgundy">View Details</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold text-burgundy">
            ₹{(earnings.todayEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">Today</ThemedText>
        </View>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold">
            ₹{(earnings.weeklyEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">This Week</ThemedText>
        </View>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold">
            ₹{(earnings.monthlyEarnings || 0).toLocaleString('en-IN')}
          </ThemedText>
          <ThemedText variant="caption">This Month</ThemedText>
        </View>
      </View>

      {earnings.pendingAmount > 0 && (
        <View className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#f59e0b" />
              <ThemedText variant="caption" className="text-warning font-semibold ml-2">
                Pending Settlement
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

// Weekly progress card
export function WeeklyProgressCard() {
  const weeklyData = {
    target: 67000,
    achieved: 62000,
    ridesTarget: 80,
    ridesAchieved: 68,
    hoursTarget: 50,
    hoursAchieved: 42
  };
  
  const earningsProgress = (weeklyData.achieved / weeklyData.target) * 100;
  const ridesProgress = (weeklyData.ridesAchieved / weeklyData.ridesTarget) * 100;
  const hoursProgress = (weeklyData.hoursAchieved / weeklyData.hoursTarget) * 100;

  return (
    <ThemedCard className="mb-4 p-4">
      <ThemedText variant="title" className="text-lg font-bold mb-4">
        Weekly Progress
      </ThemedText>
      
      {/* Earnings Progress */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">Earnings</ThemedText>
          <ThemedText className="font-bold">
            ₹{weeklyData.achieved.toLocaleString('en-IN')} / ₹{weeklyData.target.toLocaleString('en-IN')}
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View 
            className="bg-burgundy rounded-full h-3"
            style={{ width: `${Math.min(earningsProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {Math.round(earningsProgress)}% complete
        </ThemedText>
      </View>
      
      {/* Rides Progress */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">Rides</ThemedText>
          <ThemedText className="font-bold">
            {weeklyData.ridesAchieved} / {weeklyData.ridesTarget}
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View 
            className="bg-success rounded-full h-3"
            style={{ width: `${Math.min(ridesProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {Math.round(ridesProgress)}% complete
        </ThemedText>
      </View>
      
      {/* Hours Progress */}
      <View>
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="font-semibold">Online Hours</ThemedText>
          <ThemedText className="font-bold">
            {weeklyData.hoursAchieved}h / {weeklyData.hoursTarget}h
          </ThemedText>
        </View>
        <View className="bg-surface dark:bg-darkSurface rounded-full h-3 mb-2">
          <View 
            className="bg-secondary rounded-full h-3"
            style={{ width: `${Math.min(hoursProgress, 100)}%` }}
          />
        </View>
        <ThemedText variant="caption" className="text-right">
          {Math.round(hoursProgress)}% complete
        </ThemedText>
      </View>
    </ThemedCard>
  );
}