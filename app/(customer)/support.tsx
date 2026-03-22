import React from 'react';
import { ScrollView, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { useRouter } from 'expo-router';
import { BrandColors, useThemeColors } from '../../constants/Colors';

export default function SupportScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const router = useRouter();
  const colors = useThemeColors(isDarkMode);

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;

  const handleFAQ = () => {
    router.push('/(customer)/faq');
  };

  const handleUserGuides = () => {
    router.push('/(customer)/user-guides');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@chauffit.com');
  };

  const handleChatSupport = () => {
    const number = getConfigValue('whatsapp_support_number') || '+919958433134';
    const cleaned = number.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${cleaned}`);
  };

  const handleSubmitRequest = () => {
    router.push('/(customer)/submit-request');
  };

  const handleCheckStatus = () => {
    router.push('/(customer)/request-status');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Support</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Help & FAQs Section */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4 text-gray-800 dark:text-gray-200">
                Help & FAQs
              </ThemedText>
              
              <TouchableOpacity 
                onPress={handleFAQ}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <View className="w-4 h-4 rounded-full border-2 border-secondary" />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    Frequently Asked Questions
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleUserGuides}
                className="flex-row items-center justify-between py-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="book" size={16} color={BrandColors.secondary} />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    User Guides & Tutorials
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </ThemedCard>

            {/* Contact Us Section */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4 text-gray-800 dark:text-gray-200">
                Contact Us
              </ThemedText>
              
              <TouchableOpacity
                onPress={handleEmailSupport}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="mail" size={16} color={BrandColors.secondary} />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    Email Support
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChatSupport}
                className="flex-row items-center justify-between py-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="logo-whatsapp" size={16} color={BrandColors.secondary} />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    Chat Support
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </ThemedCard>

            {/* Submit an Inquiry Section */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4 text-gray-800 dark:text-gray-200">
                Submit an Inquiry
              </ThemedText>
              
              <TouchableOpacity 
                onPress={handleSubmitRequest}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="document-text" size={16} color={BrandColors.secondary} />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    Submit a New Request
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleCheckStatus}
                className="flex-row items-center justify-between py-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="checkmark-circle" size={16} color={BrandColors.secondary} />
                  </View>
                  <ThemedText className="text-gray-800 dark:text-gray-200">
                    Check Request Status
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}