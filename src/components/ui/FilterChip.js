import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { radius, spacing } from "../../constants/designSystem";

/** A selectable pill used by every filter row (Home, Search, Details, Menu). */
export default function FilterChip({ label, icon, active = false, onPress, style }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primaryStrong : colors.surface,
          borderColor: active ? colors.primaryStrong : colors.border,
        },
        style,
      ]}
    >
      {icon ? (
        <AntDesign
          name={icon}
          size={14}
          color={active ? colors.onPrimary : colors.primaryStrong}
          style={styles.icon}
        />
      ) : null}
      <AppText variant="label" style={{ color: active ? colors.onPrimary : colors.text }}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
});
