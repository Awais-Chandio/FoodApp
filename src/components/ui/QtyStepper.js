import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { radius, spacing } from "../../constants/designSystem";

/**
 * A - 2 + quantity control (or a compact vertical pill with + on top). The
 * parent decides what "minus" does at 1.
 */
export default function QtyStepper({ value, onIncrease, onDecrease, vertical = false, style }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, vertical ? styles.vertical : null, { backgroundColor: colors.badge }, style]}>
      <TouchableOpacity
        onPress={onDecrease}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <AntDesign name="minus" size={16} color={colors.primaryStrong} />
      </TouchableOpacity>
      <AppText variant="body" style={[styles.value, vertical ? styles.valueVertical : null]} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </AppText>
      <TouchableOpacity
        onPress={onIncrease}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <AntDesign name="plus" size={16} color={colors.primaryStrong} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
  },
  // column-reverse puts "+" on top and "-" at the bottom.
  vertical: {
    flexDirection: "column-reverse",
    height: 96,
    width: 38,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    justifyContent: "space-between",
  },
  valueVertical: {
    minWidth: 0,
    marginHorizontal: 0,
  },
  value: {
    minWidth: 24,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
});
