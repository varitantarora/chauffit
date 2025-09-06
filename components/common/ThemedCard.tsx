import React from 'react';
import { View, ViewProps, Pressable } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface ThemedCardProps extends ViewProps {
  className?: string;
  onPress?: () => void;
  pressable?: boolean;
  variant?: 'default' | 'elevated' | 'premium';
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ 
  className = '', 
  style, 
  children,
  onPress,
  pressable = false,
  variant = 'default',
  ...props 
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const getCardClasses = () => {
    const baseClass = isDarkMode 
      ? 'bg-darkSurface border-darkBorder' 
      : 'bg-white border-border';
    
    const shadowClass = {
      default: 'shadow-card',
      elevated: 'shadow-elevated',
      premium: 'shadow-premium'
    }[variant];
    
    return `p-6 rounded-2xl border ${baseClass} ${shadowClass}`;
  };
  
  const pressedStyle = pressable && onPress ? 'active:scale-98 transition-transform duration-150' : '';
  
  const content = (
    <View 
      className={`${getCardClasses()} ${pressedStyle} ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </View>
  );
  
  if (pressable && onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  
  return content;
};