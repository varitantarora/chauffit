import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../common/ThemedText';
import { TaskPriority } from '../../../types/navigation';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showText?: boolean;
}

export function PriorityBadge({ 
  priority, 
  size = 'medium', 
  showIcon = true, 
  showText = true 
}: PriorityBadgeProps) {
  
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'emergency':
        return {
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-500',
          borderColor: 'border-red-500/20',
          icon: 'warning',
          label: 'EMERGENCY',
          pulseColor: 'bg-red-500'
        };
      case 'urgent':
        return {
          bgColor: 'bg-orange-500/10',
          textColor: 'text-orange-500',
          borderColor: 'border-orange-500/20',
          icon: 'flash',
          label: 'URGENT',
          pulseColor: 'bg-orange-500'
        };
      case 'high':
        return {
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-500/20',
          icon: 'chevron-up',
          label: 'HIGH',
          pulseColor: 'bg-yellow-500'
        };
      case 'normal':
        return {
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-500',
          borderColor: 'border-blue-500/20',
          icon: 'checkmark-circle',
          label: 'NORMAL',
          pulseColor: 'bg-blue-500'
        };
      default:
        return {
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-500/20',
          icon: 'ellipse',
          label: 'UNKNOWN',
          pulseColor: 'bg-gray-500'
        };
    }
  };

  const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return {
          containerPadding: 'px-2 py-1',
          iconSize: 12,
          textSize: 'text-xs',
          pulseSize: 'w-2 h-2'
        };
      case 'medium':
        return {
          containerPadding: 'px-3 py-1.5',
          iconSize: 14,
          textSize: 'text-xs',
          pulseSize: 'w-2.5 h-2.5'
        };
      case 'large':
        return {
          containerPadding: 'px-4 py-2',
          iconSize: 16,
          textSize: 'text-sm',
          pulseSize: 'w-3 h-3'
        };
      default:
        return {
          containerPadding: 'px-3 py-1.5',
          iconSize: 14,
          textSize: 'text-xs',
          pulseSize: 'w-2.5 h-2.5'
        };
    }
  };

  const priorityConfig = getPriorityConfig(priority);
  const sizeConfig = getSizeConfig(size);

  // Emergency tasks get a pulsing animation
  const isEmergency = priority === 'emergency';

  return (
    <View className="relative">
      {isEmergency && (
        <View className="absolute -inset-1 animate-ping">
          <View className={`
            ${priorityConfig.pulseColor} 
            ${sizeConfig.pulseSize} 
            rounded-full opacity-75
          `} />
        </View>
      )}
      
      <View className={`
        ${priorityConfig.bgColor}
        ${priorityConfig.borderColor}
        ${sizeConfig.containerPadding}
        border
        rounded-full
        flex-row
        items-center
        justify-center
        ${isEmergency ? 'animate-pulse' : ''}
      `}>
        {showIcon && (
          <Ionicons 
            name={priorityConfig.icon as any} 
            size={sizeConfig.iconSize} 
            color={priorityConfig.textColor.replace('text-', '#').replace('-500', '').replace('-600', '')}
            style={{ marginRight: showText ? 4 : 0 }}
          />
        )}
        
        {showText && (
          <ThemedText className={`
            ${priorityConfig.textColor} 
            ${sizeConfig.textSize} 
            font-bold
          `}>
            {priorityConfig.label}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

// Additional component for priority sorting indicator
export function PrioritySortIndicator({ priority }: { priority: TaskPriority }) {
  const priorityConfig = getPriorityConfig(priority);
  
  return (
    <View className={`
      w-1 
      h-full 
      ${priorityConfig.pulseColor.replace('bg-', 'bg-').replace('-500', '-400')}
      rounded-r-sm
    `} />
  );
}

// Component for showing priority in lists with dot indicator
export function PriorityDot({ priority, size = 8 }: { priority: TaskPriority; size?: number }) {
  const priorityConfig = getPriorityConfig(priority);
  
  return (
    <View 
      className={`
        ${priorityConfig.pulseColor}
        rounded-full
      `}
      style={{ width: size, height: size }}
    />
  );
}