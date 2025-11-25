import React from 'react';
import { View, ViewProps } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface ThemedViewProps extends ViewProps {
  className?: string;
}

// Theme colors
const LIGHT_BACKGROUND = '#FFFBF5';
const DARK_BACKGROUND = '#1A1A1A';

export const ThemedView: React.FC<ThemedViewProps> = ({
  className = '',
  style,
  children,
  ...props
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  return (
    <View
      className={className}
      style={[
        { backgroundColor: isDarkMode ? DARK_BACKGROUND : LIGHT_BACKGROUND },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};