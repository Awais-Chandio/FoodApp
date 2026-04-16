import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../Context/ThemeProvider";
import { spacing } from "../../constants/designSystem";

export default function LoaderScreen({ navigation }) {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1");
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.logoCircle, { backgroundColor: colors.primaryStrong }]}>
        <Text style={styles.logoText}>F</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>FoodApp</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Clean ordering, faster choices, better food moments.
      </Text>
      <ActivityIndicator
        size="small"
        color={colors.primaryStrong}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 260,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
