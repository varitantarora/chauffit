import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedCard } from '../../components/common/ThemedCard';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, useThemeColors} from '../../constants/Colors';

type SessionResult = 'pass' | 'fail' | 'absent';

const RESULT_CONFIG: Record<SessionResult, { label: string; bg: string; textColor: string; icon: string }> = {
  pass: { label: 'Pass', bg: '#dcfce7', textColor: '#166534', icon: 'checkmark-circle' },
  fail: { label: 'Fail', bg: '#fee2e2', textColor: '#991b1b', icon: 'close-circle' },
  absent: { label: 'Absent', bg: '#fef3c7', textColor: '#92400e', icon: 'remove-circle' },
};

export default function TrainingBatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;

  const {
    selectedTrainingBatch,
    fetchTrainingBatch,
    autoAssignBatch,
    markTrainingResults,
  } = useAdminStore();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionResults, setSessionResults] = useState<Record<string, SessionResult>>({});
  const [isSavingResults, setIsSavingResults] = useState(false);

  useEffect(() => {
    if (id) {
      // Clear stale state before fetching fresh data
      useAdminStore.setState({ selectedTrainingBatch: null });
      loadBatchDetail(id as string);
    }
  }, [id]);

  const loadBatchDetail = async (batchId: string) => {
    setLoading(true);
    await fetchTrainingBatch(batchId);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (id) {
      await fetchTrainingBatch(id as string);
    }
    setRefreshing(false);
  };

  const handleAutoAssign = async () => {
    Alert.alert(
      'Auto Assign Drivers',
      'This will assign verified drivers to this training batch. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const success = await autoAssignBatch(id as string);
            setLoading(false);
            if (success) {
              Alert.alert('Success', 'Drivers assigned successfully');
            } else {
              Alert.alert('Error', 'Failed to assign drivers');
            }
          },
        },
      ]
    );
  };

  const handleSetResult = (sessionId: string, result: SessionResult) => {
    setSessionResults((prev) => ({
      ...prev,
      [sessionId]: result,
    }));
  };

  const handleSubmitResults = async () => {
    const results = Object.entries(sessionResults).map(([session_id, result]) => ({
      session_id,
      result,
      notes: '',
    }));

    if (results.length === 0) {
      Alert.alert('No Changes', 'Please mark a result for at least one driver before submitting.');
      return;
    }

    Alert.alert(
      'Submit Results',
      `Submit results for ${results.length} driver(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setIsSavingResults(true);
            const success = await markTrainingResults(id as string, results);
            setIsSavingResults(false);

            if (success) {
              Alert.alert(
                'Results Submitted',
                'Driver statuses updated. Passed drivers are now ACTIVE.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSessionResults({});
                      if (id) fetchTrainingBatch(id as string);
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Error', 'Failed to submit training results. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.burgundy} />
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedTrainingBatch) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="warning" size={48} color={colors.textSecondary} />
          <ThemedText className="mt-4 text-center">Training batch not found</ThemedText>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-2 rounded-lg"
            style={{ backgroundColor: colors.burgundy }}
          >
            <ThemedText className="text-white font-semibold">Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sessions = selectedTrainingBatch.sessions ?? [];
  const assignedCount = selectedTrainingBatch.sessions_count
    ? parseInt(selectedTrainingBatch.sessions_count, 10)
    : selectedTrainingBatch.capacity - selectedTrainingBatch.spots_remaining;
  const pendingResultCount = Object.keys(sessionResults).length;

  // Detect mismatch between reported count and actual sessions loaded
  const hasMismatch = selectedTrainingBatch.sessions_count
    ? parseInt(selectedTrainingBatch.sessions_count, 10) > sessions.length
    : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-4 py-4 border-b border-border dark:border-darkBorder flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText variant="h2" className="font-bold flex-1 ml-4">
            Batch Details
          </ThemedText>
        </View>

        <View className="px-4 py-4">
          {/* Batch Info Card */}
          <ThemedCard className="p-4 mb-4">
            <ThemedText className="font-bold text-lg mb-3">
              {selectedTrainingBatch.location_name}
            </ThemedText>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <ThemedText variant="secondary" className="ml-2">
                  {selectedTrainingBatch.date}
                </ThemedText>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <ThemedText variant="secondary" className="ml-2">
                  {selectedTrainingBatch.start_time} - {selectedTrainingBatch.end_time}
                </ThemedText>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <ThemedText variant="secondary" className="ml-2 flex-1">
                  {selectedTrainingBatch.location_address}
                </ThemedText>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="people" size={16} color={colors.textSecondary} />
                <ThemedText variant="secondary" className="ml-2">
                  {assignedCount} / {selectedTrainingBatch.capacity} drivers assigned
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Auto Assign Button */}
          <PrimaryButton
            title="Auto Assign Verified Drivers"
            onPress={handleAutoAssign}
            className="mb-6"
          />

          {/* Drivers List */}
          {sessions.length > 0 ? (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText variant="h3" className="font-bold">
                  Assigned Drivers ({sessions.length})
                </ThemedText>
                {pendingResultCount > 0 && (
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: colors.burgundy + '20' }}
                  >
                    <ThemedText className="text-xs font-semibold" style={{ color: colors.burgundy }}>
                      {pendingResultCount} pending
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Info Banner */}
              <ThemedCard className="p-3 mb-4" style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#eff6ff' }}>
                <ThemedText className="text-sm" style={{ color: isDarkMode ? '#93c5fd' : '#1d4ed8' }}>
                  💡 Pass → Driver becomes Active  ·  Fail → Driver can retake after 1 week
                </ThemedText>
              </ThemedCard>

              {/* Mismatch Warning Banner */}
              {hasMismatch && (
                <ThemedCard className="p-3 mb-4 flex-row items-start" style={{ backgroundColor: isDarkMode ? '#5f4a1e' : '#fef3c7' }}>
                  <Ionicons
                    name="warning"
                    size={20}
                    color={isDarkMode ? '#fbbf24' : '#f59e0b'}
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <ThemedText className="text-sm font-semibold mb-1" style={{ color: isDarkMode ? '#fbbf24' : '#f59e0b' }}>
                      Incomplete Load
                    </ThemedText>
                    <ThemedText className="text-xs" style={{ color: isDarkMode ? '#d4b244' : '#dc9d5f' }}>
                      Expected {assignedCount} sessions but only {sessions.length} loaded. Try refreshing.
                    </ThemedText>
                  </View>
                </ThemedCard>
              )}

              <View className="space-y-3 mb-4">
                {sessions.map((session: any) => {
                  const selected = sessionResults[session.id];
                  const currentResult: string = selected ?? session.result ?? 'pending';

                  return (
                    <ThemedCard key={session.id} className="p-4">
                      {/* Driver Info Row */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-1 mr-3">
                          <ThemedText className="font-semibold text-base">
                            {session.driver_name ?? 'Unknown Driver'}
                          </ThemedText>
                          <ThemedText variant="secondary" className="text-xs mt-0.5">
                            ID: {String(session.driver_id ?? session.id).substring(0, 8)}...
                          </ThemedText>
                        </View>

                        {/* Current status badge */}
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              currentResult === 'pass'
                                ? '#dcfce7'
                                : currentResult === 'fail'
                                ? '#fee2e2'
                                : '#fef3c7',
                          }}
                        >
                          <ThemedText
                            className="text-xs font-semibold capitalize"
                            style={{
                              color:
                                currentResult === 'pass'
                                  ? '#166534'
                                  : currentResult === 'fail'
                                  ? '#991b1b'
                                  : '#92400e',
                            }}
                          >
                            {selected ? `→ ${selected}` : currentResult}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Action Buttons: Pass / Fail / Absent */}
                      <View className="flex-row gap-2">
                        {(Object.entries(RESULT_CONFIG) as [SessionResult, typeof RESULT_CONFIG[SessionResult]][]).map(
                          ([result, config]) => {
                            const isActive = selected === result;
                            return (
                              <TouchableOpacity
                                key={result}
                                onPress={() => handleSetResult(session.id, result)}
                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg border"
                                style={{
                                  backgroundColor: isActive ? config.bg : undefined,
                                  borderColor: isActive ? config.textColor : colors.border ?? '#e5e7eb',
                                }}
                              >
                                <Ionicons
                                  name={config.icon as any}
                                  size={14}
                                  color={isActive ? config.textColor : colors.textSecondary}
                                />
                                <ThemedText
                                  className="ml-1 text-xs font-semibold"
                                  style={{
                                    color: isActive ? config.textColor : colors.textSecondary,
                                  }}
                                >
                                  {config.label}
                                </ThemedText>
                              </TouchableOpacity>
                            );
                          }
                        )}
                      </View>
                    </ThemedCard>
                  );
                })}
              </View>

              {/* Submit Button */}
              {pendingResultCount > 0 && (
                <PrimaryButton
                  title={
                    isSavingResults
                      ? 'Submitting...'
                      : `Submit Results for ${pendingResultCount} Driver${pendingResultCount > 1 ? 's' : ''}`
                  }
                  onPress={handleSubmitResults}
                  disabled={isSavingResults}
                  className="mb-6"
                />
              )}
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <Ionicons name="people-outline" size={56} color={colors.textSecondary} />
              <ThemedText className="mt-3 font-semibold text-center">No drivers assigned yet</ThemedText>
              <ThemedText variant="secondary" className="text-sm text-center mt-1">
                Use "Auto Assign" to assign verified drivers to this batch
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
