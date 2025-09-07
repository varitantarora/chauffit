import React from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { LightColors } from '../../constants/Colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
  type?: 'spinner' | 'dots' | 'pulse';
  transparent?: boolean;
  className?: string;
  style?: any;
}

const { width, height } = Dimensions.get('window');

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  subMessage,
  showProgress = false,
  progress = 0,
  type = 'spinner',
  transparent = false,
  className = '',
  style,
}) => {
  const [animatedProgress] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(1));
  const [dotsAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (showProgress) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  React.useEffect(() => {
    if (type === 'pulse') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }

    if (type === 'dots') {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotsAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotsAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => animateDots());
      };
      animateDots();
    }
  }, [type]);

  const renderSpinner = () => (
    <View className="items-center">
      <ActivityIndicator 
        size="large" 
        color={LightColors.secondary}
      />
      {message && (
        <Text className="text-lg font-medium text-black mt-4 text-center">
          {message}
        </Text>
      )}
      {subMessage && (
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {subMessage}
        </Text>
      )}
    </View>
  );

  const renderPulse = () => (
    <View className="items-center">
      <Animated.View 
        style={[
          {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: LightColors.secondary,
            transform: [{ scale: pulseAnim }],
          }
        ]}
        className="items-center justify-center"
      >
        <View 
          className="w-6 h-6 rounded-full bg-white"
        />
      </Animated.View>
      {message && (
        <Text className="text-lg font-medium text-black mt-4 text-center">
          {message}
        </Text>
      )}
      {subMessage && (
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {subMessage}
        </Text>
      )}
    </View>
  );

  const renderDots = () => {
    const dots = [0, 1, 2];
    
    return (
      <View className="items-center">
        <View className="flex-row items-center mb-4">
          {dots.map((index) => (
            <Animated.View
              key={index}
              style={[
                {
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: LightColors.secondary,
                  marginHorizontal: 4,
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: index === 0 ? [0.3, 1, 0.3, 0.3] :
                                index === 1 ? [0.3, 0.3, 1, 0.3] :
                                [0.3, 0.3, 0.3, 1],
                  }),
                  transform: [{
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 0.33, 0.66, 1],
                      outputRange: index === 0 ? [0.8, 1.2, 0.8, 0.8] :
                                  index === 1 ? [0.8, 0.8, 1.2, 0.8] :
                                  [0.8, 0.8, 0.8, 1.2],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
        {message && (
          <Text className="text-lg font-medium text-black text-center">
            {message}
          </Text>
        )}
        {subMessage && (
          <Text className="text-sm text-gray-600 mt-2 text-center">
            {subMessage}
          </Text>
        )}
      </View>
    );
  };

  const renderProgressBar = () => (
    <View className="w-full px-8">
      <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={[
            {
              backgroundColor: LightColors.secondary,
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>
      <Text className="text-center text-sm text-gray-600 mt-2">
        {Math.round(progress)}%
      </Text>
    </View>
  );

  const renderLoader = () => {
    switch (type) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View
        className={`flex-1 items-center justify-center ${className}`}
        style={[
          {
            backgroundColor: transparent ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.6)',
          },
          style,
        ]}
      >
        <View
          className="bg-white rounded-2xl p-8 mx-8 min-w-48"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {renderLoader()}
          {showProgress && (
            <View className="mt-6">
              {renderProgressBar()}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Component for inline loading states (not full overlay)
export const InlineLoader: React.FC<{
  type?: 'spinner' | 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}> = ({ 
  type = 'spinner', 
  size = 'medium',
  message,
  className = '' 
}) => {
  const [dotsAnim] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (type === 'pulse') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }

    if (type === 'dots') {
      const animateDots = () => {
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start(() => {
          dotsAnim.setValue(0);
          animateDots();
        });
      };
      animateDots();
    }
  }, [type]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20, iconSize: 'small' as const };
      case 'large':
        return { width: 40, height: 40, iconSize: 'large' as const };
      default:
        return { width: 24, height: 24, iconSize: 'small' as const };
    }
  };

  const sizeConfig = getSize();

  const renderInlineLoader = () => {
    if (type === 'spinner') {
      return (
        <ActivityIndicator 
          size={sizeConfig.iconSize} 
          color={LightColors.secondary}
        />
      );
    }

    if (type === 'pulse') {
      return (
        <Animated.View
          style={[
            {
              width: sizeConfig.width,
              height: sizeConfig.height,
              borderRadius: sizeConfig.width / 2,
              backgroundColor: LightColors.secondary,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        />
      );
    }

    if (type === 'dots') {
      return (
        <View className="flex-row">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                {
                  width: sizeConfig.width * 0.3,
                  height: sizeConfig.height * 0.3,
                  borderRadius: (sizeConfig.width * 0.3) / 2,
                  backgroundColor: LightColors.secondary,
                  marginHorizontal: 2,
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: index === 0 ? [0.4, 1, 0.4, 0.4] :
                                index === 1 ? [0.4, 0.4, 1, 0.4] :
                                [0.4, 0.4, 0.4, 1],
                  }),
                }
              ]}
            />
          ))}
        </View>
      );
    }
  };

  return (
    <View className={`items-center justify-center ${className}`}>
      {renderInlineLoader()}
      {message && (
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingOverlay;