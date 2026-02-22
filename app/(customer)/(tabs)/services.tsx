import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Image, Animated, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import AmenityApiService, { Amenity, AmenityCategory } from '../../../services/api/AmenityApiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ServicesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);

  const iconColor = isDarkMode ? '#BD8C5E' : '#720C17';

  // Main service types
  const mainServices = [
    {
      id: 'one-side',
      name: 'One-Side',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',
    },
    {
      id: 'round-trip',
      name: 'Round-Trip',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
    },
    {
      id: 'hourly',
      name: 'Hourly Flexi-hire',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80',
    },
  ];

  // Feature buttons with navigation
  const featureButtons = [
    { id: 'schedule', name: 'Schedule', icon: 'calendar-outline', route: '/(customer)/schedule' },
    { id: 'amenities', name: 'Amenities List', icon: 'list-outline', route: null },
    { id: 'insurance', name: 'Insurance', icon: 'shield-checkmark-outline', route: '/(customer)/trip-insurance' },
    { id: 'corporate', name: 'Corporate', icon: 'business-outline', route: null },
  ];

  // Save everyday cards (moved from index.tsx Popular Services)
  const saveEverydayCards = [
    {
      id: 1,
      title: 'Round-Trip',
      subtitle: 'Save up to 20%',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',
    },
    {
      id: 2,
      title: 'Corporate Subscription',
      subtitle: 'Monthly plans available',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
    },
  ];

  // Popular services (moved from index.tsx)
  const popularServices = [
    { id: 1, name: 'Airport Transfer', description: 'Fast & reliable airport rides', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },
    { id: 2, name: 'City Tour', description: 'Explore the city in comfort', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
    { id: 3, name: 'Business Meeting', description: 'Professional corporate travel', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80' },
    { id: 4, name: 'Wedding Service', description: 'Make your day special', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80' },
  ];

  // Fetch amenities from API when modal opens
  useEffect(() => {
    if (showAmenitiesModal && amenities.length === 0) {
      setIsLoadingAmenities(true);
      AmenityApiService.listAmenities().then((res) => {
        if (res.success && res.data) setAmenities(res.data);
        setIsLoadingAmenities(false);
      });
    }
  }, [showAmenitiesModal]);

  const groupedAmenities = AmenityApiService.groupByCategory(amenities);

  // Corporate benefits
  const corporateBenefits = [
    { icon: 'card-outline', title: 'Corporate Billing', desc: 'Centralized invoicing for easy expense management' },
    { icon: 'people-outline', title: 'Multiple Users', desc: 'Add team members under one corporate account' },
    { icon: 'analytics-outline', title: 'Usage Reports', desc: 'Detailed monthly reports and analytics' },
    { icon: 'pricetag-outline', title: 'Volume Discounts', desc: 'Special rates for high-volume bookings' },
    { icon: 'time-outline', title: 'Priority Booking', desc: 'Guaranteed availability for corporate clients' },
    { icon: 'shield-checkmark-outline', title: 'Dedicated Support', desc: '24/7 dedicated account manager' },
  ];

  const handleBookService = () => {
    router.push('/(customer)/book-ride-new');
  };

  const handleFeaturePress = (feature: typeof featureButtons[0]) => {
    if (feature.route) {
      router.push(feature.route as any);
    } else if (feature.id === 'amenities') {
      setShowAmenitiesModal(true);
    } else if (feature.id === 'corporate') {
      setShowCorporateModal(true);
    }
  };

  // Animated press scale
  const createPressAnimation = () => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return { scaleValue, onPressIn, onPressOut };
  };

  const ServiceButton = ({ service }: { service: typeof mainServices[0] }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handleBookService}
        className="flex-1 mx-1"
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-darkSurface' : 'bg-secondary/10'}`}
        >
          <Image
            source={{ uri: service.image }}
            className="w-full h-24"
            resizeMode="cover"
          />
          <View className="py-3 px-2">
            <ThemedText className="text-center font-bold text-sm" numberOfLines={1}>
              {service.name}
            </ThemedText>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const FeatureButton = ({ feature }: { feature: typeof featureButtons[0] }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => handleFeaturePress(feature)}
        className="flex-1 mx-1"
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <ThemedCard className="items-center py-3 px-1">
            <View className="bg-secondary/10 p-2 rounded-full mb-2">
              <Ionicons name={feature.icon as any} size={20} color="#BD8C5E" />
            </View>
            <ThemedText variant="caption" className="text-center font-medium" numberOfLines={1}>
              {feature.name}
            </ThemedText>
          </ThemedCard>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const SaveEverydayCard = ({ card, index }: { card: typeof saveEverydayCards[0]; index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardWidth = SCREEN_WIDTH * 0.75;

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    // Parallax effect
    const inputRange = [
      (index - 1) * cardWidth,
      index * cardWidth,
      (index + 1) * cardWidth,
    ];

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-30, 0, 30],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handleBookService}
        style={{ width: cardWidth, marginRight: 16 }}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className={`rounded-3xl overflow-hidden ${isDarkMode ? 'bg-darkSurface' : 'bg-white'}`}
        >
          <View className="relative h-44 overflow-hidden">
            <Animated.Image
              source={{ uri: card.image }}
              style={{
                width: cardWidth + 60,
                height: '100%',
                transform: [{ translateX }],
              }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-4 left-4 right-4">
              <ThemedText className="text-white font-bold text-xl">{card.title}</ThemedText>
              <View className="flex-row items-center mt-1">
                <ThemedText className="text-white/90 text-sm">{card.subtitle}</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 8 }} />
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <ThemedText variant="h1">Services</ThemedText>
            <ThemedText variant="small" className="mt-1 text-textSecondary dark:text-darkTextSecondary">
              Go anywhere, get anything
            </ThemedText>
          </View>

          {/* Main Service Buttons */}
          <View className="px-3 mb-6">
            <View className="flex-row">
              {mainServices.map((service) => (
                <ServiceButton key={service.id} service={service} />
              ))}
            </View>
          </View>

          {/* Feature Buttons Row */}
          <View className="px-3 mb-6">
            <View className="flex-row">
              {featureButtons.map((feature) => (
                <FeatureButton key={feature.id} feature={feature} />
              ))}
            </View>
          </View>

          {/* Save Everyday Section */}
          <View className="mb-6">
            <View className="px-6 mb-4">
              <ThemedText variant="title" className="text-lg">Save Everyday</ThemedText>
            </View>

            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH * 0.75 + 16}
              snapToAlignment="start"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            >
              {saveEverydayCards.map((card, index) => (
                <SaveEverydayCard key={card.id} card={card} index={index} />
              ))}
            </Animated.ScrollView>
          </View>

          {/* Popular Services Section */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between items-center mb-4 px-3">
              <ThemedText variant="title" className="text-lg">
                Popular Services
              </ThemedText>
              <TouchableOpacity>
                <ThemedText className="text-secondary">View All</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  className="mr-4"
                  activeOpacity={0.8}
                  onPress={handleBookService}
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
                      <ThemedText variant="caption" className="text-center dark:text-gray-400" numberOfLines={2}>
                        {service.description}
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

        {/* Amenities Modal */}
        <Modal
          visible={showAmenitiesModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAmenitiesModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 max-h-[85%] ${isDarkMode ? 'bg-darkBackground' : 'bg-white'}`}>
              <View className="flex-row justify-between items-center mb-6">
                <ThemedText variant="h2">Amenities List</ThemedText>
                <TouchableOpacity onPress={() => setShowAmenitiesModal(false)}>
                  <Ionicons name="close" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {isLoadingAmenities && (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color="#BD8C5E" />
                    <ThemedText className="mt-3 text-gray-500">Loading amenities...</ThemedText>
                  </View>
                )}

                {!isLoadingAmenities && amenities.length === 0 && (
                  <View className="py-8 items-center">
                    <Ionicons name="cafe-outline" size={40} color="#999" />
                    <ThemedText className="mt-3 text-gray-500">No amenities available</ThemedText>
                  </View>
                )}

                {!isLoadingAmenities && (Object.entries(groupedAmenities) as [AmenityCategory, Amenity[]][]).map(([category, items]) => {
                  if (items.length === 0) return null;
                  const categoryEmoji = category === 'refreshment' ? '💧' : category === 'comfort' ? '🛋️' : '✨';
                  return (
                    <View key={category} className="mb-6">
                      <ThemedText variant="title" className="mb-3">
                        {categoryEmoji} {AmenityApiService.getCategoryDisplayName(category)}
                      </ThemedText>
                      <View className="flex-row flex-wrap">
                        {items.map((item) => (
                          <View key={item.id} className="w-1/2 p-1">
                            <ThemedCard className="flex-row items-center py-3 px-3">
                              <Ionicons name={AmenityApiService.getCategoryIcon(category) as any} size={20} color="#BD8C5E" />
                              <View className="ml-2 flex-1">
                                <ThemedText variant="small" numberOfLines={1}>{item.name}</ThemedText>
                                <ThemedText variant="tiny" className="text-secondary">{AmenityApiService.formatPrice(item.price)}</ThemedText>
                              </View>
                            </ThemedCard>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}

                <ThemedText variant="caption" className="text-center text-textSecondary dark:text-darkTextSecondary mt-4">
                  Select amenities during booking to customize your ride experience
                </ThemedText>
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  setShowAmenitiesModal(false);
                  router.push('/(customer)/book-ride-new');
                }}
                className="bg-burgundy py-4 rounded-xl mt-4"
              >
                <ThemedText className="text-white text-center font-semibold">
                  Book with Amenities
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Corporate Modal */}
        <Modal
          visible={showCorporateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCorporateModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 max-h-[85%] ${isDarkMode ? 'bg-darkBackground' : 'bg-white'}`}>
              <View className="flex-row justify-between items-center mb-6">
                <ThemedText variant="h2">Corporate Services</ThemedText>
                <TouchableOpacity onPress={() => setShowCorporateModal(false)}>
                  <Ionicons name="close" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-6">
                  <View className="bg-secondary/10 p-4 rounded-full mb-3">
                    <Ionicons name="business" size={40} color="#BD8C5E" />
                  </View>
                  <ThemedText variant="h3" className="text-center mb-2">
                    Elevate Your Business Travel
                  </ThemedText>
                  <ThemedText variant="small" className="text-center text-textSecondary">
                    Professional chauffeur services tailored for corporate needs
                  </ThemedText>
                </View>

                {/* Benefits */}
                <View className="mb-6">
                  {corporateBenefits.map((benefit, index) => (
                    <ThemedCard key={index} className="flex-row items-center p-4 mb-3">
                      <View className="bg-secondary/10 p-2 rounded-full">
                        <Ionicons name={benefit.icon as any} size={24} color="#BD8C5E" />
                      </View>
                      <View className="ml-4 flex-1">
                        <ThemedText className="font-semibold">{benefit.title}</ThemedText>
                        <ThemedText variant="caption" className="text-textSecondary">
                          {benefit.desc}
                        </ThemedText>
                      </View>
                    </ThemedCard>
                  ))}
                </View>

                <ThemedCard className="p-4 mb-4 bg-burgundy/10">
                  <ThemedText className="font-semibold text-burgundy mb-2">
                    Get Started Today
                  </ThemedText>
                  <ThemedText variant="small" className="text-textSecondary">
                    Contact our corporate team for customized packages and volume discounts.
                  </ThemedText>
                </ThemedCard>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowCorporateModal(false)}
                className="bg-burgundy py-4 rounded-xl mt-4"
              >
                <ThemedText className="text-white text-center font-semibold">
                  Contact Corporate Team
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
