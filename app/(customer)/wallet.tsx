import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'cash';
  title: string;
  subtitle: string;
  icon: string;
  isDefault?: boolean;
}

interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [walletBalance, setWalletBalance] = useState(1250);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      title: 'Visa ****1234',
      subtitle: 'Expires: 12/26',
      icon: 'card',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      title: 'Mastercard ****5678',
      subtitle: 'Expires: 08/25',
      icon: 'card',
    },
    {
      id: '3',
      type: 'upi',
      title: 'UPI: sarah@okicici',
      subtitle: 'Linked to ICICI Bank',
      icon: 'phone-portrait',
    },
    {
      id: '4',
      type: 'cash',
      title: 'Cash Payment',
      subtitle: 'Pay driver directly',
      icon: 'cash',
    },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'debit',
      description: 'Trip to Office',
      amount: 650,
      date: 'Today',
      status: 'completed',
    },
    {
      id: '2',
      type: 'credit',
      description: 'Wallet topup',
      amount: 1000,
      date: 'Yesterday',
      status: 'completed',
    },
    {
      id: '3',
      type: 'debit',
      description: 'Airport trip',
      amount: 1200,
      date: '2 days ago',
      status: 'completed',
    },
    {
      id: '4',
      type: 'debit',
      description: 'Shopping mall',
      amount: 450,
      date: '3 days ago',
      status: 'completed',
    },
  ];

  const handleAddMoney = () => {
    setShowAddMoney(true);
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw Money', 'Withdrawal functionality would be implemented here.');
  };

  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'Add new payment method functionality would be implemented here.');
  };

  const handleRemovePaymentMethod = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove',
          style: 'destructive',
          onPress: () => Alert.alert('Removed', 'Payment method has been removed.')
        }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    Alert.alert('Set Default', `Payment method has been set as default.`);
  };

  const handlePayNow = () => {
    Alert.alert('Pay Now', 'Quick payment functionality would be implemented here.');
  };

  const confirmAddMoney = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to add.');
      return;
    }

    const amount = parseFloat(addAmount);
    setWalletBalance(prev => prev + amount);
    setAddAmount('');
    setShowAddMoney(false);
    Alert.alert('Success', `₹${amount} has been added to your wallet.`);
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return method.title.includes('Visa') ? 'card' : 'card';
      case 'upi':
        return 'phone-portrait';
      case 'cash':
        return 'cash';
      default:
        return 'card';
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    return transaction.type === 'credit' ? 'add-circle' : 'remove-circle';
  };

  const getTransactionColor = (transaction: Transaction) => {
    return transaction.type === 'credit' ? '#059669' : '#DC2626';
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Wallet</ThemedText>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Wallet Balance Card */}
            <ThemedCard variant="elevated" className="mb-6">
              <ThemedText variant="h3" className="mb-2">💰 Wallet Balance</ThemedText>
              <ThemedText variant="h1" className="text-burgundy mb-4">₹{walletBalance.toFixed(2)}</ThemedText>
              
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  onPress={handleAddMoney}
                  className="flex-1 mr-2 bg-green-600 py-3 rounded-xl"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="add" size={20} color="white" />
                    <ThemedText className="text-white ml-2">Add Money</ThemedText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleWithdraw}
                  className="flex-1 ml-2 border border-gray-300 py-3 rounded-xl"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="arrow-up" size={20} color={iconColor} />
                    <ThemedText className="ml-2">Withdraw</ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </ThemedCard>

            {/* Payment Methods */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-4">💳 Payment Methods</ThemedText>
              
              {paymentMethods.map((method) => (
                <ThemedCard key={method.id} className="mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-8 bg-gray-200 rounded items-center justify-center mr-3">
                        <Ionicons name={getPaymentIcon(method) as any} size={20} color={iconColor} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <ThemedText>{method.title}</ThemedText>
                          {method.isDefault && (
                            <View className="ml-2 px-2 py-1 bg-burgundy rounded">
                              <ThemedText variant="small" className="text-white">Default</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText variant="small" className="text-gray-600">{method.subtitle}</ThemedText>
                      </View>
                    </View>
                    
                    <View className="flex-row">
                      {!method.isDefault && method.type !== 'cash' && (
                        <TouchableOpacity 
                          onPress={() => handleSetDefault(method.id)}
                          className="mr-3"
                        >
                          <ThemedText variant="small" className="text-burgundy">Set Default</ThemedText>
                        </TouchableOpacity>
                      )}
                      
                      {method.type !== 'cash' && (
                        <TouchableOpacity onPress={() => handleRemovePaymentMethod(method.id)}>
                          <ThemedText variant="small" className="text-red-600">Remove</ThemedText>
                        </TouchableOpacity>
                      )}
                      
                      {method.type === 'cash' && (
                        <ThemedText variant="small" className="text-green-600">Available</ThemedText>
                      )}
                    </View>
                  </View>
                </ThemedCard>
              ))}

              <TouchableOpacity 
                onPress={handleAddPaymentMethod}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 items-center"
              >
                <Ionicons name="add-circle-outline" size={24} color={iconColor} />
                <ThemedText className="mt-2">Add New Payment Method</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h3">📊 Recent Transactions</ThemedText>
                <TouchableOpacity>
                  <ThemedText variant="small" className="text-burgundy">More</ThemedText>
                </TouchableOpacity>
              </View>

              {recentTransactions.slice(0, 4).map((transaction) => (
                <ThemedCard key={transaction.id} className="mb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${getTransactionColor(transaction)}20` }}
                      >
                        <Ionicons 
                          name={getTransactionIcon(transaction) as any} 
                          size={20} 
                          color={getTransactionColor(transaction)} 
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText>{transaction.description}</ThemedText>
                        <ThemedText variant="small" className="text-gray-600">{transaction.date}</ThemedText>
                      </View>
                    </View>
                    
                    <ThemedText 
                      className="font-semibold"
                      style={{ color: getTransactionColor(transaction) }}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </ThemedText>
                  </View>
                </ThemedCard>
              ))}

              <TouchableOpacity className="py-3">
                <ThemedText className="text-center text-burgundy">View All Transactions</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={handleSetDefault}
                className="flex-1 mr-2 py-3 border border-gray-300 rounded-xl"
              >
                <ThemedText className="text-center">Set Default Payment</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handlePayNow}
                className="flex-1 ml-2 bg-burgundy py-3 rounded-xl"
              >
                <ThemedText className="text-center text-white">Pay Now</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Add Money Modal */}
        {showAddMoney && (
          <View className="absolute inset-0 bg-black/50 flex-1 justify-center px-6">
            <ThemedCard variant="elevated" className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText variant="h2">Add Money</ThemedText>
                <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ThemedText className="mb-4">Enter amount to add to wallet:</ThemedText>
              
              <TextInput
                className={`border border-gray-300 rounded-xl p-4 mb-4 text-lg ${
                  isDarkMode ? 'bg-darkSurface text-darkText' : 'bg-white'
                }`}
                placeholder="₹ 0.00"
                placeholderTextColor="#9CA3AF"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="numeric"
              />

              <View className="flex-row mb-4">
                {[100, 500, 1000, 2000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => setAddAmount(amount.toString())}
                    className="flex-1 mx-1 py-2 border border-gray-300 rounded-lg"
                  >
                    <ThemedText variant="small" className="text-center">₹{amount}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton
                title="Add Money"
                onPress={confirmAddMoney}
                className="mb-3"
              />
              
              <TouchableOpacity 
                onPress={() => setShowAddMoney(false)}
                className="py-3"
              >
                <ThemedText className="text-center text-gray-600">Cancel</ThemedText>
              </TouchableOpacity>
            </ThemedCard>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}