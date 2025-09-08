import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

type RequestCategory = 'rides' | 'earnings' | 'documents' | 'account' | 'technical' | 'other';
type Priority = 'low' | 'medium' | 'high';

interface RequestForm {
  category: RequestCategory;
  priority: Priority;
  subject: string;
  description: string;
  rideId: string;
  contactMethod: 'email' | 'phone' | 'both';
}

export default function SubmitRequestScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [form, setForm] = useState<RequestForm>({
    category: 'rides',
    priority: 'medium',
    subject: '',
    description: '',
    rideId: '',
    contactMethod: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'rides', label: 'Ride Issues', icon: 'car', description: 'Problems with ride requests, customers, or trips' },
    { id: 'earnings', label: 'Earnings & Payments', icon: 'cash', description: 'Payment delays, earnings discrepancies, fare issues' },
    { id: 'documents', label: 'Document Verification', icon: 'document-text', description: 'Issues with document uploads or verification' },
    { id: 'account', label: 'Account & Profile', icon: 'person', description: 'Profile updates, account access, driver status' },
    { id: 'technical', label: 'Technical Support', icon: 'bug', description: 'App bugs, crashes, or technical difficulties' },
    { id: 'other', label: 'Other', icon: 'help-circle', description: 'General driver inquiries and other concerns' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: '#10B981', description: 'General inquiry, non-urgent' },
    { id: 'medium', label: 'Medium', color: '#F59E0B', description: 'Standard issue, moderate urgency' },
    { id: 'high', label: 'High', color: '#EF4444', description: 'Urgent issue affecting earnings' }
  ];

  const contactMethods = [
    { id: 'email', label: 'Email Only', icon: 'mail', description: 'Receive updates via email' },
    { id: 'phone', label: 'Phone Call', icon: 'call', description: 'Prefer phone conversation' },
    { id: 'both', label: 'Both', icon: 'notifications', description: 'Email updates + phone call if needed' }
  ];

  const handleSubmit = async () => {
    // Validation
    if (!form.subject.trim()) {
      Alert.alert('Missing Information', 'Please enter a subject for your request.');
      return;
    }
    
    if (!form.description.trim()) {
      Alert.alert('Missing Information', 'Please provide a detailed description of your issue.');
      return;
    }

    if (form.description.length < 20) {
      Alert.alert('Description Too Short', 'Please provide more details (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock ticket ID
      const ticketId = `DRV${Date.now().toString().slice(-6)}`;
      
      Alert.alert(
        'Request Submitted Successfully!',
        `Your support request has been submitted with ticket ID: ${ticketId}\n\nOur driver support team will review your request and get back to you within 24 hours.`,
        [
          {
            text: 'View Status',
            onPress: () => router.push('/(driver)/request-status')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = isDarkMode 
    ? 'bg-darkSurface text-darkText border-darkBorder' 
    : 'bg-white text-textPrimary border-gray-200';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Submit Support Request</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Driver Support Request
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600">
                Need help with driving, earnings, or account issues? Our driver support team is here to assist you.
              </ThemedText>
            </View>

            {/* Contact Information */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Contact Information
              </ThemedText>
              
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Full Name
                </ThemedText>
                <View className={`p-3 rounded-xl border ${inputClass}`}>
                  <ThemedText className="opacity-70">
                    {user?.name || 'Your Name'}
                  </ThemedText>
                </View>
              </View>

              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Email Address
                </ThemedText>
                <View className={`p-3 rounded-xl border ${inputClass}`}>
                  <ThemedText className="opacity-70">
                    {user?.email || 'your.email@example.com'}
                  </ThemedText>
                </View>
              </View>

              <View>
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Phone Number
                </ThemedText>
                <View className={`p-3 rounded-xl border ${inputClass}`}>
                  <ThemedText className="opacity-70">
                    {user?.phone || '+91 98765 43210'}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Request Category */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Request Category *
              </ThemedText>
              
              <View>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setForm(prev => ({ ...prev, category: category.id as RequestCategory }))}
                    className={`mb-3 p-4 rounded-xl border ${
                      form.category === category.id 
                        ? 'bg-burgundy/10 border-burgundy' 
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                        form.category === category.id ? 'bg-burgundy' : 'bg-secondary/10'
                      }`}>
                        <Ionicons 
                          name={category.icon as any} 
                          size={20} 
                          color={form.category === category.id ? '#FFFFFF' : '#BD8C5E'} 
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText className={`font-semibold ${
                          form.category === category.id ? 'text-burgundy' : ''
                        }`}>
                          {category.label}
                        </ThemedText>
                        <ThemedText variant="small" className="text-gray-600">
                          {category.description}
                        </ThemedText>
                      </View>
                      {form.category === category.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#722F37" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Priority Level */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Priority Level *
              </ThemedText>
              
              <View className="flex-row">
                {priorities.map((priority, index) => (
                  <TouchableOpacity
                    key={priority.id}
                    onPress={() => setForm(prev => ({ ...prev, priority: priority.id as Priority }))}
                    className={`flex-1 p-3 rounded-xl border ${index < priorities.length - 1 ? 'mr-3' : ''} ${
                      form.priority === priority.id 
                        ? 'border-opacity-100' 
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                    }`}
                    style={{
                      backgroundColor: form.priority === priority.id ? `${priority.color}20` : undefined,
                      borderColor: form.priority === priority.id ? priority.color : undefined
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="items-center">
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: priority.color }}
                      >
                        <ThemedText className="text-white font-bold text-xs">
                          {priority.label.charAt(0)}
                        </ThemedText>
                      </View>
                      <ThemedText 
                        className="font-semibold text-center"
                        style={{ color: form.priority === priority.id ? priority.color : undefined }}
                      >
                        {priority.label}
                      </ThemedText>
                      <ThemedText variant="tiny" className="text-gray-600 text-center mt-1">
                        {priority.description}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Request Details */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Request Details
              </ThemedText>

              {/* Subject */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Subject *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="Brief summary of your issue"
                  placeholderTextColor="#999"
                  value={form.subject}
                  onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
                  maxLength={100}
                />
                <ThemedText variant="tiny" className="text-gray-500 mt-1">
                  {form.subject.length}/100 characters
                </ThemedText>
              </View>

              {/* Ride ID (Optional) */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Related Ride ID (Optional)
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass}`}
                  placeholder="Enter ride ID if applicable"
                  placeholderTextColor="#999"
                  value={form.rideId}
                  onChangeText={(text) => setForm(prev => ({ ...prev, rideId: text }))}
                />
                <ThemedText variant="tiny" className="text-gray-500 mt-1">
                  Find ride ID in your trip history
                </ThemedText>
              </View>

              {/* Description */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Detailed Description *
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${inputClass} h-32`}
                  placeholder="Please provide detailed information about your issue, including what happened, when it occurred, and any error messages you received."
                  placeholderTextColor="#999"
                  value={form.description}
                  onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <ThemedText variant="tiny" className="text-gray-500 mt-1">
                  {form.description.length}/500 characters (minimum 20 required)
                </ThemedText>
              </View>
            </ThemedCard>

            {/* Contact Preference */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Preferred Contact Method
              </ThemedText>
              
              <View>
                {contactMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setForm(prev => ({ ...prev, contactMethod: method.id as 'email' | 'phone' | 'both' }))}
                    className={`mb-3 p-4 rounded-xl border ${
                      form.contactMethod === method.id 
                        ? 'bg-burgundy/10 border-burgundy' 
                        : 'bg-surface dark:bg-darkSurface border-border dark:border-darkBorder'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                        form.contactMethod === method.id ? 'bg-burgundy' : 'bg-secondary/10'
                      }`}>
                        <Ionicons 
                          name={method.icon as any} 
                          size={20} 
                          color={form.contactMethod === method.id ? '#FFFFFF' : '#BD8C5E'} 
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText className={`font-semibold ${
                          form.contactMethod === method.id ? 'text-burgundy' : ''
                        }`}>
                          {method.label}
                        </ThemedText>
                        <ThemedText variant="small" className="text-gray-600">
                          {method.description}
                        </ThemedText>
                      </View>
                      {form.contactMethod === method.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#722F37" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Submit Button */}
            <PrimaryButton
              title={isSubmitting ? "Submitting Request..." : "Submit Support Request"}
              onPress={handleSubmit}
              disabled={isSubmitting || !form.subject.trim() || !form.description.trim() || form.description.length < 20}
            />

            {/* Help Text */}
            <View className="mt-4">
              <ThemedText variant="small" className="text-gray-500 text-center">
                Our driver support team typically responds within 24 hours.
              </ThemedText>
              <ThemedText variant="small" className="text-gray-500 text-center">
                For urgent issues, please call our driver helpline.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}