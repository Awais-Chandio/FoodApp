import React from "react";
import { StyleSheet, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";

/** Green dot in a bordered square for vegetarian, red for non-vegetarian. */
export function DietMark({ isVeg }) {
  const { colors } = useTheme();
  const color = isVeg ? colors.success : colors.danger;

  return (
    <View
      style={[styles.mark, { borderColor: color }]}
      accessible
      accessibilityLabel={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <View style={[styles.markDot, { backgroundColor: color }]} />
    </View>
  );
}

/** One flame per spice level (1 to 3). Nothing for a mild dish. */
export function SpiceLevel({ level }) {
  const { colors } = useTheme();
  const count = Math.min(Math.max(Number(level) || 0, 0), 3);

  if (!count) {
    return null;
  }

  return (
    <View
      style={styles.flames}
      accessible
      accessibilityLabel={`Spice level ${count} of 3`}
    >
      {Array.from({ length: count }, (_, index) => (
        <AntDesign key={index} name="fire" size={12} color={colors.danger} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  markDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flames: {
    flexDirection: "row",
    alignItems: "center",
  },
});
