import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { radius, spacing } from "../../constants/designSystem";

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
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.82}
          style={[styles.actionButton, { backgroundColor: colors.badge }]}
        >
          <Text style={[styles.action, { color: colors.primaryStrong }]}>
            {actionLabel}
          </Text>
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
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
  },
  actionButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  action: {
    fontSize: 13,
    fontWeight: "700",
  },
});
