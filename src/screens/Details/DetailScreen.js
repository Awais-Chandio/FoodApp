import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppButton from "../../components/ui/AppButton";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { resolveFoodImage, resolveRestaurantImage } from "../../constants/imageRegistry";
import * as menuRepo from "../../database/repositories/menuRepo";
import { useFavorites } from "../../Context/FavoritesContext";

const previewFilters = [
  { id: "all", label: "All" },
  { id: "budget", label: "Budget" },
  { id: "premium", label: "Premium" },
];

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState("all");
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  // null until the menu has been read from the database.
  const [loadedMenu, setLoadedMenu] = useState(null);
  const [menuFailed, setMenuFailed] = useState(false);

  const restaurant = route?.params?.restaurant;
  const restaurantId = restaurant?.id;
  const favorite = isFavorite(restaurantId);
  const heroHeight = Math.min(Math.max(width * 0.82, 304), 372);

  // The menu is read by restaurant id, so it is fresh and also works when the
  // restaurant arrives without nested items (for example from Profile favorites).
  const loadMenu = useCallback(() => {
    if (!restaurantId) {
      return;
    }
    setMenuFailed(false);
    menuRepo
      .listByRestaurant(restaurantId)
      .then(setLoadedMenu)
      .catch((error) => {
        console.log("detail menu load error", error);
        setMenuFailed(true);
      });
  }, [restaurantId]);

  useFocusEffect(loadMenu);

  const menuPreview = useMemo(
    () => loadedMenu ?? restaurant?.menu_items ?? [],
    [loadedMenu, restaurant]
  );
  // Nothing to show yet: not loaded, and no nested items passed in.
  const menuLoading = loadedMenu === null && !menuFailed && menuPreview.length === 0;
  const filteredPreviewItems = useMemo(() => {
    switch (activeFilter) {
      case "budget":
        return menuPreview.filter((item) => Number(item.price || 0) <= 180);
      case "premium":
        return menuPreview.filter((item) => Number(item.price || 0) > 180);
      default:
        return menuPreview;
    }
  }, [activeFilter, menuPreview]);

  if (!restaurant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Restaurant unavailable"
          message="We couldn't load the selected restaurant. Please go back and try again."
          icon="warning"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={resolveRestaurantImage(restaurant)}
          style={[styles.hero, { height: heroHeight }]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={["rgba(15,23,42,0.12)", "rgba(233,79,29,0.28)", "rgba(24,24,27,0.76)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.heroOverlay}
          />

          <TouchableOpacity style={styles.topButton} onPress={() => navigation.goBack()}>
            <AntDesign name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(restaurantId)}
            accessibilityRole="button"
            accessibilityLabel={favorite ? "Remove from favorites" : "Save to favorites"}
          >
            <AntDesign
              name={favorite ? "heart" : "hearto"}
              size={18}
              color={favorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {restaurant.offer ? (
              <View style={[styles.offerPill, { backgroundColor: colors.secondarySoft }]}>
                <AppText style={[styles.offerText, { color: colors.primaryDeep }]}>
                  {restaurant.offer}
                </AppText>
              </View>
            ) : null}
            <AppText style={styles.heroTitle}>{restaurant.name}</AppText>
            <AppText style={styles.heroSubtitle}>
              Rich flavors, solid portions, and menu picks worth repeating.
            </AppText>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <AntDesign name="star" size={12} color={colors.onImage} />
                <AppText style={styles.heroChipText}>{restaurant.rating || "4.6"} rating</AppText>
              </View>
              <View style={styles.heroChip}>
                <AntDesign name="clockcircleo" size={12} color={colors.onImage} />
                <AppText style={styles.heroChipText}>{restaurant.time || "20 min"}</AppText>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <View
            style={[
              styles.statsCard,
              createShadow(colors.shadow, 14),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <View style={styles.statBlock}>
              <AppText style={[styles.statValue, { color: colors.text }]}>
                {restaurant.rating || "4.6"}
              </AppText>
              <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderSoft }]} />
            <View style={styles.statBlock}>
              <AppText style={[styles.statValue, { color: colors.text }]}>
                {restaurant.time || "20 min"}
              </AppText>
              <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Delivery
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderSoft }]} />
            <View style={styles.statBlock}>
              <AppText style={[styles.statValue, { color: colors.text }]}>
                {menuLoading ? "–" : menuPreview.length}
              </AppText>
              <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Dishes
              </AppText>
            </View>
          </View>

          <SectionHeader
            title="About this place"
            subtitle="A cleaner summary with stronger hierarchy and faster access to the menu."
          />
          <AppText style={[styles.description, { color: colors.textSecondary }]}>
            Healthy food should still feel indulgent. This restaurant blends
            fresh ingredients, thoughtful prep, and fast delivery into a simple
            experience that feels easy to order from again.
          </AppText>

          <View style={styles.actionRow}>
            <AppButton
              label="See full menu"
              onPress={() =>
                navigation.navigate("MenuScreen", { restaurant })
              }
              style={styles.primaryAction}
            />
            <AppButton
              label="View cart"
              variant="secondary"
              onPress={() => navigation.navigate("AddToCartScreen")}
              style={styles.secondaryAction}
            />
          </View>

          <SectionHeader
            title="Preview dishes"
            subtitle="A quick look at the items customers usually notice first."
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {previewFilters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? colors.primaryStrong : colors.surface,
                      borderColor: isActive ? colors.primaryStrong : colors.border,
                    },
                  ]}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <AppText
                    style={[
                      styles.filterLabel,
                      { color: isActive ? colors.onPrimary : colors.text },
                    ]}
                  >
                    {filter.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {menuLoading ? (
            [1, 2].map((key) => (
              <SkeletonCard key={key} width={null} height={116} style={styles.itemSkeleton} />
            ))
          ) : menuFailed && menuPreview.length === 0 ? (
            <EmptyState
              title="Could not load the menu"
              message="Check your connection and try again."
              icon="warning"
              actionLabel="Try again"
              onActionPress={loadMenu}
            />
          ) : menuPreview.length === 0 ? (
            <EmptyState
              title="No dishes yet"
              message="This restaurant hasn't added any dishes. Check back soon."
              icon="profile"
            />
          ) : filteredPreviewItems.length ? (
            filteredPreviewItems.map((item) => (
              <View
                key={String(item.id)}
                style={[
                  styles.itemCard,
                  createShadow(colors.shadow, 10),
                  { backgroundColor: colors.surface, borderColor: colors.borderSoft },
                ]}
              >
                <Image
                  source={resolveFoodImage(item.image_path || item.image_key || item.name)}
                  style={styles.itemImage}
                />
                <View style={styles.itemContent}>
                  <AppText style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </AppText>
                  <AppText style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    Chef recommended
                  </AppText>
                  <AppText style={[styles.itemPrice, { color: colors.primaryStrong }]}>
                    Rs. {item.price || 0}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MenuScreen", { restaurant })}
                >
                  <LinearGradient
                    colors={colors.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.inlineAdd}
                  >
                    <AntDesign name="plus" size={16} color={colors.onPrimary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <EmptyState
              title="No dishes for this filter"
              message="Switch to another preview filter or open the full menu."
              icon="profile"
              actionLabel="Open menu"
              onActionPress={() => navigation.navigate("MenuScreen", { restaurant })}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  hero: {
    justifyContent: "space-between",
  },
  heroImage: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxxl,
    marginLeft: spacing.xl,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  favoriteButton: {
    position: "absolute",
    right: spacing.xl,
    top: spacing.xxxl,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  heroContent: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.xxl,
  },
  offerPill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  offerText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  heroTitle: {
    color: "#FFFFFF",
    ...typeScale.h1,
    maxWidth: "80%",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    marginTop: spacing.sm,
    maxWidth: "85%",
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.lg,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroChipText: {
    marginLeft: spacing.xs,
    color: "#FFFFFF",
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  statsCard: {
    marginTop: -48,
    marginBottom: layout.sectionGap,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
  },
  statLabel: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  statDivider: {
    width: 1,
    height: 34,
  },
  description: {
    ...typeScale.body,
    marginTop: -spacing.xs,
    marginBottom: layout.sectionGap,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: layout.sectionGap,
  },
  primaryAction: {
    flexGrow: 1,
    flexBasis: 160,
    marginHorizontal: 6,
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    flexGrow: 1,
    flexBasis: 160,
    marginHorizontal: 6,
    marginBottom: spacing.sm,
  },
  filterRow: {
    paddingBottom: spacing.md,
    paddingRight: spacing.xs,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
  },
  filterLabel: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  itemSkeleton: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  itemMeta: {
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    marginTop: spacing.xs,
  },
  itemPrice: {
    marginTop: spacing.sm,
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  inlineAdd: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
