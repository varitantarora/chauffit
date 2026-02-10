import React from 'react';
import { View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  className?: string;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  className = '',
  style,
  children,
  ...props
}) => {
  return (
    <View
      className={`bg-background dark:bg-darkBackground ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};