import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { PaymentMethod } from '../../types/navigation';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  onAddNew?: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethod,
  onSelect,
  onAddNew,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return method.cardType === 'Visa' ? 'card' : 
               method.cardType === 'Mastercard' ? 'card' : 'card';
      case 'upi':
        return 'logo-google';
      case 'wallet':
        return 'wallet';
      case 'cash':
        return 'cash';
      default:
        return 'card';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.cardType} ****${method.last4}`;
      case 'upi':
        return method.upiId;
      case 'wallet':
        return `${method.walletProvider} Wallet`;
      case 'cash':
        return 'Cash Payment';
      default:
        return 'Payment Method';
    }
  };

  const getPaymentMethodDescription = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return 'Pay with card';
      case 'upi':
        return 'UPI Payment';
      case 'wallet':
        return 'Digital wallet';
      case 'cash':
        return 'Pay in cash';
      default:
        return '';
    }
  };

  return (
    <View className="space-y-3">
      {methods.map((method) => (
        <TouchableOpacity
          key={method.id}
          onPress={() => onSelect(method)}
          className={`flex-row items-center p-4 rounded-xl border ${
            selectedMethod?.id === method.id
              ? 'bg-secondary/10 border-secondary'
              : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
          }`}
        >
          {/* Payment Method Icon */}
          <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
            <Ionicons 
              name={getPaymentMethodIcon(method) as any} 
              size={24} 
              color="#BD8C5E" 
            />
          </View>
          
          {/* Payment Method Details */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <ThemedText variant="body" className="font-semibold">
                {getPaymentMethodLabel(method)}
              </ThemedText>
              {method.isDefault && (
                <View className="bg-burgundy px-2 py-1 rounded-full ml-2">
                  <ThemedText variant="tiny" className="text-white font-semibold">
                    DEFAULT
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText variant="small" className="text-textSecondary">
              {getPaymentMethodDescription(method)}
            </ThemedText>
          </View>
          
          {/* Selection Indicator */}
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            selectedMethod?.id === method.id
              ? 'border-secondary bg-secondary'
              : 'border-textSecondary'
          }`}>
            {selectedMethod?.id === method.id && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      {/* Add New Payment Method */}
      {onAddNew && (
        <TouchableOpacity
          onPress={onAddNew}
          className={`flex-row items-center p-4 rounded-xl border-2 border-dashed ${
            isDarkMode 
              ? 'border-darkBorder bg-darkSurface' 
              : 'border-border bg-surface'
          }`}
        >
          <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="add" size={24} color="#BD8C5E" />
          </View>
          
          <View className="flex-1">
            <ThemedText variant="body" className="font-semibold text-secondary">
              Add New Payment Method
            </ThemedText>
            <ThemedText variant="small" className="text-textSecondary">
              Add a card, UPI, or wallet
            </ThemedText>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#BD8C5E" />
        </TouchableOpacity>
      )}
    </View>
  );
};