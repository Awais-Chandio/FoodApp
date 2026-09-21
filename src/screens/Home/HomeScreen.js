import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import HomeHeader from "./HomeHeader";
import EmptyState from "../../components/ui/EmptyState";
import FilterChip from "../../components/ui/FilterChip";
import RestaurantCard from "../../components/ui/RestaurantCard";
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
import { categoryAssetMap } from "../../constants/imageRegistry";
import * as restaurantRepo from "../../database/repositories/restaurantRepo";
import { useFavorites } from "../../Context/FavoritesContext";
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
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { width } = useWindowDimensions();
  const isAdmin = role === "admin";

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const cardWidth = Math.min(Math.max(width * 0.76, 248), 296);
  const categoryWidth = Math.min(Math.max(width * 0.36, 134), 168);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { nearest: nearestRestaurants, popular: popularRestaurants } =
        await restaurantRepo.listWithMenus();
      setNearest(nearestRestaurants);
      setPopular(popularRestaurants);
    } catch (error) {
      console.log("listWithMenus error:", error);
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
          restaurantRepo.remove(item.id).then(
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

  const renderRestaurantCard = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      width={cardWidth}
      favorite={isFavorite(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onPress={() => navigation.navigate("Details", { restaurant: item })}
      admin={
        isAdmin
          ? {
              onEdit: () => navigation.navigate("ManageItems", { restaurant: item }),
              onDelete: () => confirmDelete(item),
            }
          : null
      }
    />
  );

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
                    <AppText
                      style={[
                        styles.categoryLabel,
                        { color: isActive ? colors.onPrimary : colors.text },
                      ]}
                    >
                      {item.label}
                    </AppText>
                    <AppText
                      style={[
                        styles.categoryMeta,
                        { color: isActive ? colors.onPrimary : colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </AppText>
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
            {homeFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                active={activeFilter === filter.id}
                onPress={() => setActiveFilter(filter.id)}
              />
            ))}
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
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  categoryMeta: {
    ...typeScale.caption,
    marginTop: spacing.xs,
  },
  filtersRow: {
    paddingBottom: spacing.xl,
    paddingRight: spacing.xs,
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
});
