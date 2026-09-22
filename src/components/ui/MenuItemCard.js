import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, fontFamily, layout, spacing } from "../../constants/designSystem";

/**
 * A dish row: photo, title, subtitle, price. Each screen supplies its own
 * controls: `trailing` sits at the right (add button, remove, arrow) and
 * `footer` under the price (a quantity stepper).
 */
export default function MenuItemCard({
  image,
  title,
  subtitle,
  price,
  trailing,
  footer,
  onPress,
  imageSize = 88,
  titleAccessory,
  titleLines = 2,
  subtitleLines = 2,
  contentAccessibility,
  style,
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      {...(onPress ? { onPress, activeOpacity: 0.88, accessibilityRole: "button" } : null)}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        createShadow(colors.shadow, layout.cardElevation),
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
        style,
      ]}
    >
      <Image
        source={image}
        style={[styles.image, { width: imageSize, height: imageSize }]}
      />
      <View style={styles.content} accessible={Boolean(contentAccessibility)} {...contentAccessibility}>
        <View style={styles.titleLine}>
          <AppText variant="body" style={[styles.title, styles.titleText]} numberOfLines={titleLines}>
            {title}
          </AppText>
          {titleAccessory}
        </View>
        {subtitle ? (
          <AppText variant="label" muted style={styles.subtitle} numberOfLines={subtitleLines}>
            {subtitle}
          </AppText>
        ) : null}
        {price !== undefined && price !== null ? (
          <AppText variant="body" color="primaryStrong" style={styles.price}>
            {price}
          </AppText>
        ) : null}
        {footer}
      </View>
      {trailing}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  image: {
    borderRadius: layout.cardRadius - spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
  },
  price: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.bold,
  },
});
