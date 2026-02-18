import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Vibration, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../../common/ThemedText';
import { ThemedCard } from '../../common/ThemedCard';
import { useAuthStore } from '../../../store/authStore';
import * as Haptics from 'expo-haptics';

interface ResponseTimerProps {
  targetTime: Date;
  onTimeUp?: () => void;
  onWarning?: (minutesLeft: number) => void;
  showAlerts?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear' | 'compact';
  warningThreshold?: number; // minutes
  criticalThreshold?: number; // minutes
}

export function ResponseTimer({ 
  targetTime,
  onTimeUp,
  onWarning,
  showAlerts = true,
  size = 'medium',
  variant = 'circular',
  warningThreshold = 5,
  criticalThreshold = 2
}: ResponseTimerProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasCriticalWarned, setHasCriticalWarned] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = 15 * 60 * 1000; // 15 minutes in milliseconds (typical emergency response time)

  useEffect(() => {
    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetTime]);

  useEffect(() => {
    const minutesLeft = Math.floor(timeRemaining / (60 * 1000));
    
    if (minutesLeft <= criticalThreshold && !hasCriticalWarned && !isExpired) {
      setHasCriticalWarned(true);
      startPulseAnimation();
      if (showAlerts) {
        triggerHapticFeedback('error');
        Alert.alert(
          'Critical Time!',
          `Only ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} left to respond!`,
          [{ text: 'OK' }]
        );
      }
    } else if (minutesLeft <= warningThreshold && !hasWarned && !isExpired) {
      setHasWarned(true);
      if (showAlerts) {
        triggerHapticFeedback('warning');
        onWarning?.(minutesLeft);
      }
    }
  }, [timeRemaining]);

  const updateTimer = () => {
    const now = new Date().getTime();
    const target = new Date(targetTime).getTime();
    const remaining = target - now;

    if (remaining <= 0) {
      setTimeRemaining(0);
      setIsExpired(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      onTimeUp?.();
      if (showAlerts) {
        triggerHapticFeedback('error');
      }
    } else {
      setTimeRemaining(remaining);
      // Update progress animation
      const progress = Math.max(0, Math.min(1, (totalDuration - remaining) / totalDuration));
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const triggerHapticFeedback = async (type: 'warning' | 'error') => {
    try {
      if (type === 'error') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Vibration.vibrate([0, 500, 200, 500]);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Vibration.vibrate(200);
      }
    } catch (error) {
      // Fallback to regular vibration
      Vibration.vibrate(type === 'error' ? [0, 500, 200, 500] : 200);
    }
  };

  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return { minutes: 0, seconds: 0, display: '00:00' };
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return {
      minutes,
      seconds,
      display: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const getTimerColor = () => {
    const minutesLeft = Math.floor(timeRemaining / (60 * 1000));
    
    if (isExpired) return 'text-red-500';
    if (minutesLeft <= criticalThreshold) return 'text-red-500';
    if (minutesLeft <= warningThreshold) return 'text-orange-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    const minutesLeft = Math.floor(timeRemaining / (60 * 1000));
    
    if (isExpired) return '#ef4444';
    if (minutesLeft <= criticalThreshold) return '#ef4444';
    if (minutesLeft <= warningThreshold) return '#f97316';
    return '#10b981';
  };

  const time = formatTime(timeRemaining);

  if (variant === 'compact') {
    return (
      <View className="flex-row items-center">
        <View className="bg-red-500/10 p-1.5 rounded-full mr-2">
          <Ionicons 
            name={isExpired ? 'close-circle' : 'timer'} 
            size={16} 
            color={getProgressColor()} 
          />
        </View>
        <ThemedText className={`font-bold text-sm ${getTimerColor()}`}>
          {isExpired ? 'EXPIRED' : time.display}
        </ThemedText>
      </View>
    );
  }

  if (variant === 'linear') {
    return (
      <ThemedCard className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons 
              name={isExpired ? 'close-circle' : 'timer'} 
              size={20} 
              color={getProgressColor()} 
            />
            <ThemedText className="ml-2 font-semibold">
              Response Time
            </ThemedText>
          </View>
          <ThemedText className={`font-bold text-lg ${getTimerColor()}`}>
            {isExpired ? 'EXPIRED' : time.display}
          </ThemedText>
        </View>
        
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <Animated.View 
            className="rounded-full h-2"
            style={{
              backgroundColor: getProgressColor(),
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }}
          />
        </View>
        
        {!isExpired && (
          <ThemedText variant="caption" className="text-center mt-2">
            {time.minutes > 0 && `${time.minutes}m `}{time.seconds}s remaining
          </ThemedText>
        )}
      </ThemedCard>
    );
  }

  // Circular variant (default)
  const circleSize = size === 'small' ? 80 : size === 'large' ? 120 : 100;
  const strokeWidth = size === 'small' ? 6 : size === 'large' ? 10 : 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <Animated.View
      style={{ transform: [{ scale: pulseAnim }] }}
      className="items-center justify-center"
    >
      <ThemedCard className="p-6 items-center">
        <View style={{ width: circleSize, height: circleSize }} className="relative">
          {/* Background circle */}
          <Svg
            width={circleSize}
            height={circleSize}
            style={{ position: 'absolute' }}
          >
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
          </Svg>

          {/* Progress circle */}
          <Animated.View
            style={{
              position: 'absolute',
              width: circleSize,
              height: circleSize,
            }}
          >
            <Svg
              width={circleSize}
              height={circleSize}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={getProgressColor()}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0],
                  extrapolate: 'clamp',
                })}
              />
            </Svg>
          </Animated.View>
          
          {/* Center content */}
          <View className="absolute inset-0 items-center justify-center">
            <Ionicons 
              name={isExpired ? 'close-circle' : 'timer'} 
              size={size === 'small' ? 20 : size === 'large' ? 28 : 24} 
              color={getProgressColor()} 
            />
            <ThemedText className={`font-bold mt-1 ${
              size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'
            } ${getTimerColor()}`}>
              {isExpired ? 'EXPIRED' : time.display}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText className="font-semibold mt-3 text-center">
          {isExpired ? 'Response Time Expired' : 'Emergency Response Timer'}
        </ThemedText>
        
        {!isExpired && (
          <ThemedText variant="caption" className="text-center mt-1">
            Respond quickly for better ratings
          </ThemedText>
        )}
      </ThemedCard>
    </Animated.View>
  );
}

// Emergency timer alert component
export function EmergencyTimerAlert({ 
  timeRemaining, 
  onDismiss 
}: { 
  timeRemaining: number;
  onDismiss: () => void;
}) {
  const time = Math.floor(timeRemaining / (60 * 1000));
  
  return (
    <ThemedCard className="mx-4 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-red-500/20 p-2 rounded-full mr-3">
            <Ionicons name="warning" size={20} color="#ef4444" />
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold text-red-600">
              Emergency Response Alert
            </ThemedText>
            <ThemedText variant="caption" className="text-red-500">
              {time <= 0 ? 'Response time expired!' : `${time} minute${time !== 1 ? 's' : ''} left to respond`}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={onDismiss} className="p-1">
          <Ionicons name="close" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </ThemedCard>
  );
}