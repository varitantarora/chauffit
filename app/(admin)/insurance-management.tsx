import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Modal, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AdminInsurancePlan } from '../../services/api/AdminApiService';

const TIER_OPTIONS: { value: AdminInsurancePlan['tier']; label: string }[] = [
    { value: 'scratch', label: 'Scratch' },
    { value: 'scratch_and_dent', label: 'Scratch & Dent' },
    { value: 'full', label: 'Full' },
];

const TIER_COLORS: Record<string, string> = {
    scratch: '#3B82F6',
    scratch_and_dent: '#10B981',
    full: '#8B5CF6',
};

interface PlanFormData {
    tier: AdminInsurancePlan['tier'];
    name: string;
    description: string;
    premium_amount: string;
    max_coverage_amount: string;
    coverage_details: string;
    display_order: string;
    is_active: boolean;
}

const EMPTY_FORM: PlanFormData = {
    tier: 'scratch',
    name: '',
    description: '',
    premium_amount: '',
    max_coverage_amount: '',
    coverage_details: '',
    display_order: '0',
    is_active: true,
};

export default function InsuranceManagement() {
    const router = useRouter();
    const isDarkMode = useAuthStore((state) => state.isDarkMode);
    const colors = isDarkMode ? DarkColors : LightColors;
    const {
        insurancePlans,
        insurancePlansLoading,
        fetchInsurancePlans,
        createInsurancePlan,
        updateInsurancePlan,
        deleteInsurancePlan,
    } = useAdminStore();
    const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
    const getConfigValue = useConfigStore((state) => state.getConfigValue);
    const updateConfig = useConfigStore((state) => state.updateConfig);
    const configsLoading = useConfigStore((state) => state.configsLoading);
    const configs = useConfigStore((state) => state.configs);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState<AdminInsurancePlan | null>(null);
    const [form, setForm] = useState<PlanFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [insuranceFeatureEnabled, setInsuranceFeatureEnabled] = useState(true);
    const [togglingFeature, setTogglingFeature] = useState(false);

    useEffect(() => {
        fetchInsurancePlans();
        fetchConfigs();
    }, []);

    useEffect(() => {
        const val = getConfigValue('insurance_enabled');
        if (val !== null) {
            setInsuranceFeatureEnabled(val !== 'false');
        }
    }, [configs]);

    const onRefresh = useCallback(() => {
        fetchInsurancePlans();
    }, []);

    const openAddModal = () => {
        setEditingPlan(null);
        setForm(EMPTY_FORM);
        setModalVisible(true);
    };

    const openEditModal = (plan: AdminInsurancePlan) => {
        setEditingPlan(plan);
        setForm({
            tier: plan.tier,
            name: plan.name,
            description: plan.description,
            premium_amount: plan.premium_amount,
            max_coverage_amount: plan.max_coverage_amount,
            coverage_details: Array.isArray(plan.coverage_details)
                ? plan.coverage_details.join('\n')
                : '',
            display_order: String(plan.display_order),
            is_active: plan.is_active,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.premium_amount.trim() || !form.max_coverage_amount.trim()) {
            Alert.alert('Validation', 'Please fill in name, premium amount, and coverage amount.');
            return;
        }

        setSaving(true);
        const data: Partial<AdminInsurancePlan> = {
            tier: form.tier,
            name: form.name.trim(),
            description: form.description.trim(),
            premium_amount: form.premium_amount.trim(),
            max_coverage_amount: form.max_coverage_amount.trim(),
            coverage_details: form.coverage_details
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            display_order: parseInt(form.display_order) || 0,
            is_active: form.is_active,
        };

        let success = false;
        if (editingPlan) {
            success = await updateInsurancePlan(editingPlan.id, data);
        } else {
            success = await createInsurancePlan(data);
        }

        setSaving(false);
        if (success) {
            setModalVisible(false);
        } else {
            Alert.alert('Error', `Failed to ${editingPlan ? 'update' : 'create'} insurance plan.`);
        }
    };

    const handleToggleActive = async (plan: AdminInsurancePlan) => {
        await updateInsurancePlan(plan.id, { is_active: !plan.is_active });
    };

    const handleDelete = (plan: AdminInsurancePlan) => {
        Alert.alert(
            'Deactivate Plan',
            `Are you sure you want to deactivate "${plan.name}"? This will soft-delete the plan.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deactivate',
                    style: 'destructive',
                    onPress: () => deleteInsurancePlan(plan.id),
                },
            ]
        );
    };

    const updateField = (field: keyof PlanFormData, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleInsuranceFeature = async (value: boolean) => {
        setInsuranceFeatureEnabled(value);
        setTogglingFeature(true);
        const success = await updateConfig('insurance_enabled', { value: String(value) });
        if (!success) {
            setInsuranceFeatureEnabled(!value);
            Alert.alert('Error', 'Failed to update insurance feature flag.');
        }
        setTogglingFeature(false);
    };

    const renderPlanCard = (plan: AdminInsurancePlan) => {
        const tierColor = TIER_COLORS[plan.tier] || '#6B7280';

        return (
            <View
                key={plan.id}
                className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
                style={{ borderLeftWidth: 4, borderLeftColor: tierColor }}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                        <View
                            className="px-2 py-0.5 rounded-full mr-2"
                            style={{ backgroundColor: tierColor + '20' }}
                        >
                            <ThemedText variant="tiny" style={{ color: tierColor, fontWeight: '600' }}>
                                {TIER_OPTIONS.find((t) => t.value === plan.tier)?.label || plan.tier}
                            </ThemedText>
                        </View>
                        <ThemedText className="font-semibold flex-1" numberOfLines={1}>
                            {plan.name}
                        </ThemedText>
                    </View>
                    <View className="flex-row items-center">
                        <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: plan.is_active ? '#10B98120' : '#EF444420' }}
                        >
                            <ThemedText
                                variant="tiny"
                                style={{ color: plan.is_active ? '#10B981' : '#EF4444', fontWeight: '600' }}
                            >
                                {plan.is_active ? 'Active' : 'Inactive'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <ThemedText variant="tiny" className="mb-2" numberOfLines={2}>
                    {plan.description}
                </ThemedText>

                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                            Premium
                        </ThemedText>
                        <ThemedText className="font-semibold">₹{plan.premium_amount}</ThemedText>
                    </View>
                    <View className="items-end">
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                            Max Coverage
                        </ThemedText>
                        <ThemedText className="font-semibold">₹{plan.max_coverage_amount}</ThemedText>
                    </View>
                </View>

                {plan.coverage_details && plan.coverage_details.length > 0 && (
                    <View className="mb-3">
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mb-1">
                            Coverage Details
                        </ThemedText>
                        {plan.coverage_details.slice(0, 3).map((detail, i) => (
                            <View key={i} className="flex-row items-start ml-1">
                                <ThemedText variant="tiny" style={{ color: tierColor }}>
                                    •{' '}
                                </ThemedText>
                                <ThemedText variant="tiny" className="flex-1">
                                    {detail}
                                </ThemedText>
                            </View>
                        ))}
                        {plan.coverage_details.length > 3 && (
                            <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                                +{plan.coverage_details.length - 3} more
                            </ThemedText>
                        )}
                    </View>
                )}

                <View className="flex-row items-center justify-end pt-2 border-t border-border dark:border-darkBorder">
                    <Pressable onPress={() => openEditModal(plan)} className="flex-row items-center mr-4">
                        <Ionicons name="create-outline" size={16} color={colors.burgundy} />
                        <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="ml-1">
                            Edit
                        </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => handleToggleActive(plan)} className="flex-row items-center mr-4">
                        <Ionicons
                            name={plan.is_active ? 'eye-off-outline' : 'eye-outline'}
                            size={16}
                            color={plan.is_active ? '#F59E0B' : '#10B981'}
                        />
                        <ThemedText
                            variant="tiny"
                            style={{ color: plan.is_active ? '#F59E0B' : '#10B981' }}
                            className="ml-1"
                        >
                            {plan.is_active ? 'Deactivate' : 'Activate'}
                        </ThemedText>
                    </Pressable>
                    {plan.is_active && (
                        <Pressable onPress={() => handleDelete(plan)} className="flex-row items-center">
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            <ThemedText variant="tiny" style={{ color: '#EF4444' }} className="ml-1">
                                Delete
                            </ThemedText>
                        </Pressable>
                    )}
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
                        Insurance Plans
                    </ThemedText>
                </View>
                <Pressable
                    onPress={openAddModal}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: colors.burgundy }}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <ThemedText variant="tiny" className="text-white ml-1 font-semibold">
                        Add Plan
                    </ThemedText>
                </Pressable>
            </View>

            {/* Plan List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={insurancePlansLoading}
                        onRefresh={onRefresh}
                        tintColor={colors.burgundy}
                    />
                }
            >
                {/* Insurance Feature Toggle */}
                <View className="p-4 mb-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <ThemedText className="font-semibold mb-1">Insurance Feature</ThemedText>
                            <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                                Show/hide insurance option for customers globally
                            </ThemedText>
                        </View>
                        {togglingFeature || configsLoading ? (
                            <ActivityIndicator size="small" color={colors.burgundy} />
                        ) : (
                            <Switch
                                value={insuranceFeatureEnabled}
                                onValueChange={handleToggleInsuranceFeature}
                                trackColor={{ true: colors.burgundy }}
                            />
                        )}
                    </View>
                </View>

                {insurancePlans.length > 0 ? (
                    insurancePlans
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(renderPlanCard)
                ) : (
                    !insurancePlansLoading && (
                        <View className="items-center py-12">
                            <Ionicons name="shield-outline" size={48} color={colors.textSecondary} />
                            <ThemedText variant="small" className="mt-2">
                                No insurance plans found
                            </ThemedText>
                            <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1">
                                Tap "Add Plan" to create your first insurance plan
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
                            {editingPlan ? 'Edit Plan' : 'New Plan'}
                        </ThemedText>
                        <View style={{ width: 50 }} />
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4">
                        {/* Tier Selector */}
                        <ThemedText variant="small" className="mb-2 font-medium">
                            Tier
                        </ThemedText>
                        <View className="flex-row mb-4">
                            {TIER_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => updateField('tier', opt.value)}
                                    className="flex-1 py-2.5 mx-1 rounded-xl items-center border"
                                    style={{
                                        backgroundColor:
                                            form.tier === opt.value ? TIER_COLORS[opt.value] + '15' : 'transparent',
                                        borderColor:
                                            form.tier === opt.value ? TIER_COLORS[opt.value] : colors.textSecondary + '30',
                                    }}
                                >
                                    <ThemedText
                                        variant="tiny"
                                        style={{
                                            color: form.tier === opt.value ? TIER_COLORS[opt.value] : colors.textSecondary,
                                            fontWeight: form.tier === opt.value ? '700' : '400',
                                        }}
                                    >
                                        {opt.label}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>

                        <FormField
                            label="Plan Name"
                            value={form.name}
                            onChangeText={(v) => updateField('name', v)}
                            placeholder="e.g. Scratch Coverage"
                            colors={colors}
                        />

                        <FormField
                            label="Description"
                            value={form.description}
                            onChangeText={(v) => updateField('description', v)}
                            placeholder="Brief description of the plan"
                            multiline
                            colors={colors}
                        />

                        <View className="flex-row">
                            <View className="flex-1 mr-2">
                                <FormField
                                    label="Premium (₹)"
                                    value={form.premium_amount}
                                    onChangeText={(v) => updateField('premium_amount', v)}
                                    placeholder="99.00"
                                    keyboardType="decimal-pad"
                                    colors={colors}
                                />
                            </View>
                            <View className="flex-1 ml-2">
                                <FormField
                                    label="Max Coverage (₹)"
                                    value={form.max_coverage_amount}
                                    onChangeText={(v) => updateField('max_coverage_amount', v)}
                                    placeholder="50000.00"
                                    keyboardType="decimal-pad"
                                    colors={colors}
                                />
                            </View>
                        </View>

                        <FormField
                            label="Coverage Details (one per line)"
                            value={form.coverage_details}
                            onChangeText={(v) => updateField('coverage_details', v)}
                            placeholder={"Minor scratches covered\nPaint touch-ups included\n24/7 roadside assistance"}
                            multiline
                            numberOfLines={4}
                            colors={colors}
                        />

                        <FormField
                            label="Display Order"
                            value={form.display_order}
                            onChangeText={(v) => updateField('display_order', v)}
                            placeholder="0"
                            keyboardType="number-pad"
                            colors={colors}
                        />

                        <View className="flex-row items-center justify-between py-3 mb-4">
                            <ThemedText variant="small" className="font-medium">
                                Active
                            </ThemedText>
                            <Switch
                                value={form.is_active}
                                onValueChange={(v) => updateField('is_active', v)}
                                trackColor={{ true: colors.burgundy }}
                            />
                        </View>

                        <PrimaryButton
                            title={editingPlan ? 'Save Changes' : 'Create Plan'}
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
    keyboardType,
    colors,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
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
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                className="border border-border dark:border-darkBorder rounded-xl px-4 py-3 text-textPrimary dark:text-darkText"
                style={{
                    backgroundColor: colors.background,
                    textAlignVertical: multiline ? 'top' : 'center',
                    minHeight: multiline ? 80 : undefined,
                }}
                placeholderTextColor={colors.textSecondary}
            />
        </View>
    );
}
