import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors, useThemeColors} from '../../constants/Colors';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPillsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({ options, selected, onSelect }) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}>
      {options.map((option) => {
        const isActive = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isActive ? colors.burgundy : (isDarkMode ? colors.surface : '#F3F4F6'),
              borderWidth: isActive ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: isActive ? '#FFFFFF' : colors.textSecondary, fontSize: 13, fontWeight: isActive ? '600' : '400' }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
