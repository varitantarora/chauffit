import React, { useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useLoyaltyStore } from '../../store/loyaltyStore';
import LoyaltyApiService, { CreditTransaction, ReferralEvent } from '../../services/api/LoyaltyApiService';
import { useRouter } from 'expo-router';
import { BrandColors } from '../../constants/Colors';

export default function WalletScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    profile,
    transactions,
    referrals,
    isLoadingProfile,
    isLoadingTransactions,
    isLoadingReferrals,
    error,
    fetchAll,
    fetchProfile,
  } = useLoyaltyStore();

  const iconColor = isDarkMode ? BrandColors.secondary : BrandColors.burgundy;

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const scrollToTransactions = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleCopyCode = async () => {
    if (!profile?.referral_code) return;
    Clipboard.setString(profile.referral_code);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };

  const handleShareCode = async () => {
    if (!profile?.referral_code) return;
    await Share.share({
      message: `Use my referral code ${profile.referral_code} on Chauffit to get a discount on your first ride!`,
    });
  };

  const getReferralStatusColor = (status: ReferralEvent['status']) => {
    switch (status) {
      case 'pending':
        return BrandColors.warning;
      case 'completed':
        return '#3B82F6';
      case 'rewarded':
        return BrandColors.success;
      default:
        return '#6B7280';
    }
  };

  const getReferralStatusLabel = (status: ReferralEvent['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'rewarded':
        return 'Rewarded';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderReferralItem = ({ item }: { item: ReferralEvent }) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-darkBorder">
      <View className="flex-1">
        <ThemedText variant="small" className="font-semibold">{item.referred_email}</ThemedText>
        <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">{formatDate(item.created_at)}</ThemedText>
      </View>
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: `${getReferralStatusColor(item.status)}20` }}
      >
        <ThemedText
          variant="tiny"
          className="font-semibold"
          style={{ color: getReferralStatusColor(item.status) }}
        >
          {getReferralStatusLabel(item.status)}
        </ThemedText>
      </View>
    </View>
  );

  const renderTransactionItem = ({ item }: { item: CreditTransaction }) => {
    const isPositive = item.amount > 0;
    const amountColor = isPositive ? BrandColors.success : BrandColors.danger;

    return (
      <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-darkBorder">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${amountColor}20` }}
        >
          <Ionicons
            name={isPositive ? 'add-circle' : 'remove-circle'}
            size={20}
            color={amountColor}
          />
        </View>
        <View className="flex-1">
          <ThemedText variant="small" className="font-semibold">
            {item.description || LoyaltyApiService.getTransactionTypeLabel(item.transaction_type)}
          </ThemedText>
          <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">{formatDate(item.created_at)}</ThemedText>
        </View>
        <ThemedText className="font-bold" style={{ color: amountColor }}>
          {isPositive ? '+' : ''}₹{Math.abs(item.amount).toFixed(2)}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-darkBorder">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText variant="h2">Loyalty & Rewards</ThemedText>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
          <View className="px-6 py-4">

            {/* A. Loyalty Tier Card */}
            <ThemedCard variant="elevated" className="mb-4 p-4">
              <ThemedText variant="h3" className="mb-3">Your Tier</ThemedText>

              {isLoadingProfile && !profile ? (
                <ActivityIndicator size="small" color={BrandColors.secondary} />
              ) : error && !profile ? (
                <View className="items-center py-4">
                  <ThemedText variant="small" className="text-red-500 mb-3">{error}</ThemedText>
                  <TouchableOpacity
                    onPress={fetchProfile}
                    className="px-4 py-2 bg-burgundy rounded-xl"
                  >
                    <ThemedText className="text-white font-semibold">Retry</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : profile ? (
                <>
                  {/* Tier Badge */}
                  <View className="flex-row items-center mb-4">
                    <View
                      className="px-4 py-2 rounded-full mr-3"
                      style={{ backgroundColor: LoyaltyApiService.getTierColor(profile.tier) }}
                    >
                      <ThemedText className="font-bold text-textPrimary dark:text-darkText">
                        {LoyaltyApiService.getTierLabel(profile.tier)}
                      </ThemedText>
                    </View>
                    {profile.discount_percentage > 0 && (
                      <View className="px-3 py-1 bg-green-100 rounded-full">
                        <ThemedText variant="small" className="text-green-700 font-semibold">
                          {profile.discount_percentage}% discount
                        </ThemedText>
                      </View>
                    )}
                    {profile.is_priority_customer && (
                      <View className="ml-2 px-3 py-1 bg-burgundy rounded-full">
                        <ThemedText variant="tiny" className="text-white font-semibold">
                          Priority Booking
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Trip Counters */}
                  <View className="flex-row">
                    <View className="flex-1 items-center p-3 bg-gray-50 dark:bg-darkSurface rounded-xl mr-2">
                      <ThemedText variant="h2" className="text-burgundy">{profile.total_completed_trips}</ThemedText>
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary text-center">Total Trips</ThemedText>
                    </View>
                    <View className="flex-1 items-center p-3 bg-gray-50 dark:bg-darkSurface rounded-xl">
                      <ThemedText variant="h2" className="text-burgundy">{profile.monthly_trip_count}</ThemedText>
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary text-center">This Month</ThemedText>
                    </View>
                  </View>
                </>
              ) : (
                <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">No loyalty data available.</ThemedText>
              )}
            </ThemedCard>

            {/* B. Credit Balance Widget */}
            <ThemedCard variant="elevated" className="mb-4 p-4">
              <ThemedText variant="h3" className="mb-3">Credit Balance</ThemedText>
              {profile ? (
                <View className="items-center">
                  <ThemedText variant="h1" className="text-burgundy mb-3">
                    ₹{Number(profile.credit_balance).toFixed(2)}
                  </ThemedText>
                  <TouchableOpacity onPress={scrollToTransactions}>
                    <ThemedText variant="small" className="text-secondary underline">
                      View Transaction History
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <ActivityIndicator size="small" color={BrandColors.secondary} />
              )}
            </ThemedCard>

            {/* C. Referral Card */}
            <ThemedCard variant="elevated" className="mb-4 p-4">
              <ThemedText variant="h3" className="mb-3">Referral Program</ThemedText>

              {profile ? (
                <>
                  {/* Code Display */}
                  <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-darkSurface rounded-xl">
                    <View>
                      <ThemedText variant="tiny" className="text-textSecondary dark:text-darkTextSecondary">Your Code</ThemedText>
                      <ThemedText variant="h3" className="font-mono tracking-widest">
                        {profile.referral_code}
                      </ThemedText>
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={handleCopyCode}
                        className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center mr-2"
                      >
                        <Ionicons name="copy-outline" size={18} color={BrandColors.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleShareCode}
                        className="w-10 h-10 bg-burgundy rounded-full items-center justify-center"
                      >
                        <Ionicons name="share-social-outline" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Referral List */}
                  {isLoadingReferrals ? (
                    <ActivityIndicator size="small" color={BrandColors.secondary} />
                  ) : referrals.length > 0 ? (
                    <>
                      <ThemedText variant="small" className="font-semibold mb-2">
                        Your Referrals ({referrals.length})
                      </ThemedText>
                      <FlatList
                        data={referrals}
                        keyExtractor={(item) => item.id}
                        renderItem={renderReferralItem}
                        scrollEnabled={false}
                      />
                    </>
                  ) : (
                    <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary text-center py-3">
                      No referrals yet. Share your code to earn rewards!
                    </ThemedText>
                  )}
                </>
              ) : (
                <ActivityIndicator size="small" color={BrandColors.secondary} />
              )}
            </ThemedCard>

            {/* D. Credit Transaction History */}
            <View className="mb-6">
              <ThemedText variant="h3" className="mb-3">Transaction History</ThemedText>

              {isLoadingTransactions ? (
                <ActivityIndicator size="small" color={BrandColors.secondary} />
              ) : transactions.length > 0 ? (
                <ThemedCard className="p-4">
                  <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTransactionItem}
                    scrollEnabled={false}
                  />
                </ThemedCard>
              ) : (
                <ThemedCard className="items-center py-8">
                  <Ionicons name="receipt-outline" size={32} color={BrandColors.secondary} />
                  <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary mt-2 text-center">
                    No transactions yet.
                  </ThemedText>
                </ThemedCard>
              )}
            </View>

          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
