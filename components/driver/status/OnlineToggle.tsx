import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../common/ThemedText';
import { ThemedCard } from '../../common/ThemedCard';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: (isOnline: boolean) => void;
  disabled?: boolean;
}

export function OnlineToggle({ isOnline, onToggle, disabled = false }: OnlineToggleProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggle = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    onToggle(!isOnline);
    
    // Reset animation after delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <ThemedCard className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-success' : 'bg-gray-400'}`} />
            <ThemedText variant="title" className="text-lg font-bold">
              {isOnline ? 'Online' : 'Offline'}
            </ThemedText>
          </View>
          <ThemedText variant="secondary" className="text-sm">
            {isOnline ? 'You are available for ride requests' : 'Go online to start receiving requests'}
          </ThemedText>
          {isOnline && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={14} color="#10b981" />
              <ThemedText variant="caption" className="text-success ml-1">
                Location sharing active
              </ThemedText>
            </View>
          )}
        </View>
        
        <View className="ml-4">
          <TouchableOpacity
            onPress={handleToggle}
            disabled={disabled || isAnimating}
            activeOpacity={0.8}
          >
            <View className={`
              relative w-16 h-16 rounded-full border-4 items-center justify-center
              ${isOnline 
                ? 'bg-success border-success shadow-lg shadow-success/30' 
                : 'bg-gray-300 border-gray-300'
              }
              ${disabled ? 'opacity-50' : ''}
              ${isAnimating ? 'scale-95' : ''}
            `}>
              <Ionicons 
                name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={isOnline ? '#ffffff' : '#666666'} 
              />
              
              {/* Pulse animation for online state */}
              {isOnline && (
                <View className="absolute inset-0 rounded-full border-4 border-success opacity-30 animate-pulse" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Status message */}
      {isOnline && (
        <View className="mt-4 pt-4 border-t border-border dark:border-darkBorder">
          <View className="bg-success/10 border border-success/20 rounded-lg p-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <ThemedText variant="caption" className="text-success font-semibold ml-2">
                Ready to receive ride requests
              </ThemedText>
            </View>
          </View>
        </View>
      )}
      
      {!isOnline && (
        <View className="mt-4 pt-4 border-t border-border dark:border-darkBorder">
          <View className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={16} color="#f59e0b" />
              <ThemedText variant="caption" className="text-warning font-semibold ml-2">
                You won't receive any ride requests while offline
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedCard>
  );
}

// Enhanced toggle with additional controls
export function EnhancedOnlineToggle() {
  const isOnline = useJobStore((state) => state.isOnline);
  const setOnlineStatus = useJobStore((state) => state.setOnlineStatus);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [showDetails, setShowDetails] = useState(false);
  
  const onlineStats = {
    todayHours: 8.5,
    weeklyHours: 42,
    totalEarnings: 10700,
    ridesCompleted: 8
  };

  return (
    <ThemedCard className="mb-4 p-0">
      {/* Main Toggle */}
      <View className="p-4">
        <OnlineToggle 
          isOnline={isOnline} 
          onToggle={setOnlineStatus} 
        />
      </View>
      
      {/* Stats Section */}
      {isOnline && (
        <View className="border-t border-border dark:border-darkBorder p-4">
          <TouchableOpacity 
            onPress={() => setShowDetails(!showDetails)}
            className="flex-row items-center justify-between mb-3"
          >
            <ThemedText variant="title" className="font-semibold">
              Today's Activity
            </ThemedText>
            <Ionicons 
              name={showDetails ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDarkMode ? '#d9d1c6' : '#314b4c'} 
            />
          </TouchableOpacity>
          
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <ThemedText className="font-bold text-lg">
                {onlineStats.todayHours}h
              </ThemedText>
              <ThemedText variant="caption">Online</ThemedText>
            </View>
            <View className="flex-1 items-center">
              <ThemedText className="font-bold text-lg text-success">
                {onlineStats.ridesCompleted}
              </ThemedText>
              <ThemedText variant="caption">Rides</ThemedText>
            </View>
            <View className="flex-1 items-center">
              <ThemedText className="font-bold text-lg text-burgundy">
                ₹{onlineStats.totalEarnings.toLocaleString('en-IN')}
              </ThemedText>
              <ThemedText variant="caption">Earned</ThemedText>
            </View>
          </View>
          
          {showDetails && (
            <View className="mt-4 pt-4 border-t border-border dark:border-darkBorder">
              <View className="flex-row justify-between mb-2">
                <ThemedText variant="secondary">Weekly Hours:</ThemedText>
                <ThemedText>{onlineStats.weeklyHours}h / 50h</ThemedText>
              </View>
              <View className="bg-surface dark:bg-darkSurface rounded-full h-2 mb-2">
                <View 
                  className="bg-burgundy rounded-full h-2"
                  style={{ width: `${(onlineStats.weeklyHours / 50) * 100}%` }}
                />
              </View>
              <ThemedText variant="caption" className="text-center">
                {Math.round((onlineStats.weeklyHours / 50) * 100)}% of weekly target
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </ThemedCard>
  );
}