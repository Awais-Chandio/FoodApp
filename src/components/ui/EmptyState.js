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
    marginHorizontal: spacing.sm,
    padding: spacing.xxl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
});
