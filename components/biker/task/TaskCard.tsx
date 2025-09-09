import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { PriorityBadge } from './PriorityBadge';
import { BikerTask, TaskType } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import { router } from 'expo-router';

interface TaskCardProps {
  task: BikerTask;
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TaskCard({ 
  task, 
  onAccept, 
  onDecline, 
  showActions = true, 
  compact = false 
}: TaskCardProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'customer_emergency':
        return 'warning';
      case 'driver_rescue':
        return 'car-sport';
      case 'document_delivery':
        return 'document-text';
      case 'car_retrieval':
        return 'key';
      case 'regular_delivery':
        return 'bicycle';
      default:
        return 'checkmark-circle';
    }
  };

  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case 'customer_emergency':
        return 'Customer Emergency';
      case 'driver_rescue':
        return 'Driver Rescue';
      case 'document_delivery':
        return 'Document Delivery';
      case 'car_retrieval':
        return 'Car Retrieval';
      case 'regular_delivery':
        return 'Regular Delivery';
      default:
        return 'Task';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(task.expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m left`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m left`;
  };

  const totalFare = task.fare + (task.emergencyBonus || 0);

  const handleCardPress = () => {
    router.push(`/(biker)/task/${task.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
        <ThemedCard className="mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary/10 p-2 rounded-full mr-3">
                <Ionicons 
                  name={getTaskIcon(task.type) as any} 
                  size={20} 
                  color="#BD8C5E" 
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <ThemedText className="font-semibold mr-2">{task.title}</ThemedText>
                  <PriorityBadge priority={task.priority} size="small" />
                </View>
                <ThemedText variant="caption" className="text-textSecondary">
                  {task.estimatedDistance.toFixed(1)} km • {task.estimatedDuration} min
                </ThemedText>
              </View>
            </View>
            <ThemedText className="font-bold text-primary text-lg">
              ₹{totalFare}
            </ThemedText>
          </View>
        </ThemedCard>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
      <ThemedCard className="mb-4">
        {/* Header with priority and fare */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <PriorityBadge priority={task.priority} />
            {task.responseTimeLimit && (
              <View className="bg-danger/10 px-2 py-1 rounded-full ml-2">
                <ThemedText className="text-danger text-xs font-semibold">
                  {calculateTimeRemaining()}
                </ThemedText>
              </View>
            )}
          </View>
          <View className="items-end">
            <ThemedText className="font-bold text-primary text-xl">
              ₹{totalFare}
            </ThemedText>
            {task.emergencyBonus && (
              <ThemedText className="text-success text-xs">
                +₹{task.emergencyBonus} bonus
              </ThemedText>
            )}
          </View>
        </View>

        {/* Task title and type */}
        <View className="flex-row items-center mb-3">
          <View className="bg-primary/10 p-2 rounded-full mr-3">
            <Ionicons 
              name={getTaskIcon(task.type) as any} 
              size={24} 
              color="#bd8c5e" 
            />
          </View>
          <View className="flex-1">
            <ThemedText className="font-bold text-lg">{task.title}</ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              {getTaskTypeLabel(task.type)}
            </ThemedText>
          </View>
        </View>

        {/* Customer/Driver info */}
        {(task.customerName || task.driverName) && (
          <View className="mb-3">
            {task.customerName && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="person" size={14} color="#bd8c5e" />
                <ThemedText variant="caption" className="ml-2">
                  Customer: {task.customerName}
                </ThemedText>
                {task.customerPhone && (
                  <TouchableOpacity className="ml-auto" activeOpacity={1}>
                    <Ionicons name="call" size={16} color="#BD8C5E" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {task.driverName && (
              <View className="flex-row items-center">
                <Ionicons name="car" size={14} color="#bd8c5e" />
                <ThemedText variant="caption" className="ml-2">
                  Driver: {task.driverName}
                </ThemedText>
                {task.driverPhone && (
                  <TouchableOpacity className="ml-auto" activeOpacity={1}>
                    <Ionicons name="call" size={16} color="#BD8C5E" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Locations */}
        <View className="mb-3">
          <View className="flex-row items-start mb-2">
            <Ionicons name="location" size={16} color="#BD8C5E" />
            <View className="ml-2 flex-1">
              <ThemedText variant="caption">PICKUP</ThemedText>
              <ThemedText className="text-sm">
                {task.pickupLocation.address}
              </ThemedText>
            </View>
          </View>
          
          {task.dropoffLocation && (
            <View className="flex-row items-start">
              <Ionicons name="flag" size={16} color="#BD8C5E" />
              <View className="ml-2 flex-1">
                <ThemedText variant="caption">DROP-OFF</ThemedText>
                <ThemedText className="text-sm">
                  {task.dropoffLocation.address}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Task details */}
        <View className="flex-row justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="speedometer" size={14} color="#BD8C5E" />
            <ThemedText variant="caption" className="ml-1">
              {task.estimatedDistance.toFixed(1)} km
            </ThemedText>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color="#BD8C5E" />
            <ThemedText variant="caption" className="ml-1">
              {task.estimatedDuration} min
            </ThemedText>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#BD8C5E" />
            <ThemedText variant="caption" className="ml-1">
              {formatTime(task.createdAt)}
            </ThemedText>
          </View>
        </View>

        {/* Special instructions */}
        {task.specialInstructions && (
          <View className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <ThemedText variant="caption" className="ml-2 flex-1 text-yellow-700 dark:text-yellow-300">
                {task.specialInstructions}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Items for delivery tasks */}
        {task.items && task.items.length > 0 && (
          <View className="mb-3">
            <ThemedText variant="caption" className="mb-2">ITEMS TO DELIVER:</ThemedText>
            {task.items.map((item, index) => (
              <View key={item.id} className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                <ThemedText className="flex-1 text-sm">
                  {item.quantity && `${item.quantity}x `}{item.name}
                </ThemedText>
                {item.fragile && (
                  <View className="bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-full mr-1">
                    <ThemedText className="text-warning text-xs">Fragile</ThemedText>
                  </View>
                )}
                {item.confidential && (
                  <View className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                    <ThemedText className="text-danger text-xs">Confidential</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        {showActions && task.status === 'pending' && (
          <View className="flex-row space-x-3">
            {onDecline && (
              <TouchableOpacity 
                onPress={onDecline}
                className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-lg"
                activeOpacity={1}
              >
                <ThemedText className="text-center font-semibold text-textSecondary">
                  Decline
                </ThemedText>
              </TouchableOpacity>
            )}
            {onAccept && (
              <TouchableOpacity 
                onPress={onAccept}
                className="flex-1 bg-burgundy py-3 rounded-lg"
                activeOpacity={1}
              >
                <ThemedText className="text-center font-semibold text-white">
                  Accept Task
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Status indicator for accepted/active tasks */}
        {task.status !== 'pending' && (
          <View className="mt-3">
            <View className={`py-2 px-3 rounded-lg ${
              task.status === 'accepted' ? 'bg-blue-100 dark:bg-blue-900/20' :
              task.status === 'in_progress' ? 'bg-green-100 dark:bg-green-900/20' :
              'bg-gray-100 dark:bg-gray-800'
            }`}>
              <ThemedText className={`text-center font-semibold ${
                task.status === 'accepted' ? 'text-info' :
                task.status === 'in_progress' ? 'text-success' :
                'text-textSecondary'
              }`}>
                {task.status === 'accepted' ? 'Task Accepted' :
                 task.status === 'in_progress' ? 'In Progress' :
                 task.status === 'completed' ? 'Completed' :
                 'Cancelled'}
              </ThemedText>
            </View>
          </View>
        )}
      </ThemedCard>
    </TouchableOpacity>
  );
}