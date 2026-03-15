import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { BrandColors, useThemeColors } from '../../constants/Colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'driver' | 'general' | 'account';
}

export default function FAQScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;
  
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    // Booking FAQs
    {
      id: '1',
      question: 'How do I book a ride?',
      answer: 'To book a ride, tap on "Book Now" from the home screen, enter your pickup and destination locations, select your preferred vehicle and time, then confirm your booking. You can also schedule rides for later.',
      category: 'booking'
    },
    {
      id: '2',
      question: 'Can I schedule a ride in advance?',
      answer: 'Yes! You can schedule rides up to 30 days in advance. Simply select "Schedule" instead of "Now" when booking, choose your preferred date and time, and your chauffeur will arrive accordingly.',
      category: 'booking'
    },
    {
      id: '3',
      question: 'How do I cancel a booking?',
      answer: 'You can cancel your booking through the "My Rides" section or the ride tracking screen. Free cancellation is available up to 15 minutes before your scheduled pickup time. Late cancellations may incur charges.',
      category: 'booking'
    },
    {
      id: '4',
      question: 'What if I need to add stops during my ride?',
      answer: 'You can add stops when booking by tapping "Add Stop(s)" or contact your chauffeur during the ride. Additional stops may incur extra charges based on distance and time.',
      category: 'booking'
    },

    // Payment FAQs
    {
      id: '5',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI payments, digital wallets (Paytm, PhonePe, etc.), and cash payments. You can manage your payment methods in the Profile settings.',
      category: 'payment'
    },
    {
      id: '6',
      question: 'When am I charged for my ride?',
      answer: 'For card and digital payments, you\'re charged immediately after the ride is completed. For cash payments, you pay the chauffeur directly. You\'ll receive a receipt via email and in-app.',
      category: 'payment'
    },
    {
      id: '7',
      question: 'How do refunds work?',
      answer: 'Refunds are processed automatically for cancelled rides and take 3-7 business days to reflect in your account. For ride issues, contact support and we\'ll process refunds within 24-48 hours.',
      category: 'payment'
    },
    {
      id: '8',
      question: 'Can I get a receipt for my ride?',
      answer: 'Yes! Receipts are automatically sent to your registered email after each completed ride. You can also view and download receipts from the Transaction History section.',
      category: 'payment'
    },

    // Driver FAQs
    {
      id: '9',
      question: 'How are chauffeurs selected?',
      answer: 'All our chauffeurs undergo thorough background checks, have valid licenses, and minimum 5 years of professional driving experience. They\'re rated by customers and maintain high service standards.',
      category: 'driver'
    },
    {
      id: '10',
      question: 'Can I contact my chauffeur?',
      answer: 'Yes! Once your ride is confirmed, you can call or message your chauffeur through the app. Their contact details will be available in the ride tracking screen.',
      category: 'driver'
    },
    {
      id: '11',
      question: 'What if my chauffeur is late?',
      answer: 'Chauffeurs typically arrive 5-10 minutes early. If they\'re running late, you\'ll receive notifications. You can also contact them directly or our support team for assistance.',
      category: 'driver'
    },
    {
      id: '12',
      question: 'How do I rate my chauffeur?',
      answer: 'After your ride, you\'ll be prompted to rate your chauffeur on a 5-star scale and provide optional feedback. This helps us maintain service quality and improve our services.',
      category: 'driver'
    },

    // Account FAQs
    {
      id: '13',
      question: 'How do I update my profile information?',
      answer: 'Go to Profile > Settings to update your personal information, phone number, email, and other details. Some changes may require verification.',
      category: 'account'
    },
    {
      id: '14',
      question: 'Can I add multiple cars to my account?',
      answer: 'Yes! You can add multiple vehicles in the Profile section. You can set one as default and choose different cars for different rides based on your needs.',
      category: 'account'
    },
    {
      id: '15',
      question: 'How do I change my password?',
      answer: 'Currently, Chauffit uses OTP-based authentication. If you need to update your login credentials, please contact our support team for assistance.',
      category: 'account'
    },

    // General FAQs
    {
      id: '16',
      question: 'What areas do you service?',
      answer: 'We currently operate in Delhi NCR, Mumbai, Bangalore, Chennai, and Hyderabad. We\'re rapidly expanding to more cities. Check our website for the latest service areas.',
      category: 'general'
    },
    {
      id: '17',
      question: 'Are rides available 24/7?',
      answer: 'Yes! Chauffit operates 24/7, 365 days a year. However, availability may vary by location and demand. Premium rates may apply during late night hours (11 PM - 6 AM).',
      category: 'general'
    },
    {
      id: '18',
      question: 'Do you provide car seats for children?',
      answer: 'Yes! We provide complimentary car seats for children upon request. Please specify this requirement when booking your ride. Available for children aged 2-8 years.',
      category: 'general'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'booking', label: 'Booking', icon: 'car' },
    { id: 'payment', label: 'Payment', icon: 'card' },
    { id: 'driver', label: 'Driver', icon: 'person' },
    { id: 'account', label: 'Account', icon: 'settings' },
    { id: 'general', label: 'General', icon: 'help-circle' }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

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
                Find Quick Answers
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                Browse through commonly asked questions or search for specific topics.
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

            {/* FAQ Items */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">
                Questions ({filteredFAQs.length})
              </ThemedText>

              {filteredFAQs.map((faq, index) => (
                <ThemedCard key={faq.id} variant="elevated" className="mb-3">
                  <TouchableOpacity
                    onPress={() => toggleExpanded(faq.id)}
                    className="p-4"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <ThemedText className="font-semibold">
                          {faq.question}
                        </ThemedText>
                      </View>
                      <Ionicons 
                        name={expandedItems.includes(faq.id) ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={iconColor} 
                      />
                    </View>

                    {expandedItems.includes(faq.id) && (
                      <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <ThemedText variant="small" className="text-gray-700 dark:text-gray-300 leading-6">
                          {faq.answer}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                </ThemedCard>
              ))}
            </View>

            {/* Still Need Help */}
            <ThemedCard variant="elevated" className="p-6">
              <View className="items-center">
                <View className="w-16 h-16 bg-secondary/10 rounded-full items-center justify-center mb-4">
                  <Ionicons name="help-circle" size={32} color={BrandColors.secondary} />
                </View>
                <ThemedText variant="h3" className="mb-2 text-center">
                  Still Need Help?
                </ThemedText>
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </ThemedText>

                <View className="flex-row space-x-3 w-full">
                  <TouchableOpacity 
                    className="flex-1 bg-burgundy py-3 rounded-xl mr-2"
                    onPress={() => router.push('/(customer)/submit-request')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-white text-center font-semibold">
                      Contact Support
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-1 border border-burgundy py-3 rounded-xl ml-2"
                    onPress={() => router.push('/(customer)/user-guides')}
                    activeOpacity={0.8}
                  >
                    <ThemedText className="text-burgundy text-center font-semibold">
                      View Guides
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