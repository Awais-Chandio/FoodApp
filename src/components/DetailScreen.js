import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppButton from "./ui/AppButton";
import EmptyState from "./ui/EmptyState";
import SectionHeader from "./ui/SectionHeader";
import { useTheme } from "../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../constants/designSystem";
import { resolveFoodImage, resolveRestaurantImage } from "../constants/imageRegistry";

const previewFilters = [
  { id: "all", label: "All" },
  { id: "budget", label: "Budget" },
  { id: "premium", label: "Premium" },
];

const fallbackItems = [
  { id: "1", name: "Margherita Pizza", price: 180, image_key: "food3" },
  { id: "2", name: "Veggie Supreme", price: 150, image_key: "food2" },
];

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isFavorite, setIsFavorite] = useState(false);

  const restaurant = route?.params?.restaurant;
  const heroHeight = Math.min(Math.max(width * 0.82, 304), 372);
  const menuPreview = restaurant?.menu_items?.length
    ? restaurant.menu_items
    : fallbackItems;
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
            onPress={() => setIsFavorite((current) => !current)}
          >
            <AntDesign
              name="heart"
              size={18}
              color={isFavorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {restaurant.offer ? (
              <View style={[styles.offerPill, { backgroundColor: colors.secondarySoft }]}>
                <Text style={[styles.offerText, { color: colors.primaryDeep }]}>
                  {restaurant.offer}
                </Text>
              </View>
            ) : null}
            <Text style={styles.heroTitle}>{restaurant.name}</Text>
            <Text style={styles.heroSubtitle}>
              Rich flavors, solid portions, and menu picks worth repeating.
            </Text>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <AntDesign name="star" size={12} color={colors.white} />
                <Text style={styles.heroChipText}>{restaurant.rating || "4.6"} rating</Text>
              </View>
              <View style={styles.heroChip}>
                <AntDesign name="clockcircleo" size={12} color={colors.white} />
                <Text style={styles.heroChipText}>{restaurant.time || "20 min"}</Text>
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
              <Text style={[styles.statValue, { color: colors.text }]}>
                {restaurant.rating || "4.6"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderSoft }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {restaurant.time || "20 min"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Delivery
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderSoft }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {menuPreview.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Dishes
              </Text>
            </View>
          </View>

          <SectionHeader
            title="About this place"
            subtitle="A cleaner summary with stronger hierarchy and faster access to the menu."
          />
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Healthy food should still feel indulgent. This restaurant blends
            fresh ingredients, thoughtful prep, and fast delivery into a simple
            experience that feels easy to order from again.
          </Text>

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
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: isActive ? colors.white : colors.text },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredPreviewItems.length ? (
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
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    Chef recommended
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primaryStrong }]}>
                    Rs. {item.price || 0}
                  </Text>
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
                    <AntDesign name="plus" size={16} color={colors.white} />
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
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    maxWidth: "80%",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 21,
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
    fontSize: 12,
    fontWeight: "700",
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
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 34,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
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
    fontSize: 14,
    fontWeight: "700",
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
    fontSize: 16,
    fontWeight: "800",
  },
  itemMeta: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  itemPrice: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "800",
  },
  inlineAdd: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
