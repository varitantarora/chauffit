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
import { ResponseTimer } from '../../../components/biker/emergency/ResponseTimer';
import { useTaskStore } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import { useBikerEarningsStore } from '../../../store/bikerEarningsStore';
import { BikerTask, TaskType } from '../../../types/navigation';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const acceptTask = useTaskStore((state) => state.acceptTask);
  const startTask = useTaskStore((state) => state.startTask);
  const completeTask = useTaskStore((state) => state.completeTask);
  const cancelTask = useTaskStore((state) => state.cancelTask);
  const updateEarnings = useBikerEarningsStore((state) => state.updateEarnings);
  
  const [task, setTask] = useState<BikerTask | null>(null);
  const [currentStep, setCurrentStep] = useState<'accept' | 'navigate' | 'pickup' | 'delivery' | 'complete'>('accept');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = getTaskById(id);
      setTask(foundTask);
      
      // Determine current step based on task status
      if (foundTask) {
        switch (foundTask.status) {
          case 'pending':
            setCurrentStep('accept');
            break;
          case 'accepted':
            setCurrentStep('navigate');
            break;
          case 'in_progress':
            setCurrentStep(foundTask.dropoffLocation ? 'pickup' : 'delivery');
            break;
          default:
            setCurrentStep('complete');
        }
      }
    }
  }, [id, getTaskById]);

  if (!task) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center p-6">
          <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
            <Ionicons name="document-text-outline" size={48} color="#6b7280" />
          </View>
          <ThemedText className="font-bold text-xl mb-2">Task Not Found</ThemedText>
          <ThemedText variant="caption" className="text-center mb-6">
            The task you're looking for doesn't exist or has been removed.
          </ThemedText>
          <PrimaryButton
            title="Go Back"
            onPress={() => router.back()}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

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

  const handleAcceptTask = async () => {
    setIsLoading(true);
    try {
      acceptTask(task.id);
      setCurrentStep('navigate');
      
      // Navigate to appropriate task flow screen
      switch (task.type) {
        case 'customer_emergency':
        case 'driver_rescue':
          router.push(`/(biker)/task/emergency?id=${task.id}`);
          break;
        case 'document_delivery':
        case 'regular_delivery':
          router.push(`/(biker)/task/delivery?id=${task.id}`);
          break;
        case 'car_retrieval':
          router.push(`/(biker)/task/driver-pickup?id=${task.id}`);
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = async () => {
    setIsLoading(true);
    try {
      startTask(task.id);
      setCurrentStep('pickup');
    } catch (error) {
      Alert.alert('Error', 'Failed to start task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    setIsLoading(true);
    try {
      completeTask(task.id);
      
      // Update earnings
      updateEarnings(task.fare, 'base_fare');
      if (task.emergencyBonus) {
        updateEarnings(task.emergencyBonus, 'emergency_bonus');
      }
      
      setCurrentStep('complete');
      
      Alert.alert(
        'Task Completed!',
        `You've earned ₹${task.fare + (task.emergencyBonus || 0)} for this task.`,
        [
          { text: 'OK', onPress: () => router.replace('/(biker)') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTask = () => {
    Alert.alert(
      'Cancel Task',
      'Are you sure you want to cancel this task? This may affect your ratings.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelTask(task.id, 'Biker cancelled');
            router.replace('/(biker)');
          },
        },
      ]
    );
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openMaps = () => {
    const destination = task.dropoffLocation || task.pickupLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=bicycling`;
    Linking.openURL(url);
  };

  const totalFare = task.fare + (task.emergencyBonus || 0);
  const isEmergency = task.priority === 'emergency' && task.responseTimeLimit;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#374151'} />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <ThemedText className="font-bold text-lg">Task Details</ThemedText>
            <ThemedText variant="caption" className="text-gray-500">
              ID: {task.id.slice(-6)}
            </ThemedText>
          </View>
          
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Emergency Timer */}
          {isEmergency && task.status === 'pending' && (
            <View className="p-4">
              <ResponseTimer
                targetTime={task.expiresAt}
                variant="linear"
                onTimeUp={() => {
                  Alert.alert('Time Up!', 'This emergency task has expired.');
                  router.back();
                }}
              />
            </View>
          )}

          {/* Task Header */}
          <View className="p-4">
            <ThemedCard className="p-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <PriorityBadge priority={task.priority} />
                  {task.emergencyBonus && (
                    <View className="bg-green-500/10 px-3 py-1 rounded-full ml-2">
                      <ThemedText className="text-green-600 text-xs font-semibold">
                        BONUS TASK
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText className="font-bold text-primary text-2xl">
                  ₹{totalFare}
                </ThemedText>
              </View>

              <View className="flex-row items-center mb-3">
                <View className="bg-primary/10 p-3 rounded-full mr-3">
                  <Ionicons name={getTaskIcon(task.type) as any} size={24} color="#bd8c5e" />
                </View>
                <View className="flex-1">
                  <ThemedText className="font-bold text-xl">{task.title}</ThemedText>
                  <ThemedText variant="caption" className="text-secondary mt-1">
                    {getTaskTypeLabel(task.type)}
                  </ThemedText>
                </View>
              </View>

              {task.description && (
                <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                  <ThemedText className="text-sm">{task.description}</ThemedText>
                </View>
              )}
            </ThemedCard>
          </View>

          {/* Contact Information */}
          {(task.customerName || task.driverName) && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">Contact Details</ThemedText>
                
                {task.customerName && (
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="person" size={20} color="#bd8c5e" />
                      <View className="ml-3">
                        <ThemedText className="font-semibold">Customer</ThemedText>
                        <ThemedText variant="caption">{task.customerName}</ThemedText>
                      </View>
                    </View>
                    {task.customerPhone && (
                      <TouchableOpacity
                        onPress={() => makePhoneCall(task.customerPhone!)}
                        className="bg-primary p-2 rounded-full"
                      >
                        <Ionicons name="call" size={16} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {task.driverName && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="car" size={20} color="#bd8c5e" />
                      <View className="ml-3">
                        <ThemedText className="font-semibold">Driver</ThemedText>
                        <ThemedText variant="caption">{task.driverName}</ThemedText>
                      </View>
                    </View>
                    {task.driverPhone && (
                      <TouchableOpacity
                        onPress={() => makePhoneCall(task.driverPhone!)}
                        className="bg-primary p-2 rounded-full"
                      >
                        <Ionicons name="call" size={16} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
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
                style={{ height: 200 }}
                compact={true}
              />
              
              <View className="p-4">
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Ionicons name="location" size={16} color="#bd8c5e" />
                    <View className="ml-2 flex-1">
                      <ThemedText variant="caption">PICKUP LOCATION</ThemedText>
                      <ThemedText className="text-sm">{task.pickupLocation.address}</ThemedText>
                    </View>
                  </View>
                  
                  {task.dropoffLocation && (
                    <View className="flex-row items-start">
                      <Ionicons name="flag" size={16} color="#bd8c5e" />
                      <View className="ml-2 flex-1">
                        <ThemedText variant="caption">DROP-OFF LOCATION</ThemedText>
                        <ThemedText className="text-sm">{task.dropoffLocation.address}</ThemedText>
                      </View>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity
                  onPress={openMaps}
                  className="bg-primary/10 py-3 rounded-lg mt-3"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="navigate" size={16} color="#bd8c5e" />
                    <ThemedText className="ml-2 text-primary font-semibold">
                      Open in Maps
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </ThemedCard>
          </View>

          {/* Task Items (for deliveries) */}
          {task.items && task.items.length > 0 && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">Items to Deliver</ThemedText>
                {task.items.map((item) => (
                  <View key={item.id} className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <View className="flex-1">
                      <ThemedText className="font-semibold">
                        {item.quantity && `${item.quantity}x `}{item.name}
                      </ThemedText>
                      {item.description && (
                        <ThemedText variant="caption" className="text-gray-500">
                          {item.description}
                        </ThemedText>
                      )}
                    </View>
                    <View className="flex-row space-x-1">
                      {item.fragile && (
                        <View className="bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                          <ThemedText className="text-orange-600 text-xs">Fragile</ThemedText>
                        </View>
                      )}
                      {item.confidential && (
                        <View className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                          <ThemedText className="text-red-600 text-xs">Confidential</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ThemedCard>
            </View>
          )}

          {/* Task Details */}
          <View className="px-4 mb-4">
            <ThemedCard className="p-4">
              <ThemedText className="font-bold mb-3">Task Information</ThemedText>
              <View className="space-y-2">
                <DetailRow label="Distance" value={`${task.estimatedDistance.toFixed(1)} km`} />
                <DetailRow label="Duration" value={`${task.estimatedDuration} min`} />
                <DetailRow label="Base Fare" value={`₹${task.fare}`} />
                {task.emergencyBonus && (
                  <DetailRow 
                    label="Emergency Bonus" 
                    value={`₹${task.emergencyBonus}`}
                    valueColor="text-green-600" 
                  />
                )}
                <DetailRow 
                  label="Total Earning" 
                  value={`₹${totalFare}`}
                  valueColor="text-primary font-bold" 
                />
              </View>
            </ThemedCard>
          </View>

          {/* Special Instructions */}
          {task.specialInstructions && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">Special Instructions</ThemedText>
                <View className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={16} color="#f59e0b" />
                    <ThemedText className="ml-2 flex-1 text-yellow-700 dark:text-yellow-300">
                      {task.specialInstructions}
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-4 border-t border-border dark:border-darkBorder">
          {task.status === 'pending' && (
            <View className="space-y-3">
              <PrimaryButton
                title={`Accept Task (₹${totalFare})`}
                onPress={handleAcceptTask}
                loading={isLoading}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-gray-100 dark:bg-gray-800 py-3 rounded-lg"
              >
                <ThemedText className="text-center font-semibold">Decline</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {task.status === 'accepted' && (
            <View className="space-y-3">
              <PrimaryButton
                title="Start Task"
                onPress={handleStartTask}
                loading={isLoading}
              />
              <TouchableOpacity
                onPress={handleCancelTask}
                className="bg-red-100 dark:bg-red-900/20 py-3 rounded-lg"
              >
                <ThemedText className="text-center font-semibold text-red-600">Cancel Task</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {task.status === 'in_progress' && (
            <View className="space-y-3">
              <PrimaryButton
                title="Mark as Completed"
                onPress={handleCompleteTask}
                loading={isLoading}
              />
              <TouchableOpacity
                onPress={handleCancelTask}
                className="bg-red-100 dark:bg-red-900/20 py-3 rounded-lg"
              >
                <ThemedText className="text-center font-semibold text-red-600">Cancel Task</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {task.status === 'completed' && (
            <PrimaryButton
              title="Back to Home"
              onPress={() => router.replace('/(biker)')}
            />
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

function DetailRow({ 
  label, 
  value, 
  valueColor = "text-foreground" 
}: { 
  label: string; 
  value: string; 
  valueColor?: string; 
}) {
  return (
    <View className="flex-row justify-between items-center">
      <ThemedText variant="caption" className="text-gray-500">{label}</ThemedText>
      <ThemedText className={`font-semibold ${valueColor}`}>{value}</ThemedText>
    </View>
  );
}