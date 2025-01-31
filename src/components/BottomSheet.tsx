import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TouchableWithoutFeedback, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, interpolate, withSpring, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetHandle, BottomSheetProps } from './types';

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  ({ activeHeight, children, backDropColor = 'rgba(0,0,0,0.5)', backgroundColor = 'white' }, ref) => {

    const safeAreaInsets = useSafeAreaInsets();
    const { height: screenHeight } = Dimensions.get('screen');
    const closedPositionY = screenHeight;
    const openPositionY = screenHeight - activeHeight;

    const sheetPositionY = useSharedValue(closedPositionY);
    const gestureStartPositionY = useSharedValue(0);

    // Open the Bottom Sheet
    const openSheet = useCallback(() => {
      sheetPositionY.value = withSpring(openPositionY, {
        damping: 20,
        stiffness: 120,
        mass: 0.5,
      });
    }, [openPositionY, sheetPositionY]);

    // Close the Bottom Sheet
    const closeSheet = useCallback(() => {
      sheetPositionY.value = withSpring(closedPositionY, {
        damping: 20,
        stiffness: 120,
        mass: 0.5,
      });
    }, [closedPositionY, sheetPositionY]);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      openSheet,
      closeSheet,
    }));

    // Animated styles for the bottom sheet
    const sheetStyle = useAnimatedStyle(() => ({
      top: sheetPositionY.value,
    }));

    // Animated styles for the backdrop
    const backdropStyle = useAnimatedStyle(() => {
      const opacity = interpolate(sheetPositionY.value, [closedPositionY, openPositionY], [0, 0.5]);
      return {
        opacity,
        pointerEvents: opacity === 0 ? 'none' : 'auto', // Ensures interaction works properly
      };
    });

    // Pan Gesture for Swiping Bottom Sheet
    const panGesture = Gesture.Pan()
      .onBegin(() => {
        gestureStartPositionY.value = sheetPositionY.value;
      })
      .onUpdate((event) => {
        const newPosition = gestureStartPositionY.value + event.translationY;
        sheetPositionY.value = Math.min(Math.max(newPosition, openPositionY), closedPositionY);
      })
      .onEnd(() => {
        if (sheetPositionY.value > openPositionY + 50) {
          runOnJS(closeSheet)();
        } else {
          runOnJS(openSheet)();
        }
      });

    return (
      <>
        {/* Backdrop (Tap to close) */}
        <TouchableWithoutFeedback onPress={closeSheet} accessible={false}>
          <Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backDropColor }]} />
        </TouchableWithoutFeedback>

        {/* Gesture Detector for Bottom Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.container,
              sheetStyle,
              { height: activeHeight, backgroundColor, paddingBottom: safeAreaInsets.bottom },
            ]}
          >
            <View style={styles.lineContainer}>
              <View style={styles.line} />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);

export default BottomSheet;

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  line: {
    width: 50,
    height: 4,
    borderRadius: 20,
    backgroundColor: 'black',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
