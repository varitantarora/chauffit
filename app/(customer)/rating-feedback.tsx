import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RatingFeedbackScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [overallRating, setOverallRating] = useState(parseInt(params.rating as string) || 5);
  const [vehicleRating, setVehicleRating] = useState(5);
  const [selectedPerformance, setSelectedPerformance] = useState<string[]>(['professional', 'on-time', 'smooth-ride', 'clean-appearance']);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [textFeedback, setTextFeedback] = useState('');
  
  const iconColor = isDarkMode ? '#BD8C5E' : '#722F37';
  const driverName = params.driverName as string || 'Marcus';

  const performanceOptions = [
    { id: 'professional', label: 'Professional' },
    { id: 'on-time', label: 'On time' },
    { id: 'smooth-ride', label: 'Smooth ride' },
    { id: 'friendly', label: 'Friendly' },
    { id: 'clean-appearance', label: 'Clean appearance' },
    { id: 'helpful', label: 'Helpful' },
    { id: 'courteous', label: 'Courteous' },
    { id: 'safe-driving', label: 'Safe driving' },
  ];

  const vehicleIssues = [
    { id: 'low-fuel', label: 'Low fuel' },
    { id: 'damage', label: 'Damage' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'other-issues', label: 'Other issues' },
  ];

  const handleRating = (rating: number, type: 'overall' | 'vehicle') => {
    if (type === 'overall') {
      setOverallRating(rating);
    } else {
      setVehicleRating(rating);
    }
  };

  const togglePerformance = (id: string) => {
    setSelectedPerformance(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleIssue = (id: string) => {
    setSelectedIssues(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmitReview = () => {
    const reviewData = {
      overallRating,
      vehicleRating,
      performance: selectedPerformance,
      issues: selectedIssues,
      feedback: textFeedback,
      tripId: params.tripId,
    };

    console.log('Submitting review:', reviewData);
    
    Alert.alert(
      'Review Submitted!',
      'Thank you for your feedback. Your review helps us improve our service.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/(customer)/(tabs)'),
        }
      ]
    );
  };

  const handleReportIssue = () => {
    router.push('/(customer)/report-issue');
  };

  const handleSkip = () => {
    router.push('/(customer)/(tabs)');
  };

  const handleUploadPhoto = () => {
    Alert.alert('Upload Photo', 'Photo upload functionality would be implemented here.');
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
            <ThemedText variant="h2">Rate Your Experience</ThemedText>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Overall Rating */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText className="text-center mb-4">
                How was your ride with {driverName}?
              </ThemedText>

              <ThemedText variant="h3" className="mb-3">Overall Experience</ThemedText>
              <View className="flex-row justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star, 'overall')}
                    className="mx-2"
                  >
                    <Ionicons
                      name={star <= overallRating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= overallRating ? '#F59E0B' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <ThemedText className="mb-3">What went well? (Optional)</ThemedText>
                
                <ThemedText variant="h3" className="mb-3">Driver Performance</ThemedText>
                <View className="flex-row flex-wrap">
                  {performanceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => togglePerformance(option.id)}
                      className={`px-3 py-2 m-1 rounded-full border ${
                        selectedPerformance.includes(option.id)
                          ? 'bg-green-100 border-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <View className="flex-row items-center">
                        {selectedPerformance.includes(option.id) && (
                          <Ionicons name="checkmark" size={16} color="#059669" className="mr-1" />
                        )}
                        <ThemedText 
                          variant="small"
                          className={selectedPerformance.includes(option.id) ? 'text-green-700' : ''}
                        >
                          {option.label}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ThemedCard>

            {/* Vehicle Condition */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText variant="h3" className="mb-3">Vehicle Condition</ThemedText>
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText>Rate your BMW X5:</ThemedText>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRating(star, 'vehicle')}
                      className="mx-1"
                    >
                      <Ionicons
                        name={star <= vehicleRating ? 'star' : 'star-outline'}
                        size={24}
                        color={star <= vehicleRating ? '#F59E0B' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ThemedText className="mb-3">Any issues?</ThemedText>
              <View className="flex-row flex-wrap">
                {vehicleIssues.map((issue) => (
                  <TouchableOpacity
                    key={issue.id}
                    onPress={() => toggleIssue(issue.id)}
                    className={`px-3 py-2 m-1 rounded-full border ${
                      selectedIssues.includes(issue.id)
                        ? 'bg-red-100 border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <View className="flex-row items-center">
                      {selectedIssues.includes(issue.id) && (
                        <Ionicons name="close" size={16} color="#DC2626" className="mr-1" />
                      )}
                      <ThemedText 
                        variant="small"
                        className={selectedIssues.includes(issue.id) ? 'text-red-700' : ''}
                      >
                        {issue.label}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Text Feedback */}
            <ThemedCard variant="elevated" className="mb-4">
              <ThemedText className="mb-3">Text Feedback (optional)</ThemedText>
              <TextInput
                className={`border border-gray-300 rounded-xl p-4 h-32 ${
                  isDarkMode ? 'bg-darkSurface text-darkText' : 'bg-white'
                }`}
                placeholder="Share your detailed feedback here..."
                placeholderTextColor="#9CA3AF"
                value={textFeedback}
                onChangeText={setTextFeedback}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity 
                onPress={handleUploadPhoto}
                className="flex-row items-center justify-center mt-4 py-3 border border-dashed border-gray-300 rounded-xl"
              >
                <Ionicons name="camera" size={24} color={iconColor} />
                <ThemedText className="ml-2">Upload photo (optional)</ThemedText>
              </TouchableOpacity>
            </ThemedCard>

            {/* Action Buttons */}
            <PrimaryButton
              title="SUBMIT REVIEW"
              onPress={handleSubmitReview}
              className="mb-3"
            />

            <View className="flex-row justify-between mb-6">
              <TouchableOpacity 
                onPress={handleReportIssue}
                className="flex-1 mr-2 py-3 border border-red-300 rounded-xl"
              >
                <ThemedText className="text-center text-red-600">Report an Issue</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSkip}
                className="flex-1 ml-2 py-3 border border-gray-300 rounded-xl"
              >
                <ThemedText className="text-center text-gray-600">Skip for now</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}