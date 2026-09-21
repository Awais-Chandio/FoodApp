import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import Toast from "react-native-toast-message";
import TextField from "../../components/ui/TextField";
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
import * as userRepo from "../../database/repositories/userRepo";
import { useAuth } from "./AuthContext";

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please enter both email and password.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = await userRepo.login(email.trim(), password);
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: "Invalid email or password.",
        });
        return;
      }

      await login(user);
      Toast.show({
        type: "success",
        text1: user.role === "admin" ? "Welcome back, admin" : "Login successful",
      });

      // reset (not navigate) so Back cannot return to the Login screen.
      navigation.reset({
        index: 0,
        routes: [
          user.role === "admin"
            ? { name: "Tab" }
            : { name: "Tab", params: { screen: "AddToCartScreen" } },
        ],
      });
    } catch (error) {
      console.log("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: "Invalid email or password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <ImageBackground source={appImages.heroBackground} style={styles.topImage}>
            <LinearGradient
              colors={colors.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.topOverlay}
            />
            <View style={styles.heroContent}>
              <View style={[styles.heroBadge, { backgroundColor: colors.glassOnPrimary }]}>
                <AppText style={[styles.heroBadgeText, { color: colors.onPrimary }]}>Returning customer</AppText>
              </View>
              <AppText style={[styles.heroTitle, { color: colors.onPrimary }]}>Fast checkout starts here</AppText>
              <AppText style={[styles.heroText, { color: colors.onPrimary }]}>
                Sign in and continue with the same premium orange flow across the app.
              </AppText>
            </View>
          </ImageBackground>

          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 18),
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSoft,
              },
            ]}
          >
            <Image
              source={appImages.logo}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText style={[styles.title, { color: colors.text }]}>Welcome back</AppText>
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your orders and checkout flow.
            </AppText>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secure
            />

            <AppButton
              label={submitting ? "Signing in..." : "Sign in"}
              onPress={handleLogin}
              disabled={submitting}
              style={styles.cta}
            />

            <View style={styles.footerRow}>
              <AppText style={[styles.footerText, { color: colors.textSecondary }]}>
                Don&apos;t have an account?
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <AppText style={[styles.footerLink, { color: colors.primaryStrong }]}>
                  {" "}
                  Register
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  topImage: {
    width: "100%",
    height: 270,
    justifyContent: "flex-end",
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  heroTitle: {
    ...typeScale.h1,
    maxWidth: 220,
  },
  heroText: {
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  card: {
    marginTop: -28,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  logo: {
    width: 112,
    height: 86,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typeScale.h1,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  cta: {
    marginTop: spacing.xl,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  footerLink: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
});
