import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";

const variantStyles = {
  primary: (colors) => ({
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.white,
  }),
  secondary: (colors) => ({
    backgroundColor: colors.surface,
    borderColor: colors.border,
    textColor: colors.text,
  }),
  outline: (colors) => ({
    backgroundColor: "transparent",
    borderColor: colors.border,
    textColor: colors.text,
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

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed || disabled ? 0.9 : 1 }]}
    >
      <Animated.View
        style={[
          styles.button,
          createShadow(colors.shadow, 10),
          {
            backgroundColor: resolvedVariant.backgroundColor,
            borderColor: resolvedVariant.borderColor,
            transform: [{ scale }],
          },
          disabled ? styles.disabled : null,
          style,
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: resolvedVariant.textColor },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.6,
  },
});
