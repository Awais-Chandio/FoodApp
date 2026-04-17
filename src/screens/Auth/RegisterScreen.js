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
import { registerUser } from "../../database/dbs";

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
    registerUser(
      email.trim(),
      password,
      () => {
        setSubmitting(false);
        Toast.show({
          type: "success",
          text1: "Account created",
          text2: "You can sign in now.",
        });
        navigation.replace("Login");
      },
      (error) => {
        setSubmitting(false);
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
      }
    );
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
                <Text style={styles.heroBadgeText}>New customer</Text>
              </View>
              <Text style={styles.heroTitle}>Create your food profile</Text>
              <Text style={styles.heroText}>
                Same orange design system, smoother onboarding, and a cleaner order flow.
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
            <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Register once and keep the existing checkout and ordering flow smooth.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            {renderPasswordField({
              value: password,
              onChangeText: setPassword,
              placeholder: "Create a password",
              visible: showPassword,
              onToggle: () => setShowPassword((current) => !current),
            })}

            <Text style={[styles.label, styles.secondaryLabel, { color: colors.text }]}>
              Confirm password
            </Text>
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
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.footerLink, { color: colors.primaryStrong }]}>
                  {" "}
                  Sign in
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
  secondaryLabel: {
    marginTop: spacing.lg,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
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
    marginTop: spacing.xxl,
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
