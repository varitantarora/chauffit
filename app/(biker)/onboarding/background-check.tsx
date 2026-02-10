import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

interface BackgroundCheckStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration: string;
}

export default function BackgroundCheckScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [checkSteps, setCheckSteps] = useState<BackgroundCheckStep[]>([
    {
      id: '1',
      title: 'Identity Verification',
      description: 'Verifying government ID and personal details',
      status: 'completed',
      duration: '2-4 hours'
    },
    {
      id: '2',
      title: 'Criminal Background Check',
      description: 'Checking criminal history and records',
      status: 'in_progress',
      duration: '24-48 hours'
    },
    {
      id: '3',
      title: 'Driving Record Check',
      description: 'Reviewing driving history and violations',
      status: 'pending',
      duration: '12-24 hours'
    },
    {
      id: '4',
      title: 'Vehicle Insurance Verification',
      description: 'Confirming valid insurance coverage',
      status: 'pending',
      duration: '4-8 hours'
    },
    {
      id: '5',
      title: 'Reference Verification',
      description: 'Contacting provided references',
      status: 'pending',
      duration: '24-48 hours'
    },
    {
      id: '6',
      title: 'Final Approval',
      description: 'Complete profile review and approval',
      status: 'pending',
      duration: '2-4 hours'
    }
  ]);
  
  const [overallProgress, setOverallProgress] = useState(20);
  
  useEffect(() => {
    // Simulate background check progress
    const interval = setInterval(() => {
      setCheckSteps(prev => {
        const newSteps = [...prev];
        const inProgressIndex = newSteps.findIndex(step => step.status === 'in_progress');
        
        if (inProgressIndex !== -1 && Math.random() > 0.7) {
          newSteps[inProgressIndex].status = 'completed';
          
          // Start next step
          const nextIndex = inProgressIndex + 1;
          if (nextIndex < newSteps.length) {
            newSteps[nextIndex].status = 'in_progress';
          }
        }
        
        return newSteps;
      });
      
      setOverallProgress(prev => Math.min(100, prev + Math.random() * 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: BackgroundCheckStep['status']) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'hourglass';
      case 'failed': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getStatusColor = (status: BackgroundCheckStep['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const completedSteps = checkSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / checkSteps.length) * 100;
  const allCompleted = completedSteps === checkSteps.length;

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help with your background check?',
      [
        {
          text: 'Call Support',
          onPress: () => Alert.alert('Calling...', 'Calling Chauffit support at +1-800-SUPPORT')
        },
        {
          text: 'Email Support',
          onPress: () => Alert.alert('Email', 'Opening email to support@chauffit.com')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleComplete = () => {
    if (!allCompleted) {
      Alert.alert(
        'Background Check In Progress',
        'Your background check is still being processed. You\'ll be notified once it\'s complete.'
      );
      return;
    }

    Alert.alert(
      'Congratulations! 🎉',
      'Your background check is complete and you\'ve been approved as a Chauffit biker!',
      [
        {
          text: 'Start Earning',
          onPress: () => router.replace('/(biker)')
        }
      ]
    );
  };

  const estimatedCompletion = () => {
    const inProgressStep = checkSteps.find(step => step.status === 'in_progress');
    if (inProgressStep) {
      return `Estimated completion: ${inProgressStep.duration}`;
    }
    
    const pendingSteps = checkSteps.filter(step => step.status === 'pending').length;
    if (pendingSteps > 0) {
      return `${pendingSteps} steps remaining`;
    }
    
    return 'All checks completed!';
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center">
            <ThemedText variant="title" className="font-bold">
              Background Check
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              Step 3 of 3
            </ThemedText>
          </View>
          <TouchableOpacity onPress={handleContactSupport}>
            <Ionicons name="help-circle" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-6">
          {/* Progress Overview */}
          <View className="mb-8">
            <ThemedText variant="title" className="text-2xl font-bold mb-2">
              Verification in Progress
            </ThemedText>
            <ThemedText variant="secondary" className="mb-4">
              We're conducting your background verification for safety
            </ThemedText>
            
            <ThemedCard className="p-4 mb-4 bg-burgundy/5 border border-burgundy/20">
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText className="font-bold text-burgundy">
                  Background Check Progress
                </ThemedText>
                <ThemedText className="font-bold text-burgundy">
                  {completedSteps}/{checkSteps.length}
                </ThemedText>
              </View>
              
              <View className="mb-3">
                <View className="w-full h-3 bg-surface dark:bg-darkSurface rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-burgundy rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>
              </View>
              
              <ThemedText variant="caption" className="text-burgundy">
                {estimatedCompletion()}
              </ThemedText>
            </ThemedCard>
          </View>

          {/* Verification Steps */}
          <ThemedCard className="p-4 mb-6">
            <ThemedText className="font-bold text-lg mb-4">
              Verification Steps
            </ThemedText>
            
            <View className="space-y-4">
              {checkSteps.map((step, index) => (
                <View key={step.id} className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-4 mt-1">
                    <Ionicons 
                      name={getStatusIcon(step.status)} 
                      size={24} 
                      color={getStatusColor(step.status)} 
                    />
                  </View>
                  
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-lg">
                      {step.title}
                    </ThemedText>
                    <ThemedText variant="secondary" className="text-sm mb-1">
                      {step.description}
                    </ThemedText>
                    <ThemedText variant="caption" className="text-secondary">
                      Duration: {step.duration}
                    </ThemedText>
                    
                    {step.status === 'in_progress' && (
                      <View className="flex-row items-center mt-2">
                        <View className="w-2 h-2 bg-warning rounded-full mr-2" />
                        <ThemedText className="text-warning text-sm font-semibold">
                          Processing...
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  <View className="w-20 items-end">
                    <ThemedText 
                      className={`text-sm font-semibold capitalize ${
                        step.status === 'completed' ? 'text-success' :
                        step.status === 'in_progress' ? 'text-warning' :
                        step.status === 'failed' ? 'text-danger' : 'text-secondary'
                      }`}
                    >
                      {step.status === 'in_progress' ? 'Processing' : step.status}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ThemedCard>

          {/* Important Information */}
          <ThemedCard className="p-4 mb-6 bg-info/5 border border-info/20">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <View className="flex-1 ml-3">
                <ThemedText className="font-bold text-info mb-2">
                  What happens next?
                </ThemedText>
                <View className="space-y-1">
                  <ThemedText className="text-info text-sm">
                    • You'll receive notifications for each completed step
                  </ThemedText>
                  <ThemedText className="text-info text-sm">
                    • Background checks typically complete within 2-3 business days
                  </ThemedText>
                  <ThemedText className="text-info text-sm">
                    • You can start earning immediately after approval
                  </ThemedText>
                  <ThemedText className="text-info text-sm">
                    • Support is available 24/7 if you have questions
                  </ThemedText>
                </View>
              </View>
            </View>
          </ThemedCard>

          {/* Status Messages */}
          {!allCompleted && (
            <ThemedCard className="p-4 mb-6 bg-warning/5 border border-warning/20">
              <View className="flex-row items-center">
                <Ionicons name="clock" size={20} color="#f59e0b" />
                <ThemedText className="text-warning font-semibold ml-2">
                  Background check in progress
                </ThemedText>
              </View>
              <ThemedText className="text-warning text-sm mt-1">
                We'll notify you as soon as your verification is complete. This typically takes 1-3 business days.
              </ThemedText>
            </ThemedCard>
          )}

          {allCompleted && (
            <ThemedCard className="p-4 mb-6 bg-success/5 border border-success/20">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <ThemedText className="text-success font-semibold ml-2">
                  Background check completed!
                </ThemedText>
              </View>
              <ThemedText className="text-success text-sm mt-1">
                Congratulations! You've been approved and can start earning with Chauffit.
              </ThemedText>
            </ThemedCard>
          )}
        </View>

        {/* Bottom Actions */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          <PrimaryButton
            title={allCompleted ? "START EARNING" : "CONTINUE TO DASHBOARD"}
            onPress={handleComplete}
            className="mb-4"
          />
          
          <TouchableOpacity
            onPress={handleContactSupport}
            className="py-3 items-center"
            activeOpacity={0.7}
          >
            <ThemedText className="text-secondary">
              Need help? Contact Support
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}