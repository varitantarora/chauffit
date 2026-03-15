import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Modal, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useConfigStore } from '../../store/configStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, BrandColors, useThemeColors } from '../../constants/Colors';
import { AppConfig } from '../../services/api/ConfigApiService';

type ValueType = 'string' | 'integer' | 'float' | 'boolean' | 'json';

interface ConfigFormData {
  key: string;
  name: string;
  value: string;
  value_type: ValueType;
}

const EMPTY_FORM: ConfigFormData = {
  key: '',
  name: '',
  value: '',
  value_type: 'string',
};

const VALUE_TYPES: { label: string; value: ValueType }[] = [
  { label: 'String', value: 'string' },
  { label: 'Integer', value: 'integer' },
  { label: 'Float', value: 'float' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
];

const TYPE_BADGE_COLORS: Record<ValueType, { bg: string; text: string }> = {
  string: { bg: '#E3F2FD', text: '#1565C0' },
  integer: { bg: '#F3E5F5', text: '#6A1B9A' },
  float: { bg: '#E8F5E9', text: '#2E7D32' },
  boolean: { bg: '#FFF3E0', text: '#E65100' },
  json: { bg: '#FCE4EC', text: '#880E4F' },
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
      value_type: (config.value_type as ValueType) ?? 'string',
    });
    setModalVisible(true);
  };

  const handleTypeChange = (type: ValueType) => {
    setForm((prev) => ({
      ...prev,
      value_type: type,
      value: type === 'boolean' ? 'false' : '',
    }));
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(form.value);
      setForm((prev) => ({ ...prev, value: JSON.stringify(parsed, null, 2) }));
    } catch {
      Alert.alert('Invalid JSON', 'The value is not valid JSON and cannot be formatted.');
    }
  };

  const validate = (): string | null => {
    if (!form.key.trim() || !form.name.trim()) {
      return 'Please fill in Key and Name.';
    }
    if (!/^[A-Z0-9_]+$/.test(form.key.toUpperCase())) {
      return 'Key must contain only letters, numbers, and underscores.';
    }
    const val = form.value.trim();
    switch (form.value_type) {
      case 'boolean':
        if (val !== 'true' && val !== 'false') return 'Boolean value must be "true" or "false".';
        break;
      case 'integer':
        if (!/^-?\d+$/.test(val)) return 'Integer value must be a whole number (e.g. 42).';
        break;
      case 'float':
        if (!/^-?\d+(\.\d+)?$/.test(val)) return 'Float value must be a number (e.g. 3.14).';
        break;
      case 'json':
        try { JSON.parse(val); } catch { return 'JSON value is not valid JSON.'; }
        break;
      case 'string':
        if (!val) return 'Value cannot be empty.';
        break;
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    setSaving(true);
    const data = {
      key: form.key.trim(),
      name: form.name.trim(),
      value: form.value.trim(),
      value_type: form.value_type,
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
        { text: 'Delete', style: 'destructive', onPress: () => deleteConfig(config.key) },
      ]
    );
  };

  const renderInlineValue = (config: AppConfig) => {
    const type = (config.value_type ?? 'string') as ValueType;
    const val = config.value;

    if (type === 'boolean') {
      const isTrue = val === 'true';
      return (
        <ThemedText
          variant="small"
          className="font-bold"
          style={{ color: isTrue ? '#2E7D32' : '#C62828' }}
        >
          {isTrue ? 'TRUE' : 'FALSE'}
        </ThemedText>
      );
    }

    if (type === 'json') {
      let pretty = val;
      try { pretty = JSON.stringify(JSON.parse(val), null, 2); } catch { /* raw */ }
      return (
        <View
          className="mt-1 p-2 rounded-lg border border-border dark:border-darkBorder"
          style={{ backgroundColor: isDarkMode ? '#1a1a2e' : '#F5F5F5' }}
        >
          <ThemedText
            variant="tiny"
            numberOfLines={3}
            style={{ fontFamily: 'monospace', color: isDarkMode ? '#A0D8AF' : '#1B5E20' }}
          >
            {pretty}
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedText variant="small" className="font-mono flex-shrink" numberOfLines={1}>
        {val}
      </ThemedText>
    );
  };

  const renderConfigCard = (config: AppConfig) => {
    const type = (config.value_type ?? 'string') as ValueType;
    const badgeStyle = TYPE_BADGE_COLORS[type];
    const isJson = type === 'json';

    return (
      <View
        key={config.key}
        className="px-3 py-2.5 mb-2 rounded-xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
      >
        {/* Key title */}
        <ThemedText className="font-semibold text-sm mb-1.5" numberOfLines={1}>
          {config.key}
        </ThemedText>

        {/* Name row */}
        <View className="flex-row items-center mb-1">
          <ThemedText variant="tiny" style={{ color: colors.textSecondary, width: 72 }}>
            Name
          </ThemedText>
          <ThemedText variant="tiny" className="flex-1" style={{ color: colors.textPrimary }} numberOfLines={1}>
            {config.name}
          </ThemedText>
        </View>

        {/* Value Type row */}
        <View className="flex-row items-center mb-1">
          <ThemedText variant="tiny" style={{ color: colors.textSecondary, width: 72 }}>
            Value Type
          </ThemedText>
          <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: badgeStyle.bg }}>
            <ThemedText variant="tiny" style={{ color: badgeStyle.text, fontWeight: '600', fontSize: 10 }}>
              {type.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* Value row */}
        {isJson ? (
          <View className="flex-row items-start">
            <ThemedText variant="tiny" style={{ color: colors.textSecondary, width: 72, paddingTop: 2 }}>
              Value
            </ThemedText>
            <View className="flex-1">{renderInlineValue(config)}</View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <ThemedText variant="tiny" style={{ color: colors.textSecondary, width: 72 }}>
              Value
            </ThemedText>
            {renderInlineValue(config)}
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center justify-end mt-2 pt-2 border-t border-border dark:border-darkBorder">
          <Pressable onPress={() => openEditModal(config)} className="flex-row items-center mr-4">
            <Ionicons name="create-outline" size={14} color={colors.burgundy} />
            <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="ml-1">
              Edit
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => handleDelete(config)} className="flex-row items-center">
            <Ionicons name="trash-outline" size={14} color={BrandColors.danger} />
            <ThemedText variant="tiny" style={{ color: BrandColors.danger }} className="ml-1">
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
          <RefreshControl refreshing={configsLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />
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
              onChangeText={(v) => setForm((p) => ({ ...p, key: v }))}
              placeholder="FEATURE_FLAG_NAME"
              editable={!editingConfig}
              colors={colors}
            />

            <FormField
              label="Name"
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Human-readable name"
              colors={colors}
            />

            {/* Value Type Selector */}
            <View className="mb-4">
              <ThemedText variant="small" className="mb-2 font-medium">Value Type</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {VALUE_TYPES.map((t) => {
                    const selected = form.value_type === t.value;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() => handleTypeChange(t.value)}
                        className="px-4 py-2 rounded-full border"
                        style={{
                          backgroundColor: selected ? colors.burgundy : colors.background,
                          borderColor: selected ? colors.burgundy : colors.border ?? '#E0E0E0',
                        }}
                      >
                        <ThemedText
                          variant="small"
                          style={{ color: selected ? '#FFFFFF' : colors.textSecondary, fontWeight: selected ? '600' : '400' }}
                        >
                          {t.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Value Input by Type */}
            <ValueInput
              type={form.value_type}
              value={form.value}
              onChange={(v) => setForm((p) => ({ ...p, value: v }))}
              onFormatJson={handleFormatJson}
              colors={colors}
            />

            {editingConfig && (
              <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1 mb-4">
                Key cannot be changed after creation.
              </ThemedText>
            )}

            <View className="mb-4" />
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

function ValueInput({
  type,
  value,
  onChange,
  onFormatJson,
  colors,
}: {
  type: ValueType;
  value: string;
  onChange: (v: string) => void;
  onFormatJson: () => void;
  colors: any;
}) {
  if (type === 'boolean') {
    const isTrue = value === 'true';
    return (
      <View className="mb-4">
        <ThemedText variant="small" className="mb-2 font-medium">Value</ThemedText>
        <View
          className="flex-row items-center justify-between p-4 rounded-xl border border-border dark:border-darkBorder"
          style={{ backgroundColor: colors.background }}
        >
          <ThemedText style={{ color: isTrue ? '#2E7D32' : '#C62828', fontWeight: '600' }}>
            {isTrue ? 'TRUE' : 'FALSE'}
          </ThemedText>
          <Switch
            value={isTrue}
            onValueChange={(v) => onChange(v ? 'true' : 'false')}
            trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
            thumbColor={isTrue ? '#2E7D32' : '#C62828'}
          />
        </View>
      </View>
    );
  }

  if (type === 'json') {
    return (
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <ThemedText variant="small" className="font-medium">Value (JSON)</ThemedText>
          <Pressable onPress={onFormatJson}>
            <ThemedText variant="tiny" style={{ color: colors.burgundy, fontWeight: '600' }}>
              Format JSON
            </ThemedText>
          </Pressable>
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder='{"key": "value"}'
          multiline
          numberOfLines={6}
          className="border border-border dark:border-darkBorder rounded-xl px-4 py-3"
          style={{
            backgroundColor: colors.background,
            textAlignVertical: 'top',
            minHeight: 120,
            fontFamily: 'monospace',
            color: colors.textPrimary,
          }}
          placeholderTextColor={colors.textSecondary}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    );
  }

  const keyboardType =
    type === 'integer' ? 'numeric' :
    type === 'float' ? 'decimal-pad' :
    'default';

  return (
    <FormField
      label="Value"
      value={value}
      onChangeText={onChange}
      placeholder={
        type === 'integer' ? 'e.g. 42' :
        type === 'float' ? 'e.g. 3.14' :
        'Enter value'
      }
      keyboardType={keyboardType}
      colors={colors}
    />
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
  keyboardType = 'default',
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
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
        keyboardType={keyboardType}
        className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
        style={{
          backgroundColor: editable ? colors.background : colors.textSecondary + '10',
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 100 : undefined,
          color: colors.textPrimary,
        }}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}
