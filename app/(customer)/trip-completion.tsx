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
import { BrandColors } from '../../constants/Colors';

export default function TripCompletionScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [selectedTip, setSelectedTip] = useState(100);
  const [customTip, setCustomTip] = useState('');
  const [rating, setRating] = useState(0);
  
  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;

  const tripSummary = {
    from: 'Home - 123 Main St',
    to: 'Downtown Office - 456 Market St',
    stops: ['Coffee Shop - 789 Broadway'],
    duration: '47 minutes',
    distance: '34.2 miles',
    started: '2:35 PM',
    ended: '3:22 PM',
    driver: 'Marcus Rodriguez',
    vehicle: 'Your BMW X5',
  };

  const paymentDetails = {
    tripFare: 1347.56,
    tip: selectedTip,
    paymentMethod: 'Visa ****1234',
  };

  const tipOptions = [0, 50, 100, 150];

  const handleRating = (stars: number) => {
    setRating(stars);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please rate your experience before submitting.');
      return;
    }
    
    router.push({
      pathname: '/(customer)/rating-feedback',
      params: { 
        rating: rating.toString(),
        driverName: tripSummary.driver,
        tripId: 'trip_123'
      }
    });
  };

  const handleBookReturn = () => {
    router.push({
      pathname: '/(customer)/book-ride-new',
      params: {
        destination: tripSummary.from,
      }
    });
  };

  const handleBookAgain = () => {
    router.push({
      pathname: '/(customer)/book-ride-new',
      params: {
        destination: tripSummary.to,
      }
    });
  };

  const handleDownloadInvoice = () => {
    Alert.alert('Download Invoice', 'Invoice will be downloaded and sent to your email.');
  };

  const totalPaid = paymentDetails.tripFare + paymentDetails.tip;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="items-center py-8 px-6">
          <ThemedText variant="h2" className="mb-2">Trip Complete</ThemedText>
          <ThemedText variant="h1" className="mb-2">🎉 Thank you!</ThemedText>
          <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">
            You've arrived safely
          </ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6">
            {/* Trip Summary Card */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-4">Trip Summary</ThemedText>
              
              <View className="space-y-3">
                <View className="flex-row">
                  <Ionicons name="location" size={20} color={iconColor} className="mt-1" />
                  <View className="ml-3 flex-1">
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">From</ThemedText>
                    <ThemedText>{tripSummary.from}</ThemedText>
                  </View>
                </View>

                <View className="flex-row">
                  <Ionicons name="navigate" size={20} color={iconColor} className="mt-1" />
                  <View className="ml-3 flex-1">
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">To</ThemedText>
                    <ThemedText>{tripSummary.to}</ThemedText>
                  </View>
                </View>

                {tripSummary.stops.map((stop, index) => (
                  <View key={index} className="flex-row">
                    <Ionicons name="flag" size={20} color={iconColor} className="mt-1" />
                    <View className="ml-3 flex-1">
                      <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Stop</ThemedText>
                      <ThemedText>{stop}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>

              <View className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Duration</ThemedText>
                  <ThemedText variant="small">{tripSummary.duration}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Distance</ThemedText>
                  <ThemedText variant="small">{tripSummary.distance}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Started</ThemedText>
                  <ThemedText variant="small">{tripSummary.started}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Ended</ThemedText>
                  <ThemedText variant="small">{tripSummary.ended}</ThemedText>
                </View>
                <View className="flex-row justify-between mb-2">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Driver</ThemedText>
                  <ThemedText variant="small">{tripSummary.driver}</ThemedText>
                </View>
                <View className="flex-row justify-between">
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">Vehicle</ThemedText>
                  <ThemedText variant="small">{tripSummary.vehicle}</ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Payment Details Card */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-4">Payment Details</ThemedText>
              
              <View className="flex-row justify-between mb-4">
                <ThemedText>Trip fare</ThemedText>
                <ThemedText>₹{paymentDetails.tripFare.toFixed(2)}</ThemedText>
              </View>

              {/* Tip Selection */}
              <View className="mb-4">
                <ThemedText className="mb-3">Add Tip:</ThemedText>
                <View className="flex-row justify-between mb-3">
                  {tipOptions.map((tip) => (
                    <TouchableOpacity
                      key={tip}
                      onPress={() => {
                        setSelectedTip(tip);
                        setCustomTip('');
                      }}
                      className={`px-4 py-2 rounded-full border ${
                        selectedTip === tip && !customTip
                          ? 'bg-burgundy border-burgundy'
                          : 'border-border dark:border-darkBorder'
                      }`}
                    >
                      <ThemedText 
                        variant="small"
                        className={selectedTip === tip && !customTip ? 'text-white' : ''}
                      >
                        ₹{tip}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity 
                  className="border border-border dark:border-darkBorder rounded-xl p-3"
                  onPress={() => {
                    Alert.prompt(
                      'Custom Tip Amount',
                      'Enter tip amount in ₹',
                      (text) => {
                        if (text && !isNaN(Number(text))) {
                          setCustomTip(text);
                          setSelectedTip(Number(text));
                        }
                      },
                      'plain-text',
                      '',
                      'numeric'
                    );
                  }}
                >
                  <ThemedText className="text-center">
                    {customTip ? `Custom: ₹${customTip}` : 'Custom Amount'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <View className="flex-row justify-between mb-3">
                  <ThemedText variant="h3">Total paid</ThemedText>
                  <ThemedText variant="h3" className="text-burgundy">
                    ₹{totalPaid.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="card" size={20} color={iconColor} />
                  <ThemedText className="ml-2">{paymentDetails.paymentMethod}</ThemedText>
                </View>
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mt-1">
                  Receipt sent to email
                </ThemedText>
              </View>
            </ThemedCard>

            {/* Rating Section */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText className="text-center mb-4">Rate your experience:</ThemedText>
              <View className="flex-row justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                    className="mx-1"
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? BrandColors.warning : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton
                title="Submit Review"
                onPress={handleSubmitReview}
                disabled={rating === 0}
                className={rating === 0 ? 'opacity-50' : ''}
              />
            </ThemedCard>

            {/* Action Buttons */}
            <PrimaryButton
              title="BOOK RETURN TRIP"
              onPress={handleBookReturn}
              className="mb-3"
            />

            <View className="flex-row justify-between mb-6">
              <TouchableOpacity 
                onPress={handleDownloadInvoice}
                className="flex-1 mr-2 py-3 border border-border dark:border-darkBorder rounded-xl"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="download" size={20} color={iconColor} />
                  <ThemedText className="ml-2">Download Invoice</ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleBookAgain}
                className="flex-1 ml-2 py-3 border border-border dark:border-darkBorder rounded-xl"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="refresh" size={20} color={iconColor} />
                  <ThemedText className="ml-2">Book Again</ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(customer)/(tabs)')}
              className="py-3 mb-6"
            >
              <ThemedText className="text-center text-textSecondary dark:text-darkTextSecondary">Back to Home</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}