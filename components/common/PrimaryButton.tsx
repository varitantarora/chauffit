import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'medium',
}) => {
  const getButtonClasses = () => {
    const sizeClasses = {
      small: 'py-2 px-4',
      medium: 'py-4 px-6',
      large: 'py-5 px-8'
    }[size];
    
    const variantClasses = {
      primary: 'bg-burgundy shadow-lg active:scale-98',
      secondary: 'bg-secondary shadow-lg active:scale-98',
      outline: 'border-2 border-burgundy bg-transparent active:scale-98'
    }[variant];
    
    const disabledClass = disabled || loading ? 'opacity-60' : '';
    
    return `${sizeClasses} ${variantClasses} ${disabledClass} rounded-xl items-center justify-center transition-transform duration-150`;
  };
  
  const getTextColor = () => {
    return variant === 'outline' ? 'text-burgundy' : 'text-white';
  };
  
  const getTextSize = () => {
    return {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    }[size];
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getButtonClasses()} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#720C17' : 'white'} />
      ) : (
        <Text className={`${getTextColor()} font-semibold ${getTextSize()}`}>{title}</Text>
      )}
    </Pressable>
  );
};