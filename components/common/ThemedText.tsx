import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface ThemedTextProps extends TextProps {
  className?: string;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'tiny' | 'primary' | 'secondary' | 'title' | 'caption';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  className = '', 
  variant = 'body',
  style, 
  children, 
  ...props 
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const getVariantClass = () => {
    const textColor = isDarkMode ? 'text-darkText' : 'text-textPrimary';
    const secondaryColor = isDarkMode ? 'text-darkTextSecondary' : 'text-textSecondary';
    
    switch (variant) {
      case 'display':
        return `text-4xl font-bold ${textColor}`; // 36px - Hero headlines
      case 'h1':
        return `text-3xl font-bold ${textColor}`; // 30px - Page titles
      case 'h2':
        return `text-2xl font-semibold ${textColor}`; // 24px - Section headers
      case 'h3':
        return `text-xl font-semibold ${textColor}`; // 20px - Card titles
      case 'body':
        return `text-base font-normal ${textColor}`; // 16px - Default text
      case 'small':
        return `text-sm font-normal ${secondaryColor}`; // 14px - Secondary text
      case 'tiny':
        return `text-xs font-normal ${secondaryColor}`; // 12px - Captions
      // Legacy variants for backward compatibility
      case 'title':
        return `text-2xl font-bold ${textColor}`;
      case 'secondary':
        return secondaryColor;
      case 'caption':
        return `text-sm ${secondaryColor}`;
      case 'primary':
      default:
        return textColor;
    }
  };
  
  return (
    <Text 
      className={`${getVariantClass()} ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};