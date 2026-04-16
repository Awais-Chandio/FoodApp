import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import { resolveRestaurantImage } from "../../constants/imageRegistry";
import {
  deleteRestaurant,
  fetchRestaurants,
  useCreateTables,
} from "../../database/dbs";
import { useAuth } from "../Auth/AuthContext";

const homeFilters = [
  { id: "all", label: "All" },
  { id: "offers", label: "Offers" },
  { id: "fast", label: "Fast delivery" },
  { id: "top", label: "Top rated" },
];

const getDeliveryMinutes = (value = "") => {
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 999;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  useCreateTables();

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);

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

  const applyFilter = useCallback((items) => {
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
  }, [activeFilter]);

  const filteredNearest = useMemo(() => applyFilter(nearest), [applyFilter, nearest]);
  const filteredPopular = useMemo(() => applyFilter(popular), [applyFilter, popular]);

  const recommendedItems = useMemo(() => {
    const allRestaurants = [...nearest, ...popular];
    return allRestaurants
      .filter((item, index, list) => list.findIndex((r) => r.id === item.id) === index)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [nearest, popular]);

  const toggleFavorite = (restaurantId) => {
    setFavoriteIds((current) =>
      current.includes(restaurantId)
        ? current.filter((id) => id !== restaurantId)
        : [...current, restaurantId]
    );
  };

  const confirmDelete = (item) => {
    Alert.alert(
      "Delete Restaurant",
      `Delete "${item.name}" from the app?`,
      [
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
              (error) =>
                Alert.alert("Error", error?.message || "Could not delete")
            );
          },
        },
      ]
    );
  };

  const renderRestaurantCard = ({ item }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.restaurantCard,
          createShadow(colors.shadow, 12),
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSoft,
          },
        ]}
        onPress={() => navigation.navigate("Details", { restaurant: item })}
      >
        <View>
          <Image source={resolveRestaurantImage(item)} style={styles.restaurantImage} />
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)} hitSlop={8}>
            <AntDesign
              name="heart"
              size={16}
              color={isFavorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>
          {item.offer ? (
            <View style={[styles.offerTag, { backgroundColor: colors.primaryStrong }]}>
              <Text style={styles.offerText}>{item.offer}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.ratingPill, { backgroundColor: colors.badge }]}>
              <AntDesign name="star" size={12} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {item.rating || "4.5"}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.metaText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.time || "20 min"} delivery
          </Text>

          <View style={styles.rowBetween}>
            <Text style={[styles.menuCount, { color: colors.textSecondary }]}>
              {(item.menu_items || []).length || 0} menu items
            </Text>
            <Text style={[styles.ctaText, { color: colors.primaryStrong }]}>
              Explore
            </Text>
          </View>
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
        <SkeletonCard key={item} />
      ))}
    </View>
  );

  const renderHorizontalSection = (title, subtitle, data) => {
    const emptyTitle = activeFilter === "all" ? "Nothing here yet" : "No matches found";
    const emptyMessage =
      activeFilter === "all"
        ? "Restaurants will appear here as soon as they are available."
        : "Try a different chip or clear the current filter.";

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
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRestaurants}
            tintColor={colors.primary}
          />
        }
      >
        <HomeHeader
          title="Food that feels worth the wait"
          subtitle="Clean ingredients, rich flavors, and restaurants worth repeating."
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
            title="Browse smarter"
            subtitle="Quick filters to reach the right meal faster."
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
                  activeOpacity={0.82}
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

          {recommendedItems.length ? (
            <View
              style={[
                styles.recommendedBanner,
                createShadow(colors.shadow, 12),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.bannerEyebrow, { color: colors.primaryStrong }]}>
                    Recommended
                  </Text>
                  <Text style={[styles.bannerTitle, { color: colors.text }]}>
                    Best rated right now
                  </Text>
                </View>
                <View style={[styles.bannerBadge, { backgroundColor: colors.badge }]}>
                  <Text style={[styles.bannerBadgeText, { color: colors.text }]}>
                    {recommendedItems.length} picks
                  </Text>
                </View>
              </View>

              {recommendedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.84}
                  style={[styles.recommendedItem, { borderTopColor: colors.borderSoft }]}
                  onPress={() => navigation.navigate("Details", { restaurant: item })}
                >
                  <Image
                    source={resolveRestaurantImage(item)}
                    style={styles.recommendedImage}
                  />
                  <View style={styles.recommendedContent}>
                    <Text style={[styles.recommendedName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.recommendedMeta, { color: colors.textSecondary }]}
                    >
                      {item.time || "20 min"} • ⭐ {item.rating || "4.5"}
                    </Text>
                  </View>
                  <AntDesign name="arrow-right" size={18} color={colors.primaryStrong} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {renderHorizontalSection(
            "Nearest restaurants",
            "Shorter delivery time, easier decisions.",
            filteredNearest
          )}
          {renderHorizontalSection(
            "Popular picks",
            "The places customers keep ordering from.",
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
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  filtersRow: {
    paddingBottom: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    marginRight: spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  recommendedBanner: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: layout.sectionGap,
  },
  bannerEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bannerTitle: {
    marginTop: spacing.xs,
    fontSize: 20,
    fontWeight: "800",
  },
  bannerBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  bannerBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  recommendedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
    borderTopWidth: 1,
  },
  recommendedImage: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
  },
  recommendedContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  recommendedName: {
    fontSize: 15,
    fontWeight: "700",
  },
  recommendedMeta: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  section: {
    marginBottom: layout.sectionGap,
  },
  loadingRow: {
    flexDirection: "row",
  },
  horizontalList: {
    paddingBottom: spacing.xs,
  },
  restaurantCard: {
    width: 250,
    marginRight: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 156,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  offerTag: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  offerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  cardBody: {
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    marginRight: spacing.sm,
    fontSize: 17,
    fontWeight: "800",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  metaText: {
    marginTop: spacing.sm,
    fontSize: 13,
  },
  menuCount: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: "600",
  },
  ctaText: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: "800",
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
    minHeight: 42,
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
