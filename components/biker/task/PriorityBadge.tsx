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
          bgColor: 'bg-danger/10',
          textColor: 'text-danger',
          borderColor: 'border-danger/20',
          icon: 'warning',
          label: 'EMERGENCY',
          pulseColor: 'bg-danger'
        };
      case 'urgent':
        return {
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20',
          icon: 'flash',
          label: 'URGENT',
          pulseColor: 'bg-warning'
        };
      case 'high':
        return {
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20',
          icon: 'chevron-up',
          label: 'HIGH',
          pulseColor: 'bg-warning'
        };
      case 'normal':
        return {
          bgColor: 'bg-info/10',
          textColor: 'text-info',
          borderColor: 'border-info/20',
          icon: 'checkmark-circle',
          label: 'NORMAL',
          pulseColor: 'bg-info'
        };
      default:
        return {
          bgColor: 'bg-textSecondary/10',
          textColor: 'text-textSecondary',
          borderColor: 'border-textSecondary/20',
          icon: 'ellipse',
          label: 'UNKNOWN',
          pulseColor: 'bg-textSecondary'
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
            color={priorityConfig.textColor.includes('danger') ? '#EF4444' : priorityConfig.textColor.includes('warning') ? '#F59E0B' : priorityConfig.textColor.includes('info') ? '#3B82F6' : '#6B7280'}
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
      ${priorityConfig.pulseColor}
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