import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SearchingDriversScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const curtainAnim = useRef(new Animated.Value(height)).current;
  const searchRipple1 = useRef(new Animated.Value(0)).current;
  const searchRipple2 = useRef(new Animated.Value(0)).current;
  const searchRipple3 = useRef(new Animated.Value(0)).current;
  const dotAnimation = useRef(new Animated.Value(0)).current;
  
  const [searchText, setSearchText] = useState('Searching for a chauffeur near you');
  const [showCurtain, setShowCurtain] = useState(false);

  useEffect(() => {
    // Start all animations
    startSearchAnimations();
    startTextAnimations();
    
    // After 3 seconds, start curtain animation and navigate
    const timer = setTimeout(() => {
      setShowCurtain(true);
      startCurtainAnimation();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const startSearchAnimations = () => {
    // Continuous pulse for main search indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered ripple effects
    const createRippleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createRippleAnimation(searchRipple1, 0).start();
    createRippleAnimation(searchRipple2, 500).start();
    createRippleAnimation(searchRipple3, 1000).start();
  };

  const startTextAnimations = () => {
    // Text fade in
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animated dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCurtainAnimation = () => {
    Animated.timing(curtainAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to ride tracking after curtain animation completes
      router.replace('/(customer)/ride-tracking');
    });
  };

  const tripDetails = {
    pickup: params.pickup || 'Current Location',
    destination: params.destination || 'Downtown Office - 456 Market St, SF',
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Map Background - Top Half */}
        <View className="flex-1 relative">
          {/* Simulated Map Background */}
          <View className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
            {/* Map Grid Pattern */}
            <View className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  className="absolute border-gray-300 dark:border-gray-600"
                  style={{
                    top: (i * height) / 20,
                    left: 0,
                    right: 0,
                    height: 1,
                    borderTopWidth: 1,
                  }}
                />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <View
                  key={i}
                  className="absolute border-gray-300 dark:border-gray-600"
                  style={{
                    left: (i * width) / 15,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    borderLeftWidth: 1,
                  }}
                />
              ))}
            </View>
          </View>

          {/* Location Markers */}
          <View className="absolute top-20 left-8">
            <View className="bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg" />
            <ThemedText variant="tiny" className="mt-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
              Pickup
            </ThemedText>
          </View>

          <View className="absolute top-32 right-8">
            <View className="bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg" />
            <ThemedText variant="tiny" className="mt-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
              Destination
            </ThemedText>
          </View>

          {/* Driver Search Animation - Center of Map */}
          <View className="absolute inset-0 items-center justify-center">
            {/* Ripple Effects */}
            <Animated.View
              className="absolute w-40 h-40 rounded-full border-2 border-burgundy"
              style={{
                opacity: searchRipple1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 0],
                }),
                transform: [{
                  scale: searchRipple1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 2],
                  }),
                }],
              }}
            />
            <Animated.View
              className="absolute w-40 h-40 rounded-full border-2 border-secondary"
              style={{
                opacity: searchRipple2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [{
                  scale: searchRipple2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 2.5],
                  }),
                }],
              }}
            />
            <Animated.View
              className="absolute w-40 h-40 rounded-full border-2 border-burgundy opacity-30"
              style={{
                opacity: searchRipple3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0],
                }),
                transform: [{
                  scale: searchRipple3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 3],
                  }),
                }],
              }}
            />

            {/* Central Search Icon */}
            <Animated.View
              className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-lg border-2 border-burgundy"
              style={{
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                }],
              }}
            >
              <Image 
                source={require('../../assets/chauffit-logo.png')}
                style={{ 
                  width: 32, 
                  height: 32,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Bottom Half - Search Status */}
        <View className="h-1/2 px-6 pt-8 pb-6">
          <Animated.View
            className="flex-1 items-center justify-center"
            style={{ opacity: textOpacity }}
          >
            {/* Status Icon */}
            <View className="w-20 h-20 bg-secondary/10 rounded-full items-center justify-center mb-6">
              <Animated.View
                style={{
                  transform: [{
                    rotate: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <Ionicons name="search" size={32} color="#BD8C5E" />
              </Animated.View>
            </View>

            {/* Search Text with Animated Dots */}
            <View className="flex-row items-center mb-4">
              <ThemedText variant="h3" className="text-center">
                {searchText}
              </ThemedText>
              <Animated.View
                className="ml-2 flex-row"
                style={{
                  opacity: dotAnimation.interpolate({
                    inputRange: [0, 0.3, 0.6, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                }}
              >
                <ThemedText variant="h3">...</ThemedText>
              </Animated.View>
            </View>

            <ThemedText variant="small" className="text-center text-gray-600 px-4">
              We're connecting you with the best chauffeur in your area. This usually takes 10-30 seconds.
            </ThemedText>

            {/* Trip Details Preview */}
            <View className="mt-8 w-full">
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={16} color="#10B981" />
                  <ThemedText variant="small" className="ml-2 text-gray-600">From</ThemedText>
                </View>
                <ThemedText className="mb-3 pl-6">{tripDetails.pickup}</ThemedText>
                
                <View className="flex-row items-center mb-2">
                  <Ionicons name="navigate" size={16} color="#EF4444" />
                  <ThemedText variant="small" className="ml-2 text-gray-600">To</ThemedText>
                </View>
                <ThemedText className="pl-6">{tripDetails.destination}</ThemedText>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Curtain Animation Overlay */}
        {showCurtain && (
          <Animated.View
            className="absolute inset-0 bg-white dark:bg-gray-900 items-center justify-center"
            style={{
              transform: [{
                translateY: curtainAnim,
              }],
            }}
          >
            <View className="items-center">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              </View>
              <ThemedText variant="h3" className="text-center mb-2">
                Driver Found!
              </ThemedText>
              <ThemedText variant="small" className="text-center text-gray-600">
                Rajesh Kumar is on the way
              </ThemedText>
            </View>
          </Animated.View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}