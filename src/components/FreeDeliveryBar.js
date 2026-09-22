import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./ui/AppText";
import { useTheme } from "../Context/ThemeProvider";
import { radius, spacing } from "../constants/designSystem";
import { formatMoney, freeDeliveryProgress } from "../utils/pricing";

/** "Add Rs. X more for free delivery" with a bar that animates as the subtotal changes. */
export default function FreeDeliveryBar({ subtotal }) {
  const { colors } = useTheme();
  const { unlocked, remaining, fraction } = freeDeliveryProgress(subtotal);
  const progress = useSharedValue(fraction);

  useEffect(() => {
    progress.value = withSpring(fraction, {
      damping: 18,
      stiffness: 160,
      mass: 0.85,
      overshootClamping: true,
    });
  }, [fraction, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <AntDesign
          name={unlocked ? "check-circle" : "car"}
          size={16}
          color={unlocked ? colors.success : colors.primaryStrong}
        />
        <AppText
          variant="label"
          color={unlocked ? "successText" : "text"}
          style={styles.text}
          accessibilityLiveRegion="polite"
        >
          {unlocked
            ? "Free delivery unlocked"
            : `Add ${formatMoney(remaining)} more for free delivery`}
        </AppText>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.badge }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
      >
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: unlocked ? colors.success : colors.primaryStrong },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  text: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: radius.pill,
  },
});
