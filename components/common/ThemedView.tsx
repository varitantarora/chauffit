import React from 'react';
import { View, ViewProps } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface ThemedViewProps extends ViewProps {
  className?: string;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  className = '', 
  style, 
  children, 
  ...props 
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const baseClass = isDarkMode 
    ? 'bg-darkBackground' 
    : 'bg-background';
  
  return (
    <View 
      className={`${baseClass} ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};