import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

// WheelPicker component using ScrollView instead of FlatList to avoid nesting issues
const WheelPicker = React.memo(({
  data,
  selectedValue,
  onValueChange,
  width = 70,
  isDarkMode
}: {
  data: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  width?: number;
  isDarkMode: boolean;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = data.indexOf(selectedValue);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onValueChange(data[clampedIndex]);
  }, [data, onValueChange]);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
      }, 100);
    }
  }, []);

  // Calculate position for each item relative to center
  const getItemStyle = (index: number) => {
    const centerIndex = data.indexOf(selectedValue);
    const isCenter = index === centerIndex;

    return {
      fontSize: isCenter ? 24 : 18,
      fontWeight: isCenter ? '600' as const : '400' as const,
      color: isCenter
        ? (isDarkMode ? '#ffffff' : '#000000')
        : (isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')
    };
  };

  return (
    <View style={{ width, height: ITEM_HEIGHT * VISIBLE_ITEMS, overflow: 'hidden' }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
        }}
      >
        {data.map((item, index) => {
          const itemStyle = getItemStyle(index);
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={1}
              onPress={() => {
                onValueChange(item);
                scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
              }}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
                width: width
              }}
            >
              <ThemedText style={itemStyle}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default function ScheduleScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [bookingType, setBookingType] = useState<'scheduled' | 'extended'>('scheduled');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      options.push({
        value: date.toISOString().split('T')[0],
        label: label,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      });
    }
    return options;
  };

  // Hours and minutes for iOS-style picker
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const [selectedHour, setSelectedHour] = useState('6');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const extendedServices = [
    {
      id: '4h',
      duration: '4 Hours',
      price: '₹8,000',
      description: 'Perfect for business meetings or shopping',
      popular: false
    },
    {
      id: '8h',
      duration: '8 Hours',
      price: '₹15,000',
      description: 'Full day service for tours or events',
      popular: true
    },
    {
      id: '12h',
      duration: '12 Hours',
      price: '₹20,500',
      description: 'Extended service for long events',
      popular: false
    }
  ];

  const dateOptions = getDateOptions();

  // Get formatted time string
  const getFormattedTime = () => {
    return `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
  };

  const handleSchedule = () => {
    const formattedTime = getFormattedTime();
    if (bookingType === 'scheduled') {
      if (!selectedDate) {
        Alert.alert('Missing Information', 'Please select a date.');
        return;
      }
    } else {
      if (!selectedDate || !selectedDuration) {
        Alert.alert('Missing Information', 'Please select date and service duration.');
        return;
      }
    }

    Alert.alert('Ride Scheduled!', `Your chauffeur service has been scheduled for ${formattedTime}.`);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText variant="title" className="ml-4">Schedule Ride</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Service Type Toggle */}
          <View className="px-6 py-6">
            <ThemedText variant="title" className="text-lg mb-4">Service Type</ThemedText>
            <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}>
              {bookingType === 'scheduled' ? (
                <View className="flex-1 py-3 rounded-lg bg-secondary">
                  <ThemedText className="text-center font-semibold text-white">Point to Point</ThemedText>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setBookingType('scheduled')} className="flex-1 py-3 rounded-lg">
                  <ThemedText className="text-center font-semibold text-textSecondary">Point to Point</ThemedText>
                </TouchableOpacity>
              )}
              {bookingType === 'extended' ? (
                <View className="flex-1 py-3 rounded-lg bg-secondary">
                  <ThemedText className="text-center font-semibold text-white">Extended Service</ThemedText>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setBookingType('extended')} className="flex-1 py-3 rounded-lg">
                  <ThemedText className="text-center font-semibold text-textSecondary">Extended Service</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Extended Service Duration */}
          {bookingType === 'extended' && (
            <View className="px-6 pb-6">
              <ThemedText variant="title" className="text-lg mb-4">Service Duration</ThemedText>
              {extendedServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedDuration(service.id)}
                  className="mb-3"
                >
                  <ThemedCard className={`p-4 ${
                    selectedDuration === service.id ? 'border-2 border-primary' : ''
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <ThemedText className="font-bold text-lg">{service.duration}</ThemedText>
                          {service.popular && (
                            <View className="bg-primary/20 px-2 py-1 rounded ml-2">
                              <ThemedText className="text-primary text-xs font-semibold">POPULAR</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText variant="secondary" className="mt-1">
                          {service.description}
                        </ThemedText>
                      </View>
                      <View className="items-end">
                        <ThemedText className="font-bold text-primary text-lg">
                          {service.price}
                        </ThemedText>
                        {selectedDuration === service.id && (
                          <Ionicons name="checkmark-circle" size={20} color="#bd8c5e" />
                        )}
                      </View>
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Date Selection */}
          <View className="px-6 pb-8">
            <ThemedText variant="title" className="text-lg mb-4">Select Date</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dateOptions.map((date) => {
                const isSelected = selectedDate === date.value;
                return isSelected ? (
                  <View key={date.value} className="mr-3 px-4 py-3 min-w-[100px] items-center rounded-xl bg-burgundy">
                    <ThemedText className="font-semibold text-white">{date.label}</ThemedText>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={date.value}
                    onPress={() => setSelectedDate(date.value)}
                    className={`mr-3 px-4 py-3 min-w-[100px] items-center rounded-xl ${isDarkMode ? 'bg-darkSurface' : 'bg-surface'}`}
                  >
                    <ThemedText className="font-semibold text-textSecondary">{date.label}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selection - iOS Style Wheel Picker */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">Select Time</ThemedText>
            <ThemedCard className="p-4">
              <View className="relative">
                {/* Selection Indicator */}
                <View
                  className="absolute left-0 right-0 bg-secondary/10 rounded-xl"
                  style={{
                    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                    height: ITEM_HEIGHT,
                  }}
                  pointerEvents="none"
                />

                {/* Wheel Pickers */}
                <View className="flex-row justify-center items-center">
                  <WheelPicker
                    data={hours}
                    selectedValue={selectedHour}
                    onValueChange={setSelectedHour}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                  <ThemedText style={{ fontSize: 22, fontWeight: '600', marginHorizontal: 4 }}>:</ThemedText>
                  <WheelPicker
                    data={minutes}
                    selectedValue={selectedMinute}
                    onValueChange={setSelectedMinute}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                  <View style={{ width: 16 }} />
                  <WheelPicker
                    data={periods}
                    selectedValue={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                    width={60}
                    isDarkMode={isDarkMode}
                  />
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Service Information */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">What's Included</ThemedText>
            <ThemedCard className="p-4">
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Professional chauffeur</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Verified & trained drivers</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Real-time ride tracking</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">24/7 customer support</ThemedText>
                </View>
                {bookingType === 'extended' && (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <ThemedText className="ml-3">Flexible stops and waiting time</ThemedText>
                  </View>
                )}
              </View>
            </ThemedCard>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-border dark:border-darkBorder">
          {selectedDate && (bookingType === 'scheduled' || selectedDuration) && (
            <View className="mb-4 p-4 bg-secondary/10 border border-secondary rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <ThemedText className="font-semibold text-secondary">Schedule Summary</ThemedText>
                <Ionicons name="calendar" size={20} color="#720c17" />
              </View>
              <ThemedText variant="secondary">
                {dateOptions.find(d => d.value === selectedDate)?.fullDate} at {getFormattedTime()}
              </ThemedText>
              {bookingType === 'extended' && selectedDuration && (
                <ThemedText variant="secondary">
                  {extendedServices.find(s => s.id === selectedDuration)?.duration} service
                </ThemedText>
              )}
            </View>
          )}
          
          <PrimaryButton
            title="Schedule Ride"
            onPress={handleSchedule}
          />
          
          <TouchableOpacity className="mt-3 items-center">
            <ThemedText className="text-secondary">Need help? Contact support</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}