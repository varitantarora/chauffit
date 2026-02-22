import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { LightColors, DarkColors } from '../../constants/Colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const colors = isDarkMode ? DarkColors : LightColors;
  const iconColor = color || colors.burgundy;

  return (
    <View
      className="flex-1 p-4 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder min-w-[45%]"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: iconColor + '20' }}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <ThemedText variant="tiny" className="flex-1">{title}</ThemedText>
      </View>
      <ThemedText variant="h2">{String(value)}</ThemedText>
      {subtitle && <ThemedText variant="tiny" className="mt-1">{subtitle}</ThemedText>}
    </View>
  );
};
