import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
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
import { LightColors, DarkColors } from '../../constants/Colors';

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
  const [sessionResults, setSessionResults] = useState<Record<string, string>>({});
  const [isSavingResults, setIsSavingResults] = useState(false);

  useEffect(() => {
    if (id) {
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
        { text: 'Cancel', onPress: () => {} },
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

  const handleSessionResultChange = (sessionId: string, result: string) => {
    setSessionResults((prev) => ({
      ...prev,
      [sessionId]: result,
    }));
  };

  const handleSubmitResults = async () => {
    const results = selectedTrainingBatch?.sessions
      ?.filter((session: any) => sessionResults[session.id])
      .map((session: any) => ({
        session_id: session.id,
        result: sessionResults[session.id],
        notes: '',
      }));

    if (!results || results.length === 0) {
      Alert.alert('Error', 'Please select results for at least one session');
      return;
    }

    setIsSavingResults(true);
    const success = await markTrainingResults(id as string, results);
    setIsSavingResults(false);

    if (success) {
      Alert.alert(
        'Success',
        'Training results submitted successfully. Drivers will be notified of their status.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset and refresh
              setSessionResults({});
              if (id) {
                fetchTrainingBatch(id as string);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to submit training results');
    }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-4 py-4 border-b border-border dark:border-darkBorder flex-row items-center justify-between">
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

            <View className="space-y-3">
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
                  {selectedTrainingBatch.capacity - selectedTrainingBatch.spots_remaining} /
                  {selectedTrainingBatch.capacity} assigned
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

          {/* Sessions Section */}
          {selectedTrainingBatch.sessions && selectedTrainingBatch.sessions.length > 0 ? (
            <>
              <ThemedText variant="h3" className="font-bold mb-4">
                Driver Sessions ({selectedTrainingBatch.sessions.length})
              </ThemedText>

              <View className="space-y-3 mb-6">
                {selectedTrainingBatch.sessions.map((session: any) => (
                  <ThemedCard key={session.id} className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <ThemedText className="font-bold">
                          {session.driver_name}
                        </ThemedText>
                        <ThemedText variant="secondary" className="text-sm">
                          {session.id.substring(0, 8)}...
                        </ThemedText>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            session.result === 'pending'
                              ? '#fef3c7'
                              : session.result === 'pass'
                                ? '#dcfce7'
                                : '#fee2e2',
                        }}
                      >
                        <ThemedText
                          className="text-xs font-semibold capitalize"
                          style={{
                            color:
                              session.result === 'pending'
                                ? '#92400e'
                                : session.result === 'pass'
                                  ? '#166534'
                                  : '#991b1b',
                          }}
                        >
                          {session.result}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Result Selector */}
                    <View className="flex-row gap-2 flex-wrap">
                      {['pending', 'pass', 'fail', 'absent'].map((result) => (
                        <TouchableOpacity
                          key={result}
                          onPress={() =>
                            handleSessionResultChange(session.id, result)
                          }
                          className={`px-3 py-2 rounded-lg border ${
                            sessionResults[session.id] === result
                              ? 'border-burgundy'
                              : 'border-border dark:border-darkBorder'
                          }`}
                          style={{
                            backgroundColor:
                              sessionResults[session.id] === result
                                ? colors.burgundy + '20'
                                : undefined,
                          }}
                        >
                          <ThemedText
                            className="text-xs font-semibold capitalize"
                            style={{
                              color:
                                sessionResults[session.id] === result
                                  ? colors.burgundy
                                  : colors.textSecondary,
                            }}
                          >
                            {result}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ThemedCard>
                ))}
              </View>

              {/* Submit Results Button */}
              {Object.keys(sessionResults).length > 0 && (
                <View className="mb-6">
                  <ThemedCard className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <ThemedText className="text-blue-700 dark:text-blue-300 text-sm">
                      💡 Pass → Driver becomes ACTIVE. Fail → Driver waits 1 week for retake.
                    </ThemedText>
                  </ThemedCard>

                  <PrimaryButton
                    title={`Submit Results for ${Object.keys(sessionResults).length} Session(s)`}
                    onPress={handleSubmitResults}
                    disabled={isSavingResults}
                  />
                </View>
              )}
            </>
          ) : (
            <View className="items-center justify-center py-8">
              <Ionicons name="people" size={48} color={colors.textSecondary} />
              <ThemedText className="mt-2">No drivers assigned yet</ThemedText>
              <ThemedText variant="secondary" className="text-sm">
                Use "Auto Assign" to add verified drivers
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
