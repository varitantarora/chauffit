import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { BrandColors, LightColors, DarkColors, useThemeColors } from '../../constants/Colors';
import { RevenuePayment } from '../../services/api/AdminApiService';

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function displayDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueScreen() {
    const router = useRouter();
    const isDarkMode = useAuthStore((state) => state.isDarkMode);
    const colors = isDarkMode ? DarkColors : LightColors;
    const { revenue, revenueLoading, fetchRevenue } = useAdminStore();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const loadRevenue = useCallback((date: Date) => {
        fetchRevenue(formatDate(date));
    }, [fetchRevenue]);

    useEffect(() => {
        loadRevenue(selectedDate);
    }, []);

    const goToPrevDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
        loadRevenue(prev);
    };

    const goToNextDay = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        if (next <= today) {
            setSelectedDate(next);
            loadRevenue(next);
        }
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        loadRevenue(today);
    };

    const onRefresh = useCallback(() => {
        loadRevenue(selectedDate);
    }, [selectedDate, loadRevenue]);

    const isToday = formatDate(selectedDate) === formatDate(new Date());

    const PAYMENT_TYPE_ICON: Record<string, string> = {
        ride_payment: 'car',
        task_payment: 'bicycle',
        refund: 'return-down-back',
        payout: 'wallet',
        penalty: 'alert-circle',
    };

    const renderPaymentItem = (payment: RevenuePayment) => (
        <View
            key={payment.id}
            className="flex-row items-center p-3.5 mb-2.5 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 }}
        >
            <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.burgundy + '12' }}
            >
                <Ionicons
                    name={(PAYMENT_TYPE_ICON[payment.payment_type || ''] || 'cash') as any}
                    size={18}
                    color={colors.burgundy}
                />
            </View>
            <View className="flex-1 mr-2">
                <ThemedText className="font-semibold" numberOfLines={1}>
                    {payment.customer_name || 'Unknown Customer'}
                </ThemedText>
                <View className="flex-row items-center mt-0.5">
                    <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                        {payment.payment_type_display || payment.payment_type}
                    </ThemedText>
                    <ThemedText variant="tiny" style={{ color: colors.textSecondary }}> • </ThemedText>
                    <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                        {payment.payment_reference || '—'}
                    </ThemedText>
                </View>
            </View>
            <View className="items-end">
                <ThemedText className="font-bold" style={{ color: colors.burgundy }}>
                    {formatCurrency(payment.amount)}
                </ThemedText>
                <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                    {formatTime(payment.created_at)}
                </ThemedText>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
                <ThemedText variant="h3" className="ml-3 flex-1">Revenue</ThemedText>
                <Pressable
                    onPress={goToToday}
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: isToday ? colors.textSecondary + '20' : colors.burgundy }}
                >
                    <ThemedText variant="tiny" style={{ color: isToday ? colors.textSecondary : '#FFFFFF', fontWeight: '600' }}>
                        Today
                    </ThemedText>
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={revenueLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
            >
                {/* Weekly & Monthly Summary Cards */}
                <View className="flex-row gap-3 mb-5">
                    {/* Weekly */}
                    <View
                        className="flex-1 p-4 rounded-2xl"
                        style={{
                            backgroundColor: BrandColors.info,
                            shadowColor: BrandColors.info,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={16} color="#FFFFFF90" />
                            <ThemedText variant="tiny" className="ml-1.5" style={{ color: '#FFFFFF90', fontWeight: '600' }}>
                                LAST 7 DAYS
                            </ThemedText>
                        </View>
                        <ThemedText variant="h2" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                            {revenue ? formatCurrency(revenue.weekly_earnings) : '—'}
                        </ThemedText>
                        <ThemedText variant="tiny" style={{ color: '#FFFFFFCC', marginTop: 2 }}>
                            Weekly Earnings
                        </ThemedText>
                    </View>

                    {/* Monthly */}
                    <View
                        className="flex-1 p-4 rounded-2xl"
                        style={{
                            backgroundColor: '#8B5CF6',
                            shadowColor: '#8B5CF6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="trending-up-outline" size={16} color="#FFFFFF90" />
                            <ThemedText variant="tiny" className="ml-1.5" style={{ color: '#FFFFFF90', fontWeight: '600' }}>
                                LAST 30 DAYS
                            </ThemedText>
                        </View>
                        <ThemedText variant="h2" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                            {revenue ? formatCurrency(revenue.monthly_earnings) : '—'}
                        </ThemedText>
                        <ThemedText variant="tiny" style={{ color: '#FFFFFFCC', marginTop: 2 }}>
                            Monthly Earnings
                        </ThemedText>
                    </View>
                </View>

                {/* Date Selector */}
                <View
                    className="flex-row items-center justify-between p-3 mb-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
                >
                    <Pressable onPress={goToPrevDay} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.burgundy + '12' }}>
                        <Ionicons name="chevron-back" size={20} color={colors.burgundy} />
                    </Pressable>
                    <View className="items-center">
                        <ThemedText className="font-semibold">
                            {displayDate(formatDate(selectedDate))}
                        </ThemedText>
                        {isToday && (
                            <ThemedText variant="tiny" style={{ color: colors.burgundy, fontWeight: '600' }}>Today</ThemedText>
                        )}
                    </View>
                    <Pressable
                        onPress={goToNextDay}
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: isToday ? colors.textSecondary + '10' : colors.burgundy + '12' }}
                    >
                        <Ionicons name="chevron-forward" size={20} color={isToday ? colors.textSecondary + '50' : colors.burgundy} />
                    </Pressable>
                </View>

                {/* Daily Stats */}
                <View className="flex-row gap-3 mb-5">
                    <View
                        className="flex-1 p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
                        style={{ borderLeftWidth: 4, borderLeftColor: colors.burgundy }}
                    >
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Day Revenue</ThemedText>
                        <ThemedText variant="h3" className="mt-1" style={{ fontWeight: '700' }}>
                            {revenue ? formatCurrency(revenue.daily_revenue) : '—'}
                        </ThemedText>
                    </View>
                    <View
                        className="flex-1 p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
                        style={{ borderLeftWidth: 4, borderLeftColor: BrandColors.success }}
                    >
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>Completed Rides</ThemedText>
                        <ThemedText variant="h3" className="mt-1" style={{ fontWeight: '700' }}>
                            {revenue?.daily_rides ?? '—'}
                        </ThemedText>
                    </View>
                </View>

                {/* Daily Breakdown */}
                <View className="flex-row items-center justify-between mb-3">
                    <ThemedText variant="h3">Transactions</ThemedText>
                    {revenue?.daily_breakdown && (
                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.burgundy + '15' }}>
                            <ThemedText variant="tiny" style={{ color: colors.burgundy, fontWeight: '600' }}>
                                {revenue.daily_breakdown.length} total
                            </ThemedText>
                        </View>
                    )}
                </View>

                {revenueLoading && !revenue ? (
                    <View className="items-center py-12">
                        <ActivityIndicator size="large" color={colors.burgundy} />
                    </View>
                ) : revenue?.daily_breakdown && revenue.daily_breakdown.length > 0 ? (
                    revenue.daily_breakdown.map(renderPaymentItem)
                ) : (
                    <View className="items-center py-12">
                        <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                        <ThemedText variant="small" className="mt-2">No transactions</ThemedText>
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1">
                            No completed payments on this date
                        </ThemedText>
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
