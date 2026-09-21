import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import AppText from "./ui/AppText";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../Context/ThemeProvider";
import {
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../constants/designSystem";
import { ORDER_STEPS, statusIndex } from "../utils/orderStatus";

const DOT_SIZE = 28;
const LINE_WIDTH = 4;
const LINE_MIN_HEIGHT = 36;

// The connecting line fills as the order advances. It starts at its current
// fill (so reopening an order does not replay the animation) and animates only
// when the status changes.
function StepLine({ index, currentIndex, color, trackColor }) {
  const target = Math.min(Math.max(currentIndex - index, 0), 1);
  const fill = useSharedValue(target);

  useEffect(() => {
    fill.value = withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [target, fill]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));

  return (
    <View style={[styles.line, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.lineFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

// The ring behind the current step grows and fades, again and again.
function PulseRing({ color }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.6]) }],
  }));

  return <Animated.View style={[styles.ring, { backgroundColor: color }, ringStyle]} />;
}

/**
 * Vertical progress stepper for an order. Completed steps show a check, the
 * current step pulses, and the connecting line fills as the status advances.
 */
export default function OrderStatusStepper({ status }) {
  const { colors } = useTheme();
  const currentIndex = statusIndex(status);
  const lastIndex = ORDER_STEPS.length - 1;
  const finished = currentIndex === lastIndex;

  return (
    <View>
      {ORDER_STEPS.map((step, index) => {
        const done = index < currentIndex || finished;
        const current = index === currentIndex && !finished;
        const isLast = index === lastIndex;

        const dotColor = done ? colors.success : current ? colors.primaryStrong : colors.surfaceMuted;
        const stateLabel = done ? "completed" : current ? "in progress" : "upcoming";

        return (
          <View
            key={step.status}
            style={styles.row}
            accessible
            accessibilityLabel={`${step.label}, ${stateLabel}`}
          >
            <View style={styles.indicator}>
              <View style={styles.dotWrap}>
                {current ? <PulseRing color={colors.primaryStrong} /> : null}
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: dotColor,
                      borderColor: done || current ? dotColor : colors.border,
                    },
                  ]}
                >
                  {done ? <AntDesign name="check" size={14} color={colors.onPrimary} /> : null}
                </View>
              </View>

              {!isLast ? (
                <StepLine
                  index={index}
                  currentIndex={currentIndex}
                  color={colors.success}
                  trackColor={colors.borderSoft}
                />
              ) : null}
            </View>

            <View style={styles.text}>
              <AppText
                style={[
                  styles.label,
                  { color: done || current ? colors.text : colors.textSecondary },
                ]}
              >
                {step.label}
              </AppText>
              <AppText style={[styles.description, { color: colors.textSecondary }]}>
                {step.description}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  indicator: {
    alignItems: "center",
    width: DOT_SIZE + spacing.sm,
  },
  dotWrap: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.pill,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: LINE_MIN_HEIGHT,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginVertical: spacing.xs,
  },
  lineFill: {
    width: "100%",
  },
  text: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  label: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  description: {
    marginTop: 2,
    ...typeScale.caption,
  },
});
