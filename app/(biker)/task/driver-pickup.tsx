import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { BikerMap } from '../../../components/biker/navigation/BikerMap';
import { PriorityBadge } from '../../../components/biker/task/PriorityBadge';
import { useTaskStore } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { BikerTask } from '../../../types/navigation';

type PickupStep = 'navigate' | 'locate_driver' | 'assist_driver' | 'transport' | 'completed';

const STEP_STYLES: Record<
  PickupStep,
  {
    cardClass: string;
    iconBgClass: string;
    titleClass: string;
    descriptionClass: string;
    actionButtonClass: string;
  }
> = {
  navigate: {
    cardClass: 'bg-secondary/10 border border-secondary/20',
    iconBgClass: 'bg-secondary',
    titleClass: 'text-secondary',
    descriptionClass: 'text-secondary/80',
    actionButtonClass: 'bg-burgundy',
  },
  locate_driver: {
    cardClass: 'bg-burgundy/10 border border-burgundy/20',
    iconBgClass: 'bg-burgundy',
    titleClass: 'text-burgundy',
    descriptionClass: 'text-burgundy/80',
    actionButtonClass: 'bg-burgundy',
  },
  assist_driver: {
    cardClass: 'bg-success/10 border border-success/20',
    iconBgClass: 'bg-success',
    titleClass: 'text-success',
    descriptionClass: 'text-success/80',
    actionButtonClass: 'bg-success',
  },
  transport: {
    cardClass: 'bg-secondary/10 border border-secondary/20',
    iconBgClass: 'bg-secondary',
    titleClass: 'text-secondary',
    descriptionClass: 'text-secondary/80',
    actionButtonClass: 'bg-burgundy',
  },
  completed: {
    cardClass: 'bg-success/10 border border-success/20',
    iconBgClass: 'bg-success',
    titleClass: 'text-success',
    descriptionClass: 'text-success/80',
    actionButtonClass: 'bg-success',
  },
};

export default function DriverPickupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateEarnings = useBikerEarningsStore((state) => state.updateEarnings);
  
  const [task, setTask] = useState<BikerTask | null>(null);
  const [currentStep, setCurrentStep] = useState<PickupStep>('navigate');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = getTaskById(id);
      setTask(foundTask);
    }
  }, [id, getTaskById]);

  const handleStepComplete = async (step: PickupStep) => {
    setIsLoading(true);
    try {
      switch (step) {
        case 'navigate':
          setCurrentStep('locate_driver');
          break;
        case 'locate_driver':
          setCurrentStep('assist_driver');
          break;
        case 'assist_driver':
          setCurrentStep('transport');
          break;
        case 'transport':
          setCurrentStep('completed');
          break;
        case 'completed':
          completeTask(task!.id);
          updateEarnings(task!.fare, 'base_fare');
          if (task!.emergencyBonus) {
            updateEarnings(task!.emergencyBonus, 'emergency_bonus');
          }
          
          Alert.alert(
            'Driver Pickup Completed!',
            'You have successfully helped the stranded driver.',
            [{ text: 'OK', onPress: () => router.replace('/(biker)') }]
          );
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getStepConfig = (step: PickupStep) => {
    switch (step) {
      case 'navigate':
        return {
          title: 'Navigate to Driver',
          description: 'Reach the stranded driver location',
          icon: 'navigation',
          action: 'Arrived at Location'
        };
      case 'locate_driver':
        return {
          title: 'Locate Driver',
          description: 'Find and contact the stranded driver',
          icon: 'search',
          action: 'Driver Located'
        };
      case 'assist_driver':
        return {
          title: 'Assess Situation',
          description: 'Help with immediate needs',
          icon: 'hand-left',
          action: 'Ready for Transport'
        };
      case 'transport':
        return {
          title: 'Transport Driver',
          description: 'Take driver to destination',
          icon: 'bicycle',
          action: 'Reached Destination'
        };
      case 'completed':
        return {
          title: 'Task Completed',
          description: 'Driver assistance finished',
          icon: 'checkmark-circle',
          action: 'Finish'
        };
    }
  };

  if (!task) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Loading driver pickup task...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const stepConfig = getStepConfig(currentStep);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <ThemedText className="font-bold text-lg">Driver Rescue</ThemedText>
            <PriorityBadge priority={task.priority} size="small" />
          </View>
          
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Current Step */}
          <View className="p-4">
            <ThemedCard className={`p-4 ${STEP_STYLES[currentStep].cardClass}`}>
              <View className="flex-row items-center">
                <View className={`${STEP_STYLES[currentStep].iconBgClass} p-3 rounded-full mr-4`}>
                  <Ionicons name={stepConfig.icon as any} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <ThemedText className={`font-bold text-lg ${STEP_STYLES[currentStep].titleClass}`}>
                    {stepConfig.title}
                  </ThemedText>
                  <ThemedText className={STEP_STYLES[currentStep].descriptionClass}>
                    {stepConfig.description}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Driver Contact */}
          {task.driverName && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">Stranded Driver</ThemedText>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-danger/10 p-3 rounded-full mr-3">
                      <Ionicons name="car" size={24} color="#EF4444" />
                    </View>
                    <View>
                      <ThemedText className="font-bold text-lg">{task.driverName}</ThemedText>
                      <ThemedText variant="caption" className="text-danger">
                        Needs Emergency Assistance
                      </ThemedText>
                    </View>
                  </View>
                  {task.driverPhone && (
                    <TouchableOpacity
                      onPress={() => makePhoneCall(task.driverPhone!)}
                      className="bg-danger p-3 rounded-full"
                    >
                      <Ionicons name="call" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Map */}
          <View className="px-4 mb-4">
            <ThemedCard className="overflow-hidden">
              <BikerMap
                pickupLocation={task.pickupLocation}
                dropoffLocation={task.dropoffLocation}
                showRoute={true}
                style={{ height: 250 }}
              />
            </ThemedCard>
          </View>

          {/* Task Details */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <ThemedText className="font-bold text-xl mb-2">{task.title}</ThemedText>
              {task.description && (
                <ThemedText variant="secondary" className="mb-3">
                  {task.description}
                </ThemedText>
              )}
              
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText variant="caption">Distance & Time</ThemedText>
                  <ThemedText className="font-semibold">
                    {task.estimatedDistance.toFixed(1)} km • {task.estimatedDuration} min
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText variant="caption">Emergency Reward</ThemedText>
                  <ThemedText className="font-bold text-burgundy text-xl">
                    ₹{task.fare + (task.emergencyBonus || 0)}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Safety Guidelines */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4 bg-secondary/10 border border-secondary/20">
              <ThemedText className="font-bold text-secondary mb-2">
                Driver Assistance Guidelines
              </ThemedText>
              <View className="space-y-2">
                <ThemedText className="text-secondary text-sm">
                  • Ensure your safety first before helping
                </ThemedText>
                <ThemedText className="text-secondary text-sm">
                  • Contact driver before arriving
                </ThemedText>
                <ThemedText className="text-secondary text-sm">
                  • Assess if professional help is needed
                </ThemedText>
                <ThemedText className="text-secondary text-sm">
                  • Be courteous and professional
                </ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Special Instructions */}
          {task.specialInstructions && (
            <View className="px-4 mb-6">
              <ThemedCard className="p-4 bg-warning/10 border border-warning/20">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#f59e0b" />
                  <View className="ml-3 flex-1">
                    <ThemedText className="font-semibold text-warning mb-1">
                      Special Instructions
                    </ThemedText>
                    <ThemedText className="text-warning">
                      {task.specialInstructions}
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        {currentStep !== 'completed' && (
          <View className="p-4 border-t border-border dark:border-darkBorder">
            <PrimaryButton
              title={stepConfig.action}
              onPress={() => handleStepComplete(currentStep)}
              loading={isLoading}
              className={STEP_STYLES[currentStep].actionButtonClass}
            />
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
