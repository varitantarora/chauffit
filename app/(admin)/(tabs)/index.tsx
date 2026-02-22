import React, { useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/common/ThemedText';
import { StatCard } from '../../../components/admin/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { LightColors, DarkColors } from '../../../constants/Colors';

export default function AdminDashboard() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { dashboard, dashboardLoading, fetchDashboard } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    fetchDashboard();
  }, []);

  const quickActions = [
    { title: 'Pending Drivers', icon: 'car' as const, count: dashboard?.pending_driver_verifications || 0, route: '/(admin)/drivers-pending' },
    { title: 'Pending Bikers', icon: 'bicycle' as const, count: dashboard?.pending_biker_verifications || 0, route: '/(admin)/bikers-pending' },
    { title: 'Open Disputes', icon: 'warning' as const, count: dashboard?.open_disputes || 0, route: '/(admin)/disputes' },
    { title: 'Payments', icon: 'card' as const, count: dashboard?.total_payments || 0, route: '/(admin)/payments' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <View>
            <ThemedText variant="h2">Admin Panel</ThemedText>
            <ThemedText variant="small">Overview & Analytics</ThemedText>
          </View>
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.burgundy }}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* KPI Stats */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard title="Total Rides" value={dashboard?.total_rides || 0} icon="car" color={colors.burgundy} />
          <StatCard title="Completed" value={dashboard?.completed_rides || 0} icon="checkmark-circle" color={colors.success} />
          <StatCard title="Revenue" value={`₹${dashboard?.total_revenue || 0}`} icon="cash" color={colors.secondary} />
          <StatCard title="Active Drivers" value={dashboard?.active_drivers || 0} icon="people" color="#3B82F6" />
          <StatCard title="Active Bikers" value={dashboard?.active_bikers || 0} icon="bicycle" color="#8B5CF6" />
          <StatCard title="Customers" value={dashboard?.total_customers || 0} icon="person" color={colors.info} />
        </View>

        {/* Quick Actions */}
        <ThemedText variant="h3" className="mb-3">Quick Actions</ThemedText>
        <View className="gap-3 mb-8">
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.route as any)}
              className="flex-row items-center p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.burgundy + '15' }}>
                <Ionicons name={action.icon} size={20} color={colors.burgundy} />
              </View>
              <ThemedText className="flex-1">{action.title}</ThemedText>
              <View className="bg-burgundy px-3 py-1 rounded-full mr-2">
                <ThemedText variant="tiny" className="text-white font-semibold">{action.count}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
