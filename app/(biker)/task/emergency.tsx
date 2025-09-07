import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Linking, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { BikerMap } from '../../../components/biker/navigation/BikerMap';
import { ResponseTimer } from '../../../components/biker/emergency/ResponseTimer';
import { PriorityBadge } from '../../../components/biker/task/PriorityBadge';
import { useTaskStore } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { BikerTask } from '../../../types/navigation';
import * as Haptics from 'expo-haptics';

type EmergencyStep = 'responding' | 'arrived' | 'assessing' | 'rescuing' | 'completed';

export default function EmergencyResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateEarnings = useBikerEarningsStore((state) => state.updateEarnings);
  
  const [task, setTask] = useState<BikerTask | null>(null);
  const [currentStep, setCurrentStep] = useState<EmergencyStep>('responding');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStartTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [sosPressed, setSosPressed] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = getTaskById(id);
      setTask(foundTask);
    }
  }, [id, getTaskById]);

  const handleStepComplete = async (step: EmergencyStep) => {
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      switch (step) {
        case 'arrived':
          setArrivalTime(new Date());
          setCurrentStep('assessing');
          updateTaskStatus(task!.id, 'in_progress');
          break;
        
        case 'assessing':
          setCurrentStep('rescuing');
          break;
          
        case 'rescuing':
          setCurrentStep('completed');
          break;
          
        case 'completed':
          const responseTime = arrivalTime ? 
            (arrivalTime.getTime() - responseStartTime.getTime()) / (1000 * 60) : 0;
          
          completeTask(task!.id);
          
          // Calculate bonus based on response time
          let emergencyBonus = task!.emergencyBonus || 0;
          if (responseTime <= 10) emergencyBonus += 100; // Super fast response bonus
          
          updateEarnings(task!.fare, 'base_fare');
          if (emergencyBonus > 0) {
            updateEarnings(emergencyBonus, 'emergency_bonus');
          }
          
          Alert.alert(
            'Emergency Completed!',
            `Excellent work! You responded in ${responseTime.toFixed(1)} minutes.\n\nEarnings: ₹${task!.fare + emergencyBonus}`,
            [
              { text: 'OK', onPress: () => router.replace('/(biker)') }
            ]
          );
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOS = async () => {
    setSosPressed(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Vibration.vibrate([0, 500, 100, 500, 100, 500]);
    
    Alert.alert(
      'SOS Activated!',
      'Emergency services have been notified of your location. Stay safe!',
      [
        {
          text: 'Call Emergency Services',
          onPress: () => Linking.openURL('tel:100')
        },
        { text: 'OK' }
      ]
    );
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getStepStatus = (step: EmergencyStep) => {
    const stepOrder: EmergencyStep[] = ['responding', 'arrived', 'assessing', 'rescuing', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepConfig = (step: EmergencyStep) => {
    switch (step) {
      case 'responding':
        return {
          title: 'En Route to Emergency',
          description: 'Navigate to emergency location quickly and safely',
          icon: 'bicycle',
          action: 'Mark as Arrived',
          nextStep: 'arrived' as EmergencyStep,
        };
      case 'arrived':
        return {
          title: 'Arrived at Scene',
          description: 'Assess the situation and ensure safety first',
          icon: 'location',
          action: 'Start Assessment',
          nextStep: 'assessing' as EmergencyStep,
        };
      case 'assessing':
        return {
          title: 'Assessing Situation',
          description: 'Understand the problem and plan the rescue approach',
          icon: 'search',
          action: 'Begin Rescue',
          nextStep: 'rescuing' as EmergencyStep,
        };
      case 'rescuing':
        return {
          title: 'Executing Rescue',
          description: 'Help the customer or driver as needed',
          icon: 'hand-left',
          action: 'Complete Emergency',
          nextStep: 'completed' as EmergencyStep,
        };
      case 'completed':
        return {
          title: 'Emergency Resolved',
          description: 'Task completed successfully',
          icon: 'checkmark-circle',
          action: 'Finish',
          nextStep: 'completed' as EmergencyStep,
        };
    }
  };

  if (!task) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Loading emergency task...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const stepConfig = getStepConfig(currentStep);
  const isEmergencyTask = task.type === 'customer_emergency' || task.type === 'driver_rescue';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="bg-red-500 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="flex-1 items-center">
              <ThemedText className="font-bold text-lg text-white">EMERGENCY RESPONSE</ThemedText>
              <ThemedText className="text-red-100 text-sm">Priority Task</ThemedText>
            </View>
            
            {/* SOS Button */}
            <TouchableOpacity
              onPress={handleSOS}
              className={`p-3 rounded-full border-2 ${
                sosPressed ? 'bg-white border-white' : 'border-white'
              }`}
              disabled={sosPressed}
            >
              <Ionicons 
                name="warning" 
                size={20} 
                color={sosPressed ? '#ef4444' : 'white'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Response Timer */}
          {currentStep === 'responding' && task.responseTimeLimit && (
            <View className="p-4">
              <ResponseTimer
                targetTime={new Date(Date.now() + task.responseTimeLimit * 60 * 1000)}
                variant="circular"
                size="large"
                onTimeUp={() => {
                  Alert.alert('Response Time Exceeded', 'Try to respond faster for better ratings.');
                }}
              />
            </View>
          )}

          {/* Task Info */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <PriorityBadge priority={task.priority} />
                <ThemedText className="font-bold text-red-500 text-xl">
                  URGENT
                </ThemedText>
              </View>
              
              <ThemedText className="font-bold text-xl mb-2">{task.title}</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400 mb-3">
                {task.description}
              </ThemedText>
              
              <View className="flex-row justify-between items-center">
                <ThemedText className="text-lg">
                  Estimated: {task.estimatedDistance.toFixed(1)} km, {task.estimatedDuration} min
                </ThemedText>
                <ThemedText className="font-bold text-primary text-xl">
                  ₹{task.fare + (task.emergencyBonus || 0)}
                </ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Contact Info */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <ThemedText className="font-bold mb-3">Emergency Contact</ThemedText>
              
              {task.customerName && (
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-red-500/10 p-2 rounded-full mr-3">
                      <Ionicons name="person" size={20} color="#ef4444" />
                    </View>
                    <View>
                      <ThemedText className="font-semibold">{task.customerName}</ThemedText>
                      <ThemedText variant="caption" className="text-red-600">
                        Customer in Distress
                      </ThemedText>
                    </View>
                  </View>
                  {task.customerPhone && (
                    <TouchableOpacity
                      onPress={() => makePhoneCall(task.customerPhone!)}
                      className="bg-red-500 p-3 rounded-full"
                    >
                      <Ionicons name="call" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {task.driverName && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-orange-500/10 p-2 rounded-full mr-3">
                      <Ionicons name="car" size={20} color="#f97316" />
                    </View>
                    <View>
                      <ThemedText className="font-semibold">{task.driverName}</ThemedText>
                      <ThemedText variant="caption" className="text-orange-600">
                        Stranded Driver
                      </ThemedText>
                    </View>
                  </View>
                  {task.driverPhone && (
                    <TouchableOpacity
                      onPress={() => makePhoneCall(task.driverPhone!)}
                      className="bg-orange-500 p-3 rounded-full"
                    >
                      <Ionicons name="call" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ThemedCard>
          </View>

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

          {/* Emergency Steps */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <ThemedText className="font-bold mb-4">Emergency Response Steps</ThemedText>
              
              {(['responding', 'arrived', 'assessing', 'rescuing', 'completed'] as EmergencyStep[]).map((step, index) => {
                const config = getStepConfig(step);
                const status = getStepStatus(step);
                
                return (
                  <View key={step} className="flex-row items-center mb-4 last:mb-0">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'active' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      <Ionicons 
                        name={status === 'completed' ? 'checkmark' : config.icon as any} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <ThemedText className={`font-semibold ${
                        status === 'active' ? 'text-red-600' : 
                        status === 'completed' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {config.title}
                      </ThemedText>
                      <ThemedText variant="caption" className="text-gray-500">
                        {config.description}
                      </ThemedText>
                    </View>
                    
                    <ThemedText variant="caption" className="text-gray-400">
                      {index + 1}
                    </ThemedText>
                  </View>
                );
              })}
            </ThemedCard>
          </View>

          {/* Special Instructions */}
          {task.specialInstructions && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#f59e0b" />
                  <View className="ml-3 flex-1">
                    <ThemedText className="font-semibold text-yellow-700 dark:text-yellow-300">
                      Special Instructions
                    </ThemedText>
                    <ThemedText className="text-yellow-700 dark:text-yellow-300 mt-1">
                      {task.specialInstructions}
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Safety Tips */}
          <View className="px-4 mb-6">
            <ThemedCard className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <ThemedText className="font-bold text-blue-700 dark:text-blue-300 mb-2">
                Safety First!
              </ThemedText>
              <View className="space-y-1">
                <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                  • Assess the situation before taking action
                </ThemedText>
                <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                  • Contact emergency services if needed (100)
                </ThemedText>
                <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                  • Keep yourself and others safe at all times
                </ThemedText>
                <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                  • Use SOS button if you need immediate help
                </ThemedText>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>

        {/* Action Button */}
        {currentStep !== 'completed' && (
          <View className="p-4 border-t border-border dark:border-darkBorder">
            <PrimaryButton
              title={stepConfig.action}
              onPress={() => handleStepComplete(stepConfig.nextStep)}
              loading={isLoading}
              className="bg-red-500"
            />
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}