import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

type RequestStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type RequestCategory = 'rides' | 'earnings' | 'documents' | 'account' | 'technical' | 'other';

interface SupportRequest {
  id: string;
  ticketId: string;
  category: RequestCategory;
  subject: string;
  description: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  responses: {
    id: string;
    message: string;
    sender: 'driver' | 'support';
    timestamp: Date;
  }[];
}

export default function RequestStatusScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [searchTicketId, setSearchTicketId] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real app this would come from API
  const mockRequests: SupportRequest[] = [
    {
      id: '1',
      ticketId: 'DRV123456',
      category: 'earnings',
      subject: 'Payment not received for completed rides',
      description: 'I completed 8 rides yesterday but haven\'t received payment yet.',
      status: 'in-progress',
      priority: 'high',
      createdAt: new Date('2024-01-10T10:30:00Z'),
      updatedAt: new Date('2024-01-10T14:20:00Z'),
      responses: [
        {
          id: '1',
          message: 'Thank you for contacting Chauffit driver support. We have received your request about missing payments and are investigating the issue.',
          sender: 'support',
          timestamp: new Date('2024-01-10T11:00:00Z')
        },
        {
          id: '2', 
          message: 'We found a processing delay in our payment system. Your earnings will be credited within 24 hours along with any applicable late fees waived.',
          sender: 'support',
          timestamp: new Date('2024-01-10T14:20:00Z')
        }
      ]
    },
    {
      id: '2',
      ticketId: 'DRV789012',
      category: 'technical',
      subject: 'App crashes when trying to go online',
      description: 'The app keeps crashing whenever I tap "Go Online". I\'ve tried restarting my phone.',
      status: 'resolved',
      priority: 'medium',
      createdAt: new Date('2024-01-08T09:15:00Z'),
      updatedAt: new Date('2024-01-09T16:45:00Z'),
      responses: [
        {
          id: '3',
          message: 'We\'re sorry to hear about the technical issue. Please try updating to the latest app version (v2.1.3) and clear the app cache.',
          sender: 'support',
          timestamp: new Date('2024-01-08T10:30:00Z')
        },
        {
          id: '4',
          message: 'The update worked! I can now go online without any crashes.',
          sender: 'driver',
          timestamp: new Date('2024-01-09T08:20:00Z')
        },
        {
          id: '5',
          message: 'Great! We\'re glad the issue is resolved. If you experience any other problems, please don\'t hesitate to contact us.',
          sender: 'support',
          timestamp: new Date('2024-01-09T16:45:00Z')
        }
      ]
    },
    {
      id: '3',
      ticketId: 'DRV345678',
      category: 'account',
      subject: 'Unable to update banking details',
      description: 'Getting an error when trying to update my bank account information.',
      status: 'open',
      priority: 'medium',
      createdAt: new Date('2024-01-11T15:20:00Z'),
      updatedAt: new Date('2024-01-11T15:20:00Z'),
      responses: []
    }
  ];

  const handleSearch = async () => {
    if (!searchTicketId.trim()) {
      Alert.alert('Missing Ticket ID', 'Please enter a ticket ID to search.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const request = mockRequests.find(req => 
      req.ticketId.toLowerCase() === searchTicketId.toLowerCase()
    );
    
    if (request) {
      setSelectedRequest(request);
    } else {
      Alert.alert(
        'Ticket Not Found',
        'No support request found with this ticket ID. Please check the ID and try again.'
      );
    }
    
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'open': return '#3B82F6';
      case 'in-progress': return '#F59E0B';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'open': return 'hourglass';
      case 'in-progress': return 'sync';
      case 'resolved': return 'checkmark-circle';
      case 'closed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: RequestCategory) => {
    switch (category) {
      case 'rides': return 'car';
      case 'earnings': return 'cash';
      case 'documents': return 'document-text';
      case 'account': return 'person';
      case 'technical': return 'bug';
      case 'other': return 'help-circle';
      default: return 'help-circle';
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
          <ThemedText variant="h2">Request Status</ThemedText>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="px-6 py-6">
            {/* Search Section */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Check Request Status
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600 mb-4">
                Enter your support ticket ID to view the current status and responses.
              </ThemedText>
              
              <View className="mb-4">
                <ThemedText variant="small" className="mb-2 text-gray-600">
                  Ticket ID
                </ThemedText>
                <View className="flex-row">
                  <TextInput
                    className={`flex-1 p-3 rounded-xl border mr-3 ${inputClass}`}
                    placeholder="e.g., DRV123456"
                    placeholderTextColor="#999"
                    value={searchTicketId}
                    onChangeText={setSearchTicketId}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    onPress={handleSearch}
                    disabled={isLoading}
                    className="bg-burgundy px-4 rounded-xl items-center justify-center"
                  >
                    <Ionicons 
                      name={isLoading ? "sync" : "search"} 
                      size={20} 
                      color="#FFFFFF"
                      style={{ transform: [{ rotate: isLoading ? '45deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>

            {/* Selected Request Details */}
            {selectedRequest && (
              <ThemedCard variant="elevated" className="mb-6 p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <ThemedText variant="h3">Request Details</ThemedText>
                  <View 
                    className="px-3 py-1 rounded-full flex-row items-center"
                    style={{ backgroundColor: `${getStatusColor(selectedRequest.status)}20` }}
                  >
                    <Ionicons 
                      name={getStatusIcon(selectedRequest.status) as any} 
                      size={16} 
                      color={getStatusColor(selectedRequest.status)}
                      style={{ marginRight: 4 }}
                    />
                    <ThemedText 
                      variant="small" 
                      className="capitalize font-semibold"
                      style={{ color: getStatusColor(selectedRequest.status) }}
                    >
                      {selectedRequest.status.replace('-', ' ')}
                    </ThemedText>
                  </View>
                </View>

                {/* Request Info */}
                <View className="mb-4 p-6 bg-surface dark:bg-darkSurface rounded-xl">
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 bg-secondary/10 rounded-full items-center justify-center mr-3">
                      <Ionicons 
                        name={getCategoryIcon(selectedRequest.category)} 
                        size={16} 
                        color="#BD8C5E" 
                      />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="font-semibold">
                        {selectedRequest.subject}
                      </ThemedText>
                      <ThemedText variant="small" className="text-gray-600">
                        Ticket ID: {selectedRequest.ticketId}
                      </ThemedText>
                    </View>
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${getPriorityColor(selectedRequest.priority)}20` }}
                    >
                      <ThemedText 
                        variant="tiny" 
                        className="font-semibold capitalize"
                        style={{ color: getPriorityColor(selectedRequest.priority) }}
                      >
                        {selectedRequest.priority}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText variant="small" className="text-gray-700 dark:text-gray-300 mb-3">
                    {selectedRequest.description}
                  </ThemedText>

                  <View className="flex-row justify-between">
                    <ThemedText variant="tiny" className="text-gray-500">
                      Created: {selectedRequest.createdAt.toLocaleDateString('en-IN')}
                    </ThemedText>
                    <ThemedText variant="tiny" className="text-gray-500">
                      Updated: {selectedRequest.updatedAt.toLocaleDateString('en-IN')}
                    </ThemedText>
                  </View>
                </View>

                {/* Responses */}
                {selectedRequest.responses.length > 0 && (
                  <View>
                    <ThemedText variant="h3" className="mb-4">
                      Conversation ({selectedRequest.responses.length})
                    </ThemedText>
                    
                    {selectedRequest.responses.map((response) => (
                      <View key={response.id} className={`mb-4 ${response.sender === 'support' ? 'mr-6' : 'ml-6'}`}>
                        <View className={`p-6 rounded-xl ${
                          response.sender === 'support' 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <View className="flex-row items-center mb-2">
                            <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                              response.sender === 'support' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}>
                              <Ionicons 
                                name={response.sender === 'support' ? 'person' : 'car'} 
                                size={12} 
                                color="#FFFFFF" 
                              />
                            </View>
                            <ThemedText variant="small" className="font-semibold">
                              {response.sender === 'support' ? 'Support Team' : 'You'}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500 ml-auto">
                              {response.timestamp.toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </ThemedText>
                          </View>
                          <ThemedText variant="small" className="text-gray-700 dark:text-gray-300">
                            {response.message}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedRequest.responses.length === 0 && (
                  <View className="text-center py-8">
                    <Ionicons name="time" size={48} color="#9CA3AF" />
                    <ThemedText className="text-gray-500 mt-2">
                      No responses yet
                    </ThemedText>
                    <ThemedText variant="small" className="text-gray-400">
                      Our support team will respond within 24 hours
                    </ThemedText>
                  </View>
                )}
              </ThemedCard>
            )}

            {/* Recent Requests */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <ThemedText variant="h3" className="mb-4">
                Recent Requests
              </ThemedText>
              
              {mockRequests.slice(0, 3).map((request) => (
                <TouchableOpacity
                  key={request.id}
                  onPress={() => {
                    setSelectedRequest(request);
                    setSearchTicketId(request.ticketId);
                  }}
                  className="p-6 border border-border dark:border-darkBorder rounded-xl mb-3"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <ThemedText className="font-semibold flex-1">
                      {request.subject}
                    </ThemedText>
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${getStatusColor(request.status)}20` }}
                    >
                      <ThemedText 
                        variant="tiny" 
                        className="font-semibold capitalize"
                        style={{ color: getStatusColor(request.status) }}
                      >
                        {request.status.replace('-', ' ')}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <ThemedText variant="small" className="text-gray-600">
                      {request.ticketId}
                    </ThemedText>
                    <ThemedText variant="small" className="text-gray-500">
                      {request.createdAt.toLocaleDateString('en-IN')}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ThemedCard>

            {/* Help Section */}
            <ThemedCard variant="elevated" className="p-6">
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                  <Ionicons name="help-circle" size={32} color="#3B82F6" />
                </View>
                <ThemedText variant="h3" className="mb-2 text-center">
                  Need to Submit a New Request?
                </ThemedText>
                <ThemedText variant="small" className="text-gray-600 text-center mb-4">
                  Can't find your ticket or have a new issue? Submit a support request.
                </ThemedText>

                <PrimaryButton
                  title="Submit New Request"
                  onPress={() => router.push('/(driver)/submit-request')}
                  className="w-full"
                />
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}