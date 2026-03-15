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
import { BikerTask, TaskItem } from '../../../types/navigation';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { BrandColors } from '../../../constants/Colors';

type DeliveryStep = 'pickup' | 'in_transit' | 'delivery' | 'completed';

const STEP_STYLES: Record<
  DeliveryStep,
  {
    cardClass: string;
    iconBgClass: string;
    titleClass: string;
    descriptionClass: string;
    actionButtonClass: string;
    progressDotClass: string;
    progressTextClass: string;
  }
> = {
  pickup: {
    cardClass: 'bg-secondary/10 border border-secondary/20',
    iconBgClass: 'bg-secondary',
    titleClass: 'text-secondary',
    descriptionClass: 'text-secondary/80',
    actionButtonClass: 'bg-burgundy',
    progressDotClass: 'bg-secondary',
    progressTextClass: 'text-secondary',
  },
  in_transit: {
    cardClass: 'bg-burgundy/10 border border-burgundy/20',
    iconBgClass: 'bg-burgundy',
    titleClass: 'text-burgundy',
    descriptionClass: 'text-burgundy/80',
    actionButtonClass: 'bg-burgundy',
    progressDotClass: 'bg-burgundy',
    progressTextClass: 'text-burgundy',
  },
  delivery: {
    cardClass: 'bg-success/10 border border-success/20',
    iconBgClass: 'bg-success',
    titleClass: 'text-success',
    descriptionClass: 'text-success/80',
    actionButtonClass: 'bg-success',
    progressDotClass: 'bg-success',
    progressTextClass: 'text-success',
  },
  completed: {
    cardClass: 'bg-success/10 border border-success/20',
    iconBgClass: 'bg-success',
    titleClass: 'text-success',
    descriptionClass: 'text-success/80',
    actionButtonClass: 'bg-success',
    progressDotClass: 'bg-success',
    progressTextClass: 'text-success',
  },
};

export default function DeliveryTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateEarnings = useBikerEarningsStore((state) => state.updateEarnings);
  
  const [task, setTask] = useState<BikerTask | null>(null);
  const [currentStep, setCurrentStep] = useState<DeliveryStep>('pickup');
  const [isLoading, setIsLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<Date | null>(null);
  const [pickedUpItems, setPickedUpItems] = useState<Set<string>>(new Set());
  const [deliveredItems, setDeliveredItems] = useState<Set<string>>(new Set());
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (id) {
      const foundTask = getTaskById(id);
      setTask(foundTask);
      
      if (foundTask?.status === 'in_progress') {
        setCurrentStep('pickup');
      }
    }
  }, [id, getTaskById]);

  const handleStepComplete = async (step: DeliveryStep) => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      switch (step) {
        case 'pickup':
          if (task?.items && pickedUpItems.size !== task.items.length) {
            Alert.alert('Incomplete Pickup', 'Please confirm all items have been picked up.');
            setIsLoading(false);
            return;
          }
          setPickupTime(new Date());
          setCurrentStep('in_transit');
          break;
          
        case 'in_transit':
          setCurrentStep('delivery');
          break;
          
        case 'delivery':
          if (task?.items && deliveredItems.size !== task.items.length) {
            Alert.alert('Incomplete Delivery', 'Please confirm all items have been delivered.');
            setIsLoading(false);
            return;
          }
          setDeliveryTime(new Date());
          setCurrentStep('completed');
          break;
          
        case 'completed':
          completeTask(task!.id);
          updateEarnings(task!.fare, 'base_fare');
          
          // Calculate distance bonus
          if (task!.estimatedDistance > 5) {
            const distanceBonus = Math.floor(task!.estimatedDistance) * 10;
            updateEarnings(distanceBonus, 'distance_bonus');
          }
          
          const totalEarnings = task!.fare + (task!.estimatedDistance > 5 ? Math.floor(task!.estimatedDistance) * 10 : 0);
          
          Alert.alert(
            'Delivery Completed!',
            `Great job! You've successfully completed this delivery.\n\nTotal Earnings: ₹${totalEarnings}`,
            [
              { text: 'OK', onPress: () => router.replace('/(biker)') }
            ]
          );
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update delivery status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemPickup = (itemId: string) => {
    const newPickedUp = new Set(pickedUpItems);
    if (newPickedUp.has(itemId)) {
      newPickedUp.delete(itemId);
    } else {
      newPickedUp.add(itemId);
    }
    setPickedUpItems(newPickedUp);
  };

  const toggleItemDelivery = (itemId: string) => {
    const newDelivered = new Set(deliveredItems);
    if (newDelivered.has(itemId)) {
      newDelivered.delete(itemId);
    } else {
      newDelivered.add(itemId);
    }
    setDeliveredItems(newDelivered);
  };

  const takePhoto = async (type: 'pickup' | 'delivery') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'pickup') {
          setPickupPhoto(result.assets[0].uri);
        } else {
          setDeliveryPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openMaps = () => {
    const destination = currentStep === 'pickup' || currentStep === 'in_transit' 
      ? task?.pickupLocation 
      : task?.dropoffLocation || task?.pickupLocation;
    
    if (destination) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=bicycling`;
      Linking.openURL(url);
    }
  };

  const getStepConfig = (step: DeliveryStep) => {
    switch (step) {
      case 'pickup':
        return {
          title: 'Pickup Items',
          description: 'Navigate to pickup location and collect items',
          icon: 'cube',
          action: 'Confirm Pickup',
          nextStep: 'in_transit' as DeliveryStep,
        };
      case 'in_transit':
        return {
          title: 'In Transit',
          description: 'Navigate to delivery destination',
          icon: 'bicycle',
          action: 'Arrived at Destination',
          nextStep: 'delivery' as DeliveryStep,
        };
      case 'delivery':
        return {
          title: 'Deliver Items',
          description: 'Hand over items to recipient',
          icon: 'hand-left',
          action: 'Confirm Delivery',
          nextStep: 'completed' as DeliveryStep,
        };
      case 'completed':
        return {
          title: 'Completed',
          description: 'Delivery task finished',
          icon: 'checkmark-circle',
          action: 'Finish',
          nextStep: 'completed' as DeliveryStep,
        };
    }
  };

  if (!task) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Loading delivery task...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const stepConfig = getStepConfig(currentStep);
  const currentLocation = currentStep === 'pickup' || currentStep === 'in_transit'
    ? task.pickupLocation
    : task.dropoffLocation || task.pickupLocation;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <ThemedText className="font-bold text-lg">Delivery Task</ThemedText>
            <PriorityBadge priority={task.priority} size="small" />
          </View>
          
          <TouchableOpacity onPress={openMaps} className="p-2">
            <Ionicons name="navigate" size={24} color="#bd8c5e" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Current Step Header */}
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

          {/* Task Info */}
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
                  <ThemedText variant="caption">Total Earning</ThemedText>
                  <ThemedText className="font-bold text-primary text-xl">
                    ₹{task.fare}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

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
              
              <View className="p-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <ThemedText className="font-semibold">
                      {currentStep === 'pickup' || currentStep === 'in_transit' ? 'Pickup Location' : 'Delivery Location'}
                    </ThemedText>
                    <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                      {currentLocation.address}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={openMaps}
                    className="bg-primary p-2 rounded-full"
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Contact Information */}
          {task.customerName && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">Contact Information</ThemedText>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-secondary/10 p-2 rounded-full mr-3">
                      <Ionicons name="person" size={20} color={BrandColors.secondary} />
                    </View>
                    <View>
                      <ThemedText className="font-semibold">{task.customerName}</ThemedText>
                      <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                        {currentStep === 'pickup' ? 'Pickup Contact' : 'Delivery Contact'}
                      </ThemedText>
                    </View>
                  </View>
                  {task.customerPhone && (
                    <TouchableOpacity
                      onPress={() => makePhoneCall(task.customerPhone!)}
                      className="bg-secondary p-3 rounded-full"
                    >
                      <Ionicons name="call" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Items List */}
          {task.items && task.items.length > 0 && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-4">
                  {currentStep === 'pickup' ? 'Items to Pickup' : 
                   currentStep === 'delivery' ? 'Items to Deliver' : 'Items'}
                </ThemedText>
                
                {task.items.map((item) => (
                  <DeliveryItem
                    key={item.id}
                    item={item}
                    isPickedUp={pickedUpItems.has(item.id)}
                    isDelivered={deliveredItems.has(item.id)}
                    onTogglePickup={() => toggleItemPickup(item.id)}
                    onToggleDelivery={() => toggleItemDelivery(item.id)}
                    currentStep={currentStep}
                  />
                ))}
              </ThemedCard>
            </View>
          )}

          {/* Photo Section */}
          {(currentStep === 'pickup' || currentStep === 'delivery') && (
            <View className="px-4 mb-4">
              <ThemedCard className="p-4">
                <ThemedText className="font-bold mb-3">
                  {currentStep === 'pickup' ? 'Pickup Proof' : 'Delivery Proof'}
                </ThemedText>
                
                <TouchableOpacity
                  onPress={() => takePhoto(currentStep)}
                  className="border-2 border-dashed border-border dark:border-darkBorder rounded-lg p-6 items-center"
                >
                  {(currentStep === 'pickup' ? pickupPhoto : deliveryPhoto) ? (
                    <View className="items-center">
                      <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                      <ThemedText className="text-success font-semibold mt-2">
                        Photo Taken
                      </ThemedText>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera" size={32} color="#6B7280" />
                      <ThemedText className="text-textSecondary dark:text-darkTextSecondary font-semibold mt-2">
                        Take Photo
                      </ThemedText>
                      <ThemedText variant="caption" className="text-center mt-1">
                        Capture proof of {currentStep}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              </ThemedCard>
            </View>
          )}

          {/* Delivery Steps Progress */}
          <View className="px-4 mb-6">
            <ThemedCard className="p-4">
              <ThemedText className="font-bold mb-4">Delivery Progress</ThemedText>
              
              {(['pickup', 'in_transit', 'delivery', 'completed'] as DeliveryStep[]).map((step, index) => {
                const config = getStepConfig(step);
                const isCompleted = ['pickup', 'in_transit', 'delivery'].indexOf(currentStep) > index ||
                                   currentStep === 'completed';
                const isActive = step === currentStep;
                
                return (
                  <View key={step} className="flex-row items-center mb-3 last:mb-0">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isCompleted ? STEP_STYLES[step].progressDotClass :
                      isActive ? STEP_STYLES[step].progressDotClass : 'bg-border'
                    }`}>
                      <Ionicons 
                        name={isCompleted ? 'checkmark' : config.icon as any} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <ThemedText className={`font-semibold ${
                        isActive ? STEP_STYLES[step].progressTextClass :
                        isCompleted ? 'text-success' : 'text-textSecondary dark:text-darkTextSecondary'
                      }`}>
                        {config.title}
                      </ThemedText>
                      {isActive && (
                        <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary">
                          Current step
                        </ThemedText>
                      )}
                    </View>
                    
                    {isCompleted && step !== 'completed' && (
                      <ThemedText variant="caption" className="text-success">
                        ✓ Done
                      </ThemedText>
                    )}
                  </View>
                );
              })}
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
              className={STEP_STYLES[currentStep].actionButtonClass}
            />
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

interface DeliveryItemProps {
  item: TaskItem;
  isPickedUp: boolean;
  isDelivered: boolean;
  onTogglePickup: () => void;
  onToggleDelivery: () => void;
  currentStep: DeliveryStep;
}

function DeliveryItem({ 
  item, 
  isPickedUp, 
  isDelivered, 
  onTogglePickup, 
  onToggleDelivery, 
  currentStep 
}: DeliveryItemProps) {
  const showPickupToggle = currentStep === 'pickup';
  const showDeliveryToggle = currentStep === 'delivery';
  const isCompleted = currentStep === 'completed' || (currentStep === 'delivery' && isPickedUp);

  return (
    <View className="flex-row items-center justify-between p-3 bg-surface dark:bg-darkSurface rounded-lg mb-2">
      <View className="flex-1">
        <View className="flex-row items-center">
          <ThemedText className="font-semibold flex-1">
            {item.quantity && `${item.quantity}x `}{item.name}
          </ThemedText>
          
          <View className="flex-row space-x-1">
            {item.fragile && (
              <View className="bg-warning/10 px-2 py-1 rounded-full">
                <ThemedText className="text-warning text-xs">Fragile</ThemedText>
              </View>
            )}
            {item.confidential && (
              <View className="bg-danger/10 px-2 py-1 rounded-full">
                <ThemedText className="text-danger text-xs">Confidential</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {item.description && (
          <ThemedText variant="caption" className="text-textSecondary dark:text-darkTextSecondary mt-1">
            {item.description}
          </ThemedText>
        )}
      </View>
      
      {showPickupToggle && (
        <TouchableOpacity
          onPress={onTogglePickup}
          className={`ml-3 p-2 rounded-full ${
            isPickedUp ? 'bg-success' : 'bg-border'
          }`}
        >
          <Ionicons name="checkmark" size={16} color="white" />
        </TouchableOpacity>
      )}
      
      {showDeliveryToggle && (
        <TouchableOpacity
          onPress={onToggleDelivery}
          className={`ml-3 p-2 rounded-full ${
            isDelivered ? 'bg-success' : 'bg-border'
          }`}
        >
          <Ionicons name="checkmark" size={16} color="white" />
        </TouchableOpacity>
      )}
      
      {isCompleted && (
        <View className="ml-3 p-2">
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        </View>
      )}
    </View>
  );
}
