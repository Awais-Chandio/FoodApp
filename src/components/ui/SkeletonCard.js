import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { radius, spacing } from "../../constants/designSystem";

export default function SkeletonCard({ width = 220, height = 180, style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width,
          height,
          opacity,
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.borderSoft,
        },
        style,
      ]}
    >
      <View style={[styles.image, { backgroundColor: colors.badge }]} />
      <View
        style={[styles.line, styles.linePrimary, { backgroundColor: colors.badge }]}
      />
      <View
        style={[styles.line, styles.lineSecondary, { backgroundColor: colors.badge }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
  },
  image: {
    height: 102,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  line: {
    height: 12,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  linePrimary: {
    width: "70%",
  },
  lineSecondary: {
    width: "42%",
  },
});
