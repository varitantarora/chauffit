import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { Incentive } from '../../../store/bikerEarningsStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { useAuthStore } from '../../../store/authStore';

interface IncentiveTrackerProps {
  incentives: Incentive[];
  compact?: boolean;
  showCompleted?: boolean;
}

export function IncentiveTracker({ 
  incentives, 
  compact = false, 
  showCompleted = false 
}: IncentiveTrackerProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getIncentiveProgress = useBikerEarningsStore((state) => state.getIncentiveProgress);

  const activeIncentives = incentives.filter(i => i.isActive && !i.isCompleted);
  const completedIncentives = incentives.filter(i => i.isCompleted);

  if (compact) {
    return (
      <ThemedCard className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <ThemedText className="font-semibold">Active Incentives</ThemedText>
          <ThemedText variant="caption" className="text-primary">
            {activeIncentives.length} active
          </ThemedText>
        </View>
        
        {activeIncentives.slice(0, 2).map((incentive) => (
          <IncentiveItem 
            key={incentive.id} 
            incentive={incentive} 
            progress={getIncentiveProgress(incentive.id)}
            compact={true}
          />
        ))}
        
        {activeIncentives.length > 2 && (
          <TouchableOpacity className="mt-2">
            <ThemedText variant="caption" className="text-primary text-center">
              View {activeIncentives.length - 2} more incentives
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedCard>
    );
  }

  return (
    <View className="space-y-4">
      {/* Active Incentives */}
      {activeIncentives.length > 0 && (
        <ThemedCard className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="font-bold text-lg">Active Incentives</ThemedText>
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <ThemedText className="text-primary font-semibold text-sm">
                {activeIncentives.length}
              </ThemedText>
            </View>
          </View>
          
          {activeIncentives.map((incentive, index) => (
            <IncentiveItem 
              key={incentive.id} 
              incentive={incentive} 
              progress={getIncentiveProgress(incentive.id)}
              isLast={index === activeIncentives.length - 1}
            />
          ))}
        </ThemedCard>
      )}

      {/* Completed Incentives */}
      {showCompleted && completedIncentives.length > 0 && (
        <ThemedCard className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="font-bold text-lg">Completed Today</ThemedText>
            <View className="bg-green-500/10 px-3 py-1 rounded-full">
              <ThemedText className="text-green-600 font-semibold text-sm">
                +₹{completedIncentives.reduce((sum, i) => sum + i.reward, 0)}
              </ThemedText>
            </View>
          </View>
          
          {completedIncentives.slice(0, 3).map((incentive, index) => (
            <CompletedIncentiveItem 
              key={incentive.id} 
              incentive={incentive}
              isLast={index === Math.min(2, completedIncentives.length - 1)}
            />
          ))}
        </ThemedCard>
      )}

      {/* No Active Incentives */}
      {activeIncentives.length === 0 && (
        <ThemedCard className="p-6">
          <View className="items-center">
            <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
              <Ionicons name="trophy-outline" size={32} color="#bd8c5e" />
            </View>
            <ThemedText className="font-semibold text-center">
              No Active Incentives
            </ThemedText>
            <ThemedText variant="caption" className="text-center mt-1">
              Complete more tasks to unlock new incentives
            </ThemedText>
          </View>
        </ThemedCard>
      )}
    </View>
  );
}

interface IncentiveItemProps {
  incentive: Incentive;
  progress: number;
  compact?: boolean;
  isLast?: boolean;
}

function IncentiveItem({ incentive, progress, compact = false, isLast = false }: IncentiveItemProps) {
  const [animatedProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getIncentiveIcon = (type: Incentive['type']) => {
    switch (type) {
      case 'task_count':
        return 'checkmark-done';
      case 'emergency_response':
        return 'medical';
      case 'rating':
        return 'star';
      case 'hours':
        return 'time';
      case 'streak':
        return 'flame';
      default:
        return 'trophy';
    }
  };

  const getTimeRemaining = () => {
    if (!incentive.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(incentive.deadline);
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h left`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d left`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <View className={`${!isLast ? 'border-b border-border dark:border-darkBorder pb-4 mb-4' : ''}`}>
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="bg-primary/10 p-2 rounded-full mr-3">
            <Ionicons 
              name={getIncentiveIcon(incentive.type) as any} 
              size={compact ? 16 : 20} 
              color="#bd8c5e" 
            />
          </View>
          <View className="flex-1">
            <ThemedText className={`font-semibold ${compact ? 'text-sm' : ''}`}>
              {incentive.title}
            </ThemedText>
            {!compact && (
              <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary mt-1">
                {incentive.description}
              </ThemedText>
            )}
          </View>
        </View>
        
        <View className="items-end ml-3">
          <ThemedText className={`font-bold text-green-600 ${compact ? 'text-sm' : ''}`}>
            ₹{incentive.reward}
          </ThemedText>
          {timeRemaining && (
            <ThemedText variant="caption" className={`
              ${timeRemaining === 'Expired' ? 'text-red-500' : 'text-orange-500'}
              ${compact ? 'text-xs' : ''}
            `}>
              {timeRemaining}
            </ThemedText>
          )}
        </View>
      </View>
      
      {/* Progress Bar */}
      <View className="mb-2">
        <View className="flex-row justify-between items-center mb-1">
          <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
            Progress: {incentive.progress}/{incentive.target}
          </ThemedText>
          <ThemedText variant="caption" className="text-primary font-semibold">
            {Math.round(progress)}%
          </ThemedText>
        </View>
        
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <Animated.View 
            className="bg-primary rounded-full h-2"
            style={{
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }}
          />
        </View>
      </View>
      
      {/* Progress milestones */}
      {!compact && progress > 80 && (
        <View className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="flash" size={14} color="#10b981" />
            <ThemedText className="text-green-600 text-sm ml-2">
              Almost there! Just {incentive.target - incentive.progress} more to go!
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

interface CompletedIncentiveItemProps {
  incentive: Incentive;
  isLast?: boolean;
}

function CompletedIncentiveItem({ incentive, isLast = false }: CompletedIncentiveItemProps) {
  const [celebrationAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={{
        transform: [{ scale: celebrationAnim }],
      }}
      className={`${!isLast ? 'border-b border-border dark:border-darkBorder pb-3 mb-3' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-green-500/10 p-2 rounded-full mr-3">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold">{incentive.title}</ThemedText>
            <ThemedText variant="caption" className="text-green-600">
              Completed {incentive.completedAt ? new Date(incentive.completedAt).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'today'}
            </ThemedText>
          </View>
        </View>
        
        <View className="items-end">
          <ThemedText className="font-bold text-green-600">
            +₹{incentive.reward}
          </ThemedText>
          <View className="bg-green-500/10 px-2 py-1 rounded-full">
            <ThemedText className="text-green-600 text-xs font-semibold">
              EARNED
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// Quick incentive summary component
export function IncentiveSummary() {
  const activeIncentives = useBikerEarningsStore((state) => state.activeIncentives);
  const completedIncentives = useBikerEarningsStore((state) => state.completedIncentives);
  
  const todayCompleted = completedIncentives.filter(i => {
    const today = new Date();
    const completedDate = i.completedAt ? new Date(i.completedAt) : null;
    return completedDate && completedDate.toDateString() === today.toDateString();
  });
  
  const todayEarnings = todayCompleted.reduce((sum, i) => sum + i.reward, 0);

  return (
    <View className="flex-row space-x-3">
      <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <ThemedText className="text-blue-600 font-bold text-xl">
          {activeIncentives.length}
        </ThemedText>
        <ThemedText variant="caption" className="text-blue-600">
          Active Incentives
        </ThemedText>
      </View>
      
      <View className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <ThemedText className="text-green-600 font-bold text-xl">
          ₹{todayEarnings}
        </ThemedText>
        <ThemedText variant="caption" className="text-green-600">
          Earned Today
        </ThemedText>
      </View>
    </View>
  );
}