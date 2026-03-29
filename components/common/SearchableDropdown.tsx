import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
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

  const handleToggle = () => {
    if (!disabled) {
      if (isOpen) {
        setIsOpen(false);
        setSearchText('');
      } else {
        setSearchText('');
        setIsOpen(true);
      }
    }
  };

  return (
    <View className="mb-4">
      <ThemedText variant="small" className="mb-2 font-semibold">
        {label}
      </ThemedText>
      {isOpen ? (
        <View
          className={`flex-row items-center p-4 rounded-xl border ${inputClass}`}
        >
          <Ionicons name="search" size={20} color={iconColor} />
          <TextInput
            className={`flex-1 ml-3 text-base ${isDarkMode ? 'text-darkText' : 'text-textPrimary'}`}
            placeholder={`Search ${label.toLowerCase().replace(' *', '')}...`}
            placeholderTextColor={iconColor}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} className="mr-2">
              <Ionicons name="close-circle" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleToggle}>
            <Ionicons name="chevron-up" size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleToggle}
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
      )}

      {isOpen && (
        <View
          className={`mt-1 rounded-xl border overflow-hidden ${inputClass}`}
        >
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {filteredOptions.length === 0 ? (
              <View className="items-center py-6">
                <ThemedText variant="small" style={{ color: iconColor }}>
                  No results found
                </ThemedText>
              </View>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = item === selectedValue;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => handleSelect(item)}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-burgundy/20'
                          : 'bg-burgundy/10'
                        : ''
                    }`}
                  >
                    <ThemedText
                      className="text-sm"
                      style={isSelected ? { color: BrandColors.burgundy, fontWeight: '600' } : undefined}
                    >
                      {item}
                    </ThemedText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={BrandColors.burgundy} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
