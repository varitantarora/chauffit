import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

interface VerificationStep {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  completedDate?: string;
  estimatedDays?: string;
}

export default function BackgroundCheckScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const verificationSteps: VerificationStep[] = [
    {
      id: 'documents',
      title: 'Documents Submitted',
      status: 'completed',
      completedDate: 'Mar 15, 2024'
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      status: 'in-progress',
      estimatedDays: '2-3 days'
    },
    {
      id: 'driving-record',
      title: 'Driving Record Check',
      status: 'pending',
      estimatedDays: '3-5 days'
    },
    {
      id: 'background',
      title: 'Background Verification',
      status: 'pending',
      estimatedDays: '5-7 days'
    },
    {
      id: 'final-review',
      title: 'Final Review',
      status: 'pending',
      estimatedDays: '1-2 days'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      default: return 'time';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            </TouchableOpacity>
            <ThemedText variant="title" className="font-bold">
              Background Check Status
            </ThemedText>
            <View className="w-6" />
          </View>

          <View className="px-6 pt-6">
            <ThemedText variant="secondary" className="text-center mb-6">
              Your application is being processed
            </ThemedText>

            {/* Verification Status Header */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="shield-checkmark" size={20} color="#BD8C5E" />
              <ThemedText className="font-bold ml-2">VERIFICATION STATUS</ThemedText>
            </View>

            {/* Verification Steps */}
            <View className="space-y-4 mb-6">
              {verificationSteps.map((step, index) => (
                <ThemedCard key={step.id} className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons 
                        name={getStatusIcon(step.status) as any} 
                        size={20} 
                        color={getStatusColor(step.status)} 
                      />
                      <View className="ml-3 flex-1">
                        <ThemedText className="font-semibold">
                          {step.status === 'completed' ? '✅' : step.status === 'in-progress' ? '⏳' : '⏳'} {step.title}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          {step.status === 'completed' 
                            ? `Completed on ${step.completedDate}`
                            : step.status === 'in-progress'
                            ? `In progress (${step.estimatedDays})`
                            : `Pending (${step.estimatedDays})`
                          }
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </ThemedCard>
              ))}
            </View>

            {/* Next Steps */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="phone-portrait" size={20} color="#BD8C5E" />
              <ThemedText className="font-bold ml-2">NEXT STEPS</ThemedText>
            </View>

            <ThemedCard className="p-4 mb-6">
              <View className="space-y-2">
                <ThemedText>• Complete online training module</ThemedText>
                <ThemedText>• Schedule in-person orientation</ThemedText>
                <ThemedText>• Download driver app</ThemedText>
              </View>
            </ThemedCard>

            {/* Timeline */}
            <ThemedCard className="p-4 mb-6">
              <View className="items-center">
                <ThemedText className="font-bold text-burgundy text-lg mb-2">
                  Estimated completion: 7-10 days
                </ThemedText>
                <ThemedText variant="secondary" className="text-center">
                  We'll notify you via SMS & email
                </ThemedText>
              </View>
            </ThemedCard>

            {/* Support Options */}
            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity className="flex-1 bg-burgundy/10 py-3 px-4 rounded-lg border border-burgundy/20">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="call" size={16} color="#720C17" />
                  <ThemedText className="text-burgundy font-semibold ml-2">
                    Contact Support
                  </ThemedText>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-secondary/10 py-3 px-4 rounded-lg border border-secondary/20">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="help-circle" size={16} color="#BD8C5E" />
                  <ThemedText className="text-secondary font-semibold ml-2">
                    FAQ
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}