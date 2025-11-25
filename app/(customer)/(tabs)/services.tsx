import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  features: string[];
  category: 'hourly' | 'transfer' | 'special';
  popular?: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export default function ServicesScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const iconColor = isDarkMode ? '#BD8C5E' : '#720C17';

  const categories: ServiceCategory[] = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'hourly', name: 'Hourly', icon: 'time-outline' },
    { id: 'transfer', name: 'Transfer', icon: 'car-outline' },
    { id: 'special', name: 'Special', icon: 'star-outline' },
  ];

  const services: Service[] = [
    {
      id: '1',
      name: 'Hourly Rental',
      description: 'Flexible chauffeur service charged by the hour. Perfect for meetings, shopping, or city exploration.',
      price: 'From ₹600/hr',
      duration: 'Min 2 hours',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80',
      features: ['Professional chauffeur', 'Flexible scheduling', 'Multiple stops', 'Uniformed driver'],
      category: 'hourly',
      popular: true,
    },
    {
      id: '2',
      name: 'Airport Transfer',
      description: 'Reliable airport pickup and drop service with punctual and professional chauffeurs.',
      price: 'From ₹1,500',
      duration: 'One-way',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
      features: ['On-time pickup', 'Professional driver', 'Door-to-door service', 'Safe driving'],
      category: 'transfer',
      popular: true,
    },
    {
      id: '3',
      name: 'Full Day Package',
      description: '8-hour dedicated chauffeur service for a full day of travel within city limits.',
      price: 'From ₹4,000',
      duration: '8 hours',
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80',
      features: ['Dedicated chauffeur', 'Flexible itinerary', 'City-wide coverage', 'Reliable service'],
      category: 'hourly',
    },
    {
      id: '4',
      name: 'Outstation Trip',
      description: 'Long-distance travel with experienced chauffeurs. One-way and round-trip options available.',
      price: 'From ₹12/km',
      duration: 'As per trip',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
      features: ['Experienced drivers', 'Long-distance expert', 'Safe driving', 'Multiple cities'],
      category: 'transfer',
    },
    {
      id: '5',
      name: 'Wedding Service',
      description: 'Professional chauffeurs for your special day ensuring a smooth and elegant experience.',
      price: 'From ₹8,000',
      duration: 'Custom',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
      features: ['Well-groomed chauffeur', 'Punctual service', 'Courteous behavior', 'Event coordination'],
      category: 'special',
    },
    {
      id: '6',
      name: 'Corporate Service',
      description: 'Professional chauffeur services for business executives and corporate events.',
      price: 'Custom',
      duration: 'As per need',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
      features: ['Corporate accounts', 'Priority booking', 'Trained chauffeurs', 'Confidential service'],
      category: 'special',
    },
  ];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(service => service.category === activeCategory);

  const handleBookService = () => {
    router.push('/(customer)/book-ride-new');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <ThemedText variant="h1">Our Services</ThemedText>
          <ThemedText variant="small" className="mt-1 text-textSecondary">
            Premium chauffeur services for every occasion
          </ThemedText>
        </View>

        {/* Category Tabs */}
        <View className="px-6 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {categories.map((category) => (
                activeCategory === category.id ? (
                  <View
                    key={category.id}
                    className="flex-row items-center mr-3 px-4 py-2 rounded-full bg-burgundy"
                  >
                    <Ionicons name={category.icon as any} size={16} color="#FFFFFF" />
                    <ThemedText className="ml-2 font-semibold text-white">
                      {category.name}
                    </ThemedText>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setActiveCategory(category.id)}
                    className={`flex-row items-center mr-3 px-4 py-2 rounded-full ${
                      isDarkMode ? 'bg-darkSurface' : 'bg-surface'
                    }`}
                  >
                    <Ionicons name={category.icon as any} size={16} color={iconColor} />
                    <ThemedText className="ml-2 font-semibold text-textSecondary">
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                )
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Services List */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6">
            {filteredServices.map((service) => (
              <ThemedCard key={service.id} className="mb-4 overflow-hidden">
                {/* Service Image */}
                <Image
                  source={{ uri: service.image }}
                  className="w-full h-40"
                  resizeMode="cover"
                />

                {/* Popular Badge */}
                {service.popular && (
                  <View className="absolute top-3 left-3 bg-burgundy px-3 py-1 rounded-full">
                    <ThemedText className="text-white text-xs font-semibold">Popular</ThemedText>
                  </View>
                )}

                {/* Service Details */}
                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <ThemedText variant="h3" className="flex-1 font-bold">
                      {service.name}
                    </ThemedText>
                    <View className="items-end">
                      <ThemedText className="font-bold text-burgundy">{service.price}</ThemedText>
                      <ThemedText variant="caption" className="text-textSecondary">
                        {service.duration}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText variant="small" className="text-textSecondary mb-3">
                    {service.description}
                  </ThemedText>

                  {/* Features */}
                  <View className="flex-row flex-wrap mb-4">
                    {service.features.map((feature, index) => (
                      <View
                        key={index}
                        className={`flex-row items-center mr-3 mb-2 px-2 py-1 rounded ${
                          isDarkMode ? 'bg-darkSurface' : 'bg-surface'
                        }`}
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <ThemedText variant="caption" className="ml-1">
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity
                    onPress={handleBookService}
                    className="bg-burgundy py-3 rounded-xl"
                  >
                    <ThemedText className="text-white text-center font-semibold">
                      Book Now
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            ))}
          </View>

          {/* Why Choose Us Section */}
          <View className="px-6 py-6">
            <ThemedText variant="h2" className="mb-4">Why Choose Chauffit?</ThemedText>

            <View className="flex-row flex-wrap">
              {[
                { icon: 'shield-checkmark', title: 'Verified Drivers', desc: 'Background checked' },
                { icon: 'car-sport', title: 'Premium Fleet', desc: 'Well-maintained cars' },
                { icon: 'time', title: '24/7 Available', desc: 'Round the clock' },
                { icon: 'cash', title: 'Fair Pricing', desc: 'No hidden charges' },
              ].map((item, index) => (
                <View key={index} className="w-1/2 p-2">
                  <ThemedCard className="p-4 items-center">
                    <View className="bg-primary/10 p-3 rounded-full mb-2">
                      <Ionicons name={item.icon as any} size={24} color={iconColor} />
                    </View>
                    <ThemedText className="font-semibold text-center">{item.title}</ThemedText>
                    <ThemedText variant="caption" className="text-textSecondary text-center">
                      {item.desc}
                    </ThemedText>
                  </ThemedCard>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
