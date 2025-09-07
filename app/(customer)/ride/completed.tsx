import React, { useState } from 'react';
import { TouchableOpacity, View, ScrollView, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RideCompleted() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { availableChauffeurs, activeBookings } = useBookingStore();
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const booking = activeBookings.find(b => b.id === bookingId);
  const chauffeur = availableChauffeurs.find(c => c.id === booking?.chauffeurId);

  const tipPresets = [50, 100, 200, 500];
  
  const ratingLabels = [
    '', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
  ];

  const handleRatingPress = (value: number) => {
    setRating(value);
  };

  const handleTipSelect = (amount: number) => {
    setTipAmount(amount);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating for your experience');
      return;
    }

    setLoading(true);

    // Simulate API call to submit rating
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted. We appreciate your business!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(customer)/(tabs)'),
          },
        ]
      );
    }, 1500);
  };

  const handleBookAgain = () => {
    router.push('/(customer)/booking/select-duration');
  };

  const calculateTotal = () => {
    const baseAmount = booking?.totalAmount || 0;
    const tax = baseAmount * 0.18;
    return baseAmount + tax + tipAmount;
  };

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-success/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <ThemedText variant="h1" className="text-center mb-2">
              Ride Completed!
            </ThemedText>
            <ThemedText variant="body" className="text-center text-textSecondary">
              Thank you for using Chauffit
            </ThemedText>
          </View>

          {/* Booking Summary */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Ride Summary
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Duration
                </ThemedText>
                <ThemedText variant="body" className="font-semibold">
                  {booking?.duration || '4hr'}
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Date & Time
                </ThemedText>
                <ThemedText variant="body" className="font-semibold">
                  {booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Today, 2:00 PM'}
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Booking ID
                </ThemedText>
                <ThemedText variant="body" className="font-semibold font-mono">
                  #{bookingId?.slice(-6).toUpperCase() || 'CHF123'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Chauffeur Info */}
          {chauffeur && (
            <View className={`p-4 rounded-2xl mb-6 ${
              isDarkMode ? 'bg-darkSurface' : 'bg-white'
            } border border-border`}>
              <ThemedText variant="h3" className="font-bold mb-4">
                Your Chauffeur
              </ThemedText>
              
              <View className="flex-row items-center">
                <Image
                  source={{ uri: chauffeur.photo }}
                  className="w-16 h-16 rounded-full mr-4"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                
                <View className="flex-1">
                  <ThemedText variant="h3" className="font-bold">
                    {chauffeur.name}
                  </ThemedText>
                  <View className="flex-row items-center mt-1">
                    <View className="flex-row mr-3">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Ionicons
                          key={index}
                          name={index < Math.floor(chauffeur.rating) ? 'star' : 'star-outline'}
                          size={12}
                          color="#BD8C5E"
                        />
                      ))}
                    </View>
                    <ThemedText variant="small" className="text-textSecondary">
                      {chauffeur.rating} • {chauffeur.experience}y exp
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Rate Your Experience */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Rate Your Experience
            </ThemedText>
            
            {/* Star Rating */}
            <View className="items-center mb-6">
              <View className="flex-row mb-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRatingPress(index + 1)}
                    className="px-1"
                  >
                    <Ionicons
                      name={index < rating ? 'star' : 'star-outline'}
                      size={32}
                      color="#BD8C5E"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              {rating > 0 && (
                <ThemedText variant="body" className="text-secondary font-semibold">
                  {ratingLabels[rating]}
                </ThemedText>
              )}
            </View>

            {/* Comment */}
            <View className="mb-4">
              <ThemedText variant="body" className="mb-2 font-semibold">
                Additional Comments (Optional)
              </ThemedText>
              <TextInput
                className={`p-4 rounded-xl border text-base ${
                  isDarkMode 
                    ? 'bg-darkSurface text-darkText border-darkBorder' 
                    : 'bg-surface text-textPrimary border-border'
                }`}
                placeholder="Share your experience..."
                placeholderTextColor={iconColor}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Add Tip */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="h3" className="font-bold">
                Add Tip (Optional)
              </ThemedText>
              <TouchableOpacity onPress={() => setShowTip(!showTip)}>
                <Ionicons 
                  name={showTip ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={iconColor} 
                />
              </TouchableOpacity>
            </View>
            
            {showTip && (
              <>
                <View className="flex-row flex-wrap mb-4">
                  {tipPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => handleTipSelect(preset)}
                      className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                        tipAmount === preset
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border'
                      }`}
                    >
                      <ThemedText 
                        variant="small" 
                        className={`font-semibold ${
                          tipAmount === preset ? 'text-secondary' : 'text-textSecondary'
                        }`}
                      >
                        ₹{preset}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className={`flex-row items-center p-3 rounded-xl border ${
                  isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-surface border-border'
                }`}>
                  <ThemedText className="text-textSecondary mr-2">₹</ThemedText>
                  <TextInput
                    className="flex-1 text-base"
                    placeholder="Custom amount"
                    placeholderTextColor={iconColor}
                    value={tipAmount > 0 && !tipPresets.includes(tipAmount) ? tipAmount.toString() : ''}
                    onChangeText={(text) => setTipAmount(parseInt(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </View>

          {/* Payment Summary */}
          <View className={`p-4 rounded-2xl mb-6 ${
            isDarkMode ? 'bg-darkSurface' : 'bg-white'
          } border border-border`}>
            <ThemedText variant="h3" className="font-bold mb-4">
              Payment Summary
            </ThemedText>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Service Charge
                </ThemedText>
                <ThemedText variant="body">
                  ₹{(booking?.totalAmount || 0).toLocaleString()}
                </ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText variant="body" className="text-textSecondary">
                  Taxes & Fees (18%)
                </ThemedText>
                <ThemedText variant="body">
                  ₹{Math.floor((booking?.totalAmount || 0) * 0.18).toLocaleString()}
                </ThemedText>
              </View>
              
              {tipAmount > 0 && (
                <View className="flex-row justify-between">
                  <ThemedText variant="body" className="text-textSecondary">
                    Tip
                  </ThemedText>
                  <ThemedText variant="body">
                    ₹{tipAmount.toLocaleString()}
                  </ThemedText>
                </View>
              )}
              
              <View className="border-t border-border pt-3">
                <View className="flex-row justify-between">
                  <ThemedText variant="h3" className="font-bold">
                    Total Paid
                  </ThemedText>
                  <ThemedText variant="h3" className="font-bold text-success">
                    ₹{calculateTotal().toLocaleString()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 pb-6 pt-4 border-t border-border">
          <PrimaryButton
            title="Submit Rating"
            onPress={handleSubmitRating}
            loading={loading}
            className="mb-4"
          />
          
          <PrimaryButton
            title="Book Another Ride"
            onPress={handleBookAgain}
            variant="outline"
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}