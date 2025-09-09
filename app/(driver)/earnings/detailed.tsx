import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { useAuthStore } from '../../../store/authStore';
import { useEarningsStore } from '../../../store/earningsStore';

interface TripEarning {
  id: string;
  tripNumber: number;
  time: string;
  customerName: string;
  vehicleType: string;
  distance: number;
  duration: number;
  baseFare: number;
  tip: number;
  total: number;
}

export default function DetailedEarningsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { earnings } = useEarningsStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const todayTrips: TripEarning[] = [
    {
      id: '1',
      tripNumber: 1,
      time: '8:30 AM',
      customerName: 'David L.',
      vehicleType: 'Tesla Model S',
      distance: 28,
      duration: 35,
      baseFare: 445.25,
      tip: 80,
      total: 525.25
    },
    {
      id: '2',
      tripNumber: 2,
      time: '10:15 AM',
      customerName: 'Maria K.',
      vehicleType: 'BMW 3 Series',
      distance: 18,
      duration: 22,
      baseFare: 325.00,
      tip: 50,
      total: 375.00
    },
    {
      id: '3',
      tripNumber: 3,
      time: '1:45 PM',
      customerName: 'Sarah C.',
      vehicleType: 'BMW X5',
      distance: 56,
      duration: 47,
      baseFare: 675.50,
      tip: 125,
      total: 800.50
    }
  ];

  const earningsBreakdown = {
    baseFares: 1985.75,
    distanceCharges: 234.50,
    timeBonuses: 89.25,
    tipsReceived: 425.00,
    surgeEarnings: 156.75,
    grossEarnings: 2891.25,
    platformFee: 415.75,
    netEarnings: 2475.50
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <ThemedText variant="title" className="font-bold">
            My Earnings
          </ThemedText>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Today's Total */}
          <View className="px-6 py-4 bg-burgundy">
            <ThemedText className="text-white text-3xl font-bold">
              ₹{earningsBreakdown.netEarnings.toLocaleString('en-IN')}
            </ThemedText>
            <ThemedText className="text-white/80">TODAY'S EARNINGS</ThemedText>
          </View>

          <View className="px-6">
            {/* Trip Breakdown Header */}
            <View className="py-4">
              <View className="flex-row items-center justify-between mb-4">
                <ThemedText variant="title" className="font-bold">
                  TRIP BREAKDOWN
                </ThemedText>
                <TouchableOpacity>
                  <ThemedText className="text-burgundy">View More Trips</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Trip Cards */}
              <View className="space-y-4 mb-6">
                {todayTrips.map((trip) => (
                  <ThemedCard key={trip.id} className="p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <ThemedText className="font-bold">
                          Trip #{trip.tripNumber} - {trip.time}
                        </ThemedText>
                        <ThemedText variant="secondary">
                          {trip.customerName} • {trip.vehicleType}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          {trip.distance} km • {trip.duration} min
                        </ThemedText>
                      </View>
                      <View className="items-end">
                        <ThemedText className="font-bold text-burgundy text-xl">
                          ₹{trip.total.toLocaleString('en-IN')}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          Base: ₹{trip.baseFare.toFixed(2)}
                        </ThemedText>
                        <ThemedText variant="caption" className="text-secondary">
                          Tip: ₹{trip.tip}
                        </ThemedText>
                      </View>
                    </View>
                  </ThemedCard>
                ))}
              </View>
            </View>

            {/* Earnings Analysis */}
            <View className="py-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="analytics" size={20} color="#BD8C5E" />
                <ThemedText variant="title" className="font-bold ml-2">
                  EARNINGS ANALYSIS
                </ThemedText>
              </View>

              <ThemedCard className="p-4 mb-6">
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <ThemedText>Base fares:</ThemedText>
                    <ThemedText className="font-semibold">
                      ₹{earningsBreakdown.baseFares.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Distance charges:</ThemedText>
                    <ThemedText className="font-semibold">
                      ₹{earningsBreakdown.distanceCharges.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Time bonuses:</ThemedText>
                    <ThemedText className="font-semibold">
                      ₹{earningsBreakdown.timeBonuses.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Tips received:</ThemedText>
                    <ThemedText className="font-semibold text-success">
                      ₹{earningsBreakdown.tipsReceived.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <View className="flex-row justify-between">
                    <ThemedText>Surge earnings:</ThemedText>
                    <ThemedText className="font-semibold text-warning">
                      ₹{earningsBreakdown.surgeEarnings.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  
                  <View className="border-t border-border dark:border-darkBorder pt-3">
                    <View className="flex-row justify-between">
                      <ThemedText className="font-semibold">Gross earnings:</ThemedText>
                      <ThemedText className="font-semibold">
                        ₹{earningsBreakdown.grossEarnings.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText className="text-danger">Platform fee (15%):</ThemedText>
                      <ThemedText className="font-semibold text-danger">
                        -₹{earningsBreakdown.platformFee.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View className="border-t border-border dark:border-darkBorder pt-3">
                    <View className="flex-row justify-between">
                      <ThemedText className="font-bold text-lg">NET EARNINGS:</ThemedText>
                      <ThemedText className="font-bold text-lg text-burgundy">
                        ₹{earningsBreakdown.netEarnings.toLocaleString('en-IN')}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ThemedCard>
            </View>

            {/* Surge Earnings Highlight */}
            <View className="py-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="trending-up" size={20} color="#BD8C5E" />
                <ThemedText variant="title" className="font-bold ml-2">
                  Surge Earnings Highlight
                </ThemedText>
              </View>

              <ThemedCard className="p-4 mb-6 bg-warning/10 border border-warning/20">
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <ThemedText>Peak hours bonus:</ThemedText>
                    <ThemedText className="font-bold text-warning">
                      +₹{earningsBreakdown.surgeEarnings.toLocaleString('en-IN')}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" className="text-secondary">
                    Best surge trip: Trip #3 (1.3x multiplier)
                  </ThemedText>
                </View>
              </ThemedCard>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 pb-6">
              <TouchableOpacity
                onPress={() => router.push('/(driver)/earnings/withdraw')}
                className="flex-1 bg-burgundy py-4 rounded-lg"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="wallet" size={20} color="white" />
                  <ThemedText className="text-white font-semibold ml-2">
                    Request Advance
                  </ThemedText>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.push('/(driver)/(tabs)/earnings')}
                className="flex-1 bg-secondary py-4 rounded-lg"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="analytics" size={20} color="white" />
                  <ThemedText className="text-white font-semibold ml-2">
                    Analytics
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-3 pb-6">
              <TouchableOpacity className="flex-1 bg-surface dark:bg-darkSurface py-4 rounded-lg border border-border dark:border-darkBorder">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="mail" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  <ThemedText className="font-semibold ml-2">Email Report</ThemedText>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-surface dark:bg-darkSurface py-4 rounded-lg border border-border dark:border-darkBorder">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="card" size={20} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
                  <ThemedText className="font-semibold ml-2">Payout Info</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}