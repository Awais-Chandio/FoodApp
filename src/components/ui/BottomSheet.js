import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";

const OPEN_MS = 260;
const CLOSE_MS = 220;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;

/**
 * A modal sheet that slides up from the bottom and can be dragged down (by its
 * handle), tapped away (backdrop) or closed with the Android back button, all
 * through `onClose`. The parent controls `visible`; the sheet stays mounted
 * until its slide-out animation has finished.
 *
 * Android: gesture handlers only work inside a Modal when the Modal has its own
 * GestureHandlerRootView, hence the one below.
 */
export default function BottomSheet({ visible, onClose, children, accessibilityLabel }) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = height;
      translateY.value = withTiming(0, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      translateY.value = withTiming(height, { duration: CLOSE_MS }, (finished) => {
        "worklet";
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
    // `mounted` is deliberately not a dependency: this reacts to `visible` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, height]);

  const drag = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height], [1, 0]),
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable
            style={styles.fill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.sheet,
            createShadow(colors.shadow, 24),
            { backgroundColor: colors.surface, maxHeight: height * 0.9 },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={drag}>
            <View style={styles.handleArea} accessibilityLabel="Drag down to close">
              <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  fill: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
});
