import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import HomeHeader from "../../components/HomeHeader";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../../constants/designSystem";
import {
  categoryAssetMap,
  resolveRestaurantImage,
} from "../../constants/imageRegistry";
import {
  deleteRestaurant,
  fetchRestaurants,
  useCreateTables,
} from "../../database/dbs";
import { useAuth } from "../Auth/AuthContext";

const homeFilters = [
  { id: "all", label: "All" },
  { id: "offers", label: "Hot deals" },
  { id: "fast", label: "Quick bites" },
  { id: "top", label: "Top rated" },
];

const discoveryCategories = [
  {
    id: "all",
    label: "All meals",
    subtitle: "Full storefront",
    image: categoryAssetMap.all,
  },
  {
    id: "offers",
    label: "Deals",
    subtitle: "Save on dinner",
    image: categoryAssetMap.pizza,
  },
  {
    id: "fast",
    label: "Fast delivery",
    subtitle: "In a rush",
    image: categoryAssetMap.beverages,
  },
  {
    id: "top",
    label: "Top picks",
    subtitle: "Loved nearby",
    image: categoryAssetMap.asian,
  },
];

const getDeliveryMinutes = (value = "") => {
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 999;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { role } = useAuth();
  const { width } = useWindowDimensions();
  const isAdmin = role === "admin";
  useCreateTables();

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const cardWidth = Math.min(Math.max(width * 0.76, 248), 296);
  const categoryWidth = Math.min(Math.max(width * 0.36, 134), 168);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { nearest: nearestRestaurants, popular: popularRestaurants } =
        await fetchRestaurants();
      setNearest(nearestRestaurants);
      setPopular(popularRestaurants);
    } catch (error) {
      console.log("fetchRestaurants error:", error);
      Toast.show({
        type: "error",
        text1: "Could not load restaurants",
        text2: "Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [loadRestaurants])
  );

  const applyFilter = useCallback(
    (items) => {
      switch (activeFilter) {
        case "offers":
          return items.filter((item) => item.offer);
        case "fast":
          return items.filter((item) => getDeliveryMinutes(item.time) <= 20);
        case "top":
          return items.filter((item) => Number(item.rating) >= 4.8);
        default:
          return items;
      }
    },
    [activeFilter]
  );

  const filteredNearest = useMemo(() => applyFilter(nearest), [applyFilter, nearest]);
  const filteredPopular = useMemo(() => applyFilter(popular), [applyFilter, popular]);

  const toggleFavorite = (restaurantId) => {
    setFavoriteIds((current) =>
      current.includes(restaurantId)
        ? current.filter((id) => id !== restaurantId)
        : [...current, restaurantId]
    );
  };

  const confirmDelete = (item) => {
    Alert.alert("Delete Restaurant", `Delete "${item.name}" from the app?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (!isAdmin) {
            return;
          }
          deleteRestaurant(
            item.id,
            () => {
              Toast.show({
                type: "success",
                text1: "Restaurant deleted",
                text2: `${item.name} was removed successfully.`,
              });
              loadRestaurants();
            },
            (error) => Alert.alert("Error", error?.message || "Could not delete")
          );
        },
      },
    ]);
  };

  const renderRestaurantCard = ({ item }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.restaurantCard,
          createShadow(colors.shadow, 14),
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSoft,
            width: cardWidth,
          },
        ]}
        onPress={() => navigation.navigate("Details", { restaurant: item })}
      >
        <View style={styles.imageWrap}>
          <Image source={resolveRestaurantImage(item)} style={styles.restaurantImage} />
          <LinearGradient
            colors={["transparent", "rgba(24,24,27,0.58)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.imageFade}
          />
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: colors.white }]}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={8}
          >
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={16}
              color={isFavorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>
          {item.offer ? (
            <View style={[styles.offerTag, { backgroundColor: colors.secondarySoft }]}>
              <Text style={[styles.offerText, { color: colors.primaryDeep }]}>
                {item.offer}
              </Text>
            </View>
          ) : null}

          <View style={styles.imageMeta}>
            <View style={styles.ratingPill}>
              <AntDesign name="star" size={12} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {item.rating || "4.5"}
              </Text>
            </View>
            <Text style={styles.imageMetaText}>{item.time || "20 min"} delivery</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            {(item.menu_items || []).length || 0} menu items • Freshly prepared
          </Text>

          <LinearGradient
            colors={colors.surfaceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardFooter}
          >
            <View>
              <Text style={[styles.footerLabel, { color: colors.primaryStrong }]}>
                View menu
              </Text>
              <Text style={[styles.footerMeta, { color: colors.textSecondary }]}>
                Fast checkout and smart recommendations
              </Text>
            </View>
            <View style={[styles.footerArrow, { backgroundColor: colors.badge }]}>
              <AntDesign name="arrow-right" size={15} color={colors.primaryStrong} />
            </View>
          </LinearGradient>
        </View>

        {isAdmin ? (
          <View style={styles.adminRow}>
            <TouchableOpacity
              style={[styles.adminAction, { backgroundColor: colors.badge }]}
              onPress={() => navigation.navigate("ManageItems", { restaurant: item })}
            >
              <AntDesign name="edit" size={15} color={colors.text} />
              <Text style={[styles.adminActionText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adminAction, { backgroundColor: colors.surfaceMuted }]}
              onPress={() => confirmDelete(item)}
            >
              <AntDesign name="delete" size={15} color={colors.danger} />
              <Text style={[styles.adminDangerText, { color: colors.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderLoadingRow = () => (
    <View style={styles.loadingRow}>
      {[1, 2, 3].map((item) => (
        <SkeletonCard key={item} width={cardWidth} />
      ))}
    </View>
  );

  const renderHorizontalSection = (title, subtitle, data) => {
    const emptyTitle = activeFilter === "all" ? "Nothing here yet" : "No matches found";
    const emptyMessage =
      activeFilter === "all"
        ? "Restaurants will appear here as soon as they are available."
        : "Try a different category or clear the current filter.";

    return (
      <View style={styles.section}>
        <SectionHeader title={title} subtitle={subtitle} />
        {loading ? (
          renderLoadingRow()
        ) : data.length ? (
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRestaurantCard}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <EmptyState title={emptyTitle} message={emptyMessage} icon="search" />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRestaurants}
            tintColor={colors.primary}
          />
        }
      >
        <HomeHeader
          title="Food that looks as good as it tastes"
          subtitle="Bold flavors, cleaner cards, and faster decisions from the first scroll."
          rightActionLabel={isAdmin ? "Add store" : undefined}
          onRightActionPress={
            isAdmin ? () => navigation.navigate("ManageItems") : undefined
          }
          onSearchPress={() => navigation.getParent()?.navigate("Search")}
          searchPlaceholder="Search from the discover tab"
          searchEditable={false}
        />

        <View style={styles.content}>
          <SectionHeader
            title="Taste categories"
            subtitle="Explore by mood, speed, and what feels worth ordering."
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {discoveryCategories.map((item, index) => {
              const isActive = activeFilter === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  onPress={() => setActiveFilter(item.id)}
                  style={[
                    styles.categoryCard,
                    createShadow(colors.shadow, isActive ? 16 : 10),
                    { width: categoryWidth, borderColor: colors.borderSoft },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isActive
                        ? colors.heroGradientAlt
                        : index % 2 === 0
                          ? colors.surfaceGradient
                          : [colors.secondarySoft, colors.surface]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryGradient}
                  >
                    <Image source={item.image} style={styles.categoryImage} />
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: isActive ? colors.white : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.categoryMeta,
                        isActive ? styles.categoryMetaActive : { color: colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <SectionHeader
            title="Smart filters"
            subtitle="Quick shortcuts that keep the browsing flow lightweight."
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {homeFilters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  activeOpacity={0.86}
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

          {renderHorizontalSection(
            "Nearby favorites",
            "Shorter delivery times with a more premium storefront feel.",
            filteredNearest
          )}
          {renderHorizontalSection(
            "Popular right now",
            "The places customers keep opening first.",
            filteredPopular
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
    paddingBottom: spacing.huge + spacing.lg,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xl + spacing.sm,
    paddingBottom: spacing.huge,
  },
  categoriesRow: {
    paddingBottom: spacing.xl,
    paddingRight: spacing.xs,
  },
  categoryCard: {
    marginRight: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  categoryGradient: {
    padding: spacing.lg,
    minHeight: 168,
    justifyContent: "space-between",
  },
  categoryImage: {
    width: 54,
    height: 54,
    resizeMode: "contain",
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  categoryMeta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  categoryMetaActive: {
    color: "rgba(255,255,255,0.84)",
  },
  filtersRow: {
    paddingBottom: spacing.xl,
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
  section: {
    marginBottom: layout.sectionGap,
  },
  loadingRow: {
    flexDirection: "row",
  },
  horizontalList: {
    paddingBottom: spacing.xs,
    paddingRight: spacing.xs,
  },
  restaurantCard: {
    marginRight: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrap: {
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 190,
  },
  imageFade: {
    ...StyleSheet.absoluteFillObject,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  offerTag: {
    position: "absolute",
    left: spacing.md,
    top: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  offerText: {
    fontSize: 12,
    fontWeight: "800",
  },
  imageMeta: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageMetaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 1,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  metaText: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  footerMeta: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 170,
  },
  footerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  adminRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  adminAction: {
    flex: 1,
    marginRight: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  adminActionText: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
  },
  adminDangerText: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
  },
});
