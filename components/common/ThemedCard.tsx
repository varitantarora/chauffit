import React from 'react';
import { View, ViewProps, Pressable } from 'react-native';

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
  const getCardClasses = () => {
    return `p-6 rounded-2xl border bg-surface dark:bg-darkSurface border-border dark:border-darkBorder`;
  };

  const getShadowStyle = () => {
    const shadows = {
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
      premium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }
    };
    
    return shadows[variant];
  };
  
  const content = (
    <View
      className={`${getCardClasses()} ${className}`}
      style={[getShadowStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
  
  if (pressable && onPress) {
    return (
      <Pressable 
        onPress={onPress}
        android_ripple={null}
        style={({ pressed }) => [
          { opacity: pressed ? 1 : 1 }
        ]}
      >
        {content}
      </Pressable>
    );
  }
  
  return content;
};