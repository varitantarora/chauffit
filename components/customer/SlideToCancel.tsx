import React, { useState, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';

interface SlideToCancelProps {
  onSlideComplete: () => void;
  disabled?: boolean;
}

const SlideToCancel = ({ onSlideComplete, disabled }: SlideToCancelProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const screenWidth = Dimensions.get('window').width - 48;
  const BUTTON_WIDTH = screenWidth;
  const KNOB_SIZE = 50;
  const PADDING = 6;
  const SLIDE_THRESHOLD = BUTTON_WIDTH - KNOB_SIZE - PADDING * 2;

  const translateX = useSharedValue(0);
  const progress = useSharedValue(0);

  const handleSlideComplete = useCallback(() => {
    setIsUnlocked(true);
    setTimeout(() => {
      onSlideComplete();
    }, 300);
  }, [onSlideComplete]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled && !isUnlocked)
    .onUpdate((event) => {
      const clampedX = Math.max(0, Math.min(event.translationX, SLIDE_THRESHOLD));
      translateX.value = clampedX;
      progress.value = clampedX / SLIDE_THRESHOLD;
    })
    .onEnd(() => {
      if (translateX.value >= SLIDE_THRESHOLD * 0.8) {
        translateX.value = withSpring(SLIDE_THRESHOLD, { damping: 15, stiffness: 400 });
        progress.value = withTiming(1, { duration: 200 }, () => {
          runOnJS(handleSlideComplete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
        progress.value = withTiming(0, { duration: 200 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#DC2626', '#991B1B']
    ),
    width: BUTTON_WIDTH,
    height: 62,
    padding: PADDING,
    borderRadius: 31,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: disabled ? 0.5 : 1,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 31,
    width: translateX.value + KNOB_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }));

  const textStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: interpolate(progress.value, [0, 0.4], [1, 0], 'clamp'),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: PADDING,
    top: PADDING,
    height: KNOB_SIZE,
    width: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transform: [{ translateX: translateX.value }],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }));

  return (
    <View style={{ marginBottom: 12 }}>
      <Animated.View style={containerStyle}>
        {/* Background progress */}
        <Animated.View style={progressBarStyle} />

        {/* Text */}
        <Animated.View style={textStyle}>
          <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
            {isUnlocked ? 'RIDE CANCELLED' : 'SLIDE TO CANCEL'}
          </ThemedText>
        </Animated.View>

        {/* Sliding Knob */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={knobStyle}>
            {isUnlocked ? (
              <Ionicons name="close" size={24} color="#DC2626" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#DC2626" />
            )}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

export default SlideToCancel;
