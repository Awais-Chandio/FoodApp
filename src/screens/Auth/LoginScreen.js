import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
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
  const [showPassword, setShowPassword] = useState(false);
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
              <View style={styles.heroBadge}>
                <AppText style={styles.heroBadgeText}>Returning customer</AppText>
              </View>
              <AppText style={styles.heroTitle}>Fast checkout starts here</AppText>
              <AppText style={styles.heroText}>
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

            <AppText style={[styles.label, { color: colors.text }]}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <AppText style={[styles.label, { color: colors.text }]}>Password</AppText>
            <View
              style={[
                styles.passwordWrap,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                style={[styles.passwordInput, { color: colors.text }]}
              />
              <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
                <AntDesign
                  name={showPassword ? "eye" : "eye-invisible"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

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
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  heroTitle: {
    color: "#FFFFFF",
    ...typeScale.h1,
    maxWidth: 220,
  },
  heroText: {
    color: "rgba(255,255,255,0.86)",
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
  label: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    ...typeScale.body,
    marginBottom: spacing.lg,
  },
  passwordWrap: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    ...typeScale.body,
    paddingVertical: spacing.md,
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
