import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { hasSeenOnboarding } from "../../services/onboarding";
import { resolveInitialRoute } from "../../navigation/initialRoute";
import { useAuth } from "../Auth/AuthContext";

export default function LoaderScreen({ navigation }) {
  const { colors } = useTheme();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const splash = new Promise((resolve) => setTimeout(resolve, 1800));

    // AuthProvider only renders after the stored session has loaded, so
    // isLoggedIn is already accurate when this screen mounts.
    Promise.all([splash, hasSeenOnboarding()]).then(([, seen]) => {
      if (cancelled) {
        return;
      }
      const routeName = resolveInitialRoute({
        isLoggedIn,
        hasSeenOnboarding: seen,
      });
      navigation.reset({ index: 0, routes: [{ name: routeName }] });
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, isLoggedIn]);

  return (
    <LinearGradient
      colors={colors.surfaceGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.glow, { backgroundColor: colors.glow }]} />
      <LinearGradient
        colors={colors.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.logoCircle, createShadow(colors.shadow, 18)]}
      >
        <AppText style={[styles.logoText, { color: colors.onPrimary }]}>F</AppText>
      </LinearGradient>
      <AppText style={[styles.title, { color: colors.text }]}>FoodApp</AppText>
      <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
        Bold food visuals, smoother checkout, and one consistent Citrus design language.
      </AppText>
      <ActivityIndicator size="small" color={colors.primaryStrong} style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    ...typeScale.display,
  },
  title: {
    ...typeScale.display,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typeScale.body,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
