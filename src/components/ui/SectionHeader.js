import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import {
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
        {subtitle ? (
          <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.82}
          style={[styles.actionButton, { backgroundColor: colors.badge }]}
        >
          <AppText style={[styles.action, { color: colors.primaryStrong }]}>
            {actionLabel}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    ...typeScale.h2,
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  actionButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  action: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
});
