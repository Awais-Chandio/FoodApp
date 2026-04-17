import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../components/ui/AppButton";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../../constants/designSystem";
import { useAuth } from "../Auth/AuthContext";

const profileOptions = [
  { id: "theme", label: "Switch appearance", icon: "bulb" },
  { id: "orders", label: "Order history", icon: "profile" },
  { id: "support", label: "Help and support", icon: "customer-service" },
];

export default function ProfileScreen({ route }) {
  const navigation = useNavigation();
  const { role, user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const adminName = route?.params?.name || "Admin";

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userRole");
    await logout();
    navigation.replace("Login");
  };

  if (!role) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryStrong} />
      </View>
    );
  }

  const displayName = role === "admin" ? adminName : user?.email || "Guest user";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.heroCard,
            createShadow(colors.shadow, 14),
            { borderColor: colors.borderSoft },
          ]}
        >
          <LinearGradient
            colors={colors.heroGradientAlt}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(displayName || "F").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileMeta}>
              {role === "admin"
                ? "Admin controls and storefront management"
                : "Customer profile, preferences, and app settings"}
            </Text>

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                <AntDesign name="bulb" size={16} color={colors.white} />
                <Text style={styles.themeButtonText}>
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {role === "admin" ? (
          <>
            <SectionHeader
              title="Admin shortcuts"
              subtitle="Quick access to the core management flows."
            />
            <TouchableOpacity
              style={[
                styles.actionCard,
                createShadow(colors.shadow, 10),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
              onPress={() =>
                navigation.navigate("Tab", {
                  screen: "HomeStack",
                  params: { screen: "MenuScreen" },
                })
              }
            >
              <AntDesign name="appstore" size={20} color={colors.primaryStrong} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Manage menu</Text>
                <Text style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Review restaurant items and update the storefront.
                </Text>
              </View>
              <AntDesign name="arrow-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                createShadow(colors.shadow, 10),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
              onPress={() =>
                navigation.navigate("Tab", {
                  screen: "HomeStack",
                  params: { screen: "HomeScreen" },
                })
              }
            >
              <AntDesign name="home" size={20} color={colors.primaryStrong} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Review customer view
                </Text>
                <Text style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Check the updated storefront experience as a shopper.
                </Text>
              </View>
              <AntDesign name="arrow-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                createShadow(colors.shadow, 10),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
              onPress={() => navigation.navigate("ManageUsers")}
            >
              <AntDesign name="team" size={20} color={colors.primaryStrong} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Manage users
                </Text>
                <Text style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Add, review, and edit saved admin-side user records.
                </Text>
              </View>
              <AntDesign name="arrow-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <SectionHeader
              title="Preferences"
              subtitle="Lightweight settings that keep the current app flow intact."
            />
            {profileOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.actionCard,
                  createShadow(colors.shadow, 10),
                  { backgroundColor: colors.surface, borderColor: colors.borderSoft },
                ]}
                onPress={option.id === "theme" ? toggleTheme : undefined}
                activeOpacity={option.id === "theme" ? 0.86 : 1}
              >
                <AntDesign name={option.icon} size={20} color={colors.primaryStrong} />
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.actionMeta, { color: colors.textSecondary }]}>
                    {option.id === "theme"
                      ? `Currently using ${theme} appearance.`
                      : "Reserved for the next UI iteration without changing your existing flows."}
                  </Text>
                </View>
                <AntDesign name="arrow-right" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <AppButton
          label="Log out"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: layout.sectionGap,
  },
  heroGradient: {
    padding: spacing.xxl,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: spacing.lg,
    color: "#FFFFFF",
  },
  profileMeta: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.84)",
  },
  heroActions: {
    marginTop: spacing.lg,
    alignItems: "flex-start",
  },
  rolePill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  themeButtonText: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  actionContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  actionMeta: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
  },
  logoutButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
