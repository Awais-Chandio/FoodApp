import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AppButton from "../../components/ui/AppButton";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";

export default function Onboarding3({ navigation }) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.surfaceGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: colors.badge }]}>
          <Text style={[styles.badgeText, { color: colors.primaryStrong }]}>
            Step 3 of 3
          </Text>
        </View>
        <LinearGradient
          colors={colors.heroGradientAlt}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.imageWrap, createShadow(colors.shadow, 16)]}
        >
          <Image source={appImages.onboardingDelivery} style={styles.image} />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.text }]}>
          Track delivery with clearer progress
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Move from discovery to ordering to delivery with the same polished orange visual language.
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
        />
      </View>
    </LinearGradient>
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
  imageWrap: {
    width: 288,
    height: 288,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
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
});
