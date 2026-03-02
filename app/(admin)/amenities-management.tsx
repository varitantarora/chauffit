import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Modal, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';
import { AdminAmenity } from '../../services/api/AdminApiService';

type AmenityCategory = AdminAmenity['category'];

const CATEGORY_OPTIONS: { value: AmenityCategory; label: string; icon: string }[] = [
    { value: 'refreshment', label: 'Refreshment', icon: 'cafe' },
    { value: 'comfort', label: 'Comfort', icon: 'bed' },
    { value: 'premium', label: 'Premium', icon: 'diamond' },
];

const CATEGORY_COLORS: Record<string, string> = {
    refreshment: '#F59E0B',
    comfort: '#3B82F6',
    premium: '#8B5CF6',
};

interface AmenityFormData {
    name: string;
    description: string;
    category: AmenityCategory;
    price: string;
    available_segments: string;
    image_url: string;
    is_active: boolean;
}

const EMPTY_FORM: AmenityFormData = {
    name: '',
    description: '',
    category: 'refreshment',
    price: '',
    available_segments: '',
    image_url: '',
    is_active: true,
};

export default function AmenitiesManagement() {
    const router = useRouter();
    const isDarkMode = useAuthStore((state) => state.isDarkMode);
    const colors = isDarkMode ? DarkColors : LightColors;
    const {
        amenities,
        amenitiesLoading,
        fetchAmenities,
        createAmenity,
        updateAmenity,
        deleteAmenity,
    } = useAdminStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<AdminAmenity | null>(null);
    const [form, setForm] = useState<AmenityFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AmenityCategory | 'all'>('all');

    useEffect(() => {
        fetchAmenities();
    }, []);

    const onRefresh = useCallback(() => {
        fetchAmenities();
    }, []);

    const groupedAmenities = useMemo(() => {
        const filtered =
            selectedCategory === 'all'
                ? amenities
                : amenities.filter((a) => a.category === selectedCategory);

        const groups: Record<string, AdminAmenity[]> = {};
        for (const amenity of filtered) {
            const cat = amenity.category || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(amenity);
        }
        return groups;
    }, [amenities, selectedCategory]);

    const openAddModal = (category?: AmenityCategory) => {
        setEditingAmenity(null);
        setForm({ ...EMPTY_FORM, category: category || 'refreshment' });
        setModalVisible(true);
    };

    const openEditModal = (amenity: AdminAmenity) => {
        setEditingAmenity(amenity);
        setForm({
            name: amenity.name,
            description: amenity.description,
            category: amenity.category,
            price: amenity.price,
            available_segments: Array.isArray(amenity.available_segments)
                ? amenity.available_segments.join(', ')
                : '',
            image_url: amenity.image_url || '',
            is_active: amenity.is_active,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.price.trim()) {
            Alert.alert('Validation', 'Please fill in name and price.');
            return;
        }

        setSaving(true);
        const data: Partial<AdminAmenity> = {
            name: form.name.trim(),
            description: form.description.trim(),
            category: form.category,
            price: form.price.trim(),
            available_segments: form.available_segments
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            image_url: form.image_url.trim(),
            is_active: form.is_active,
        };

        let success = false;
        if (editingAmenity) {
            success = await updateAmenity(editingAmenity.id, data);
        } else {
            success = await createAmenity(data);
        }

        setSaving(false);
        if (success) {
            setModalVisible(false);
        } else {
            Alert.alert('Error', `Failed to ${editingAmenity ? 'update' : 'create'} amenity.`);
        }
    };

    const handleToggleActive = async (amenity: AdminAmenity) => {
        await updateAmenity(amenity.id, { is_active: !amenity.is_active });
    };

    const handleDelete = (amenity: AdminAmenity) => {
        Alert.alert(
            'Deactivate Amenity',
            `Are you sure you want to deactivate "${amenity.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deactivate',
                    style: 'destructive',
                    onPress: () => deleteAmenity(amenity.id),
                },
            ]
        );
    };

    const updateField = (field: keyof AmenityFormData, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const renderAmenityCard = (amenity: AdminAmenity) => {
        const catColor = CATEGORY_COLORS[amenity.category] || '#6B7280';

        return (
            <View
                key={amenity.id}
                className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
            >
                <View className="flex-row items-center justify-between mb-2">
                    <ThemedText className="font-semibold flex-1 mr-2" numberOfLines={1}>
                        {amenity.name}
                    </ThemedText>
                    <View className="flex-row items-center">
                        <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: amenity.is_active ? '#10B98120' : '#EF444420' }}
                        >
                            <ThemedText
                                variant="tiny"
                                style={{ color: amenity.is_active ? '#10B981' : '#EF4444', fontWeight: '600' }}
                            >
                                {amenity.is_active ? 'Active' : 'Inactive'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <ThemedText variant="tiny" className="mb-2" numberOfLines={2}>
                    {amenity.description}
                </ThemedText>

                <View className="flex-row items-center justify-between mb-3">
                    <ThemedText className="font-semibold" style={{ color: catColor }}>
                        ₹{amenity.price}
                    </ThemedText>
                    {amenity.available_segments && amenity.available_segments.length > 0 && (
                        <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
                            {amenity.available_segments.join(', ')}
                        </ThemedText>
                    )}
                </View>

                <View className="flex-row items-center justify-end pt-2 border-t border-border dark:border-darkBorder">
                    <Pressable onPress={() => openEditModal(amenity)} className="flex-row items-center mr-4">
                        <Ionicons name="create-outline" size={16} color={colors.burgundy} />
                        <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="ml-1">
                            Edit
                        </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => handleToggleActive(amenity)} className="flex-row items-center mr-4">
                        <Ionicons
                            name={amenity.is_active ? 'eye-off-outline' : 'eye-outline'}
                            size={16}
                            color={amenity.is_active ? '#F59E0B' : '#10B981'}
                        />
                        <ThemedText
                            variant="tiny"
                            style={{ color: amenity.is_active ? '#F59E0B' : '#10B981' }}
                            className="ml-1"
                        >
                            {amenity.is_active ? 'Deactivate' : 'Activate'}
                        </ThemedText>
                    </Pressable>
                    {amenity.is_active && (
                        <Pressable onPress={() => handleDelete(amenity)} className="flex-row items-center">
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
                        Amenities
                    </ThemedText>
                </View>
                <Pressable
                    onPress={() => openAddModal()}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: colors.burgundy }}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <ThemedText variant="tiny" className="text-white ml-1 font-semibold">
                        Add Amenity
                    </ThemedText>
                </Pressable>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3" style={{ maxHeight: 44 }}>
                <Pressable
                    onPress={() => setSelectedCategory('all')}
                    className="mr-2 px-4 py-2 rounded-full border"
                    style={{
                        backgroundColor: selectedCategory === 'all' ? colors.burgundy : 'transparent',
                        borderColor: selectedCategory === 'all' ? colors.burgundy : colors.textSecondary + '30',
                    }}
                >
                    <ThemedText
                        variant="tiny"
                        style={{
                            color: selectedCategory === 'all' ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: selectedCategory === 'all' ? '700' : '400',
                        }}
                    >
                        All
                    </ThemedText>
                </Pressable>
                {CATEGORY_OPTIONS.map((opt) => (
                    <Pressable
                        key={opt.value}
                        onPress={() => setSelectedCategory(opt.value)}
                        className="mr-2 px-4 py-2 rounded-full flex-row items-center border"
                        style={{
                            backgroundColor:
                                selectedCategory === opt.value ? CATEGORY_COLORS[opt.value] + '15' : 'transparent',
                            borderColor:
                                selectedCategory === opt.value
                                    ? CATEGORY_COLORS[opt.value]
                                    : colors.textSecondary + '30',
                        }}
                    >
                        <Ionicons
                            name={opt.icon as any}
                            size={14}
                            color={
                                selectedCategory === opt.value ? CATEGORY_COLORS[opt.value] : colors.textSecondary
                            }
                            style={{ marginRight: 4 }}
                        />
                        <ThemedText
                            variant="tiny"
                            style={{
                                color:
                                    selectedCategory === opt.value ? CATEGORY_COLORS[opt.value] : colors.textSecondary,
                                fontWeight: selectedCategory === opt.value ? '700' : '400',
                            }}
                        >
                            {opt.label}
                        </ThemedText>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Amenity List grouped by category */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={amenitiesLoading}
                        onRefresh={onRefresh}
                        tintColor={colors.burgundy}
                    />
                }
            >
                {Object.keys(groupedAmenities).length > 0 ? (
                    CATEGORY_OPTIONS.filter((cat) => groupedAmenities[cat.value]).map((cat) => (
                        <View key={cat.value} className="mb-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={18}
                                        color={CATEGORY_COLORS[cat.value]}
                                        style={{ marginRight: 6 }}
                                    />
                                    <ThemedText variant="h3" style={{ color: CATEGORY_COLORS[cat.value] }}>
                                        {cat.label}
                                    </ThemedText>
                                    <View
                                        className="ml-2 px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: CATEGORY_COLORS[cat.value] + '15' }}
                                    >
                                        <ThemedText variant="tiny" style={{ color: CATEGORY_COLORS[cat.value], fontWeight: '600' }}>
                                            {groupedAmenities[cat.value].length}
                                        </ThemedText>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => openAddModal(cat.value)}
                                    className="flex-row items-center"
                                >
                                    <Ionicons name="add-circle-outline" size={18} color={CATEGORY_COLORS[cat.value]} />
                                    <ThemedText variant="tiny" style={{ color: CATEGORY_COLORS[cat.value] }} className="ml-1">
                                        Add
                                    </ThemedText>
                                </Pressable>
                            </View>
                            {groupedAmenities[cat.value].map(renderAmenityCard)}
                        </View>
                    ))
                ) : (
                    !amenitiesLoading && (
                        <View className="items-center py-12">
                            <Ionicons name="cafe-outline" size={48} color={colors.textSecondary} />
                            <ThemedText variant="small" className="mt-2">
                                No amenities found
                            </ThemedText>
                            <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1">
                                Tap "Add Amenity" to create your first amenity
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
                            {editingAmenity ? 'Edit Amenity' : 'New Amenity'}
                        </ThemedText>
                        <View style={{ width: 50 }} />
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4">
                        <FormField
                            label="Name"
                            value={form.name}
                            onChangeText={(v) => updateField('name', v)}
                            placeholder="e.g. Bottled Water"
                            colors={colors}
                        />

                        <FormField
                            label="Description"
                            value={form.description}
                            onChangeText={(v) => updateField('description', v)}
                            placeholder="Brief description of the amenity"
                            multiline
                            colors={colors}
                        />

                        {/* Category Selector */}
                        <ThemedText variant="small" className="mb-2 font-medium">
                            Category
                        </ThemedText>
                        <View className="flex-row mb-4">
                            {CATEGORY_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => updateField('category', opt.value)}
                                    className="flex-1 py-2.5 mx-1 rounded-xl items-center border flex-row justify-center"
                                    style={{
                                        backgroundColor:
                                            form.category === opt.value
                                                ? CATEGORY_COLORS[opt.value] + '15'
                                                : 'transparent',
                                        borderColor:
                                            form.category === opt.value
                                                ? CATEGORY_COLORS[opt.value]
                                                : colors.textSecondary + '30',
                                    }}
                                >
                                    <Ionicons
                                        name={opt.icon as any}
                                        size={14}
                                        color={
                                            form.category === opt.value
                                                ? CATEGORY_COLORS[opt.value]
                                                : colors.textSecondary
                                        }
                                        style={{ marginRight: 4 }}
                                    />
                                    <ThemedText
                                        variant="tiny"
                                        style={{
                                            color:
                                                form.category === opt.value
                                                    ? CATEGORY_COLORS[opt.value]
                                                    : colors.textSecondary,
                                            fontWeight: form.category === opt.value ? '700' : '400',
                                        }}
                                    >
                                        {opt.label}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>

                        <FormField
                            label="Price (₹)"
                            value={form.price}
                            onChangeText={(v) => updateField('price', v)}
                            placeholder="49.00"
                            keyboardType="decimal-pad"
                            colors={colors}
                        />

                        <FormField
                            label="Available Segments (comma-separated, leave empty for all)"
                            value={form.available_segments}
                            onChangeText={(v) => updateField('available_segments', v)}
                            placeholder="sedan, suv, luxury"
                            colors={colors}
                        />

                        <FormField
                            label="Image URL (optional)"
                            value={form.image_url}
                            onChangeText={(v) => updateField('image_url', v)}
                            placeholder="https://example.com/image.png"
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
                            title={editingAmenity ? 'Save Changes' : 'Create Amenity'}
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
