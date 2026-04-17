import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import AppButton from "../../components/ui/AppButton";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";
import { loginUser } from "../../database/dbs";
import { useAuth } from "./AuthContext";

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please enter both email and password.",
      });
      return;
    }

    setSubmitting(true);
    loginUser(
      email.trim(),
      password,
      async (user) => {
        setSubmitting(false);
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

        if (user.role === "admin") {
          navigation.navigate("Tab");
        } else {
          navigation.navigate("Tab", { screen: "AddToCartScreen" });
        }
      },
      (error) => {
        setSubmitting(false);
        console.log("Login error:", error);
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: "Invalid email or password.",
        });
      }
    );
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
                <Text style={styles.heroBadgeText}>Returning customer</Text>
              </View>
              <Text style={styles.heroTitle}>Fast checkout starts here</Text>
              <Text style={styles.heroText}>
                Sign in and continue with the same premium orange flow across the app.
              </Text>
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
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your orders and checkout flow.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
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
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.footerLink, { color: colors.primaryStrong }]}>
                  {" "}
                  Register
                </Text>
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
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    maxWidth: 220,
  },
  heroText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 21,
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
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
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
    fontSize: 15,
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
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "800",
  },
});
