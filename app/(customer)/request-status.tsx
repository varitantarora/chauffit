import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { BrandColors, useThemeColors } from '../../constants/Colors';

interface SupportRequest {
  id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  description: string;
  assignedAgent?: string;
  responses: SupportResponse[];
}

interface SupportResponse {
  id: string;
  message: string;
  timestamp: string;
  isFromSupport: boolean;
  agentName?: string;
}

type StatusFilter = 'all' | 'open' | 'in-progress' | 'resolved' | 'closed';

export default function RequestStatusScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = useThemeColors(isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;
  const backgroundColor = colors.altBackground;
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('all');
  const [expandedRequest, setExpandedRequest] = useState<string>('');

  // Mock data - in real app this would come from API
  const supportRequests: SupportRequest[] = [
    {
      id: '1',
      ticketId: 'CHF789123',
      subject: 'Payment failed during ride booking',
      category: 'Payment & Billing',
      priority: 'high',
      status: 'in-progress',
      createdAt: '2024-09-08T10:30:00Z',
      lastUpdated: '2024-09-08T14:20:00Z',
      description: 'My payment failed when trying to book a ride to the airport. The amount was debited but booking was not confirmed.',
      assignedAgent: 'Priya Sharma',
      responses: [
        {
          id: '1',
          message: 'Thank you for contacting us. We are looking into your payment issue and will resolve it within 24 hours.',
          timestamp: '2024-09-08T11:15:00Z',
          isFromSupport: true,
          agentName: 'Priya Sharma'
        },
        {
          id: '2',
          message: 'We have identified the issue with your payment. The amount will be refunded within 3-5 business days. You can try booking again.',
          timestamp: '2024-09-08T14:20:00Z',
          isFromSupport: true,
          agentName: 'Priya Sharma'
        }
      ]
    },
    {
      id: '2',
      ticketId: 'CHF789124',
      subject: 'Chauffeur was 30 minutes late',
      category: 'Driver Related',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2024-09-07T16:45:00Z',
      lastUpdated: '2024-09-07T18:30:00Z',
      description: 'My chauffeur for ride RIDE001234 was significantly late without any prior notification.',
      assignedAgent: 'Rajesh Kumar',
      responses: [
        {
          id: '3',
          message: 'We apologize for the inconvenience. We have reviewed the incident and provided feedback to the chauffeur.',
          timestamp: '2024-09-07T17:20:00Z',
          isFromSupport: true,
          agentName: 'Rajesh Kumar'
        },
        {
          id: '4',
          message: 'As a gesture of goodwill, we have credited ₹100 to your account. You can use this for your next ride.',
          timestamp: '2024-09-07T18:30:00Z',
          isFromSupport: true,
          agentName: 'Rajesh Kumar'
        }
      ]
    },
    {
      id: '3',
      ticketId: 'CHF789125',
      subject: 'Unable to update profile information',
      category: 'Account & Profile',
      priority: 'low',
      status: 'open',
      createdAt: '2024-09-06T09:20:00Z',
      lastUpdated: '2024-09-06T09:20:00Z',
      description: 'I am trying to update my phone number in the profile section but getting an error message.',
      responses: []
    },
    {
      id: '4',
      ticketId: 'CHF789126',
      subject: 'App crashes when selecting destination',
      category: 'Technical Support',
      priority: 'medium',
      status: 'closed',
      createdAt: '2024-09-05T14:10:00Z',
      lastUpdated: '2024-09-05T16:45:00Z',
      description: 'The app crashes every time I try to select a destination on the booking screen.',
      assignedAgent: 'Tech Team',
      responses: [
        {
          id: '5',
          message: 'We have identified and fixed the bug. Please update to the latest version of the app from the store.',
          timestamp: '2024-09-05T16:45:00Z',
          isFromSupport: true,
          agentName: 'Tech Team'
        }
      ]
    }
  ];

  const statusFilters = [
    { id: 'all', label: 'All', count: supportRequests.length },
    { id: 'open', label: 'Open', count: supportRequests.filter(r => r.status === 'open').length },
    { id: 'in-progress', label: 'In Progress', count: supportRequests.filter(r => r.status === 'in-progress').length },
    { id: 'resolved', label: 'Resolved', count: supportRequests.filter(r => r.status === 'resolved').length },
    { id: 'closed', label: 'Closed', count: supportRequests.filter(r => r.status === 'closed').length }
  ];

  const filteredRequests = useMemo(() => {
    return selectedFilter === 'all' 
      ? supportRequests 
      : supportRequests.filter(request => request.status === selectedFilter);
  }, [selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3B82F6';
      case 'in-progress': return BrandColors.warning;
      case 'resolved': return BrandColors.success;
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return BrandColors.danger;
      case 'medium': return BrandColors.warning;
      case 'low': return BrandColors.success;
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return 'ellipsis-horizontal-circle';
      case 'in-progress': return 'hourglass';
      case 'resolved': return 'checkmark-circle';
      case 'closed': return 'lock-closed';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleRequestToggle = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? '' : requestId);
  };

  const handleAddResponse = (ticketId: string) => {
    Alert.alert('Add Response', 'Feature to add responses will be available soon!');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Request Status</ThemedText>
          </View>
          
          <TouchableOpacity onPress={() => router.push('/(customer)/submit-request')}>
            <Ionicons name="add-circle" size={24} color={BrandColors.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Track Your Support Requests
              </ThemedText>
              <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                View the status of your submitted requests and responses from our support team.
              </ThemedText>
            </View>

            {/* Status Filter */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">Filter by Status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {statusFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      onPress={() => setSelectedFilter(filter.id as StatusFilter)}
                      className={`mr-3 px-4 py-2 rounded-full border ${
                        selectedFilter === filter.id 
                          ? 'bg-burgundy border-burgundy' 
                          : 'bg-transparent border-gray-300 dark:border-gray-600'
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <ThemedText 
                          variant="small" 
                          className={selectedFilter === filter.id ? 'text-white' : 'text-textSecondary dark:text-darkTextSecondary'}
                        >
                          {filter.label}
                        </ThemedText>
                        {filter.count > 0 && (
                          <View 
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: selectedFilter === filter.id ? 'rgba(255,255,255,0.2)' : BrandColors.secondary 
                            }}
                          >
                            <ThemedText 
                              variant="tiny" 
                              className={selectedFilter === filter.id ? 'text-white' : 'text-white'}
                            >
                              {filter.count}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Requests List */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">
                Your Requests ({filteredRequests.length})
              </ThemedText>

              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <ThemedCard key={request.id} variant="elevated" className="mb-4">
                    <TouchableOpacity
                      onPress={() => handleRequestToggle(request.id)}
                      className="p-4"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-start">
                        <View 
                          className="w-12 h-12 rounded-full items-center justify-center mr-4"
                          style={{ backgroundColor: `${getStatusColor(request.status)}20` }}
                        >
                          <Ionicons 
                            name={getStatusIcon(request.status) as any}
                            size={24} 
                            color={getStatusColor(request.status)} 
                          />
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-2">
                            <ThemedText className="font-semibold flex-1 mr-2">
                              {request.subject}
                            </ThemedText>
                            <Ionicons 
                              name={expandedRequest === request.id ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color={iconColor} 
                            />
                          </View>
                          
                          <View className="flex-row items-center mb-2">
                            <View 
                              className="px-2 py-1 rounded-full mr-2"
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
                            
                            <View 
                              className="px-2 py-1 rounded-full"
                              style={{ backgroundColor: `${getPriorityColor(request.priority)}20` }}
                            >
                              <ThemedText 
                                variant="tiny" 
                                className="font-semibold capitalize"
                                style={{ color: getPriorityColor(request.priority) }}
                              >
                                {request.priority} Priority
                              </ThemedText>
                            </View>
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">
                              {formatDate(request.createdAt)} • {formatTime(request.createdAt)}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">
                              #{request.ticketId}
                            </ThemedText>
                          </View>
                          
                          {request.assignedAgent && (
                            <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary mt-1">
                              Assigned to: {request.assignedAgent}
                            </ThemedText>
                          )}
                        </View>
                      </View>

                      {expandedRequest === request.id && (
                        <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          {/* Original Request */}
                          <View className="mb-4">
                            <ThemedText variant="small" className="font-semibold mb-2">
                              Original Request:
                            </ThemedText>
                            <ThemedText variant="small" className="text-gray-700 dark:text-gray-300">
                              {request.description}
                            </ThemedText>
                          </View>

                          {/* Responses */}
                          {request.responses.length > 0 && (
                            <View className="mb-4">
                              <ThemedText variant="small" className="font-semibold mb-3">
                                Support Responses:
                              </ThemedText>
                              
                              {request.responses.map((response) => (
                                <View 
                                  key={response.id} 
                                  className={`mb-3 p-3 rounded-xl ${
                                    response.isFromSupport 
                                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                                      : 'bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  <View className="flex-row items-center mb-2">
                                    <Ionicons 
                                      name={response.isFromSupport ? "person-circle" : "person"} 
                                      size={16} 
                                      color={response.isFromSupport ? BrandColors.info : "#6B7280"} 
                                    />
                                    <ThemedText variant="tiny" className="ml-2 font-semibold">
                                      {response.isFromSupport 
                                        ? `${response.agentName} (Support)` 
                                        : 'You'
                                      }
                                    </ThemedText>
                                    <ThemedText variant="tiny" className="ml-auto text-textSecondary dark:text-darkTextSecondary">
                                      {formatDate(response.timestamp)} • {formatTime(response.timestamp)}
                                    </ThemedText>
                                  </View>
                                  <ThemedText variant="small" className="text-gray-700 dark:text-gray-300">
                                    {response.message}
                                  </ThemedText>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Action Buttons */}
                          <View className="flex-row space-x-3">
                            {request.status !== 'closed' && (
                              <TouchableOpacity 
                                className="flex-1 bg-burgundy py-2 rounded-lg mr-2"
                                onPress={() => handleAddResponse(request.ticketId)}
                                activeOpacity={0.8}
                              >
                                <ThemedText className="text-white text-center font-semibold">
                                  Add Response
                                </ThemedText>
                              </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                              className="flex-1 border border-burgundy py-2 rounded-lg ml-2"
                              onPress={() => setExpandedRequest('')}
                              activeOpacity={0.8}
                            >
                              <ThemedText className="text-burgundy text-center font-semibold">
                                Close
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </ThemedCard>
                ))
              ) : (
                <ThemedCard className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                    <Ionicons name="document-text-outline" size={32} color="#6B7280" />
                  </View>
                  <ThemedText variant="h3" className="mb-2">
                    No Requests Found
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center mb-4">
                    {selectedFilter === 'all' 
                      ? "You haven't submitted any support requests yet."
                      : `No ${selectedFilter.replace('-', ' ')} requests found.`
                    }
                  </ThemedText>
                  <TouchableOpacity 
                    className="bg-burgundy px-6 py-3 rounded-xl"
                    onPress={() => router.push('/(customer)/submit-request')}
                  >
                    <ThemedText className="text-white font-semibold">
                      Submit New Request
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedCard>
              )}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}