import React, { useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';

interface SlideToCancelProps {
  onSlideComplete: () => void;
  disabled?: boolean;
}

const SlideToCancel = ({ onSlideComplete, disabled }: SlideToCancelProps) => {
  const [slideValue] = useState(new Animated.Value(0));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [progressValue] = useState(new Animated.Value(50));
  const [textOpacity] = useState(new Animated.Value(1));
  const [backgroundColor] = useState(new Animated.Value(0));

  const screenWidth = Dimensions.get('window').width - 48;
  const BUTTON_WIDTH = screenWidth;
  const KNOB_SIZE = 50;
  const PADDING = 6;
  const SLIDE_THRESHOLD = BUTTON_WIDTH - KNOB_SIZE - PADDING * 2;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideValue } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        if (disabled || isUnlocked) return;
        const translationX = Math.max(0, Math.min(event.nativeEvent.translationX, SLIDE_THRESHOLD));
        const progress = translationX / SLIDE_THRESHOLD;

        progressValue.setValue(translationX + KNOB_SIZE);
        textOpacity.setValue(Math.max(1 - progress * 2.5, 0));
        backgroundColor.setValue(progress);
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (disabled || isUnlocked) return;
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (translationX >= SLIDE_THRESHOLD * 0.8) {
        Animated.parallel([
          Animated.spring(slideValue, {
            toValue: SLIDE_THRESHOLD,
            useNativeDriver: false,
            tension: 400,
            friction: 50,
          }),
          Animated.timing(backgroundColor, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(progressValue, {
            toValue: BUTTON_WIDTH,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setIsUnlocked(true);
          setTimeout(() => {
            onSlideComplete();
          }, 300);
        });
      } else {
        Animated.parallel([
          Animated.spring(slideValue, {
            toValue: 0,
            useNativeDriver: false,
            tension: 400,
            friction: 50,
          }),
          Animated.timing(backgroundColor, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(progressValue, {
            toValue: KNOB_SIZE,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
  };

  const animatedBackgroundColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#DC2626', '#991B1B'],
  });

  return (
    <View style={{ marginBottom: 12 }}>
      <Animated.View
        style={{
          backgroundColor: animatedBackgroundColor,
          width: BUTTON_WIDTH,
          height: 62,
          padding: PADDING,
          borderRadius: 31,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Background progress */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            borderRadius: 31,
            width: progressValue,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Text */}
        <Animated.View
          style={{
            position: 'absolute',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: textOpacity,
          }}
        >
          <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
            {isUnlocked ? 'RIDE CANCELLED' : 'SLIDE TO CANCEL'}
          </ThemedText>
        </Animated.View>

        {/* Sliding Knob */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={!disabled && !isUnlocked}
        >
          <Animated.View
            style={{
              position: 'absolute',
              left: PADDING,
              top: PADDING,
              height: KNOB_SIZE,
              width: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateX: slideValue }],
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            {isUnlocked ? (
              <Ionicons name="close" size={24} color="#DC2626" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#DC2626" />
            )}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
};

export default SlideToCancel;
