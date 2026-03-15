import React, { useEffect, useCallback } from 'react';
import { FlatList, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, useThemeColors} from '../../constants/Colors';
import { AdminTask } from '../../services/api/AdminApiService';

export default function Tasks() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const { tasks, tasksLoading, fetchTasks } = useAdminStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = useCallback(() => {
    fetchTasks();
  }, []);

  const renderTask = ({ item }: { item: AdminTask }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(admin)/task-detail', params: { id: item.id } })}
      className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
    >
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="font-semibold flex-1 mr-2" numberOfLines={1}>{item.task_reference}</ThemedText>
        <StatusBadge status={item.task_status} customLabel={item.task_status_display} />
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <StatusBadge status={item.priority} customLabel={item.priority} />
          <ThemedText variant="tiny" className="capitalize">{item.biker_name}</ThemedText>
        </View>
        <ThemedText variant="small" className="text-textSecondary dark:text-darkTextSecondary">{item.booking_reference}</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <ThemedText variant="h3" className="ml-3">Biker Tasks</ThemedText>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={tasksLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
        ListEmptyComponent={
          !tasksLoading ? (
            <View className="items-center py-12">
              <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">No tasks found</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
