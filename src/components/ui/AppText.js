import React from "react";
import { Text } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { MAX_FONT_SCALE, typeScale } from "../../constants/designSystem";

/**
 * The app's Text. Applies a type-scale variant (display, h1, h2, h3, body,
 * label, caption), a theme color and the 1.3x font-scaling cap.
 *
 * `color` is a theme token name (default "text"); `muted` is shorthand for
 * "textSecondary". A color in `style` still wins.
 */
export default function AppText({
  variant = "body",
  color,
  muted = false,
  style,
  children,
  ...rest
}) {
  const { colors } = useTheme();
  const tokenName = color || (muted ? "textSecondary" : "text");

  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typeScale[variant] || typeScale.body, { color: colors[tokenName] }, style]}
    >
      {children}
    </Text>
  );
}
