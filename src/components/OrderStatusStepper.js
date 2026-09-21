import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../Context/ThemeProvider";
import { radius, spacing, typography } from "../constants/designSystem";
import { ORDER_STEPS, statusIndex } from "../utils/orderStatus";

const DOT_SIZE = 28;
const LINE_WIDTH = 4;
const LINE_MIN_HEIGHT = 36;

/**
 * Vertical progress stepper for an order. Completed steps show a check, the
 * current step pulses, and the connecting line fills as the status advances.
 */
export default function OrderStatusStepper({ status }) {
  const { colors } = useTheme();
  const currentIndex = statusIndex(status);
  const lastIndex = ORDER_STEPS.length - 1;
  const finished = currentIndex === lastIndex;

  // Line fill: starts at the current position (so reopening an order does not
  // replay the animation) and animates only when the status changes.
  const progress = useRef(new Animated.Value(currentIndex)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: currentIndex,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates height, which the native driver cannot do
    }).start();
  }, [currentIndex, progress]);

  useEffect(() => {
    if (finished) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [finished, currentIndex, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

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
                {current ? (
                  <Animated.View
                    style={[
                      styles.ring,
                      {
                        backgroundColor: colors.primaryStrong,
                        opacity: ringOpacity,
                        transform: [{ scale: ringScale }],
                      },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: dotColor,
                      borderColor: done || current ? dotColor : colors.border,
                    },
                  ]}
                >
                  {done ? <AntDesign name="check" size={14} color={colors.white} /> : null}
                </View>
              </View>

              {!isLast ? (
                <View style={[styles.line, { backgroundColor: colors.borderSoft }]}>
                  <Animated.View
                    style={[
                      styles.lineFill,
                      {
                        backgroundColor: colors.success,
                        height: progress.interpolate({
                          inputRange: [index, index + 1],
                          outputRange: ["0%", "100%"],
                          extrapolate: "clamp",
                        }),
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.text}>
              <Text
                style={[
                  styles.label,
                  { color: done || current ? colors.text : colors.textSecondary },
                ]}
              >
                {step.label}
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {step.description}
              </Text>
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
    fontSize: typography.body,
    fontWeight: "800",
  },
  description: {
    marginTop: 2,
    fontSize: typography.caption,
  },
});
