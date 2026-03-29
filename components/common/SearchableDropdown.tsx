import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { BrandColors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function SearchableDropdown({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  iconName = 'chevron-down',
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const inputClass = isDarkMode
    ? 'bg-darkSurface text-darkText border-darkBorder'
    : 'bg-white text-textPrimary dark:text-darkText border-border';

  const iconColor = isDarkMode ? '#d9d1c6' : '#314b4c';

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const lower = searchText.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lower));
  }, [options, searchText]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setSearchText('');
  };

  const handleOpen = () => {
    if (!disabled) {
      setSearchText('');
      setIsOpen(true);
    }
  };

  return (
    <>
      <View className="mb-4">
        <ThemedText variant="small" className="mb-2 font-semibold">
          {label}
        </ThemedText>
        <TouchableOpacity
          onPress={handleOpen}
          activeOpacity={disabled ? 1 : 0.7}
          className={`flex-row items-center justify-between p-4 rounded-xl border ${inputClass}`}
          style={disabled ? { opacity: 0.5 } : undefined}
        >
          <View className="flex-row items-center flex-1">
            <Ionicons name={iconName} size={20} color={iconColor} />
            <ThemedText
              className="ml-3 text-base flex-1"
              numberOfLines={1}
              style={!selectedValue ? { color: iconColor } : undefined}
            >
              {selectedValue || placeholder}
            </ThemedText>
          </View>
          <Ionicons name="chevron-down" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View
                className={`rounded-t-3xl ${isDarkMode ? 'bg-darkSurface' : 'bg-white'}`}
                style={{ maxHeight: '80%' }}
              >
                {/* Handle bar */}
                <View className="items-center pt-3 pb-2">
                  <View className="w-10 h-1 bg-gray-300 rounded-full" />
                </View>

                {/* Title */}
                <ThemedText variant="h3" className="px-6 mb-3">
                  {label}
                </ThemedText>

                {/* Search bar */}
                <View className="mx-4 mb-3">
                  <View
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${inputClass}`}
                  >
                    <Ionicons name="search" size={18} color={iconColor} />
                    <TextInput
                      className="flex-1 ml-3 text-base"
                      placeholder={`Search ${label.toLowerCase().replace(' *', '')}...`}
                      placeholderTextColor={iconColor}
                      value={searchText}
                      onChangeText={setSearchText}
                      autoFocus
                      autoCorrect={false}
                    />
                    {searchText.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={18} color={iconColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Options list */}
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item}
                  style={{ maxHeight: 350 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const isSelected = item === selectedValue;
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        className={`flex-row items-center justify-between px-6 py-4 ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-burgundy/20'
                              : 'bg-burgundy/10'
                            : ''
                        }`}
                      >
                        <ThemedText
                          className="text-base"
                          style={isSelected ? { color: BrandColors.burgundy, fontWeight: '600' } : undefined}
                        >
                          {item}
                        </ThemedText>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color={BrandColors.burgundy} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View className="items-center py-8">
                      <ThemedText variant="small" style={{ color: iconColor }}>
                        No results found
                      </ThemedText>
                    </View>
                  }
                />

                {/* Bottom padding for safe area */}
                <View className="h-8" />
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
