import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function ScheduleScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  
  const [bookingType, setBookingType] = useState<'scheduled' | 'extended'>('scheduled');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
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

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

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

  const handleSchedule = () => {
    if (bookingType === 'scheduled') {
      if (!selectedDate || !selectedTime) {
        Alert.alert('Missing Information', 'Please select both date and time.');
        return;
      }
    } else {
      if (!selectedDate || !selectedTime || !selectedDuration) {
        Alert.alert('Missing Information', 'Please select date, time, and service duration.');
        return;
      }
    }

    Alert.alert('Ride Scheduled!', 'Your chauffeur service has been scheduled successfully.');
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
            <View className="flex-row bg-surface dark:bg-darkSurface rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setBookingType('scheduled')}
                className={`flex-1 py-3 rounded-lg ${
                  bookingType === 'scheduled' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    bookingType === 'scheduled' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Point to Point
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBookingType('extended')}
                className={`flex-1 py-3 rounded-lg ${
                  bookingType === 'extended' ? 'bg-primary' : ''
                }`}
              >
                <ThemedText 
                  className={`text-center ${
                    bookingType === 'extended' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Extended Service
                </ThemedText>
              </TouchableOpacity>
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
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">Select Date</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dateOptions.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  onPress={() => setSelectedDate(date.value)}
                  className="mr-3"
                >
                  <ThemedCard className={`px-4 py-3 min-w-[100px] items-center ${
                    selectedDate === date.value ? 'bg-primary' : ''
                  }`}>
                    <ThemedText className={`font-semibold ${
                      selectedDate === date.value ? 'text-white' : ''
                    }`}>
                      {date.label}
                    </ThemedText>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View className="px-6 pb-6">
            <ThemedText variant="title" className="text-lg mb-4">Select Time</ThemedText>
            <View className="flex-row flex-wrap">
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className="w-[23%] mr-[2%] mb-3"
                >
                  <ThemedCard className={`py-3 items-center ${
                    selectedTime === time ? 'bg-primary' : ''
                  }`}>
                    <ThemedText className={`font-semibold ${
                      selectedTime === time ? 'text-white' : ''
                    }`}>
                      {time}
                    </ThemedText>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
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
                  <ThemedText className="ml-3">Luxury vehicle</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <ThemedText className="ml-3">Complimentary water & phone charger</ThemedText>
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
          {selectedDate && selectedTime && (bookingType === 'scheduled' || selectedDuration) && (
            <View className="mb-4 p-4 bg-secondary/10 border border-secondary rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <ThemedText className="font-semibold text-secondary">Schedule Summary</ThemedText>
                <Ionicons name="calendar" size={20} color="#720c17" />
              </View>
              <ThemedText variant="secondary">
                {dateOptions.find(d => d.value === selectedDate)?.fullDate} at {selectedTime}
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