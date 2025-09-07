import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';

interface DurationOption {
  id: string;
  duration: string;
  label: string;
  price: number;
  description: string;
  popular?: boolean;
}

interface DurationSelectorProps {
  options: DurationOption[];
  selectedDuration: string;
  onSelect: (option: DurationOption) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  options,
  selectedDuration,
  onSelect,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  return (
    <View className="space-y-4">
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => onSelect(option)}
          className={`p-4 rounded-2xl border-2 ${
            selectedDuration === option.id
              ? 'border-secondary bg-secondary/10'
              : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <ThemedText variant="h3" className="font-bold">
                  {option.label}
                </ThemedText>
                {option.popular && (
                  <View className="bg-secondary px-2 py-1 rounded-full ml-2">
                    <ThemedText variant="tiny" className="text-white font-semibold">
                      POPULAR
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText variant="small" className="text-textSecondary mb-2">
                {option.description}
              </ThemedText>
              <ThemedText variant="h3" className="text-burgundy font-bold">
                {option.id === 'custom' ? '₹1,200/hr' : `₹${option.price.toLocaleString()}`}
              </ThemedText>
            </View>
            
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              selectedDuration === option.id
                ? 'border-secondary bg-secondary'
                : 'border-textSecondary'
            }`}>
              {selectedDuration === option.id && (
                <View className="w-2 h-2 bg-white rounded-full" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};