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
      primary: 'bg-burgundy',
      secondary: 'bg-secondary',
      outline: 'border-2 border-burgundy bg-transparent dark:border-primary'
    }[variant];
    
    const disabledClass = disabled || loading ? 'opacity-60' : '';
    
    return `${sizeClasses} ${variantClasses} ${disabledClass} rounded-xl items-center justify-center`;
  };
  
  const getTextColor = () => {
    if (variant === 'outline') {
      return 'text-burgundy dark:text-primary';
    }
    return 'text-white';
  };
  
  const getTextSize = () => {
    return {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    }[size];
  };

  const getShadowStyle = () => {
    if (variant === 'outline') return {};
    
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getButtonClasses()} ${className}`}
      style={getShadowStyle()}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#720C17' : 'white'} />
      ) : (
        <Text className={`${getTextColor()} font-semibold ${getTextSize()}`}>{title}</Text>
      )}
    </Pressable>
  );
};