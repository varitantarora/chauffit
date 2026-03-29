import React, { useState } from 'react';
import { View, TouchableOpacity, Text, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';

interface TaxesAndFeesRowProps {
  platformFee?: number;
  gstAmount?: number;
  smallDistanceFee?: number;
  formatAmount?: (amount: number) => string;
  variant?: 'nativewind-tiny' | 'nativewind-small' | 'nativewind-body' | 'inline-style';
  className?: string;
  textColor?: string;
  textSecondaryColor?: string;
  iconColor?: string;
}

const defaultFormat = (v: number) =>
  `₹${v.toLocaleString('en-IN')}`;

export const TaxesAndFeesRow: React.FC<TaxesAndFeesRowProps> = ({
  platformFee = 0,
  gstAmount = 0,
  smallDistanceFee = 0,
  formatAmount = defaultFormat,
  variant = 'nativewind-tiny',
  className = '',
  textColor,
  textSecondaryColor,
  iconColor: iconColorProp,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isDarkMode = useAuthStore((s) => s.isDarkMode);

  const total = platformFee + gstAmount + smallDistanceFee;
  if (total <= 0) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  if (variant === 'inline-style') {
    const primary = textColor || (isDarkMode ? '#d9d1c6' : '#1a1a1a');
    const secondary = textSecondaryColor || (isDarkMode ? '#9ca3af' : '#6b7280');
    const iColor = iconColorProp || secondary;

    return (
      <View style={{ marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: secondary, fontSize: 14 }}>Taxes & Fees</Text>
            <TouchableOpacity onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={expanded ? 'information-circle' : 'information-circle-outline'}
                size={14}
                color={iColor}
              />
            </TouchableOpacity>
          </View>
          <Text style={{ color: primary, fontSize: 14 }}>{formatAmount(total)}</Text>
        </View>
        {expanded && (
          <View style={{ paddingLeft: 12, marginTop: 4 }}>
            {platformFee > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: secondary, fontSize: 12 }}>Platform Fee</Text>
                <Text style={{ color: secondary, fontSize: 12 }}>{formatAmount(platformFee)}</Text>
              </View>
            )}
            {gstAmount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: secondary, fontSize: 12 }}>GST</Text>
                <Text style={{ color: secondary, fontSize: 12 }}>{formatAmount(gstAmount)}</Text>
              </View>
            )}
            {smallDistanceFee > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: secondary, fontSize: 12 }}>Short Distance Fee</Text>
                <Text style={{ color: secondary, fontSize: 12 }}>{formatAmount(smallDistanceFee)}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  // NativeWind variants
  const textVariant =
    variant === 'nativewind-tiny' ? 'tiny' as const
    : variant === 'nativewind-small' ? 'small' as const
    : 'body' as const;

  const subTextVariant = variant === 'nativewind-body' ? 'small' as const : 'tiny' as const;

  const secondaryClass = 'text-textSecondary dark:text-darkTextSecondary';
  const iColor = iconColorProp || (isDarkMode ? '#9ca3af' : '#6b7280');

  return (
    <View className={`mb-1 ${className}`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <ThemedText variant={textVariant} className={secondaryClass}>
            Taxes & Fees
          </ThemedText>
          <TouchableOpacity onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={expanded ? 'information-circle' : 'information-circle-outline'}
              size={variant === 'nativewind-body' ? 16 : 14}
              color={iColor}
            />
          </TouchableOpacity>
        </View>
        <ThemedText variant={textVariant} className={secondaryClass}>
          {formatAmount(total)}
        </ThemedText>
      </View>
      {expanded && (
        <View className="pl-3 mt-1">
          {platformFee > 0 && (
            <View className="flex-row justify-between mb-0.5">
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                Platform Fee
              </ThemedText>
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                {formatAmount(platformFee)}
              </ThemedText>
            </View>
          )}
          {gstAmount > 0 && (
            <View className="flex-row justify-between mb-0.5">
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                GST
              </ThemedText>
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                {formatAmount(gstAmount)}
              </ThemedText>
            </View>
          )}
          {smallDistanceFee > 0 && (
            <View className="flex-row justify-between mb-0.5">
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                Short Distance Fee
              </ThemedText>
              <ThemedText variant={subTextVariant} className={secondaryClass}>
                {formatAmount(smallDistanceFee)}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
