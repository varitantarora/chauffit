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
  category: 'getting-started' | 'booking' | 'features' | 'troubleshooting';
  icon: string;
  steps: string[];
}

export default function UserGuidesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const colors = useThemeColors(isDarkMode);

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuide, setExpandedGuide] = useState<string>('');

  const guides: GuideItem[] = [
    // Getting Started
    {
      id: '1',
      title: 'Creating Your Chauffit Account',
      description: 'Learn how to sign up and set up your profile',
      duration: '3 min',
      difficulty: 'Beginner',
      category: 'getting-started',
      icon: 'person-add',
      steps: [
        'Download the Chauffit app from App Store or Google Play',
        'Tap "Sign Up" on the welcome screen',
        'Enter your phone number and verify with OTP',
        'Complete your profile with name and email',
        'Add your first vehicle details (optional)',
        'Set up your preferred payment method'
      ]
    },
    {
      id: '2',
      title: 'Adding Your First Vehicle',
      description: 'Register your car details for chauffeur services',
      duration: '2 min',
      difficulty: 'Beginner',
      category: 'getting-started',
      icon: 'car',
      steps: [
        'Go to Profile > Your Vehicles',
        'Tap "Add Car" button',
        'Enter vehicle make, model, and year',
        'Add registration number and color',
        'Upload required documents (RC, Insurance)',
        'Set as default vehicle if desired'
      ]
    },

    // Booking Guides
    {
      id: '3',
      title: 'Booking Your First Ride',
      description: 'Step-by-step guide to book a chauffeur',
      duration: '4 min',
      difficulty: 'Beginner',
      category: 'booking',
      icon: 'car-sport',
      steps: [
        'Tap "Book Now" from the home screen',
        'Enter your pickup location (or use current location)',
        'Select your destination',
        'Choose your vehicle from the list',
        'Select ride type (One-way, Round-trip, or Hourly)',
        'Pick "Now" or "Schedule" for later',
        'Review fare estimate and confirm booking'
      ]
    },
    {
      id: '4',
      title: 'Scheduling Rides in Advance',
      description: 'How to book rides for future dates and times',
      duration: '3 min',
      difficulty: 'Intermediate',
      category: 'booking',
      icon: 'time',
      steps: [
        'Start booking process normally',
        'In the "When" section, select "Schedule"',
        'Choose your preferred date (up to 30 days ahead)',
        'Select time slot (15-minute intervals)',
        'Add any special instructions',
        'Confirm and receive booking confirmation',
        'View scheduled rides in "My Rides" section'
      ]
    },
    {
      id: '5',
      title: 'Adding Multiple Stops',
      description: 'Learn to add stops and plan multi-destination trips',
      duration: '3 min',
      difficulty: 'Intermediate',
      category: 'booking',
      icon: 'location',
      steps: [
        'During booking, tap "Add Stop(s)"',
        'Enter first stop location',
        'Tap "+ Add Another Stop" for more destinations',
        'Drag to reorder stops if needed',
        'Review updated fare (includes stop fees)',
        'Confirm booking with all stops',
        'Share trip details with chauffeur if needed'
      ]
    },

    // Features
    {
      id: '6',
      title: 'Using Trip Insurance',
      description: 'Protect your journey with comprehensive coverage',
      duration: '2 min',
      difficulty: 'Beginner',
      category: 'features',
      icon: 'shield-checkmark',
      steps: [
        'During booking flow, you\'ll see Trip Insurance option',
        'Choose from Scratch Coverage (₹79), Scratch & Dent (₹99), or Full Coverage (₹129)',
        'Review coverage details and benefits',
        'Select your preferred payment method',
        'Read and accept Terms & Conditions',
        'Complete booking with insurance protection',
        'Receive insurance confirmation via email'
      ]
    },
    {
      id: '7',
      title: 'Sharing Your Trip',
      description: 'Keep your loved ones informed about your journey',
      duration: '2 min',
      difficulty: 'Beginner',
      category: 'features',
      icon: 'share',
      steps: [
        'Start your ride tracking screen',
        'Tap "Share Trip" button',
        'Select contacts from your phone',
        'Add custom message if desired',
        'Send live location link via SMS/WhatsApp',
        'Recipients can track your journey in real-time',
        'Trip sharing ends automatically when ride completes'
      ]
    },

    // Troubleshooting
    {
      id: '8',
      title: 'What to Do if Chauffeur is Late',
      description: 'Steps to take when your driver is delayed',
      duration: '2 min',
      difficulty: 'Beginner',
      category: 'troubleshooting',
      icon: 'time',
      steps: [
        'Check ride tracking screen for real-time updates',
        'Look for delay notifications from your chauffeur',
        'Call chauffeur directly using in-app calling',
        'If no response, contact Chauffit support immediately',
        'Consider rebooking if delay is excessive',
        'Report the experience for service improvement'
      ]
    },
    {
      id: '9',
      title: 'Resolving Payment Issues',
      description: 'Fix common payment and billing problems',
      duration: '4 min',
      difficulty: 'Intermediate',
      category: 'troubleshooting',
      icon: 'card',
      steps: [
        'Go to Profile > Payment Methods',
        'Check if your default payment method is valid',
        'Update expired cards or add new payment method',
        'For failed payments, try alternative payment method',
        'Check bank account for any holds or restrictions',
        'Contact support if payment keeps failing',
        'Review transaction history for any discrepancies'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Guides', icon: 'library' },
    { id: 'getting-started', label: 'Getting Started', icon: 'play-circle' },
    { id: 'booking', label: 'Booking Rides', icon: 'car' },
    { id: 'features', label: 'Features', icon: 'star' },
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
      default: return colors.placeholder;
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
          <ThemedText variant="h2">User Guides & Tutorials</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Learn How to Use Chauffit
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                Step-by-step guides and video tutorials to help you master all features.
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
                        color={selectedCategory === category.id ? BrandColors.white : BrandColors.secondary}
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
                <ThemedCard key={guide.id} variant="elevated" className="mb-4">
                  <TouchableOpacity
                    onPress={() => handleGuideSelect(guide)}
                    className="p-4"
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
                            <Ionicons name="time" size={14} color={colors.placeholder} />
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
                              <Ionicons name="play" size={16} color={BrandColors.white} />
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
                  Browse our FAQ section or contact support for personalized assistance.
                </ThemedText>

                <View className="flex-row space-x-3 w-full">
                  <TouchableOpacity 
                    className="flex-1 bg-secondary/10 py-3 rounded-xl mr-2"
                    onPress={() => router.push('/(customer)/faq')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-burgundy text-center font-semibold">
                      View FAQ
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-1 bg-burgundy py-3 rounded-xl ml-2"
                    onPress={() => router.push('/(customer)/submit-request')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-white text-center font-semibold">
                      Contact Us
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