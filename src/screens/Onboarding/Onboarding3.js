import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AppButton from "../../components/ui/AppButton";
import { useTheme } from "../../Context/ThemeProvider";
import { radius, spacing } from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";

export default function Onboarding3({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: colors.badge }]}>
          <Text style={[styles.badgeText, { color: colors.primaryStrong }]}>
            Step 3 of 3
          </Text>
        </View>
        <Image source={appImages.onboardingDelivery} style={styles.image} />
        <Text style={[styles.title, { color: colors.text }]}>
          Track delivery with clearer progress
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Move from discovery to ordering to delivery with a more polished
          front-end experience and unchanged core app behavior.
        </Text>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primaryStrong }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Start exploring"
          onPress={() => navigation.replace("Tab")}
          style={styles.primaryButton}
        />
        <AppButton
          label="Skip"
          variant="secondary"
          onPress={() => navigation.replace("Tab")}
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxl,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  title: {
    marginTop: spacing.xl,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 300,
  },
  dots: {
    flexDirection: "row",
    marginTop: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
  },
  footer: {
    marginTop: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
});
