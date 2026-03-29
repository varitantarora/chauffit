import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, Text, RefreshControl, Animated, Image, ActivityIndicator, Platform, Linking } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useConfigStore } from '../../../store/configStore';
import { useRouter } from 'expo-router';
import BookingApiService, { CustomerRide } from '../../../services/api/BookingApiService';
import BlogApiService, { BlogListItem } from '../../../services/api/BlogApiService';
import AdvertisementApiService, { Advertisement } from '../../../services/api/AdvertisementApiService';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { DarkMapStyle } from '../../../constants/MapStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors } from '../../../constants/Colors';
import { MapLocationPicker, MapPickerLocation } from '../../../components/customer/MapLocationPicker';
import BurgundyLightLogo from '../../../assets/nav_logo/burgundy_light_mode.svg';
const PastelGrayDarkLogo = BurgundyLightLogo; // Fallback since the file is missing

const AD_CARD_WIDTH = 317;
const AD_CARD_GAP = 16;  // mr-4 via NativeWind
const AD_SNAP_INTERVAL = AD_CARD_WIDTH + AD_CARD_GAP; // 333

export default function CustomerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
  const getConfigValue = useConfigStore((state) => state.getConfigValue);
  const showRecentActivity = getConfigValue('show_recent_activity_in_home_page') === 'true';
  const showPromotions = getConfigValue('show_promotions_in_home_page') === 'true';
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAnimation, setShowAnimation] = useState(true);
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const [currentLocationLat, setCurrentLocationLat] = useState(28.6139);
  const [currentLocationLng, setCurrentLocationLng] = useState(77.2090);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationLat, setDestinationLat] = useState<number | null>(null);
  const [destinationLng, setDestinationLng] = useState<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerField, setMapPickerField] = useState<'pickup' | 'dropoff'>('pickup');
  const [recentActivity, setRecentActivity] = useState<CustomerRide[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const DEFAULT_REGION = { latitude: 28.4595, longitude: 77.0266, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const mapRef = useRef<MapView>(null);
  const activeAdIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const adsTranslateX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const adsCountShared = useSharedValue(0);

  const clipAnimation = useRef(new Animated.Value(0)).current;

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
    // TODO: Uncomment when backend /meta/configs/ endpoint is available
    // fetchConfigs();
  }, [fetchRecentActivity, fetchBlogs]);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoadingAds(true);
      const response = await AdvertisementApiService.getAdvertisements('home');
      if (response.success && response.data) setAds(response.data);
      setIsLoadingAds(false);
    };
    fetchAds();
  }, []);

  // Keep ads count in sync for gesture worklet
  useEffect(() => { adsCountShared.value = ads.length; }, [ads.length, adsCountShared]);

  // Auto-scroll ads every 3 seconds using reanimated (bypasses ScrollView entirely)
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      if (isUserScrollingRef.current) return;
      const next = (activeAdIndexRef.current + 1) % ads.length;
      activeAdIndexRef.current = next;
      setActiveAdIndex(next);
      adsTranslateX.value = withTiming(-next * AD_SNAP_INTERVAL, { duration: 400 });
    }, 3000);
    return () => clearInterval(interval);
  }, [ads.length, adsTranslateX]);

  // Fetch user location for map hero & auto-fill pickup
  useEffect(() => {
    (async () => {
      // Load cached location for instant map render on repeat visits
      try {
        const cached = await AsyncStorage.getItem('@lastKnownLocation');
        if (cached) {
          const { latitude, longitude } = JSON.parse(cached);
          setMapRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
          setCurrentLocationLat(latitude);
          setCurrentLocationLng(longitude);
        }
      } catch {}

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;

        // Cache for next launch
        AsyncStorage.setItem('@lastKnownLocation', JSON.stringify({ latitude, longitude })).catch(() => {});

        // Animate map to real location smoothly
        mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 800);
        setMapRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        setCurrentLocationLat(latitude);
        setCurrentLocationLng(longitude);

        // Reverse geocode runs non-blocking — does not delay map render
        Location.reverseGeocodeAsync({ latitude, longitude })
          .then((addresses) => {
            if (addresses.length > 0) {
              const addr = addresses[0];
              const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
              setCurrentLocationAddress(parts.join(', '));
            }
          })
          .catch((e) => console.warn('Reverse geocode failed:', e));
      }
    })();
  }, []);

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

  const handleWhereToPress = () => {
    router.push({
      pathname: '/(customer)/ride-search',
      params: {
        initialPickup: currentLocationAddress,
        initialPickupLat: currentLocationLat.toString(),
        initialPickupLng: currentLocationLng.toString(),
      },
    });
  };

  const handleOpenMapPicker = (fieldType: 'pickup' | 'dropoff') => {
    setMapPickerField(fieldType);
    setShowMapPicker(true);
  };

  const handleMapLocationSelected = (location: MapPickerLocation) => {
    if (mapPickerField === 'pickup') {
      setCurrentLocationAddress(location.address);
      setCurrentLocationLat(location.latitude);
      setCurrentLocationLng(location.longitude);
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 800);
    } else {
      setDestinationAddress(location.address);
      setDestinationLat(location.latitude);
      setDestinationLng(location.longitude);
    }
  };

  // Carousel gesture helpers (called from worklets via runOnJS)
  const updateAdIndex = useCallback((index: number) => {
    activeAdIndexRef.current = index;
    setActiveAdIndex(index);
  }, []);

  const setScrolling = useCallback((val: boolean) => {
    isUserScrollingRef.current = val;
  }, []);

  // Animated style for carousel row
  const adsRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: adsTranslateX.value }],
  }));

  // Pan gesture for manual ad swiping
  const adsPanGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      gestureStartX.value = adsTranslateX.value;
      runOnJS(setScrolling)(true);
    })
    .onUpdate((e) => {
      adsTranslateX.value = gestureStartX.value + e.translationX;
    })
    .onEnd((e) => {
      let nearestIndex = Math.round(-adsTranslateX.value / AD_SNAP_INTERVAL);
      if (e.velocityX < -500) nearestIndex = Math.ceil(-adsTranslateX.value / AD_SNAP_INTERVAL);
      if (e.velocityX > 500) nearestIndex = Math.floor(-adsTranslateX.value / AD_SNAP_INTERVAL);
      const maxIndex = Math.max(0, adsCountShared.value - 1);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, maxIndex));
      adsTranslateX.value = withTiming(-clampedIndex * AD_SNAP_INTERVAL, { duration: 250 });
      runOnJS(updateAdIndex)(clampedIndex);
      runOnJS(setScrolling)(false);
    });

  const quickActions = [
    { title: 'Book Now', icon: 'car', action: () => router.push('/(customer)/book-ride-new') },
    { title: 'Schedule', icon: 'time', action: () => router.push({ pathname: '/(customer)/book-ride-new', params: { schedule: 'true' } }) },
    { title: 'Trips', icon: 'list', action: () => router.push('/(customer)/(tabs)/history') },
    { title: 'Favorites', icon: 'heart', action: () => router.push('/(customer)/favorites') }
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
          {/* Map Hero Section */}
          <View style={{ height: 280, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            {/* Map Background — always rendered, animates to real location once GPS resolves */}
            <MapView
              key={isDarkMode ? 'dark' : 'light'}
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              initialRegion={mapRegion}
              showsUserLocation={Platform.OS !== 'android'}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              showsMyLocationButton={false}
              showsCompass={false}
              liteMode={Platform.OS === 'android'}
              customMapStyle={isDarkMode ? DarkMapStyle : undefined}
            />

            {/* Header overlay with gradient + glassmorphism */}
            <LinearGradient
              colors={isDarkMode ? ['rgba(26,26,26,0.85)', 'rgba(26,26,26,0)'] : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 4, paddingBottom: 30, paddingHorizontal: 24 }}
            >
              <View style={{ alignSelf: 'flex-start', marginLeft: -70 }}>
                {isDarkMode ? (
                  <PastelGrayDarkLogo height={64} width={260} />
                ) : (
                  <BurgundyLightLogo height={64} width={260} />
                )}
              </View>
            </LinearGradient>

            {/* From / To search card */}
            <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
              <BlurView
                intensity={80}
                tint={isDarkMode ? 'dark' : 'light'}
                style={{ borderRadius: 16, overflow: 'hidden' }}
              >
                <View
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(26,26,26,0.75)' : 'rgba(255,255,255,0.8)',
                    borderRadius: 16,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  {/* From row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="radio-button-on" size={14} color={BrandColors.burgundy} />
                    <TouchableOpacity
                      style={{ flex: 1, marginLeft: 10 }}
                      onPress={handleWhereToPress}
                      activeOpacity={0.7}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 14,
                          color: currentLocationAddress
                            ? (isDarkMode ? '#d9d1c6' : '#333')
                            : (isDarkMode ? '#999' : '#888'),
                          fontWeight: currentLocationAddress ? '500' : '400',
                        }}
                      >
                        {currentLocationAddress || 'Pickup location'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenMapPicker('pickup')}
                      style={{ padding: 4 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="map-outline" size={18} color={isDarkMode ? BrandColors.secondary : BrandColors.burgundy} />
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', marginLeft: 24, marginBottom: 6 }} />

                  {/* To row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location" size={14} color={BrandColors.secondary} />
                    <TouchableOpacity
                      style={{ flex: 1, marginLeft: 10 }}
                      onPress={handleWhereToPress}
                      activeOpacity={0.7}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 14,
                          color: destinationAddress
                            ? (isDarkMode ? '#d9d1c6' : '#333')
                            : (isDarkMode ? '#999' : '#888'),
                          fontWeight: destinationAddress ? '500' : '400',
                        }}
                      >
                        {destinationAddress || 'Where to?'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenMapPicker('dropoff')}
                      style={{ padding: 4 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="map-outline" size={18} color={isDarkMode ? BrandColors.secondary : BrandColors.burgundy} />
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Spacing after map hero */}
          <View style={{ height: 16 }} />

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
                      <Ionicons name={action.icon as any} size={22} color={BrandColors.secondary} />
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

          {/* Promotions Section */}
          {showPromotions && (isLoadingAds || ads.length > 0) && (
            <View className="px-3 mb-6">
              {isLoadingAds ? (
                <View className="flex-row gap-3">
                  <View style={{ width: 317, height: 158 }} className="rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <View style={{ width: 317, height: 158 }} className="rounded-xl bg-gray-200 dark:bg-gray-700" />
                </View>
              ) : (
                <>
                  <View style={{ overflow: 'hidden' }}>
                    <GestureDetector gesture={adsPanGesture}>
                      <Reanimated.View style={[{ flexDirection: 'row', paddingHorizontal: 12 }, adsRowStyle]}>
                        {ads.map((ad) => (
                          <TouchableOpacity
                            key={ad.id}
                            style={{ width: AD_CARD_WIDTH, marginRight: AD_CARD_GAP }}
                            activeOpacity={0.85}
                            onPress={() => ad.link && Linking.openURL(ad.link)}
                            disabled={!ad.link}
                          >
                            <View style={{ width: AD_CARD_WIDTH, height: 158 }}>
                              <View style={{
                                width: AD_CARD_WIDTH, height: 158, borderRadius: 12, overflow: 'hidden',
                                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
                              }}>
                                <Image
                                  source={{ uri: ad.image }}
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                />
                              </View>
                              <View style={{
                                position: 'absolute', top: 8, right: 8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                paddingHorizontal: 6, paddingVertical: 2,
                                borderRadius: 4,
                              }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Ad</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </Reanimated.View>
                    </GestureDetector>
                  </View>
                  {ads.length > 1 && (
                    <View className="flex-row justify-center mt-3 gap-1">
                      {ads.map((_, i) => (
                        <View
                          key={i}
                          style={{
                            width: i === activeAdIndex ? 16 : 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: i === activeAdIndex ? BrandColors.burgundy : (isDarkMode ? '#555' : '#ccc'),
                          }}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Recent Activity */}
          {showRecentActivity && <View className="px-3 mb-6">
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
                <ActivityIndicator size="small" color={BrandColors.secondary} />
                <ThemedText variant="caption" className="mt-2 text-textSecondary dark:text-darkTextSecondary">Loading activity...</ThemedText>
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
                      <View className={`p-2 rounded-full ${activity.booking_status === 'trip_completed'
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
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mt-1">
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
          </View>}

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
                <ActivityIndicator size="small" color={BrandColors.secondary} />
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
                    <View
                      className="w-48 my-2 rounded-2xl overflow-hidden border border-border dark:border-darkBorder bg-surface dark:bg-darkSurface"
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                    >
                      {blog.image ? (
                        <Image
                          source={{ uri: blog.image }}
                          className="w-full h-32"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-32 bg-gray-200 dark:bg-darkSurface items-center justify-center">
                          <ThemedText className="text-textSecondary dark:text-darkTextSecondary text-xs">No Image</ThemedText>
                        </View>
                      )}
                      <View className="px-3 py-2">
                        <ThemedText className="font-semibold text-center" numberOfLines={2}>
                          {blog.title}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <ThemedCard className="items-center py-4">
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">No content available</ThemedText>
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
              backgroundColor: isDarkMode ? BrandColors.burgundy : BrandColors.secondary,
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
                backgroundColor: isDarkMode ? BrandColors.secondary : BrandColors.burgundy,
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

      {/* Map Location Picker */}
      <MapLocationPicker
        visible={showMapPicker}
        onLocationSelected={handleMapLocationSelected}
        onClose={() => setShowMapPicker(false)}
        initialCoordinate={
          mapPickerField === 'pickup'
            ? { latitude: currentLocationLat, longitude: currentLocationLng }
            : destinationLat && destinationLng
              ? { latitude: destinationLat, longitude: destinationLng }
              : undefined
        }
        locationType={mapPickerField}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
}