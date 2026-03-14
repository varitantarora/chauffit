import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Modal, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useConfigStore } from '../../store/configStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AppConfig } from '../../services/api/ConfigApiService';

interface ConfigFormData {
  key: string;
  name: string;
  value: string;
}

const EMPTY_FORM: ConfigFormData = {
  key: '',
  name: '',
  value: '',
};

export default function ConfigManagement() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const configs = useConfigStore((state) => state.configs);
  const configsLoading = useConfigStore((state) => state.configsLoading);
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
  const createConfig = useConfigStore((state) => state.createConfig);
  const updateConfig = useConfigStore((state) => state.updateConfig);
  const deleteConfig = useConfigStore((state) => state.deleteConfig);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
  const [form, setForm] = useState<ConfigFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: fetchConfigs() disabled - backend /meta/configs/ returns 404
    // fetchConfigs();
  }, []);

  const onRefresh = useCallback(() => {
    // TODO: fetchConfigs() disabled - backend /meta/configs/ returns 404
    // fetchConfigs();
  }, []);

  const openAddModal = () => {
    setEditingConfig(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (config: AppConfig) => {
    setEditingConfig(config);
    setForm({
      key: config.key,
      name: config.name,
      value: config.value,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.key.trim() || !form.name.trim() || !form.value.trim()) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }

    // Validate key format (alphanumeric + underscores only)
    if (!/^[A-Z0-9_]+$/.test(form.key.toUpperCase())) {
      Alert.alert('Validation', 'Key must contain only uppercase letters, numbers, and underscores.');
      return;
    }

    setSaving(true);
    const data: Pick<AppConfig, 'key' | 'name' | 'value'> = {
      key: form.key.trim(),
      name: form.name.trim(),
      value: form.value.trim(),
    };

    let success = false;
    if (editingConfig) {
      success = await updateConfig(editingConfig.key, data);
    } else {
      success = await createConfig(data);
    }

    setSaving(false);
    if (success) {
      setModalVisible(false);
    } else {
      Alert.alert('Error', `Failed to ${editingConfig ? 'update' : 'create'} config.`);
    }
  };

  const handleDelete = (config: AppConfig) => {
    Alert.alert(
      'Delete Config',
      `Are you sure you want to delete "${config.name}" (${config.key})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConfig(config.key),
        },
      ]
    );
  };

  const updateField = (field: keyof ConfigFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderConfigCard = (config: AppConfig) => {
    return (
      <View
        key={config.key}
        className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <ThemedText className="font-semibold mb-1">{config.key}</ThemedText>
            <ThemedText variant="small" style={{ color: colors.textSecondary }}>
              {config.name}
            </ThemedText>
          </View>
        </View>

        <View
          className="p-3 rounded-xl mb-3 border border-border dark:border-darkBorder"
          style={{ backgroundColor: colors.background }}
        >
          <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mb-1">
            Value
          </ThemedText>
          <ThemedText className="font-mono break-words" numberOfLines={3}>
            {config.value}
          </ThemedText>
        </View>

        <View className="flex-row items-center justify-end pt-2 border-t border-border dark:border-darkBorder">
          <Pressable onPress={() => openEditModal(config)} className="flex-row items-center mr-4">
            <Ionicons name="create-outline" size={16} color={colors.burgundy} />
            <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="ml-1">
              Edit
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => handleDelete(config)} className="flex-row items-center">
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <ThemedText variant="tiny" style={{ color: '#EF4444' }} className="ml-1">
              Delete
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => router.back()} />
          <ThemedText variant="h3" className="ml-3">
            App Config
          </ThemedText>
        </View>
        <Pressable
          onPress={openAddModal}
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.burgundy }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <ThemedText variant="tiny" className="text-white ml-1 font-semibold">
            Add
          </ThemedText>
        </Pressable>
      </View>

      {/* Config List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={configsLoading}
            onRefresh={onRefresh}
            tintColor={colors.burgundy}
          />
        }
      >
        {configs.length > 0 ? (
          configs.map(renderConfigCard)
        ) : (
          !configsLoading && (
            <View className="items-center py-12">
              <Ionicons name="settings-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">
                No configs found
              </ThemedText>
              <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1">
                Tap "Add" to create your first config
              </ThemedText>
            </View>
          )
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-darkBorder">
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText style={{ color: colors.burgundy }}>Cancel</ThemedText>
            </Pressable>
            <ThemedText variant="h3">
              {editingConfig ? 'Edit Config' : 'New Config'}
            </ThemedText>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            <FormField
              label="Key (e.g. SCHEDULED_BOOKINGS)"
              value={form.key}
              onChangeText={(v) => updateField('key', v)}
              placeholder="FEATURE_FLAG_NAME"
              editable={!editingConfig}
              colors={colors}
            />

            <FormField
              label="Name"
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Human-readable name"
              colors={colors}
            />

            <FormField
              label="Value"
              value={form.value}
              onChangeText={(v) => updateField('value', v)}
              placeholder='e.g. "true", "42", or JSON'
              multiline
              numberOfLines={5}
              colors={colors}
            />

            <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-2 mb-4">
              {editingConfig && 'Key cannot be changed after creation.'}
            </ThemedText>

            <PrimaryButton
              title={editingConfig ? 'Save Changes' : 'Create Config'}
              onPress={handleSave}
              loading={saving}
            />
            <View className="h-12" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  editable = true,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  colors: any;
}) {
  return (
    <View className="mb-4">
      <ThemedText variant="small" className="mb-1 font-medium">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
        style={{
          backgroundColor: editable ? colors.background : colors.textSecondary + '10',
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 100 : undefined,
        }}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}
