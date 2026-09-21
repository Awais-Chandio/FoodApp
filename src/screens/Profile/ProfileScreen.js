import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import { useCart } from "../../Context/CartContext";
import { useFavorites } from "../../Context/FavoritesContext";
import { navigationRef } from "../../navigation/rootNavigation";
import {
  createShadow,
  layout,
  radius,
  spacing,
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
                <AntDesign name="bulb" size={16} color={colors.onPrimary} />
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
                          <Text
                            style={[styles.favoriteName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {restaurant.name}
                          </Text>
                          <View style={styles.favoriteMetaRow}>
                            <AntDesign name="star" size={12} color={colors.warning} />
                            <Text
                              style={[styles.favoriteMeta, { color: colors.textSecondary }]}
                            >
                              {restaurant.rating || "4.5"} • {restaurant.time || "20 min"}
                            </Text>
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
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.actionMeta, { color: colors.textSecondary }]}>
                    {option.id === "theme"
                      ? `Currently using ${theme} appearance.`
                      : option.id === "orders"
                        ? "See your past orders, track them, or order again."
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
    fontSize: 15,
    fontWeight: "800",
  },
  favoriteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  favoriteMeta: {
    marginLeft: spacing.xs,
    fontSize: 12,
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
