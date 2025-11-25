import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, RefreshControl, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

export default function CustomerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAnimation, setShowAnimation] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');

  const clipAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const pickupFieldAnimation = useRef(new Animated.Value(0)).current;
  const destinationFieldAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  useEffect(() => {
    // Start the reveal animation when component mounts
    const timer = setTimeout(() => {
      Animated.timing(clipAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start(() => {
        // Hide the animation overlay after completion
        setTimeout(() => setShowAnimation(false), 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const services = [
    { id: 1, name: 'Airport Transfer', description: 'Fast & reliable airport rides', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },
    { id: 2, name: 'City Tour', description: 'Explore the city in comfort', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
    { id: 3, name: 'Business Meeting', description: 'Professional corporate travel', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80' },
    { id: 4, name: 'Wedding Service', description: 'Make your day special', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80' },
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/(customer)/book-ride-new',
        params: { destination: searchText.trim() }
      });
    }
  };

  const toggleSearchExpansion = () => {
    if (isSearchExpanded) {
      // Closing - stagger in reverse
      Animated.parallel([
        Animated.spring(buttonAnimation, {
          toValue: 0,
          useNativeDriver: true,
          stiffness: 400,
          damping: 40,
        }),
        Animated.spring(destinationFieldAnimation, {
          toValue: 0,
          useNativeDriver: true,
          stiffness: 400,
          damping: 40,
        }),
        Animated.spring(pickupFieldAnimation, {
          toValue: 0,
          useNativeDriver: true,
          stiffness: 400,
          damping: 40,
        }),
      ]).start();

      Animated.spring(searchAnimation, {
        toValue: 0,
        useNativeDriver: false,
        stiffness: 400,
        damping: 40,
      }).start(() => {
        setIsSearchExpanded(false);
      });
    } else {
      // Opening - set state first, then animate in next frame
      setIsSearchExpanded(true);

      // Use requestAnimationFrame to ensure state is updated before animations
      requestAnimationFrame(() => {
        // Main container expansion
        Animated.spring(searchAnimation, {
          toValue: 1,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
        }).start();

        // Stagger children animations with Animated.stagger
        Animated.stagger(70, [
          Animated.spring(pickupFieldAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
          Animated.spring(destinationFieldAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
          Animated.spring(buttonAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
        ]).start();
      });
    }
  };

  const handleExpandedSearch = () => {
    if (pickupLocation.trim() && destinationLocation.trim()) {
      router.push({
        pathname: '/(customer)/book-ride-new',
        params: {
          pickup: pickupLocation.trim(),
          destination: destinationLocation.trim()
        }
      });
      toggleSearchExpansion();
    }
  };

  const quickActions = [
    { title: 'Book Now', icon: 'car', action: () => router.push('/(customer)/book-ride-new') },
    { title: 'Schedule', icon: 'time', action: () => router.push('/(customer)/schedule') },
    { title: 'History', icon: 'list', action: () => router.push('/(customer)/(tabs)/history') },
    { title: 'Favorites', icon: 'heart', action: () => router.push('/(customer)/(tabs)/favorites') }
  ];

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="h1">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'}
            </ThemedText>
            <ThemedText variant="small" className="mt-1">
              Where would you like to go today?
            </ThemedText>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-6">
            <Animated.View
              className={`rounded-xl border ${
                isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
              }`}
              style={{
                height: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [56, 240],
                }),
                overflow: 'hidden',
              }}
            >
              {/* Collapsed Search Bar */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: searchAnimation.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [1, 0, 0],
                  }),
                }}
                pointerEvents={isSearchExpanded ? 'none' : 'auto'}
              >
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3 h-14"
                  onPress={toggleSearchExpansion}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search" size={20} color={iconColor} />
                  <ThemedText className="flex-1 ml-3" style={{ color: iconColor }}>
                    Search destination...
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>

              {/* Expanded Search Form */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: 16,
                  opacity: searchAnimation.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 0, 1],
                  }),
                }}
                pointerEvents={isSearchExpanded ? 'auto' : 'none'}
              >
                {/* Close button */}
                <TouchableOpacity
                  className="absolute top-2 right-2 p-2 z-10"
                  onPress={toggleSearchExpansion}
                >
                  <Ionicons name="close-circle" size={24} color={iconColor} />
                </TouchableOpacity>

                {/* Pickup Location */}
                <Animated.View
                  style={{
                    opacity: pickupFieldAnimation,
                    transform: [
                      {
                        translateY: pickupFieldAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <View
                    className={`flex-row items-center px-4 py-3 rounded-lg border mb-3 ${
                      isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Ionicons name="location" size={20} color="#10b981" />
                    <TextInput
                      className={`flex-1 ml-3 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                      placeholder="Pickup location"
                      placeholderTextColor={iconColor}
                      value={pickupLocation}
                      onChangeText={setPickupLocation}
                    />
                  </View>
                </Animated.View>

                {/* Destination Location */}
                <Animated.View
                  style={{
                    opacity: destinationFieldAnimation,
                    transform: [
                      {
                        translateY: destinationFieldAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <View
                    className={`flex-row items-center px-4 py-3 rounded-lg border mb-4 ${
                      isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Ionicons name="location" size={20} color="#ef4444" />
                    <TextInput
                      className={`flex-1 ml-3 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                      placeholder="Destination"
                      placeholderTextColor={iconColor}
                      value={destinationLocation}
                      onChangeText={setDestinationLocation}
                    />
                  </View>
                </Animated.View>

                {/* Search Button */}
                <Animated.View
                  style={{
                    opacity: buttonAnimation,
                    transform: [
                      {
                        translateY: buttonAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    className="bg-burgundy py-3 rounded-lg"
                    onPress={handleExpandedSearch}
                    disabled={!pickupLocation.trim() || !destinationLocation.trim()}
                    style={{
                      opacity: !pickupLocation.trim() || !destinationLocation.trim() ? 0.5 : 1,
                    }}
                  >
                    <ThemedText className="text-white text-center font-semibold">Search</ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </View>
          
          {/* Quick Actions */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <View key={index} className="flex-1 mx-1">
                  <ThemedCard 
                    variant="premium" 
                    className="items-center py-3 h-[110px] justify-center px-1"
                    pressable
                    onPress={action.action}
                  >
                    <View className="bg-secondary/10 p-2 rounded-full mb-2">
                      <Ionicons name={action.icon as any} size={22} color="#BD8C5E" />
                    </View>
                    <ThemedText 
                      variant="small" 
                      className="text-center font-medium"
                      numberOfLines={1}
                    >
                      {action.title}
                    </ThemedText>
                  </ThemedCard>
                </View>
              ))}
            </View>
          </View>
          
          {/* Recent Activity */}
          <View className="px-3 mb-6">
            <ThemedText variant="title" className="text-lg mb-4">
              Recent Activity
            </ThemedText>

            <ThemedCard className="mb-3">
              <View className="flex-row items-center">
                <View className="bg-green-500/10 p-2 rounded-full">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View className="ml-3 flex-1">
                  <ThemedText className="font-semibold">Airport Transfer</ThemedText>
                  <ThemedText variant="caption">Completed • Yesterday 9:00 AM</ThemedText>
                  <ThemedText variant="caption">Cyber Hub → IGI Airport T3</ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="font-bold">₹2,850</ThemedText>
                  <View className="flex-row items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={12} color="#fbbf24" />
                    ))}
                  </View>
                </View>
              </View>
            </ThemedCard>

            <ThemedCard className="mb-3 px-3">
              <View className="flex-row items-center">
                <View className="bg-blue-500/10 p-2 rounded-full">
                  <Ionicons name="time" size={20} color="#3b82f6" />
                </View>
                <View className="ml-3 flex-1">
                  <ThemedText className="font-semibold">City Tour</ThemedText>
                  <ThemedText variant="caption">Scheduled • Tomorrow 2:00 PM</ThemedText>
                  <ThemedText variant="caption">4 hour service</ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="font-bold">₹8,000</ThemedText>
                  <ThemedText variant="caption" className="text-secondary">Upcoming</ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Popular Services */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg">
                Popular Services
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-secondary">View All</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  className="mr-4"
                  activeOpacity={0.8}
                  onPress={() => router.push('/(customer)/book-ride-new')}
                >
                  <ThemedCard className="w-48 px-3 pt-3 pb-1 my-2 h-[175px]">
                    <Image
                      source={{ uri: service.image }}
                      className="w-full h-24 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                    <View className="h-5 justify-center">
                      <ThemedText className="font-semibold text-center" numberOfLines={1}>
                        {service.name}
                      </ThemedText>
                    </View>
                    <View className="h-10 mt-1 justify-start">
                      <ThemedText variant="caption" className="text-center text-gray-600" numberOfLines={2}>
                        {service.description}
                      </ThemedText>
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* More Ways to Use Chauffit */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg">
                More Ways to Use Chauffit
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-secondary">Explore All</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                {
                  id: 1,
                  title: 'Business Meetings',
                  description: 'Professional rides for work',
                  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
                },
                {
                  id: 2,
                  title: 'Wedding Events',
                  description: 'Special occasions made memorable',
                  image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80',
                },
                {
                  id: 3,
                  title: 'Shopping Tours',
                  description: 'Comfortable shopping trips',
                  image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
                },
                {
                  id: 4,
                  title: 'Date Nights',
                  description: 'Romantic evenings out',
                  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
                },
                {
                  id: 5,
                  title: 'Medical Visits',
                  description: 'Reliable healthcare transport',
                  image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
                },
                {
                  id: 6,
                  title: 'Party Nights',
                  description: 'Safe rides for celebrations',
                  image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
                }
              ].map((useCase) => (
                <TouchableOpacity
                  key={useCase.id}
                  className="mr-4"
                  activeOpacity={0.8}
                  onPress={() => router.push('/(customer)/book-ride-new')}
                >
                  <ThemedCard className="w-48 px-3 pt-3 pb-1 my-2 h-[175px]">
                    <Image
                      source={{ uri: useCase.image }}
                      className="w-full h-24 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                    <View className="h-5 justify-center">
                      <ThemedText className="font-semibold text-center" numberOfLines={1}>
                        {useCase.title}
                      </ThemedText>
                    </View>
                    <View className="h-10 mt-1 justify-start">
                      <ThemedText variant="caption" className="text-center text-gray-600" numberOfLines={2}>
                        {useCase.description}
                      </ThemedText>
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
        
        {/* Masking Animation Overlay */}
        {showAnimation && (
          <Animated.View
            className="absolute inset-0 items-center justify-center"
            style={{
              backgroundColor: isDarkMode ? '#720C17' : '#BD8C5E',
              opacity: clipAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [{
                scale: clipAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 15],
                })
              }],
            }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDarkMode ? '#BD8C5E' : '#720C17',
              }}
            >
              <Image 
                source={require('../../../assets/chauffit-logo.png')}
                style={{ 
                  width: 50, 
                  height: 50,
                }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}