import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { spacing } from "../../constants/designSystem";

/** The round back arrow. Also used floating over images (Details, Track order). */
export function BackButton({ onPress, style, floating = false }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.back,
        { backgroundColor: floating ? colors.imageChip : colors.surface },
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <AntDesign name="arrow-left" size={20} color={floating ? colors.imageChipText : colors.text} />
    </TouchableOpacity>
  );
}

/** Back button, title, optional subtitle, and an optional `right` node. */
export default function ScreenHeader({ title, subtitle, onBack, right, centered = false, style }) {
  return (
    <View style={[styles.row, style]}>
      {onBack ? <BackButton onPress={onBack} /> : null}
      <View style={[styles.text, onBack ? styles.textAfterBack : null, centered ? styles.centered : null]}>
        <AppText variant="h1" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" muted style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right || (centered && onBack ? <View style={styles.back} /> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  textAfterBack: {
    marginLeft: spacing.md,
  },
  centered: {
    alignItems: "center",
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
