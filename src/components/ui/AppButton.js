import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import AppText from "./AppText";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";

const variantStyles = {
  primary: (colors) => ({
    gradientColors: colors.buttonGradient,
    pressedGradientColors: colors.buttonGradientPressed,
    borderColor: colors.primaryStrong,
    textColor: colors.onPrimary,
  }),
  secondary: (colors) => ({
    backgroundColor: colors.surface,
    borderColor: colors.border,
    textColor: colors.text,
  }),
  outline: (colors) => ({
    backgroundColor: "transparent",
    borderColor: colors.primaryStrong,
    textColor: colors.primaryStrong,
  }),
  ghost: (colors) => ({
    backgroundColor: colors.badge,
    borderColor: colors.badge,
    textColor: colors.primaryStrong,
  }),
};

export default function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();
  const resolvedVariant =
    (variantStyles[variant] || variantStyles.primary)(colors);
  // A disabled gradient button turns flat, so it needs its own readable colors.
  const flatDisabled = disabled && Boolean(resolvedVariant.gradientColors);
  const labelColor = flatDisabled ? colors.textSecondary : resolvedVariant.textColor;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.62 : pressed ? 0.96 : 1 }]}
    >
      <Animated.View
        style={[
          styles.buttonShell,
          createShadow(colors.shadow, variant === "primary" ? 16 : 8),
          {
            backgroundColor: flatDisabled
              ? colors.surfaceMuted
              : resolvedVariant.backgroundColor || "transparent",
            borderColor: resolvedVariant.borderColor,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {resolvedVariant.gradientColors && !disabled ? (
          <LinearGradient
            colors={resolvedVariant.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          >
            <AppText style={[styles.label, { color: labelColor }, textStyle]}>
              {label}
            </AppText>
          </LinearGradient>
        ) : (
          <View style={styles.flatFill}>
            <AppText style={[styles.label, { color: labelColor }, textStyle]}>
              {label}
            </AppText>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonShell: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  gradientFill: {
    minHeight: 58,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  flatFill: {
    minHeight: 58,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.35,
  },
});
