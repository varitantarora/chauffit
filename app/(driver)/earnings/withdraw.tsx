import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

interface WithdrawalMethod {
  id: string;
  type: 'bank' | 'upi' | 'instant';
  name: string;
  icon: string;
  details: string;
  processingTime: string;
  fee: string;
  minimum: number;
  maximum?: number;
  recommended?: boolean;
}

interface WithdrawalHistory {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export default function WithdrawEarningsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [selectedMethod, setSelectedMethod] = useState<string>('bank');
  const [amount, setAmount] = useState<string>('5000');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableBalance = 8750.50;
  const instantBalance = 2500.00;

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer (Recommended)',
      icon: 'card',
      details: 'Account: ICICI Bank ****4567',
      processingTime: '1-2 business days',
      fee: 'Free',
      minimum: 100,
      recommended: true
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI Instant Transfer',
      icon: 'phone-portrait',
      details: 'UPI ID: marcus@okicici',
      processingTime: 'Instant',
      fee: '₹5 per transaction',
      minimum: 50,
      maximum: 25000
    }
  ];

  const withdrawalHistory: WithdrawalHistory[] = [
    { id: '1', date: 'Mar 18', amount: 3250.00, status: 'completed' },
    { id: '2', date: 'Mar 15', amount: 4100.00, status: 'completed' },
    { id: '3', date: 'Mar 12', amount: 2850.00, status: 'completed' }
  ];

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    const method = withdrawalMethods.find(m => m.id === selectedMethod);
    
    if (!method) return;
    
    if (withdrawAmount < method.minimum) {
      Alert.alert('Invalid Amount', `Minimum withdrawal amount is ₹${method.minimum}`);
      return;
    }
    
    if (method.maximum && withdrawAmount > method.maximum) {
      Alert.alert('Invalid Amount', `Maximum withdrawal amount is ₹${method.maximum.toLocaleString('en-IN')}`);
      return;
    }
    
    if (withdrawAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have sufficient balance for this withdrawal.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Withdrawal Requested',
        `Your withdrawal of ₹${withdrawAmount.toLocaleString('en-IN')} has been submitted successfully. ${method.processingTime === 'Instant' ? 'You will receive the amount instantly.' : `Processing time: ${method.processingTime}`}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-danger';
      default: return 'text-secondary';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            Withdraw Earnings
          </ThemedText>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Available Balance */}
          <View className="px-6 py-6 bg-burgundy">
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <Ionicons name="wallet" size={24} color="white" />
                <ThemedText className="text-white ml-2">Available Balance</ThemedText>
              </View>
              <ThemedText className="text-white text-3xl font-bold">
                ₹{availableBalance.toLocaleString('en-IN')}
              </ThemedText>
            </View>
          </View>

          <View className="px-6">
            {/* Withdrawal Options Header */}
            <View className="py-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="card" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold ml-2">WITHDRAWAL OPTIONS</ThemedText>
              </View>

              {/* Withdrawal Methods */}
              <View className="space-y-4 mb-6">
                {withdrawalMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    className={`border-2 rounded-lg ${
                      selectedMethod === method.id 
                        ? 'border-burgundy bg-burgundy/5' 
                        : 'border-border dark:border-darkBorder bg-surface dark:bg-darkSurface'
                    }`}
                  >
                    <ThemedCard className="p-4 bg-transparent">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <Ionicons 
                            name={method.icon as any} 
                            size={20} 
                            color={selectedMethod === method.id ? "#720C17" : "#BD8C5E"} 
                          />
                          <ThemedText className={`font-bold ml-3 ${selectedMethod === method.id ? 'text-burgundy' : ''}`}>
                            {method.name}
                          </ThemedText>
                        </View>
                        {selectedMethod === method.id && (
                          <Ionicons name="checkmark-circle" size={20} color="#720C17" />
                        )}
                      </View>
                      
                      <View className="space-y-1">
                        <ThemedText variant="secondary">{method.details}</ThemedText>
                        <ThemedText variant="caption">Processing: {method.processingTime}</ThemedText>
                        <ThemedText variant="caption">Fee: {method.fee}</ThemedText>
                        <ThemedText variant="caption">
                          Minimum: ₹{method.minimum}
                          {method.maximum && ` • Maximum: ₹${method.maximum.toLocaleString('en-IN')} per day`}
                        </ThemedText>
                      </View>

                      {selectedMethod === method.id && (
                        <View className="mt-4 pt-4 border-t border-burgundy/20">
                          <ThemedText className="mb-2">Amount: ₹</ThemedText>
                          <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            className="border border-burgundy rounded-lg px-3 py-2 text-lg font-bold"
                            style={{ color: isDarkMode ? '#d9d1c6' : '#720C17' }}
                          />
                        </View>
                      )}
                    </ThemedCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Instant Withdrawal Option */}
            <View className="py-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="flash" size={20} color="#BD8C5E" />
                <ThemedText className="font-bold ml-2">INSTANT WITHDRAWAL</ThemedText>
              </View>

              <ThemedCard className="p-4 mb-6 bg-warning/10 border border-warning/20">
                <View className="space-y-2">
                  <ThemedText className="font-semibold">Available for premium drivers</ThemedText>
                  <View className="flex-row justify-between">
                    <ThemedText>Balance:</ThemedText>
                    <ThemedText className="font-bold text-warning">
                      ₹{instantBalance.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" className="text-secondary">
                    Fee: 2% of amount
                  </ThemedText>
                </View>
              </ThemedCard>
            </View>

            {/* Withdrawal History */}
            <View className="py-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#BD8C5E" />
                  <ThemedText className="font-bold ml-2">WITHDRAWAL HISTORY</ThemedText>
                </View>
                <TouchableOpacity>
                  <ThemedText className="text-burgundy">More</ThemedText>
                </TouchableOpacity>
              </View>

              <View className="space-y-3 mb-6">
                {withdrawalHistory.map((item) => (
                  <ThemedCard key={item.id} className="p-3">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <ThemedText className="font-semibold">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          {item.date}
                        </ThemedText>
                      </View>
                      <ThemedText className={`font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </ThemedText>
                    </View>
                  </ThemedCard>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="pb-6">
              <PrimaryButton
                title={isProcessing ? "Processing..." : "Request Withdrawal"}
                onPress={handleWithdraw}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="mb-4"
              />
              
              <TouchableOpacity
                onPress={() => router.push('/(driver)/earnings/advance')}
                className="bg-secondary py-4 rounded-lg"
              >
                <ThemedText className="text-white font-semibold text-center">
                  Request Advance
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}