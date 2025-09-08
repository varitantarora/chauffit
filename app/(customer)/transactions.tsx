import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
  description: string;
  transactionId: string;
  rideId?: string;
}

type FilterPeriod = 'all' | '7days' | '30days' | '90days' | '1year';

export default function TransactionsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';

  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('30days');

  // Sample transaction data
  const allTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-09-08T14:30:00Z',
      amount: 850,
      status: 'completed',
      method: 'Visa ****1234',
      description: 'Airport Transfer - IGI to Home',
      transactionId: 'TXN001234567',
      rideId: 'RIDE001'
    },
    {
      id: '2',
      date: '2024-09-07T09:15:00Z',
      amount: 1200,
      status: 'completed',
      method: 'UPI - rajesh@paytm',
      description: 'Business Meeting - Gurgaon',
      transactionId: 'TXN001234566',
      rideId: 'RIDE002'
    },
    {
      id: '3',
      date: '2024-09-05T16:45:00Z',
      amount: 650,
      status: 'completed',
      method: 'Paytm Wallet',
      description: 'City Tour - 4 hours',
      transactionId: 'TXN001234565',
      rideId: 'RIDE003'
    },
    {
      id: '4',
      date: '2024-09-03T11:20:00Z',
      amount: 2500,
      status: 'completed',
      method: 'Cash Payment',
      description: 'Wedding Service - Full Day',
      transactionId: 'TXN001234564',
      rideId: 'RIDE004'
    },
    {
      id: '5',
      date: '2024-09-01T08:00:00Z',
      amount: 750,
      status: 'refunded',
      method: 'Visa ****1234',
      description: 'Cancelled Ride Refund',
      transactionId: 'TXN001234563',
    },
    {
      id: '6',
      date: '2024-08-28T19:30:00Z',
      amount: 900,
      status: 'completed',
      method: 'UPI - rajesh@paytm',
      description: 'Evening Ride - Dinner',
      transactionId: 'TXN001234562',
      rideId: 'RIDE005'
    },
    {
      id: '7',
      date: '2024-08-25T13:10:00Z',
      amount: 450,
      status: 'failed',
      method: 'Visa ****1234',
      description: 'Payment Failed - Retry Successful',
      transactionId: 'TXN001234561',
    },
    {
      id: '8',
      date: '2024-08-20T10:45:00Z',
      amount: 1800,
      status: 'completed',
      method: 'Cash Payment',
      description: 'Airport Transfer - Multiple Stops',
      transactionId: 'TXN001234560',
      rideId: 'RIDE006'
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Time', days: 0 },
    { id: '7days', label: 'Last 7 Days', days: 7 },
    { id: '30days', label: 'Last 30 Days', days: 30 },
    { id: '90days', label: 'Last 3 Months', days: 90 },
    { id: '1year', label: 'Last Year', days: 365 }
  ];

  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return allTransactions;
    
    const filterDays = filterOptions.find(f => f.id === selectedPeriod)?.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    
    return allTransactions.filter(transaction => 
      new Date(transaction.date) >= cutoffDate
    );
  }, [selectedPeriod]);

  const totalAmount = useMemo(() => {
    return filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      case 'refunded': return 'refresh';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1" style={{ backgroundColor }}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="h2">Transaction History</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Summary Card */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <View className="items-center">
                <ThemedText variant="small" className="text-gray-600 mb-2">
                  Total Spent ({filterOptions.find(f => f.id === selectedPeriod)?.label})
                </ThemedText>
                <ThemedText variant="h1" className="text-burgundy mb-4">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </ThemedText>
                
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <Ionicons name="trending-up" size={16} color="#10B981" />
                  <ThemedText variant="small" className="ml-2 text-green-600">
                    {filteredTransactions.filter(t => t.status === 'completed').length} completed rides
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Filter Buttons */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">Filter by Period</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedPeriod(option.id as FilterPeriod)}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      selectedPeriod === option.id 
                        ? 'bg-burgundy border-burgundy' 
                        : 'bg-transparent border-gray-300 dark:border-gray-600'
                    }`}
                    activeOpacity={0.7}
                  >
                    <ThemedText 
                      variant="small" 
                      className={selectedPeriod === option.id ? 'text-white' : 'text-gray-600'}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Transactions List */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText variant="h3">
                  Transactions ({filteredTransactions.length})
                </ThemedText>
              </View>

              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <ThemedCard key={transaction.id} className="mb-3">
                    <TouchableOpacity className="p-4" activeOpacity={0.7}>
                      <View className="flex-row items-center">
                        <View 
                          className="w-12 h-12 rounded-full items-center justify-center mr-4"
                          style={{ backgroundColor: `${getStatusColor(transaction.status)}20` }}
                        >
                          <Ionicons 
                            name={getStatusIcon(transaction.status) as any}
                            size={24} 
                            color={getStatusColor(transaction.status)} 
                          />
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-1">
                            <ThemedText className="font-semibold">
                              ₹{transaction.amount.toLocaleString('en-IN')}
                            </ThemedText>
                            <View 
                              className="px-2 py-1 rounded-full"
                              style={{ backgroundColor: `${getStatusColor(transaction.status)}20` }}
                            >
                              <ThemedText 
                                variant="tiny" 
                                className="font-semibold capitalize"
                                style={{ color: getStatusColor(transaction.status) }}
                              >
                                {transaction.status}
                              </ThemedText>
                            </View>
                          </View>
                          
                          <ThemedText variant="small" className="text-gray-800 dark:text-gray-200 mb-1">
                            {transaction.description}
                          </ThemedText>
                          
                          <View className="flex-row items-center justify-between">
                            <ThemedText variant="small" className="text-gray-600">
                              {formatDate(transaction.date)} • {formatTime(transaction.date)}
                            </ThemedText>
                            <ThemedText variant="tiny" className="text-gray-500">
                              {transaction.method}
                            </ThemedText>
                          </View>
                          
                          <ThemedText variant="tiny" className="text-gray-400 mt-1">
                            ID: {transaction.transactionId}
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </ThemedCard>
                ))
              ) : (
                <ThemedCard className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                    <Ionicons name="receipt-outline" size={32} color="#6B7280" />
                  </View>
                  <ThemedText variant="h3" className="mb-2">
                    No Transactions Found
                  </ThemedText>
                  <ThemedText variant="small" className="text-gray-600 text-center">
                    No transactions found for the selected period.
                  </ThemedText>
                </ThemedCard>
              )}
            </View>

            {/* Export Options */}
            <ThemedCard variant="elevated" className="p-6">
              <ThemedText variant="h3" className="mb-4">
                Export Transactions
              </ThemedText>
              
              <View className="space-y-3">
                <TouchableOpacity 
                  className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                      <Ionicons name="document-text" size={20} color="#10B981" />
                    </View>
                    <ThemedText>Download as PDF</ThemedText>
                  </View>
                  <Ionicons name="download" size={20} color="#BD8C5E" />
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-row items-center justify-between py-3"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
                      <Ionicons name="mail" size={20} color="#3B82F6" />
                    </View>
                    <ThemedText>Email Statement</ThemedText>
                  </View>
                  <Ionicons name="send" size={20} color="#BD8C5E" />
                </TouchableOpacity>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}