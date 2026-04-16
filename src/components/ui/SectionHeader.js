import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { spacing } from "../../constants/designSystem";

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
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.75}>
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  action: {
    fontSize: 14,
    fontWeight: "700",
  },
});
