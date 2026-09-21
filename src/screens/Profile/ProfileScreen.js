import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../components/ui/AppButton";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import { useCart } from "../../Context/CartContext";
import { useFavorites } from "../../Context/FavoritesContext";
import { navigationRef } from "../../navigation/rootNavigation";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { resolveRestaurantImage } from "../../constants/imageRegistry";
import { useAuth } from "../Auth/AuthContext";

const profileOptions = [
  { id: "theme", label: "Switch appearance", icon: "bulb" },
  { id: "orders", label: "Order history", icon: "profile" },
  { id: "support", label: "Help and support", icon: "customer-service" },
];

export default function ProfileScreen({ route }) {
  const navigation = useNavigation();
  const { role, user, logout, isLoggedIn } = useAuth();
  const { favorites } = useFavorites();
  const { theme, toggleTheme, colors } = useTheme();
  const { clear: clearCart } = useCart();
  const adminName = route?.params?.name || "Admin";

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userRole");
    // The cart belongs to the session: it must not carry over to the next account.
    try {
      await clearCart();
    } catch (error) {
      console.log("could not clear cart on logout", error);
    }
    await logout();
    navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (!role) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryStrong} />
      </View>
    );
  }

  const openRestaurant = (restaurant) =>
    navigation.navigate("Tab", {
      screen: "HomeStack",
      params: { screen: "Details", params: { restaurant } },
    });

  const displayName = role === "admin" ? adminName : user?.email || "Guest user";

  // Preference cards that do something when tapped; the rest are placeholders.
  const optionActions = {
    theme: toggleTheme,
    orders: () => navigation.navigate("OrderHistory"),
  };

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
                <AppText style={styles.avatarText}>
                  {(displayName || "F").charAt(0).toUpperCase()}
                </AppText>
              </View>
              <View style={styles.rolePill}>
                <AppText style={styles.roleText}>{role.toUpperCase()}</AppText>
              </View>
            </View>
            <AppText style={styles.profileName}>{displayName}</AppText>
            <AppText style={styles.profileMeta}>
              {role === "admin"
                ? "Admin controls and storefront management"
                : "Customer profile, preferences, and app settings"}
            </AppText>

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                <AntDesign name="bulb" size={16} color={colors.onPrimary} />
                <AppText style={styles.themeButtonText}>
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </AppText>
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
                <AppText style={[styles.actionTitle, { color: colors.text }]}>Manage menu</AppText>
                <AppText style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Review restaurant items and update the storefront.
                </AppText>
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
                <AppText style={[styles.actionTitle, { color: colors.text }]}>
                  Review customer view
                </AppText>
                <AppText style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Check the updated storefront experience as a shopper.
                </AppText>
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
                <AppText style={[styles.actionTitle, { color: colors.text }]}>
                  Manage users
                </AppText>
                <AppText style={[styles.actionMeta, { color: colors.textSecondary }]}>
                  Add, review, and edit saved admin-side user records.
                </AppText>
              </View>
              <AntDesign name="arrow-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {isLoggedIn ? (
              <>
                <SectionHeader
                  title="Favorites"
                  subtitle="Restaurants you saved with the heart."
                />
                {favorites.length ? (
                  <FlatList
                    data={favorites}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(restaurant) => String(restaurant.id)}
                    contentContainerStyle={styles.favoritesList}
                    renderItem={({ item: restaurant }) => (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={[
                          styles.favoriteCard,
                          createShadow(colors.shadow, 10),
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.borderSoft,
                          },
                        ]}
                        onPress={() => openRestaurant(restaurant)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${restaurant.name}`}
                      >
                        <Image
                          source={resolveRestaurantImage(restaurant)}
                          style={styles.favoriteImage}
                        />
                        <View style={styles.favoriteBody}>
                          <AppText
                            style={[styles.favoriteName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {restaurant.name}
                          </AppText>
                          <View style={styles.favoriteMetaRow}>
                            <AntDesign name="star" size={12} color={colors.warning} />
                            <AppText
                              style={[styles.favoriteMeta, { color: colors.textSecondary }]}
                            >
                              {restaurant.rating || "4.5"} • {restaurant.time || "20 min"}
                            </AppText>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <EmptyState
                    title="No favorites yet"
                    message="Tap the heart on any restaurant to save it here."
                    icon="heart"
                  />
                )}
              </>
            ) : null}
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
                onPress={optionActions[option.id]}
                activeOpacity={optionActions[option.id] ? 0.86 : 1}
              >
                <AntDesign name={option.icon} size={20} color={colors.primaryStrong} />
                <View style={styles.actionContent}>
                  <AppText style={[styles.actionTitle, { color: colors.text }]}>
                    {option.label}
                  </AppText>
                  <AppText style={[styles.actionMeta, { color: colors.textSecondary }]}>
                    {option.id === "theme"
                      ? `Currently using ${theme} appearance.`
                      : option.id === "orders"
                        ? "See your past orders, track them, or order again."
                        : "Reserved for the next UI iteration without changing your existing flows."}
                  </AppText>
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
    ...typeScale.h1,
    color: "#FFFFFF",
  },
  profileName: {
    ...typeScale.h1,
    marginTop: spacing.lg,
    color: "#FFFFFF",
  },
  profileMeta: {
    marginTop: spacing.sm,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
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
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
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
    ...typeScale.label,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  favoritesList: {
    paddingBottom: spacing.xs,
    paddingRight: spacing.xs,
    marginBottom: layout.sectionGap,
  },
  favoriteCard: {
    width: 168,
    marginRight: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  favoriteImage: {
    width: "100%",
    height: 96,
  },
  favoriteBody: {
    padding: spacing.md,
  },
  favoriteName: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  favoriteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  favoriteMeta: {
    marginLeft: spacing.xs,
    ...typeScale.caption,
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
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  actionMeta: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  logoutButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
