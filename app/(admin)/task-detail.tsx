import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { selectedTask, fetchTaskDetail } = useAdminStore();

  useEffect(() => {
    if (id) fetchTaskDetail(id);
  }, [id]);

  const task = selectedTask;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Task Detail</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4">
        {task ? (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="h2">{task.task_reference}</ThemedText>
              <StatusBadge status={task.task_status} customLabel={task.task_status_display} />
            </View>

            <View className="p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder mb-4">
              <InfoRow label="Booking Ref" value={task.booking_reference} />
              <InfoRow label="Priority" value={task.priority} />
              <InfoRow label="Biker" value={task.biker_name || 'Not assigned'} />
              <InfoRow label="Created" value={new Date(task.created_at).toLocaleString()} />
              <InfoRow label="Updated" value={new Date(task.updated_at).toLocaleString()} isLast />
            </View>
          </>
        ) : (
          <View className="items-center py-12">
            <ThemedText variant="small">Loading task details...</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View className={`flex-row justify-between py-3 ${isLast ? '' : 'border-b border-border dark:border-darkBorder'}`}>
      <ThemedText variant="small">{label}</ThemedText>
      <ThemedText className="font-medium flex-1 text-right ml-4 capitalize" numberOfLines={2}>{value}</ThemedText>
    </View>
  );
}
