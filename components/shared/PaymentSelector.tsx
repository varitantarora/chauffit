import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightColors } from '../../constants/Colors';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cash' | 'netbanking';
  displayName: string;
  lastFour?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'rupay';
  upiId?: string;
  walletProvider?: 'paytm' | 'phonepe' | 'googlepay' | 'mobikwik';
  isDefault: boolean;
  isEnabled: boolean;
}

interface PaymentSelectorProps {
  className?: string;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod?: PaymentMethod;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onAddPaymentMethod: () => void;
  showAddButton?: boolean;
  allowCash?: boolean;
  allowUPI?: boolean;
  allowWallets?: boolean;
  allowCards?: boolean;
  allowNetBanking?: boolean;
  indianPayments?: boolean;
  style?: any;
}

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (method: Partial<PaymentMethod>) => void;
  indianPayments?: boolean;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  visible,
  onClose,
  onAdd,
  indianPayments = true,
}) => {
  const [selectedType, setSelectedType] = useState<PaymentMethod['type']>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const paymentTypes = [
    { type: 'card' as const, name: 'Credit/Debit Card', icon: 'card' },
    ...(indianPayments ? [
      { type: 'upi' as const, name: 'UPI', icon: 'phone-portrait' },
      { type: 'wallet' as const, name: 'Digital Wallet', icon: 'wallet' },
      { type: 'netbanking' as const, name: 'Net Banking', icon: 'globe' },
    ] : []),
    { type: 'cash' as const, name: 'Cash', icon: 'cash' },
  ];

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      let newMethod: Partial<PaymentMethod> = {
        type: selectedType,
        isDefault: false,
        isEnabled: true,
      };

      switch (selectedType) {
        case 'card':
          if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
            Alert.alert('Error', 'Please fill all card details');
            return;
          }
          newMethod = {
            ...newMethod,
            displayName: `**** ${cardNumber.slice(-4)}`,
            lastFour: cardNumber.slice(-4),
            cardBrand: getCardBrand(cardNumber),
          };
          break;
        case 'upi':
          if (!upiId) {
            Alert.alert('Error', 'Please enter UPI ID');
            return;
          }
          newMethod = {
            ...newMethod,
            displayName: upiId,
            upiId,
          };
          break;
        case 'cash':
          newMethod = {
            ...newMethod,
            displayName: 'Cash Payment',
          };
          break;
        default:
          newMethod = {
            ...newMethod,
            displayName: `${selectedType.charAt(0).toUpperCase()}${selectedType.slice(1)}`,
          };
      }

      onAdd(newMethod);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setIsAdding(false);
    }
  };

  const getCardBrand = (number: string): PaymentMethod['cardBrand'] => {
    const firstDigit = number.charAt(0);
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'rupay';
    return 'visa';
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return text;
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={LightColors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Add Payment Method</Text>
          <TouchableOpacity 
            onPress={handleAdd}
            disabled={isAdding}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: LightColors.secondary }}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {/* Payment Type Selection */}
          <Text className="text-base font-medium text-black mb-3">Payment Type</Text>
          <View className="flex-row flex-wrap mb-6">
            {paymentTypes.map((type) => (
              <TouchableOpacity
                key={type.type}
                className={`flex-row items-center mr-4 mb-2 px-3 py-2 rounded-lg border ${
                  selectedType === type.type 
                    ? 'border-secondary bg-secondary/10' 
                    : 'border-border dark:border-darkBorder'
                }`}
                onPress={() => setSelectedType(type.type)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={16} 
                  color={selectedType === type.type ? LightColors.secondary : LightColors.textSecondary}
                />
                <Text 
                  className={`ml-2 ${selectedType === type.type ? 'text-secondary font-medium' : 'text-textSecondary dark:text-darkTextSecondary'}`}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Card Details Form */}
          {selectedType === 'card' && (
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-black mb-2">Card Number</Text>
                <TextInput
                  className="border border-border dark:border-darkBorder rounded-lg px-3 py-3 text-base"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-black mb-2">Expiry Date</Text>
                  <TextInput
                    className="border border-border dark:border-darkBorder rounded-lg px-3 py-3 text-base"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-sm font-medium text-black mb-2">CVV</Text>
                  <TextInput
                    className="border border-border dark:border-darkBorder rounded-lg px-3 py-3 text-base"
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View>
                <Text className="text-sm font-medium text-black mb-2">Cardholder Name</Text>
                <TextInput
                  className="border border-border dark:border-darkBorder rounded-lg px-3 py-3 text-base"
                  placeholder="John Doe"
                  value={cardHolderName}
                  onChangeText={setCardHolderName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* UPI ID Form */}
          {selectedType === 'upi' && (
            <View>
              <Text className="text-sm font-medium text-black mb-2">UPI ID</Text>
              <TextInput
                className="border border-border dark:border-darkBorder rounded-lg px-3 py-3 text-base"
                placeholder="yourname@upi"
                value={upiId}
                onChangeText={setUpiId}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Cash Payment Info */}
          {selectedType === 'cash' && (
            <View className="bg-yellow-50 p-4 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color={LightColors.secondary} />
                <Text className="ml-2 text-sm font-medium text-black">Cash Payment</Text>
              </View>
              <Text className="text-sm text-textSecondary dark:text-darkTextSecondary mt-2">
                Pay with cash directly to the driver at the end of your trip.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  className = '',
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onAddPaymentMethod,
  showAddButton = true,
  allowCash = true,
  allowUPI = true,
  allowWallets = true,
  allowCards = true,
  allowNetBanking = true,
  indianPayments = true,
  style,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return 'card';
      case 'upi':
        return 'phone-portrait';
      case 'wallet':
        return 'wallet';
      case 'cash':
        return 'cash';
      case 'netbanking':
        return 'globe';
      default:
        return 'card';
    }
  };

  const getPaymentBrandIcon = (method: PaymentMethod) => {
    if (method.type === 'card' && method.cardBrand) {
      // In a real app, you would have brand-specific icons
      return method.cardBrand;
    }
    return null;
  };

  const filteredPaymentMethods = paymentMethods.filter(method => {
    switch (method.type) {
      case 'card':
        return allowCards;
      case 'upi':
        return allowUPI && indianPayments;
      case 'wallet':
        return allowWallets && indianPayments;
      case 'cash':
        return allowCash;
      case 'netbanking':
        return allowNetBanking && indianPayments;
      default:
        return true;
    }
  });

  const handleAddPaymentMethod = (method: Partial<PaymentMethod>) => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: method.type!,
      displayName: method.displayName!,
      lastFour: method.lastFour,
      cardBrand: method.cardBrand,
      upiId: method.upiId,
      walletProvider: method.walletProvider,
      isDefault: method.isDefault || false,
      isEnabled: method.isEnabled || true,
    };
    
    onAddPaymentMethod();
    // In a real app, you would save this to the backend
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <TouchableOpacity
      className={`flex-row items-center p-4 border rounded-lg mb-3 ${
        selectedPaymentMethod?.id === item.id 
          ? 'border-secondary bg-secondary/5' 
          : 'border-border dark:border-darkBorder bg-white'
      }`}
      onPress={() => onPaymentMethodSelect(item)}
      disabled={!item.isEnabled}
    >
      <View className="w-12 h-12 bg-gray-100 dark:bg-darkSurface rounded-lg items-center justify-center mr-3">
        <Ionicons 
          name={getPaymentIcon(item) as any} 
          size={24} 
          color={item.isEnabled ? LightColors.secondary : LightColors.textSecondary}
        />
      </View>
      
      <View className="flex-1">
        <Text className={`text-base font-medium ${item.isEnabled ? 'text-black' : 'text-textSecondary dark:text-darkTextSecondary'}`}>
          {item.displayName}
        </Text>
        {item.type === 'card' && item.cardBrand && (
          <Text className="text-sm text-textSecondary dark:text-darkTextSecondary mt-1 capitalize">
            {item.cardBrand} • {item.lastFour}
          </Text>
        )}
        {item.isDefault && (
          <Text className="text-xs font-medium mt-1" style={{color: LightColors.secondary}}>
            Default
          </Text>
        )}
      </View>

      {selectedPaymentMethod?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={LightColors.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <View className={`${className}`} style={style}>
      <Text className="text-lg font-semibold text-black mb-4">Payment Method</Text>
      
      <FlatList
        data={filteredPaymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentMethod}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Ionicons name="card" size={48} color={LightColors.textSecondary} />
            <Text className="text-textSecondary dark:text-darkTextSecondary text-center mt-4">
              No payment methods added yet
            </Text>
          </View>
        }
      />

      {showAddButton && (
        <TouchableOpacity
          className="flex-row items-center justify-center p-4 border-2 border-dashed border-border dark:border-darkBorder rounded-lg mt-4"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color={LightColors.secondary} />
          <Text className="ml-2 text-base font-medium" style={{color: LightColors.secondary}}>
            Add Payment Method
          </Text>
        </TouchableOpacity>
      )}

      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPaymentMethod}
        indianPayments={indianPayments}
      />
    </View>
  );
};

export default PaymentSelector;