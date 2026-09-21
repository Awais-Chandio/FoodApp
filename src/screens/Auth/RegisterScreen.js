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

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please complete all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }

    setSubmitting(true);
    userRepo
      .register({ email: email.trim(), password })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Account created",
          text2: "You can sign in now.",
        });
        navigation.replace("Login");
      })
      .catch((error) => {
        if (error.message.includes("UNIQUE constraint")) {
          Toast.show({
            type: "error",
            text1: "Email already exists",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Registration failed",
            text2: error.message,
          });
        }
      })
      .finally(() => setSubmitting(false));
  };

  const renderPasswordField = ({
    value,
    onChangeText,
    placeholder,
    visible,
    onToggle,
  }) => (
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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={!visible}
        style={[styles.passwordInput, { color: colors.text }]}
      />
      <TouchableOpacity onPress={onToggle}>
        <AntDesign
          name={visible ? "eye" : "eye-invisible"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

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
              colors={colors.heroGradientAlt}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.topOverlay}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <AppText style={styles.heroBadgeText}>New customer</AppText>
              </View>
              <AppText style={styles.heroTitle}>Create your food profile</AppText>
              <AppText style={styles.heroText}>
                Same orange design system, smoother onboarding, and a cleaner order flow.
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
            <AppText style={[styles.title, { color: colors.text }]}>Create account</AppText>
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Register once and keep the existing checkout and ordering flow smooth.
            </AppText>

            <AppText style={[styles.label, { color: colors.text }]}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
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
            {renderPasswordField({
              value: password,
              onChangeText: setPassword,
              placeholder: "Create a password",
              visible: showPassword,
              onToggle: () => setShowPassword((current) => !current),
            })}

            <AppText style={[styles.label, styles.secondaryLabel, { color: colors.text }]}>
              Confirm password
            </AppText>
            {renderPasswordField({
              value: confirmPassword,
              onChangeText: setConfirmPassword,
              placeholder: "Re-enter your password",
              visible: showConfirmPassword,
              onToggle: () => setShowConfirmPassword((current) => !current),
            })}

            <AppButton
              label={submitting ? "Creating account..." : "Register"}
              onPress={handleRegister}
              disabled={submitting}
              style={styles.cta}
            />

            <View style={styles.footerRow}>
              <AppText style={[styles.footerText, { color: colors.textSecondary }]}>
                Already have an account?
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <AppText style={[styles.footerLink, { color: colors.primaryStrong }]}>
                  {" "}
                  Sign in
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
    height: 262,
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
    marginTop: -24,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  logo: {
    width: 96,
    height: 74,
    alignSelf: "center",
    marginBottom: spacing.md,
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
  secondaryLabel: {
    marginTop: spacing.lg,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    ...typeScale.body,
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
    marginTop: spacing.xxl,
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
