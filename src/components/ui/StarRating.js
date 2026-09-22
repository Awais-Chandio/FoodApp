import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";
import { spacing } from "../../constants/designSystem";

/**
 * Five stars. With `onChange` it is an input (tap a star to choose; each star
 * has a spoken label). Without it, it is a read-only display of `value`.
 */
export default function StarRating({ value = 0, onChange, size = 28 }) {
  const { colors } = useTheme();
  const interactive = typeof onChange === "function";

  return (
    <View
      style={styles.row}
      accessible={!interactive}
      accessibilityLabel={interactive ? undefined : `Rated ${value} out of 5`}
      accessibilityRole={interactive ? "radiogroup" : "image"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = (
          <AntDesign
            name="star"
            size={size}
            color={filled ? colors.warning : colors.borderStrong}
          />
        );
        return interactive ? (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityState={{ checked: star === value }}
            accessibilityLabel={`Rate ${star} out of 5 stars`}
            style={styles.star}
          >
            {icon}
          </Pressable>
        ) : (
          <View key={star} style={styles.readStar}>
            {icon}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: spacing.sm,
    padding: 2,
  },
  readStar: {
    marginRight: 2,
  },
});
