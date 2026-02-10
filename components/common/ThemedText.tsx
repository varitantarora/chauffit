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
  const getVariantClass = () => {
    const textColor = 'text-textPrimary dark:text-darkText';
    const secondaryColor = 'text-textSecondary dark:text-darkTextSecondary';
    
    // Check if className already has a text color override (including dark: variants)
    const hasColorOverride = /\b(dark:)?text-\w+/.test(className);
    
    switch (variant) {
      case 'display':
        return `text-4xl font-bold ${hasColorOverride ? '' : textColor}`;
      case 'h1':
        return `text-3xl font-bold ${hasColorOverride ? '' : textColor}`;
      case 'h2':
        return `text-2xl font-semibold ${hasColorOverride ? '' : textColor}`;
      case 'h3':
        return `text-xl font-semibold ${hasColorOverride ? '' : textColor}`;
      case 'body':
        return `text-base font-normal ${hasColorOverride ? '' : textColor}`;
      case 'small':
        return `text-sm font-normal ${hasColorOverride ? '' : secondaryColor}`;
      case 'tiny':
        return `text-xs font-normal ${hasColorOverride ? '' : secondaryColor}`;
      case 'title':
        return `text-2xl font-bold ${hasColorOverride ? '' : textColor}`;
      case 'secondary':
        return hasColorOverride ? '' : secondaryColor;
      case 'caption':
        return `text-sm ${hasColorOverride ? '' : secondaryColor}`;
      case 'primary':
      default:
        return hasColorOverride ? '' : textColor;
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