import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";

const variantStyles = {
  primary: (colors) => ({
    gradientColors: colors.buttonGradient,
    pressedGradientColors: colors.buttonGradientPressed,
    borderColor: colors.primaryStrong,
    textColor: colors.white,
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
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
    textColor: colors.accent,
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
            backgroundColor: resolvedVariant.backgroundColor || "transparent",
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
            <Text style={[styles.label, { color: resolvedVariant.textColor }, textStyle]}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.flatFill}>
            <Text style={[styles.label, { color: resolvedVariant.textColor }, textStyle]}>
              {label}
            </Text>
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
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.35,
  },
});
