import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'driving' | 'earnings' | 'app' | 'safety' | 'support';
}

export default function FAQScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    // Driving Questions
    {
      id: '1',
      question: 'How do I accept ride requests?',
      answer: 'When you receive a ride request, you\'ll see details about the pickup location, destination, and estimated fare. Tap "Accept" to confirm the ride or "Decline" to reject it. You have 30 seconds to respond.',
      category: 'driving'
    },
    {
      id: '2',
      question: 'Can I cancel a ride after accepting it?',
      answer: 'You can cancel a ride before picking up the customer, but frequent cancellations may affect your driver rating and account status. Valid reasons include vehicle issues, traffic conditions, or customer no-show.',
      category: 'driving'
    },
    {
      id: '3',
      question: 'What documents do I need to drive?',
      answer: 'You need a valid driving license, vehicle registration certificate (RC), commercial insurance, and PAN card. All documents must be uploaded and verified in the app.',
      category: 'driving'
    },
    {
      id: '4',
      question: 'How do I navigate to pickup and drop locations?',
      answer: 'The app provides turn-by-turn navigation. Tap the navigation button to open your preferred maps app (Google Maps or Apple Maps) with the destination pre-loaded.',
      category: 'driving'
    },

    // Earnings Questions
    {
      id: '5',
      question: 'When will I receive my payments?',
      answer: 'Payments are processed twice a week - every Tuesday and Friday. Your earnings from completed rides will be transferred to your registered bank account within 24-48 hours.',
      category: 'earnings'
    },
    {
      id: '6',
      question: 'How are ride fares calculated?',
      answer: 'Fares are calculated based on base fare, distance traveled, time taken, and any applicable surge pricing. You can see the breakdown of each fare in your earnings section.',
      category: 'earnings'
    },
    {
      id: '7',
      question: 'What are surge prices and bonuses?',
      answer: 'Surge pricing applies during high-demand periods, increasing your earnings. Bonuses are rewards for completing a certain number of rides or driving during specific hours.',
      category: 'earnings'
    },
    {
      id: '8',
      question: 'How can I track my daily earnings?',
      answer: 'Go to the Earnings tab to see your daily, weekly, and monthly earnings. You can also view details of individual rides and download earning statements.',
      category: 'earnings'
    },

    // App Usage Questions  
    {
      id: '9',
      question: 'How do I go online to receive ride requests?',
      answer: 'Tap the "Go Online" button on your home screen. Make sure you have a stable internet connection and GPS enabled. You\'ll start receiving ride requests in your area.',
      category: 'app'
    },
    {
      id: '10',
      question: 'Why am I not receiving ride requests?',
      answer: 'This could be due to low demand in your area, network issues, or being offline. Try moving to busier areas or check your internet connection and location settings.',
      category: 'app'
    },
    {
      id: '11',
      question: 'How do I update my profile information?',
      answer: 'Go to Profile > Edit Profile to update your personal information. For document updates, visit the Documents section and upload new files for verification.',
      category: 'app'
    },
    {
      id: '12',
      question: 'Can I use the app in multiple cities?',
      answer: 'Yes, you can drive in any city where Chauffit operates. Your profile and documents are valid across all supported locations.',
      category: 'app'
    },

    // Safety Questions
    {
      id: '13',
      question: 'What safety features are available?',
      answer: 'The app includes GPS tracking, customer photo verification, emergency contact sharing, and 24/7 support. Always verify customer details before starting the ride.',
      category: 'safety'
    },
    {
      id: '14',
      question: 'What should I do in case of an emergency?',
      answer: 'Use the emergency button in the app to contact authorities and notify Chauffit support. You can also call emergency services directly (100/108) if needed.',
      category: 'safety'
    },
    {
      id: '15',
      question: 'How do I report problematic customers?',
      answer: 'After completing or canceling a ride, you can rate the customer and provide feedback. For serious issues, contact support immediately through the app.',
      category: 'safety'
    },

    // Support Questions
    {
      id: '16',
      question: 'How do I contact customer support?',
      answer: 'You can reach support through the Help & Support section in the app, call our driver support line, or email driver-support@chauffit.com for assistance.',
      category: 'support'
    },
    {
      id: '17',
      question: 'What if my account gets suspended?',
      answer: 'Account suspensions are usually due to policy violations or document issues. Contact support for clarification and follow the required steps to reactivate your account.',
      category: 'support'
    },
    {
      id: '18',
      question: 'How long does document verification take?',
      answer: 'Document verification typically takes 24-48 hours. You\'ll receive a notification once your documents are approved. Ensure all uploaded documents are clear and valid.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'driving', label: 'Driving', icon: 'car' },
    { id: 'earnings', label: 'Earnings', icon: 'cash' },
    { id: 'app', label: 'App Usage', icon: 'phone-portrait' },
    { id: 'safety', label: 'Safety', icon: 'shield-checkmark' },
    { id: 'support', label: 'Support', icon: 'help-circle' }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getFilteredFAQs = () => {
    if (selectedCategory === 'all') return faqData;
    return faqData.filter(faq => faq.category === selectedCategory);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Frequently Asked Questions</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Driver FAQ
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600">
                Find answers to common questions about driving with Chauffit.
              </ThemedText>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <View className="flex-row space-x-3 px-1">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={`flex-row items-center px-4 py-2 rounded-full border ${
                      selectedCategory === category.id
                        ? 'bg-burgundy border-burgundy'
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={selectedCategory === category.id ? '#FFFFFF' : '#BD8C5E'} 
                    />
                    <ThemedText 
                      variant="small" 
                      className={`ml-2 font-semibold ${
                        selectedCategory === category.id ? 'text-white' : 'text-textPrimary dark:text-darkText'
                      }`}
                    >
                      {category.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* FAQ Items */}
            <View>
              {getFilteredFAQs().map((faq) => (
                <ThemedCard key={faq.id} variant="elevated" className="mb-4 p-6">
                  <TouchableOpacity
                    onPress={() => toggleExpanded(faq.id)}
                    className="flex-row items-center justify-between"
                    activeOpacity={0.7}
                  >
                    <View className="flex-1 mr-4">
                      <ThemedText className="font-semibold text-base">
                        {faq.question}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name={expandedItems.includes(faq.id) ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                  
                  {expandedItems.includes(faq.id) && (
                    <View className="mt-4 pt-4 border-t border-border dark:border-darkBorder">
                      <ThemedText variant="small" className="text-gray-700 dark:text-gray-300 leading-6">
                        {faq.answer}
                      </ThemedText>
                    </View>
                  )}
                </ThemedCard>
              ))}
            </View>

            {/* Contact Support */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <View className="items-center">
                <View className="w-16 h-16 bg-secondary/10 rounded-full items-center justify-center mb-4">
                  <Ionicons name="help-circle" size={32} color="#BD8C5E" />
                </View>
                <ThemedText variant="h3" className="mb-2 text-center">
                  Still need help?
                </ThemedText>
                <ThemedText variant="small" className="text-gray-600 text-center mb-4">
                  Can't find what you're looking for? Our driver support team is here to help.
                </ThemedText>
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="bg-burgundy px-6 py-3 rounded-xl"
                  activeOpacity={0.8}
                >
                  <ThemedText className="text-white font-semibold">
                    Contact Support
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}