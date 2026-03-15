import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { BrandColors, useThemeColors } from '../../constants/Colors';

interface GuideItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'getting-started' | 'driving' | 'earnings' | 'troubleshooting';
  icon: string;
  steps: string[];
}

export default function UserGuidesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuide, setExpandedGuide] = useState<string>('');

  const guides: GuideItem[] = [
    // Getting Started
    {
      id: '1',
      title: 'Setting Up Your Driver Profile',
      description: 'Complete your driver profile and upload required documents',
      duration: '5 min',
      difficulty: 'Beginner',
      category: 'getting-started',
      icon: 'person-add',
      steps: [
        'Complete your personal information in Profile section',
        'Upload your driving license photo (both sides)',
        'Add vehicle registration certificate (RC)',
        'Submit vehicle insurance documents',
        'Upload your PAN card for tax purposes',
        'Add a clear profile photo',
        'Wait for document verification (24-48 hours)'
      ]
    },
    {
      id: '2',
      title: 'Understanding Driver Verification',
      description: 'Learn about the verification process and requirements',
      duration: '3 min',
      difficulty: 'Beginner',
      category: 'getting-started',
      icon: 'checkmark-circle',
      steps: [
        'Ensure all documents are clear and readable',
        'Check that document details match your profile information',
        'Wait for automated verification to complete',
        'Respond promptly to any verification queries',
        'Complete background check if required',
        'Receive approval notification via app and SMS',
        'Begin accepting ride requests once approved'
      ]
    },

    // Driving Guides
    {
      id: '3',
      title: 'Going Online and Accepting Rides',
      description: 'Learn how to start receiving and accepting ride requests',
      duration: '4 min',
      difficulty: 'Beginner',
      category: 'driving',
      icon: 'car',
      steps: [
        'Tap "Go Online" button on your home screen',
        'Ensure GPS location and internet are enabled',
        'Wait for ride requests in high-demand areas',
        'Review ride details when request appears',
        'Check pickup location, destination, and fare estimate',
        'Accept ride within 30 seconds if interested',
        'Navigate to pickup location using in-app directions'
      ]
    },
    {
      id: '4',
      title: 'Completing Your First Ride',
      description: 'Step-by-step guide to successfully complete rides',
      duration: '6 min',
      difficulty: 'Intermediate',
      category: 'driving',
      icon: 'location',
      steps: [
        'Navigate to pickup location using GPS',
        'Call customer when you arrive at pickup spot',
        'Verify customer identity before starting ride',
        'Start the trip in the app once customer boards',
        'Follow navigation to destination safely',
        'Maintain professional conversation during ride',
        'Mark trip as complete when customer alights',
        'Wait for customer rating and provide your rating'
      ]
    },
    {
      id: '5',
      title: 'Handling Customer Communications',
      description: 'Best practices for communicating with customers',
      duration: '3 min',
      difficulty: 'Intermediate',
      category: 'driving',
      icon: 'chatbox',
      steps: [
        'Use in-app messaging for text communication',
        'Call customers only when necessary (arrival, delays)',
        'Be polite and professional in all interactions',
        'Confirm pickup location if customer seems lost',
        'Update customers about any delays or issues',
        'Ask about preferred route or any stops needed',
        'Thank customer at the end of the ride'
      ]
    },

    // Earnings
    {
      id: '6',
      title: 'Understanding Your Earnings',
      description: 'Learn how fares are calculated and track your income',
      duration: '4 min',
      difficulty: 'Beginner',
      category: 'earnings',
      icon: 'cash',
      steps: [
        'Go to Earnings tab to view your income details',
        'Understand base fare, distance, and time components',
        'Learn about surge pricing during peak hours',
        'Check for completion bonuses and incentives',
        'Review daily, weekly, and monthly earnings',
        'Understand commission structure and deductions',
        'Download earning statements for tax purposes'
      ]
    },
    {
      id: '7',
      title: 'Setting Up Banking Details',
      description: 'Configure your bank account for automatic payments',
      duration: '5 min',
      difficulty: 'Beginner',
      category: 'earnings',
      icon: 'card',
      steps: [
        'Go to Profile > Banking Details',
        'Enter your full name as per bank records',
        'Add your bank account number (verify carefully)',
        'Provide correct IFSC code for your bank branch',
        'Enter bank name and select account type',
        'Add PAN number for tax compliance',
        'Optionally add UPI ID for quick payments',
        'Save details and wait for verification'
      ]
    },
    {
      id: '8',
      title: 'Maximizing Your Earnings',
      description: 'Tips and strategies to increase your daily income',
      duration: '5 min',
      difficulty: 'Advanced',
      category: 'earnings',
      icon: 'trending-up',
      steps: [
        'Drive during peak hours (morning and evening rush)',
        'Position yourself in high-demand areas',
        'Accept rides during surge pricing periods',
        'Maintain high driver rating for more requests',
        'Complete consecutive rides for bonus eligibility',
        'Use fuel-efficient routes to reduce costs',
        'Track your best earning hours and days',
        'Participate in weekly/monthly incentive programs'
      ]
    },

    // Troubleshooting
    {
      id: '9',
      title: 'Handling Ride Cancellations',
      description: 'What to do when customers cancel or no-show',
      duration: '3 min',
      difficulty: 'Intermediate',
      category: 'troubleshooting',
      icon: 'close-circle',
      steps: [
        'If customer cancels early, you receive cancellation fee',
        'For no-shows, wait at pickup for 5 minutes',
        'Try calling customer if they don\'t appear',
        'Mark as "Customer No Show" in the app',
        'Take photo of pickup location as proof',
        'Submit no-show report through the app',
        'Receive compensation for time and fuel spent'
      ]
    },
    {
      id: '10',
      title: 'Resolving App Technical Issues',
      description: 'Fix common app problems and connectivity issues',
      duration: '4 min',
      difficulty: 'Intermediate',
      category: 'troubleshooting',
      icon: 'build',
      steps: [
        'Check your internet connection (WiFi/Mobile data)',
        'Ensure GPS location services are enabled',
        'Force close and restart the Chauffit app',
        'Update to the latest app version if available',
        'Clear app cache in phone settings',
        'Restart your phone if issues persist',
        'Contact technical support with error screenshots',
        'Use backup phone/app if available'
      ]
    },
    {
      id: '11',
      title: 'Dealing with Difficult Customers',
      description: 'Professional ways to handle challenging situations',
      duration: '4 min',
      difficulty: 'Advanced',
      category: 'troubleshooting',
      icon: 'people',
      steps: [
        'Stay calm and professional at all times',
        'Listen to customer concerns without arguing',
        'Apologize for any inconvenience caused',
        'Offer reasonable solutions within your control',
        'Contact support if situation escalates',
        'End ride safely if customer becomes abusive',
        'Report incident immediately through app',
        'Don\'t take negative feedback personally'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Guides', icon: 'library' },
    { id: 'getting-started', label: 'Getting Started', icon: 'play-circle' },
    { id: 'driving', label: 'Driving', icon: 'car' },
    { id: 'earnings', label: 'Earnings', icon: 'cash' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: 'build' }
  ];

  const filteredGuides = selectedCategory === 'all' 
    ? guides 
    : guides.filter(guide => guide.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return BrandColors.success;
      case 'Intermediate': return BrandColors.warning;
      case 'Advanced': return BrandColors.danger;
      default: return '#6B7280';
    }
  };

  const handleGuideSelect = (guide: GuideItem) => {
    if (expandedGuide === guide.id) {
      setExpandedGuide('');
    } else {
      setExpandedGuide(guide.id);
    }
  };

  const handleWatchVideo = (guideTitle: string) => {
    Alert.alert('Video Tutorial', `Video tutorial for "${guideTitle}" will be available soon!`);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Driver Guides & Tutorials</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Learn How to Drive with Chauffit
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                Comprehensive guides to help you succeed as a professional chauffeur.
              </ThemedText>
            </View>

            {/* Category Filters */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">Categories</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${
                        selectedCategory === category.id 
                          ? 'bg-burgundy border-burgundy' 
                          : 'bg-transparent border-gray-300 dark:border-gray-600'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={16} 
                        color={selectedCategory === category.id ? '#FFFFFF' : BrandColors.secondary} 
                        style={{ marginRight: 6 }}
                      />
                      <ThemedText 
                        variant="small" 
                        className={selectedCategory === category.id ? 'text-white' : 'text-textSecondary dark:text-darkTextSecondary'}
                      >
                        {category.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Guides List */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">
                Guides ({filteredGuides.length})
              </ThemedText>

              {filteredGuides.map((guide) => (
                <ThemedCard key={guide.id} variant="elevated" className="mb-4 p-6">
                  <TouchableOpacity
                    onPress={() => handleGuideSelect(guide)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start">
                      <View className="w-12 h-12 bg-secondary/10 rounded-full items-center justify-center mr-4">
                        <Ionicons name={guide.icon as any} size={24} color={BrandColors.secondary} />
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-2">
                          <ThemedText className="font-semibold flex-1 mr-2">
                            {guide.title}
                          </ThemedText>
                          <Ionicons 
                            name={expandedGuide === guide.id ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={iconColor} 
                          />
                        </View>
                        
                        <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mb-3">
                          {guide.description}
                        </ThemedText>
                        
                        <View className="flex-row items-center">
                          <View className="flex-row items-center mr-4">
                            <Ionicons name="time" size={14} color="#6B7280" />
                            <ThemedText variant="tiny" className="ml-1 text-textSecondary dark:text-darkTextSecondary">
                              {guide.duration}
                            </ThemedText>
                          </View>
                          
                          <View 
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${getDifficultyColor(guide.difficulty)}20` }}
                          >
                            <ThemedText 
                              variant="tiny" 
                              className="font-semibold"
                              style={{ color: getDifficultyColor(guide.difficulty) }}
                            >
                              {guide.difficulty}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                    </View>

                    {expandedGuide === guide.id && (
                      <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <ThemedText variant="small" className="font-semibold mb-3">
                          Step-by-Step Instructions:
                        </ThemedText>
                        
                        {guide.steps.map((step, index) => (
                          <View key={index} className="flex-row mb-2">
                            <View 
                              className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                              style={{ backgroundColor: BrandColors.secondary }}
                            >
                              <ThemedText variant="tiny" className="text-white font-bold">
                                {index + 1}
                              </ThemedText>
                            </View>
                            <ThemedText variant="small" className="flex-1 text-gray-700 dark:text-gray-300">
                              {step}
                            </ThemedText>
                          </View>
                        ))}

                        <View className="flex-row mt-4 space-x-3">
                          <TouchableOpacity 
                            className="flex-1 bg-burgundy py-2 rounded-lg mr-2"
                            onPress={() => handleWatchVideo(guide.title)}
                            activeOpacity={0.8}
                          >
                            <View className="flex-row items-center justify-center">
                              <Ionicons name="play" size={16} color="#FFFFFF" />
                              <ThemedText className="text-white ml-2 font-semibold">
                                Watch Video
                              </ThemedText>
                            </View>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            className="flex-1 border border-burgundy py-2 rounded-lg ml-2"
                            onPress={() => setExpandedGuide('')}
                            activeOpacity={0.8}
                          >
                            <ThemedText className="text-burgundy text-center font-semibold">
                              Got It!
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </ThemedCard>
              ))}
            </View>

            {/* Quick Access */}
            <ThemedCard variant="elevated" className="p-6">
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                  <Ionicons name="school" size={32} color={BrandColors.info} />
                </View>
                <ThemedText variant="h3" className="mb-2 text-center">
                  Need More Help?
                </ThemedText>
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center mb-4">
                  Browse our FAQ section or contact driver support for personalized assistance.
                </ThemedText>

                <View className="flex-row space-x-3 w-full">
                  <TouchableOpacity 
                    className="flex-1 bg-secondary/10 py-3 rounded-xl mr-2"
                    onPress={() => router.push('/(driver)/faq')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-burgundy text-center font-semibold">
                      View FAQ
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-1 bg-burgundy py-3 rounded-xl ml-2"
                    onPress={() => router.push('/(driver)/submit-request')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-white text-center font-semibold">
                      Contact Support
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}