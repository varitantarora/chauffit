import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, RefreshControl, Animated, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import BookingApiService, { CustomerRide } from '../../../services/api/BookingApiService';
import BlogApiService, { BlogListItem } from '../../../services/api/BlogApiService';

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
  const [recentActivity, setRecentActivity] = useState<CustomerRide[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  const clipAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const pickupFieldAnimation = useRef(new Animated.Value(0)).current;
  const destinationFieldAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  // Fetch recent activity from API
  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      const response = await BookingApiService.listRides();
      if (response.success && response.data) {
        // Sort by created_at descending and take top 3
        const sorted = response.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setRecentActivity(sorted);
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  // Fetch blogs from API
  const fetchBlogs = useCallback(async () => {
    try {
      setBlogsLoading(true);
      const response = await BlogApiService.listBlogs(1);
      if (response.success && response.data) {
        // Take first 5 blogs
        setBlogs(response.data.results?.slice(0, 5) || []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  }, []);

  // Load recent activity and blogs on mount
  useEffect(() => {
    fetchRecentActivity();
    fetchBlogs();
  }, [fetchRecentActivity, fetchBlogs]);

  // Start the reveal animation when component mounts
  useEffect(() => {
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchRecentActivity(), fetchBlogs()]);
    setRefreshing(false);
  }, [fetchRecentActivity, fetchBlogs]);

  // Format fare for display
  const formatFare = (fare: string | number | null | undefined): string => {
    if (!fare) return '₹0';
    const numFare = typeof fare === 'string' ? parseFloat(fare) : fare;
    return `₹${numFare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Format booking status for display
  const formatBookingStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'requested': 'Pending',
      'driver_assigned': 'Driver Assigned',
      'biker_assigned': 'Driver Assigned',
      'driver_en_route': 'Driver En Route',
      'driver_arrived': 'Driver Arrived',
      'trip_started': 'In Progress',
      'trip_completed': 'Completed',
      'cancelled_by_customer': 'Cancelled',
      'cancelled_by_driver': 'Cancelled',
      'cancelled_by_system': 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

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
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
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
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg">
                Recent Activity
              </ThemedText>
              {recentActivity.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/history')}>
                  <ThemedText className="text-secondary">View All</ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {loadingActivity ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#BD8C5E" />
                <ThemedText variant="caption" className="mt-2 text-gray-500">Loading activity...</ThemedText>
              </View>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ThemedCard key={activity.id} className="mb-3">
                  <TouchableOpacity
                    onPress={() => router.push({
                      pathname: '/(customer)/ride-details',
                      params: { bookingId: activity.id }
                    })}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className={`p-2 rounded-full ${
                        activity.booking_status === 'trip_completed'
                          ? 'bg-green-500/10'
                          : activity.booking_status === 'trip_started'
                          ? 'bg-blue-500/10'
                          : activity.booking_status === 'cancelled_by_customer' || activity.booking_status === 'cancelled_by_driver' || activity.booking_status === 'cancelled_by_system'
                          ? 'bg-red-500/10'
                          : 'bg-yellow-500/10'
                      }`}>
                        <Ionicons
                          name={
                            activity.booking_status === 'trip_completed'
                              ? 'checkmark-circle'
                              : activity.booking_status === 'trip_started'
                              ? 'car'
                              : activity.booking_status === 'cancelled_by_customer' || activity.booking_status === 'cancelled_by_driver' || activity.booking_status === 'cancelled_by_system'
                              ? 'close-circle'
                              : 'time'
                          }
                          size={20}
                          color={
                            activity.booking_status === 'trip_completed'
                              ? '#10b981'
                              : activity.booking_status === 'trip_started'
                              ? '#3b82f6'
                              : activity.booking_status === 'cancelled_by_customer' || activity.booking_status === 'cancelled_by_driver' || activity.booking_status === 'cancelled_by_system'
                              ? '#ef4444'
                              : '#f59e0b'
                          }
                        />
                      </View>
                      <View className="ml-3 flex-1">
                        <ThemedText className="font-semibold">
                          {activity.trip_type === 'one_way'
                            ? 'One-way Trip'
                            : activity.trip_type === 'round_trip'
                            ? 'Round-trip'
                            : 'Hourly Charter'}
                        </ThemedText>
                        <ThemedText variant="caption">
                          {formatBookingStatus(activity.booking_status)} • {formatDate(activity.created_at)}
                        </ThemedText>
                        <ThemedText variant="caption" numberOfLines={1}>
                          {activity.pickup_address?.substring(0, 30)}... → {activity.dropoff_address?.substring(0, 20)}...
                        </ThemedText>
                      </View>
                      <View className="items-end">
                        <ThemedText className="font-bold">
                          {formatFare(activity.actual_fare || activity.estimated_fare)}
                        </ThemedText>
                        {activity.rating && (
                          <View className="flex-row items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name={star <= (activity.rating || 0) ? 'star' : 'star-outline'}
                                size={12}
                                color="#fbbf24"
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </ThemedCard>
              ))
            ) : (
              <ThemedCard className="items-center py-8">
                <Ionicons name="car-outline" size={40} color={iconColor} />
                <ThemedText variant="body" className="font-semibold mt-3">
                  No Recent Activity
                </ThemedText>
                <ThemedText variant="small" className="text-textSecondary mt-1">
                  Book your first ride to see activity here
                </ThemedText>
                <TouchableOpacity
                  onPress={() => router.push('/(customer)/book-ride-new')}
                  className="mt-4 bg-secondary px-4 py-2 rounded-lg"
                >
                  <ThemedText className="text-white font-semibold">Book a Ride</ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            )}
          </View>

          {/* Blogs - More Ways to Use Chauffit */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText variant="title" className="text-lg">
                More Ways to Use Chauffit
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(customer)/blog-list')}>
                <ThemedText className="text-secondary">Explore All</ThemedText>
              </TouchableOpacity>
            </View>

            {blogsLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#BD8C5E" />
              </View>
            ) : blogs.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {blogs.map((blog) => (
                  <TouchableOpacity
                    key={blog.id}
                    className="mr-4"
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/(customer)/blog-detail', params: { slug: blog.slug } })}
                  >
                    <ThemedCard className="w-48 px-3 pt-3 pb-1 my-2 h-[175px]">
                      {blog.image ? (
                        <Image
                          source={{ uri: blog.image }}
                          className="w-full h-24 rounded-lg mb-2"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-24 rounded-lg mb-2 bg-gray-200 items-center justify-center">
                          <ThemedText className="text-gray-400 text-xs">No Image</ThemedText>
                        </View>
                      )}
                      <View className="h-5 justify-center">
                        <ThemedText className="font-semibold text-center" numberOfLines={1}>
                          {blog.title}
                        </ThemedText>
                      </View>
                      <View className="h-10 mt-1 justify-start">
                        <ThemedText variant="caption" className="text-center text-gray-600" numberOfLines={2}>
                          {blog.author_name}
                        </ThemedText>
                      </View>
                    </ThemedCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <ThemedCard className="items-center py-4">
                <ThemedText variant="small" className="text-textSecondary">No content available</ThemedText>
              </ThemedCard>
            )}
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