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

type RequestCategory = 'booking' | 'payment' | 'driver' | 'account' | 'technical' | 'other';
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
    category: 'booking',
    priority: 'medium',
    subject: '',
    description: '',
    rideId: '',
    contactMethod: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'booking', label: 'Booking Issues', icon: 'car', description: 'Problems with ride booking or scheduling' },
    { id: 'payment', label: 'Payment & Billing', icon: 'card', description: 'Payment failures, refunds, billing questions' },
    { id: 'driver', label: 'Driver Related', icon: 'person', description: 'Issues with chauffeur service or behavior' },
    { id: 'account', label: 'Account & Profile', icon: 'settings', description: 'Profile updates, login issues, account settings' },
    { id: 'technical', label: 'Technical Support', icon: 'bug', description: 'App bugs, crashes, or technical difficulties' },
    { id: 'other', label: 'Other', icon: 'help-circle', description: 'General inquiries and other concerns' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: '#10B981', description: 'General inquiry, non-urgent' },
    { id: 'medium', label: 'Medium', color: '#F59E0B', description: 'Standard issue, moderate urgency' },
    { id: 'high', label: 'High', color: '#EF4444', description: 'Urgent issue affecting service' }
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
      const ticketId = `CHF${Date.now().toString().slice(-6)}`;
      
      Alert.alert(
        'Request Submitted Successfully!',
        `Your support request has been submitted with ticket ID: ${ticketId}\n\nOur team will review your request and get back to you within 24 hours.`,
        [
          {
            text: 'View Status',
            onPress: () => router.push('/(customer)/request-status')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.icon || 'help-circle';
  };

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
                How Can We Help?
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600">
                Fill out this form with details about your issue. Our support team will get back to you soon.
              </ThemedText>
            </View>

            {/* Category Selection */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Request Category *
              </ThemedText>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setForm(prev => ({ ...prev, category: category.id as RequestCategory }))}
                  className={`flex-row items-center p-3 rounded-xl mb-3 border ${
                    form.category === category.id 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  activeOpacity={0.7}
                >
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
                    <ThemedText className="font-semibold mb-1">
                      {category.label}
                    </ThemedText>
                    <ThemedText variant="small" className="text-gray-600">
                      {category.description}
                    </ThemedText>
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    form.category === category.id 
                      ? 'border-burgundy bg-burgundy' 
                      : 'border-gray-300'
                  }`}>
                    {form.category === category.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ThemedCard>

            {/* Priority Level */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Priority Level *
              </ThemedText>
              
              <View className="flex-row justify-between">
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    onPress={() => setForm(prev => ({ ...prev, priority: priority.id as Priority }))}
                    className={`flex-1 mx-1 p-3 rounded-xl border ${
                      form.priority === priority.id 
                        ? 'border-2' 
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                    style={form.priority === priority.id ? { borderColor: priority.color } : {}}
                    activeOpacity={0.7}
                  >
                    <View className="items-center">
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: `${priority.color}20` }}
                      >
                        <View 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                      </View>
                      <ThemedText 
                        variant="small" 
                        className={`font-semibold ${form.priority === priority.id ? '' : 'text-gray-600'}`}
                        style={form.priority === priority.id ? { color: priority.color } : {}}
                      >
                        {priority.label}
                      </ThemedText>
                      <ThemedText variant="tiny" className="text-gray-500 text-center mt-1">
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
                Request Details *
              </ThemedText>
              
              {/* Subject */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Subject
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${
                    isDarkMode ? 'bg-darkSurface text-darkText border-darkBorder' : 'bg-white text-textPrimary border-gray-200'
                  }`}
                  placeholder="Brief summary of your issue"
                  placeholderTextColor="#999"
                  value={form.subject}
                  onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
                  maxLength={100}
                />
                <ThemedText variant="tiny" className="text-gray-500 mt-1 text-right">
                  {form.subject.length}/100
                </ThemedText>
              </View>

              {/* Description */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Detailed Description
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border h-32 ${
                    isDarkMode ? 'bg-darkSurface text-darkText border-darkBorder' : 'bg-white text-textPrimary border-gray-200'
                  }`}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  placeholderTextColor="#999"
                  value={form.description}
                  onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <ThemedText variant="tiny" className="text-gray-500 mt-1 text-right">
                  {form.description.length}/500
                </ThemedText>
              </View>

              {/* Ride ID (Optional) */}
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Ride ID (Optional)
                </ThemedText>
                <TextInput
                  className={`p-3 rounded-xl border ${
                    isDarkMode ? 'bg-darkSurface text-darkText border-darkBorder' : 'bg-white text-textPrimary border-gray-200'
                  }`}
                  placeholder="e.g., RIDE001234 (if your issue is related to a specific ride)"
                  placeholderTextColor="#999"
                  value={form.rideId}
                  onChangeText={(text) => setForm(prev => ({ ...prev, rideId: text }))}
                  autoCapitalize="characters"
                />
              </View>
            </ThemedCard>

            {/* Contact Preference */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                How Should We Contact You? *
              </ThemedText>
              
              {contactMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setForm(prev => ({ ...prev, contactMethod: method.id as 'email' | 'phone' | 'both' }))}
                  className={`flex-row items-center p-3 rounded-xl mb-3 border ${
                    form.contactMethod === method.id 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  activeOpacity={0.7}
                >
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
                    <ThemedText className="font-semibold mb-1">
                      {method.label}
                    </ThemedText>
                    <ThemedText variant="small" className="text-gray-600">
                      {method.description}
                    </ThemedText>
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    form.contactMethod === method.id 
                      ? 'border-burgundy bg-burgundy' 
                      : 'border-gray-300'
                  }`}>
                    {form.contactMethod === method.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Contact Info Display */}
              <View className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <ThemedText variant="small" className="text-gray-600 mb-2">
                  We'll contact you at:
                </ThemedText>
                {(form.contactMethod === 'email' || form.contactMethod === 'both') && (
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="mail" size={16} color="#BD8C5E" />
                    <ThemedText variant="small" className="ml-2">
                      {user?.email || 'your@email.com'}
                    </ThemedText>
                  </View>
                )}
                {(form.contactMethod === 'phone' || form.contactMethod === 'both') && (
                  <View className="flex-row items-center">
                    <Ionicons name="call" size={16} color="#BD8C5E" />
                    <ThemedText variant="small" className="ml-2">
                      {user?.phone || '+91 XXXXXXXXXX'}
                    </ThemedText>
                  </View>
                )}
              </View>
            </ThemedCard>

            {/* Submit Button */}
            <PrimaryButton
              title={isSubmitting ? "Submitting..." : "Submit Request"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="mb-4"
            />

            <View className="items-center">
              <ThemedText variant="small" className="text-gray-500 text-center">
                * Required fields
              </ThemedText>
              <ThemedText variant="tiny" className="text-gray-400 text-center mt-2">
                We typically respond within 24 hours during business days
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}