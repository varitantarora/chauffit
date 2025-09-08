import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
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
  type: 'card' | 'upi' | 'wallet' | 'cash';
  title: string;
  subtitle: string;
  icon: string;
  isDefault: boolean;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  network?: string;
}

export default function PaymentMethodsScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#F5F5F0';
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      title: 'Visa ****1234',
      subtitle: 'Expires 12/26',
      icon: 'card',
      isDefault: true,
      last4: '1234',
      expiryMonth: '12',
      expiryYear: '26',
      network: 'Visa'
    },
    {
      id: '2',
      type: 'upi',
      title: 'UPI Payment',
      subtitle: 'rajesh@paytm',
      icon: 'phone-portrait',
      isDefault: false
    },
    {
      id: '3',
      type: 'wallet',
      title: 'Paytm Wallet',
      subtitle: 'Balance: ₹2,450',
      icon: 'wallet',
      isDefault: false
    },
    {
      id: '4',
      type: 'cash',
      title: 'Cash Payment',
      subtitle: 'Pay directly to driver',
      icon: 'cash',
      isDefault: false
    }
  ]);

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedForDeletion([]);
  };

  const toggleSelectionForDeletion = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault || method?.type === 'cash') {
      return; // Cannot select default or cash payment
    }

    setSelectedForDeletion(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedMethods = () => {
    if (selectedForDeletion.length === 0) return;

    const methodNames = selectedForDeletion
      .map(id => paymentMethods.find(m => m.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    Alert.alert(
      'Delete Payment Methods',
      `Are you sure you want to delete: ${methodNames}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => 
              prev.filter(m => !selectedForDeletion.includes(m.id))
            );
            setIsDeleteMode(false);
            setSelectedForDeletion([]);
          }
        }
      ]
    );
  };

  const addPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit/Debit Card', onPress: () => addCard() },
        { text: 'UPI', onPress: () => addUPI() },
        { text: 'Wallet', onPress: () => addWallet() }
      ]
    );
  };

  const addCard = () => {
    Alert.alert('Add Card', 'Credit/Debit card addition form coming soon!');
  };

  const addUPI = () => {
    Alert.alert('Add UPI', 'UPI setup form coming soon!');
  };

  const addWallet = () => {
    Alert.alert('Add Wallet', 'Digital wallet setup coming soon!');
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card': return 'card';
      case 'upi': return 'phone-portrait';
      case 'wallet': return 'wallet';
      case 'cash': return 'cash';
      default: return 'card';
    }
  };

  const getNetworkIcon = (network?: string) => {
    // In a real app, you'd have actual brand icons
    return 'card';
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
            <ThemedText variant="h2">Payment Methods</ThemedText>
          </View>
          
          {!isDeleteMode ? (
            <TouchableOpacity onPress={toggleDeleteMode}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={toggleDeleteMode} className="mr-4">
                <ThemedText className="text-gray-600">Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={deleteSelectedMethods}
                disabled={selectedForDeletion.length === 0}
                style={{ opacity: selectedForDeletion.length === 0 ? 0.5 : 1 }}
              >
                <ThemedText className="text-red-600 font-semibold">
                  Delete ({selectedForDeletion.length})
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-6">
            {/* Header Info */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-2">
                Manage Payment Methods
              </ThemedText>
              <ThemedText variant="small" className="text-gray-600">
                Add, edit, or remove payment methods for your rides. Your default method will be used automatically.
              </ThemedText>
            </View>

            {/* Add Payment Method Button */}
            <PrimaryButton
              title="Add New Payment Method"
              onPress={addPaymentMethod}
              className="mb-6"
              icon="add"
            />

            {/* Payment Methods List */}
            <ThemedCard variant="elevated" className="mb-6">
              <View className="p-6 pb-0">
                <ThemedText variant="h3" className="mb-4">
                  Your Payment Methods
                </ThemedText>
              </View>

              {paymentMethods.map((method, index) => (
                <View key={method.id}>
                  <TouchableOpacity
                    className="p-6 py-4"
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isDeleteMode) {
                        toggleSelectionForDeletion(method.id);
                      } else if (!method.isDefault) {
                        setDefaultPayment(method.id);
                      }
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-secondary/10 rounded-full items-center justify-center mr-4">
                        <Ionicons 
                          name={getPaymentIcon(method.type) as any} 
                          size={24} 
                          color="#BD8C5E" 
                        />
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <ThemedText className="font-semibold mr-2">
                            {method.title}
                          </ThemedText>
                          {method.isDefault && (
                            <View className="bg-burgundy px-2 py-1 rounded-full">
                              <ThemedText variant="tiny" className="text-white font-semibold">
                                DEFAULT
                              </ThemedText>
                            </View>
                          )}
                          {method.type === 'cash' && (
                            <View className="bg-gray-200 px-2 py-1 rounded-full ml-2">
                              <ThemedText variant="tiny" className="text-gray-600 font-semibold">
                                SYSTEM
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText variant="small" className="text-gray-600 mt-1">
                          {method.subtitle}
                        </ThemedText>
                      </View>

                      <View className="flex-row items-center">
                        {isDeleteMode ? (
                          <TouchableOpacity
                            onPress={() => toggleSelectionForDeletion(method.id)}
                            className="p-2"
                            disabled={method.isDefault || method.type === 'cash'}
                            style={{ 
                              opacity: (method.isDefault || method.type === 'cash') ? 0.3 : 1 
                            }}
                          >
                            <Ionicons 
                              name={selectedForDeletion.includes(method.id) ? "radio-button-on" : "radio-button-off"} 
                              size={24} 
                              color={selectedForDeletion.includes(method.id) ? "#EF4444" : "#BD8C5E"} 
                            />
                          </TouchableOpacity>
                        ) : (
                          !method.isDefault && (
                            <TouchableOpacity
                              onPress={() => setDefaultPayment(method.id)}
                              className="p-2"
                            >
                              <Ionicons name="radio-button-off" size={20} color="#BD8C5E" />
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {index < paymentMethods.length - 1 && (
                    <View className="border-b border-gray-100 dark:border-gray-700 mx-6" />
                  )}
                </View>
              ))}
            </ThemedCard>

            {/* Payment Security */}
            <ThemedCard variant="elevated" className="mb-6 p-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <ThemedText variant="h3">Secure Payments</ThemedText>
                  <ThemedText variant="small" className="text-gray-600 mt-1">
                    Your payment information is encrypted and secure
                  </ThemedText>
                </View>
              </View>

              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <ThemedText variant="small" className="ml-2 text-gray-700">
                    256-bit SSL encryption
                  </ThemedText>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <ThemedText variant="small" className="ml-2 text-gray-700">
                    PCI DSS compliant
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <ThemedText variant="small" className="ml-2 text-gray-700">
                    No card details stored on device
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Payment History */}
            <ThemedCard variant="elevated" className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText variant="h3">Recent Transactions</ThemedText>
                <TouchableOpacity onPress={() => router.push('/(customer)/transactions')}>
                  <ThemedText variant="small" className="text-burgundy">View All</ThemedText>
                </TouchableOpacity>
              </View>

              {[
                { date: 'Today', amount: '₹850', status: 'Completed', method: 'Visa ****1234' },
                { date: 'Yesterday', amount: '₹1,200', status: 'Completed', method: 'UPI' },
                { date: '3 days ago', amount: '₹650', status: 'Completed', method: 'Paytm Wallet' }
              ].map((transaction, index) => (
                <View key={index} className="flex-row items-center justify-between py-3">
                  <View className="flex-1">
                    <ThemedText className="font-semibold">{transaction.amount}</ThemedText>
                    <ThemedText variant="small" className="text-gray-600">
                      {transaction.date} • {transaction.method}
                    </ThemedText>
                  </View>
                  <View className="items-end">
                    <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      <ThemedText variant="tiny" className="text-green-700 font-semibold">
                        {transaction.status}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </ThemedCard>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}