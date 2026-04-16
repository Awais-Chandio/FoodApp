import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";
import AppButton from "./AppButton";

const iconAliases = {
  search1: "search",
  shoppingcart: "shopping-cart",
  closecircle: "close-circle",
  arrowleft: "arrow-left",
  arrowright: "arrow-right",
  clockcircleo: "clock-circle",
  customerservice: "customer-service",
};

export default function EmptyState({
  title,
  message,
  icon = "inbox",
  actionLabel,
  onActionPress,
}) {
  const { colors } = useTheme();
  const resolvedIcon = iconAliases[icon] || icon;

  return (
    <View
      style={[
        styles.card,
        createShadow(colors.shadow, 8),
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.badge }]}>
        <AntDesign name={resolvedIcon} size={24} color={colors.primaryStrong} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {actionLabel && onActionPress ? (
        <AppButton
          label={actionLabel}
          onPress={onActionPress}
          variant="ghost"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.xl,
    padding: spacing.xxl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
});
