import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { BrandColors } from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  image: any;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Chauffit',
    subtitle: 'Your premium ride experience starts here. Travel in comfort and style with professional drivers.',
    image: require('../assets/onboarding/man-with-a-car.png'),
  },
  {
    id: 2,
    title: 'Book Your Ride',
    subtitle: 'Easy booking process with real-time tracking. Choose from multiple vehicle options to suit your needs.',
    image: require('../assets/onboarding/Online Taxi Booking.png'),
  },
  {
    id: 3,
    title: 'Ready to Go?',
    subtitle: 'Safe, reliable, and always on time. Join thousands of satisfied customers today.',
    image: require('../assets/onboarding/Onboarding Process launch app.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'system' | 'light' | 'dark'>('system');
  const scrollViewRef = useRef<ScrollView>(null);
  const totalSlides = onboardingData.length + 1; // +1 for theme selection slide

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    useAuthStore.getState().setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  const handleGetStarted = () => {
    useAuthStore.getState().setThemeMode(selectedTheme);
    useAuthStore.getState().setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(slideIndex);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity
          onPress={handleSkip}
          className="px-4 py-2"
        >
          <Text className="text-textSecondary dark:text-darkTextSecondary font-bold text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {onboardingData.map((slide) => (
          <View
            key={slide.id}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 items-center justify-center px-8"
          >
            {/* Image Container */}
            <View className="flex-1 items-center justify-center mb-8">
              <Image
                source={slide.image}
                style={{
                  width: SCREEN_WIDTH * 0.85,
                  height: SCREEN_HEIGHT * 0.4,
                  resizeMode: 'contain',
                }}
              />
            </View>

            {/* Text Content */}
            <View className="items-center px-4 mb-8">
              <Text className="text-3xl font-bold text-textPrimary dark:text-darkText text-center mb-4">
                {slide.title}
              </Text>
              <Text className="text-base text-textSecondary dark:text-darkTextSecondary text-center leading-6 px-4">
                {slide.subtitle}
              </Text>
            </View>
          </View>
        ))}

        {/* Theme Selection Slide */}
        <View
          style={{ width: SCREEN_WIDTH }}
          className="flex-1 items-center justify-center px-8"
        >
          <View className="items-center px-4 mb-8">
            <Text className="text-3xl font-bold text-textPrimary dark:text-darkText text-center mb-4">
              Choose Your Theme
            </Text>
            <Text className="text-base text-textSecondary dark:text-darkTextSecondary text-center leading-6 px-4 mb-8">
              Select your preferred appearance. You can change this later in Settings.
            </Text>

            <View className="w-full space-y-4">
              {[
                { key: 'system' as const, label: 'System Default', icon: '📱', desc: 'Match your device settings' },
                { key: 'light' as const, label: 'Light Mode', icon: '☀️', desc: 'Classic bright appearance' },
                { key: 'dark' as const, label: 'Dark Mode', icon: '🌙', desc: 'Easy on the eyes at night' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSelectedTheme(option.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selectedTheme === option.key ? BrandColors.burgundy : '#e5e5e5',
                    backgroundColor: selectedTheme === option.key ? 'rgba(114,12,23,0.05)' : '#fff',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 28, marginRight: 16 }}>{option.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>
                      {option.label}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      {option.desc}
                    </Text>
                  </View>
                  {selectedTheme === option.key && (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: BrandColors.burgundy, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View className="px-8 pb-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center mb-8">
          {[...onboardingData, { id: 999 }].map((_, index) => (
            <View
              key={index}
              className={`mx-1 rounded-full ${index === currentIndex
                  ? 'w-8 h-2 bg-burgundy'
                  : 'w-2 h-2 bg-gray-300'
                }`}
            />
          ))}
        </View>

        {/* Action Buttons */}
        {currentIndex === totalSlides - 1 ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            className="w-full bg-burgundy py-4 px-8 rounded-full"
          >
            <Text className="text-white text-center font-bold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
        ) : currentIndex === 0 ? (
          <TouchableOpacity
            onPress={handleNext}
            className="w-full bg-burgundy py-4 px-8 rounded-full"
          >
            <Text className="text-white text-center font-bold text-lg">
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => {
                const prevIndex = currentIndex - 1;
                scrollViewRef.current?.scrollTo({
                  x: SCREEN_WIDTH * prevIndex,
                  animated: true,
                });
                setCurrentIndex(prevIndex);
              }}
              className="px-6 py-3"
            >
              <Text className="text-textSecondary dark:text-darkTextSecondary font-medium text-base">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 ml-4 bg-burgundy py-4 px-8 rounded-full"
            >
              <Text className="text-white text-center font-bold text-lg">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}