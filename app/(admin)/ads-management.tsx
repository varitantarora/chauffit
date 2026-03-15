import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Pressable, RefreshControl, TextInput, Modal, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '../../components/common/ThemedText';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, BrandColors } from '../../constants/Colors';
import { Advertisement, AdvertisementCategory } from '../../services/api/AdvertisementApiService';

interface AdFormData {
  heading: string;
  description: string;
  category: string;
  page: string;
  link: string;
  image: string;
  display_order: string;
  is_active: boolean;
}

const EMPTY_FORM: AdFormData = {
  heading: '',
  description: '',
  category: '',
  page: 'home',
  link: '',
  image: '',
  display_order: '0',
  is_active: true,
};

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'ride_tracking', label: 'Ride Tracking' },
  { value: 'profile', label: 'Profile' },
  { value: 'driver_home', label: 'Driver Home' },
  { value: 'biker_home', label: 'Biker Home' },
  { value: 'other', label: 'Other' },
];

export default function AdsManagement() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const {
    advertisements,
    advertisementCategories,
    adsLoading,
    fetchAdvertisements,
    fetchAdvertisementCategories,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
  } = useAdminStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [form, setForm] = useState<AdFormData>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('all');

  useEffect(() => {
    fetchAdvertisements();
    fetchAdvertisementCategories();
  }, []);

  const onRefresh = useCallback(() => {
    fetchAdvertisements();
  }, []);

  const filteredAds = useMemo(() => {
    if (selectedPage === 'all') return advertisements;
    return advertisements.filter((ad) => ad.page === selectedPage);
  }, [advertisements, selectedPage]);

  const openAddModal = () => {
    setEditingAd(null);
    setForm({ ...EMPTY_FORM, page: selectedPage !== 'all' ? selectedPage : 'home' });
    setImageFile(null);
    setModalVisible(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      heading: ad.heading,
      description: ad.description || '',
      category: ad.category ? ad.category.id : '',
      page: ad.page,
      link: ad.link || '',
      image: ad.image || '',
      display_order: ad.display_order.toString(),
      is_active: ad.is_active,
    });
    setImageFile(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      setImageFile({
        uri: asset.uri,
        name: `ad_image.${fileType}`,
        type: `image/${fileType}`,
      });
      setForm({ ...form, image: asset.uri });
    }
  };

  const handleSave = async () => {
    if (!form.heading.trim() || (!form.image.trim() && !imageFile && !editingAd)) {
      Alert.alert('Validation', 'Please provide a heading and an image.');
      return;
    }

    setSaving(true);
    try {
      // In a real application, we might use FormData for multipart/form-data upload.
      // Assuming BaseApiService supports FormData when passing it directly or wrapping it.
      // If our generic update only JSON, we must adapt. For Django API, if `imageFile` exists, 
      // we usually send FormData. For now, we will construct FormData.
      
      const formData: any = new FormData();
      formData.append('heading', form.heading.trim());
      formData.append('description', form.description.trim());
      formData.append('page', form.page);
      formData.append('link', form.link.trim());
      formData.append('display_order', form.display_order);
      formData.append('is_active', form.is_active ? 'true' : 'false');
      
      if (form.category) {
        formData.append('category', form.category);
      }

      if (imageFile) {
        formData.append('image', {
          uri: imageFile.uri,
          name: imageFile.name,
          type: imageFile.type,
        } as any);
      }

      let success = false;
      if (editingAd) {
         // Since updateAdvertisement currently accepts Partial<Advertisement>, changing to any for FormData 
         // which is standard in React Native networking.
        success = await updateAdvertisement(editingAd.id, formData as any);
      } else {
        success = await createAdvertisement(formData as any);
      }

      if (success) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', `Failed to ${editingAd ? 'update' : 'create'} advertisement.`);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    // using json payload for partial update
    await updateAdvertisement(ad.id, { is_active: !ad.is_active });
  };

  const handleDelete = (ad: Advertisement) => {
    Alert.alert(
      'Delete Advertisement',
      `Are you sure you want to delete "${ad.heading}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAdvertisement(ad.id),
        },
      ]
    );
  };

  const updateField = (field: keyof AdFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const cleanUrl = apiUrl.replace('/api/v1', '');
    return `${cleanUrl}${path}`;
  };

  const renderAdCard = (ad: Advertisement) => {
    return (
      <View
        key={ad.id}
        className="p-4 mb-3 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder"
      >
        <View className="flex-row items-center justify-between mb-2">
          <ThemedText className="font-semibold flex-1 mr-2" numberOfLines={1}>
            {ad.heading}
          </ThemedText>
          <View className="flex-row items-center">
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: ad.is_active ? '#10B98120' : '#EF444420' }}
            >
              <ThemedText
                variant="tiny"
                style={{ color: ad.is_active ? BrandColors.success : BrandColors.danger, fontWeight: '600' }}
              >
                {ad.is_active ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          </View>
        </View>

        {ad.image && (
          <Image
            source={{ uri: getImageUrl(ad.image) }}
            style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 12 }}
            resizeMode="cover"
          />
        )}

        <ThemedText variant="tiny" className="mb-2" numberOfLines={2}>
          {ad.description || 'No description provided.'}
        </ThemedText>

        <View className="flex-row items-center justify-between mb-3">
          <ThemedText variant="tiny" style={{ color: colors.textSecondary }}>
             {ad.category ? ad.category.name : 'Uncategorized'} | Order: {ad.display_order}
          </ThemedText>
        </View>

        <View className="flex-row items-center justify-end pt-2 border-t border-border dark:border-darkBorder">
          <Pressable onPress={() => openEditModal(ad)} className="flex-row items-center mr-4">
            <Ionicons name="create-outline" size={16} color={colors.burgundy} />
            <ThemedText variant="tiny" style={{ color: colors.burgundy }} className="ml-1">
              Edit
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => handleToggleActive(ad)} className="flex-row items-center mr-4">
            <Ionicons
              name={ad.is_active ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={ad.is_active ? BrandColors.warning : BrandColors.success}
            />
            <ThemedText
              variant="tiny"
              style={{ color: ad.is_active ? BrandColors.warning : BrandColors.success }}
              className="ml-1"
            >
              {ad.is_active ? 'Hide' : 'Show'}
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => handleDelete(ad)} className="flex-row items-center">
            <Ionicons name="trash-outline" size={16} color={BrandColors.danger} />
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
            Advertisements
          </ThemedText>
        </View>
        <Pressable
          onPress={openAddModal}
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.burgundy }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <ThemedText variant="tiny" className="text-white ml-1 font-semibold">
            Add Ad
          </ThemedText>
        </Pressable>
      </View>

      {/* Page Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3" style={{ maxHeight: 44 }}>
        <Pressable
          onPress={() => setSelectedPage('all')}
          className="mr-2 px-4 py-2 rounded-full border mb-1"
          style={{
            backgroundColor: selectedPage === 'all' ? colors.burgundy : 'transparent',
            borderColor: selectedPage === 'all' ? colors.burgundy : colors.textSecondary + '30',
          }}
        >
          <ThemedText
            variant="tiny"
            style={{
              color: selectedPage === 'all' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: selectedPage === 'all' ? '700' : '400',
            }}
          >
            All Pages
          </ThemedText>
        </Pressable>
        {PAGE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setSelectedPage(opt.value)}
            className="mr-2 px-4 py-2 rounded-full border mb-1"
            style={{
              backgroundColor: selectedPage === opt.value ? colors.burgundy + '15' : 'transparent',
              borderColor: selectedPage === opt.value ? colors.burgundy : colors.textSecondary + '30',
            }}
          >
            <ThemedText
              variant="tiny"
              style={{
                color: selectedPage === opt.value ? colors.burgundy : colors.textSecondary,
                fontWeight: selectedPage === opt.value ? '700' : '400',
              }}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Ads List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={adsLoading} onRefresh={onRefresh} tintColor={colors.burgundy} />}
      >
        {filteredAds.length > 0 ? (
          filteredAds.map(renderAdCard)
        ) : (
          !adsLoading && (
            <View className="items-center py-12">
              <Ionicons name="megaphone-outline" size={48} color={colors.textSecondary} />
              <ThemedText variant="small" className="mt-2">
                No advertisements found
              </ThemedText>
              <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-1">
                Tap "Add Ad" to create your first notification or ad.
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
            <ThemedText variant="h3">{editingAd ? 'Edit Advertisement' : 'New Advertisement'}</ThemedText>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            <FormField
              label="Heading *"
              value={form.heading}
              onChangeText={(v) => updateField('heading', v)}
              placeholder="e.g. Summer Sale 50% Off"
              colors={colors}
            />

            <FormField
              label="Description"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Brief description of the promotion"
              multiline
              colors={colors}
            />

            {/* Page Selector */}
            <ThemedText variant="small" className="mb-2 font-medium">Page Placement *</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {PAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => updateField('page', opt.value)}
                  className="px-4 py-2 mr-2 rounded-xl border"
                  style={{
                    backgroundColor: form.page === opt.value ? colors.burgundy + '15' : 'transparent',
                    borderColor: form.page === opt.value ? colors.burgundy : colors.textSecondary + '30',
                  }}
                >
                  <ThemedText
                    variant="tiny"
                    style={{
                      color: form.page === opt.value ? colors.burgundy : colors.textSecondary,
                      fontWeight: form.page === opt.value ? '700' : '400',
                    }}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            {/* Category Selector */}
            {advertisementCategories.length > 0 && (
              <>
                <ThemedText variant="small" className="mb-2 font-medium">Category</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  <Pressable
                    onPress={() => updateField('category', '')}
                    className="px-4 py-2 mr-2 rounded-xl border"
                    style={{
                      backgroundColor: form.category === '' ? colors.burgundy + '15' : 'transparent',
                      borderColor: form.category === '' ? colors.burgundy : colors.textSecondary + '30',
                    }}
                  >
                    <ThemedText variant="tiny" style={{ color: form.category === '' ? colors.burgundy : colors.textSecondary }}>
                      None
                    </ThemedText>
                  </Pressable>
                  {advertisementCategories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => updateField('category', cat.id)}
                      className="px-4 py-2 mr-2 rounded-xl border"
                      style={{
                        backgroundColor: form.category === cat.id ? colors.burgundy + '15' : 'transparent',
                        borderColor: form.category === cat.id ? colors.burgundy : colors.textSecondary + '30',
                      }}
                    >
                      <ThemedText variant="tiny" style={{ color: form.category === cat.id ? colors.burgundy : colors.textSecondary }}>
                        {cat.name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Image Upload */}
            <ThemedText variant="small" className="mb-2 font-medium">Banner Image *</ThemedText>
            <Pressable
              onPress={pickImage}
              className="mb-4 rounded-xl border border-dashed items-center justify-center p-4"
              style={{
                borderColor: colors.textSecondary + '50',
                backgroundColor: colors.textSecondary + '10',
                minHeight: 120,
              }}
            >
              {form.image ? (
                <Image
                  source={{ uri: form.image.startsWith('http') || form.image.startsWith('file') ? form.image : getImageUrl(form.image) }}
                  style={{ width: '100%', height: 120, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                  <ThemedText variant="tiny" style={{ color: colors.textSecondary }} className="mt-2">
                    Tap to upload an image
                  </ThemedText>
                </>
              )}
            </Pressable>

            <FormField
              label="Action Link URL"
              value={form.link}
              onChangeText={(v) => updateField('link', v)}
              placeholder="https://yourwebsite.com/promo"
              keyboardType="url"
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
              <ThemedText variant="small" className="font-medium">Active</ThemedText>
              <Switch value={form.is_active} onValueChange={(v) => updateField('is_active', v)} trackColor={{ true: colors.burgundy }} />
            </View>

            <PrimaryButton title={editingAd ? 'Save Changes' : 'Create Advertisement'} onPress={handleSave} loading={saving} />
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
  keyboardType?: any;
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
