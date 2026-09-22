import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "./ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../constants/designSystem";

const typeConfig = {
  deal: {
    icon: "tags",
    eyebrow: "Fresh deal",
    actionLabel: "View deals",
  },
  new_restaurant: {
    icon: "shop",
    eyebrow: "New restaurant",
    actionLabel: "Explore now",
  },
  restaurant: {
    icon: "shop",
    eyebrow: "Restaurant update",
    actionLabel: "Open restaurants",
  },
  reminder: {
    icon: "clock-circle",
    eyebrow: "Reminder",
    actionLabel: "Check status",
  },
  order: {
    icon: "carry-out",
    eyebrow: "Order update",
    actionLabel: "Track order",
  },
};

export default function NotificationModal({
  notification,
  visible,
  onClose,
  onPrimaryPress,
}) {
  const { colors } = useTheme();
  const config = typeConfig[notification?.type] || {
    icon: "notification",
    eyebrow: "Notification",
    actionLabel: "Open",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
          <LinearGradient
            colors={colors.heroGradientAlt}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconShell}
          >
            <AntDesign name={config.icon} size={24} color={colors.onPrimary} />
          </LinearGradient>

          <AppText style={[styles.eyebrow, { color: colors.primaryStrong }]}>
            {notification?.eyebrow || config.eyebrow}
          </AppText>
          <AppText style={[styles.title, { color: colors.text }]}>
            {notification?.title || "New update"}
          </AppText>
          <AppText style={[styles.body, { color: colors.textSecondary }]}>
            {notification?.body || "Tap below to view this update in the app."}
          </AppText>

          {notification?.meta ? (
            <View style={[styles.metaPill, { backgroundColor: colors.badge }]}>
              <AppText style={[styles.metaText, { color: colors.primaryDeep }]}>
                {notification.meta}
              </AppText>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={onClose}
              activeOpacity={0.82}
            >
              <AntDesign name="close" size={16} color={colors.textSecondary} />
              <AppText style={[styles.secondaryText, { color: colors.text }]}>
                Later
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPrimaryPress}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={colors.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryFill}
              >
                <AppText style={[styles.primaryText, { color: colors.onPrimary }]}>
                  {notification?.actionLabel || config.actionLabel}
                </AppText>
                <AntDesign name="arrow-right" size={16} color={colors.onPrimary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: layout.pagePadding,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    marginTop: spacing.sm,
    ...typeScale.h2,
  },
  body: {
    marginTop: spacing.sm,
    ...typeScale.body,
  },
  metaPill: {
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metaText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  secondaryButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  secondaryText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  primaryFill: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
});
