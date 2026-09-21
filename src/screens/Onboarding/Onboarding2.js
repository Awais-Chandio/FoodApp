import React from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AppButton from "../../components/ui/AppButton";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";
import { finishOnboarding } from "../../services/onboarding";

export default function Onboarding2({ navigation }) {
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
          <AppText style={[styles.badgeText, { color: colors.primaryStrong }]}>
            Step 2 of 3
          </AppText>
        </View>
        <LinearGradient
          colors={colors.heroGradientAlt}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.imageWrap, createShadow(colors.shadow, 16)]}
        >
          <Image source={appImages.onboardingPayment} style={styles.image} />
        </LinearGradient>
        <AppText style={[styles.title, { color: colors.text }]}>
          Keep checkout cleaner and easier to trust
        </AppText>
        <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Stronger cart summaries, clearer totals, and simpler payment feedback keep the ordering flow confident.
        </AppText>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primaryStrong }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Next"
          onPress={() => navigation.navigate("Onboarding3")}
          style={styles.primaryButton}
        />
        <AppButton
          label="Skip"
          variant="secondary"
          onPress={() => finishOnboarding(navigation)}
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
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
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
    ...typeScale.h1,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.md,
    ...typeScale.body,
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
