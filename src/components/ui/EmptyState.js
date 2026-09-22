import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import AppText from "./AppText";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  layout,
  spacing,
  typeScale,
} from "../../constants/designSystem";
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
        createShadow(colors.shadow, layout.cardElevation),
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.badge }]}>
        <AntDesign name={resolvedIcon} size={24} color={colors.primaryStrong} />
      </View>
      <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
      <AppText style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </AppText>
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
    padding: layout.cardPadding,
    borderRadius: layout.cardRadius,
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
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
    marginBottom: spacing.sm,
  },
  message: {
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
});
