import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import HomeHeader from "../Home/HomeHeader";
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
import * as restaurantRepo from "../../database/repositories/restaurantRepo";
import { searchAll } from "../../utils/search";

const STORAGE_KEY = "recent_searches";

const filters = [
  { id: "all", label: "All" },
  { id: "offers", label: "Deals" },
  { id: "top", label: "Top rated" },
];

const persistRecentSearch = async (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  const currentRaw = await AsyncStorage.getItem(STORAGE_KEY);
  const current = currentRaw ? JSON.parse(currentRaw) : [];
  const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 6);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const hasLoadedRef = useRef(false);

  // Pass `quiet` to refresh in the background (no skeleton), so dishes an admin
  // just added are searchable without a pull-to-refresh.
  const loadSearchData = useCallback(async (quiet = false) => {
    if (!quiet) {
      setLoading(true);
    }
    try {
      const savedSearches = await AsyncStorage.getItem(STORAGE_KEY);
      setRecentSearches(savedSearches ? JSON.parse(savedSearches) : []);

      const { nearest, popular } = await restaurantRepo.listWithMenus();
      const allRestaurants = [...nearest, ...popular].filter(
        (item, index, list) => list.findIndex((entry) => entry.id === item.id) === index
      );
      setRestaurants(allRestaurants);
      hasLoadedRef.current = true;
    } catch (error) {
      console.log("search load error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSearchData(hasLoadedRef.current);
    }, [loadSearchData])
  );

  const results = useMemo(
    () => searchAll(restaurants, query, activeFilter),
    [activeFilter, query, restaurants]
  );
  const sections = useMemo(
    () =>
      [
        { key: "restaurants", title: "Restaurants", data: results.restaurants },
        { key: "dishes", title: "Dishes", data: results.dishes },
      ].filter((section) => section.data.length),
    [results]
  );

  const handleSearchSubmit = async () => {
    await persistRecentSearch(query);
    const savedSearches = await AsyncStorage.getItem(STORAGE_KEY);
    setRecentSearches(savedSearches ? JSON.parse(savedSearches) : []);
  };

  const openRestaurant = async (restaurant) => {
    if (query.trim()) {
      await handleSearchSubmit();
    }

    navigation.navigate("HomeStack", {
      screen: "Details",
      params: { restaurant },
    });
  };

  // Tapping a dish opens its restaurant's menu.
  const openDishMenu = async (dish) => {
    if (query.trim()) {
      await handleSearchSubmit();
    }

    navigation.navigate("HomeStack", {
      screen: "MenuScreen",
      params: { restaurant: dish.restaurant },
    });
  };

  const renderDish = (dish) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.dishCard,
        createShadow(colors.shadow, 10),
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
      ]}
      onPress={() => openDishMenu(dish)}
      accessibilityRole="button"
      accessibilityLabel={`${dish.name} from ${dish.restaurant.name}. Open menu`}
    >
      <Image
        source={resolveFoodImage(dish.image_path || dish.image_key || dish.name)}
        style={styles.dishImage}
      />
      <View style={styles.dishContent}>
        <AppText style={[styles.dishName, { color: colors.text }]} numberOfLines={1}>
          {dish.name}
        </AppText>
        <AppText style={[styles.dishRestaurant, { color: colors.textSecondary }]} numberOfLines={1}>
          {dish.restaurant.name}
        </AppText>
        <AppText style={[styles.dishPrice, { color: colors.primaryStrong }]}>
          Rs. {dish.price || 0}
        </AppText>
      </View>
      <AntDesign name="arrow-right" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item, section }) =>
    section.key === "dishes" ? renderDish(item) : renderRestaurant(item);

  const renderRestaurant = (item) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.resultCard,
        createShadow(colors.shadow, 12),
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
      ]}
      onPress={() => openRestaurant(item)}
    >
      <Image source={resolveRestaurantImage(item)} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <View style={styles.rowBetween}>
          <AppText style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </AppText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("HomeStack", {
                screen: "MenuScreen",
                params: { restaurant: item },
              })
            }
          >
            <LinearGradient
              colors={colors.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuButton}
            >
              <AppText style={styles.menuButtonText}>Menu</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <AppText style={[styles.resultMeta, { color: colors.textSecondary }]}>
          ⭐ {item.rating || "4.6"} • {item.time || "20 min"}
        </AppText>
        {item.offer ? (
          <View style={[styles.dealPill, { backgroundColor: colors.accentSoft }]}>
            <AppText style={[styles.dealText, { color: colors.accentText }]}>
              {item.offer}
            </AppText>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const trimmedQuery = query.trim();
  const resultsSubtitle = trimmedQuery
    ? `${results.restaurants.length} restaurants and ${results.dishes.length} dishes matching "${trimmedQuery}"`
    : "Popular spots and current offers";

  const header = (
    <>
      <HomeHeader
        title="Search what you're craving"
        subtitle="Find restaurants, dishes, and offers from one place."
        searchValue={query}
        onChangeSearch={setQuery}
        searchPlaceholder="Search restaurants or dishes"
      />

      <View style={styles.content}>
        <SectionHeader title="Filters" subtitle="Sharpen your search in one tap." />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          keyboardShouldPersistTaps="handled"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.8}
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
                    styles.filterText,
                    { color: isActive ? colors.onPrimary : colors.text },
                  ]}
                >
                  {filter.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {recentSearches.length ? (
          <>
            <SectionHeader
              title="Recent searches"
              actionLabel="Clear"
              onActionPress={async () => {
                await AsyncStorage.removeItem(STORAGE_KEY);
                setRecentSearches([]);
              }}
            />
            <View style={styles.recentRow}>
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.recentChip, { backgroundColor: colors.surfaceMuted }]}
                  onPress={() => setQuery(item)}
                >
                  <AntDesign name="clock-circle" size={13} color={colors.textSecondary} />
                  <AppText style={[styles.recentText, { color: colors.text }]}>{item}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <SectionHeader title="Results" subtitle={resultsSubtitle} />
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={loading ? [] : sections}
        keyExtractor={(item, index) => `${item.restaurant ? "dish" : "restaurant"}-${item.id ?? index}`}
        renderItem={renderSearchResult}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title} ({section.data.length})
            </AppText>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.content}>
            {loading ? (
              [1, 2, 3].map((item) => (
                <SkeletonCard
                  key={item}
                  width={null}
                  height={142}
                  style={styles.searchSkeleton}
                />
              ))
            ) : (
              <EmptyState
                title="No restaurants or dishes found"
                message="Try a different keyword or remove the current filter."
                icon="search"
                actionLabel="Reset search"
                onActionPress={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
              />
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadSearchData()}
            tintColor={colors.primary}
          />
        }
      />
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
  },
  filterRow: {
    paddingBottom: spacing.lg,
    paddingRight: spacing.xs,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
  },
  filterText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: -spacing.xs,
    marginBottom: spacing.xxl,
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginRight: spacing.sm,
    marginTop: spacing.sm,
  },
  recentText: {
    marginLeft: spacing.xs,
    ...typeScale.label,
  },
  searchSkeleton: {
    width: "100%",
    marginBottom: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
  },
  resultCard: {
    marginHorizontal: layout.pagePadding,
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  dishCard: {
    marginHorizontal: layout.pagePadding,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dishImage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  dishContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  dishName: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  dishRestaurant: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  dishPrice: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  resultImage: {
    width: "100%",
    height: 182,
  },
  resultContent: {
    padding: spacing.xl,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  resultTitle: {
    flex: 1,
    marginRight: spacing.sm,
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
    minWidth: 160,
  },
  menuButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    marginTop: spacing.xs,
  },
  menuButtonText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  resultMeta: {
    marginTop: spacing.sm,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  dealPill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginTop: spacing.md,
  },
  dealText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
});
