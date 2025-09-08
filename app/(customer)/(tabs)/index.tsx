import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, RefreshControl } from 'react-native';
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
  
  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

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
    { id: 1, name: 'Airport Transfer', price: 'From ₹2,500', duration: '45 min', icon: 'airplane' },
    { id: 2, name: 'City Tour', price: 'From ₹4,000/hr', duration: '4 hrs', icon: 'car' },
    { id: 3, name: 'Business Meeting', price: 'From ₹2,800', duration: '2 hrs', icon: 'business' },
    { id: 4, name: 'Wedding Service', price: 'From ₹8,000', duration: '6 hrs', icon: 'heart' },
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/(customer)/book-ride-new',
        params: { destination: searchText.trim() }
      });
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
            <View className={`flex-row items-center px-4 py-3 rounded-xl border ${
              isDarkMode ? 'bg-darkSurface border-darkBorder' : 'bg-white border-border'
            }`}>
              <Ionicons name="search" size={20} color={iconColor} />
              <TextInput
                className={`flex-1 ml-3 ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
                placeholder="Search destination..."
                placeholderTextColor={iconColor}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => setSearchText('')} className="mr-2">
                    <Ionicons name="close-circle" size={20} color={iconColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSearch} className="bg-burgundy px-3 py-1 rounded-lg">
                    <ThemedText className="text-white text-sm font-medium">Search</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Quick Actions */}
          <View className="px-3 mb-6">
            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <View key={index} className="flex-1 mx-1">
                  <ThemedCard 
                    variant="premium" 
                    className="items-center py-6 min-h-[100px] justify-center"
                    pressable
                    onPress={action.action}
                  >
                    <View className="bg-secondary/10 p-3 rounded-full mb-3">
                      <Ionicons name={action.icon as any} size={24} color="#BD8C5E" />
                    </View>
                    <ThemedText variant="tiny" className="text-center font-medium">
                      {action.title}
                    </ThemedText>
                  </ThemedCard>
                </View>
              ))}
            </View>
          </View>
          
          {/* Popular Services */}
          <View className="px-3 mb-6 ">
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
                <TouchableOpacity key={service.id} className="mr-4">
                  <ThemedCard className="w-56 p-4 my-2">
                    <View className="flex-row items-center mb-3">
                      <View className="bg-primary/10 p-2 rounded-lg">
                        <Ionicons name={service.icon as any} size={20} color="#bd8c5e" />
                      </View>
                      <View className="ml-3 flex-1">
                        <ThemedText className="font-semibold">{service.name}</ThemedText>
                        <ThemedText variant="caption">{service.duration}</ThemedText>
                      </View>
                    </View>
                    <ThemedText className="font-bold text-primary mb-2">
                      {service.price}
                    </ThemedText>
                    <TouchableOpacity 
                      className="bg-secondary py-2 rounded-lg"
                      onPress={() => router.push('/(customer)/book-ride-new')}
                    >
                      <ThemedText className="text-white text-center font-semibold">
                        Book Now
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
          
          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}