import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import AntDesign from "@react-native-vector-icons/ant-design";
import { initialWindowMetrics } from "react-native-safe-area-context";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, fontFamily, radius, spacing } from "../../constants/designSystem";

const TYPES = {
  success: { icon: "check-circle", color: "success" },
  error: { icon: "close-circle", color: "danger" },
  info: { icon: "info-circle", color: "primary" },
};

// One card for every toast type: theme surface and border, a colored accent bar
// and icon, the app font. Text uses the theme text colors, never the accent.
function ToastCard({ type = "info", text1, text2, onPress }) {
  const { colors } = useTheme();
  const { icon, color } = TYPES[type] || TYPES.info;
  const accent = colors[color];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="alert"
      accessibilityLabel={[text1, text2].filter(Boolean).join(". ")}
      style={[
        styles.card,
        createShadow(colors.shadow, 12),
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <AntDesign name={icon} size={22} color={accent} style={styles.icon} />
      <View style={styles.text}>
        {text1 ? (
          <AppText variant="label" style={styles.title} numberOfLines={2}>
            {text1}
          </AppText>
        ) : null}
        {text2 ? (
          <AppText variant="caption" muted numberOfLines={3}>
            {text2}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

export const toastConfig = {
  success: (props) => <ToastCard {...props} type="success" />,
  error: (props) => <ToastCard {...props} type="error" />,
  info: (props) => <ToastCard {...props} type="info" />,
};

/** Mount once, in place of <Toast />. Toast.show(...) calls stay unchanged. */
export default function AppToast() {
  const topInset = initialWindowMetrics?.insets?.top ?? 0;

  return <Toast config={toastConfig} topOffset={topInset + spacing.sm} />;
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    minHeight: 60,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bar: {
    alignSelf: "stretch",
    width: 5,
    marginRight: spacing.md,
    marginVertical: -spacing.md,
  },
  icon: {
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
  },
});
