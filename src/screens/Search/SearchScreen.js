import React, { useCallback, useMemo, useRef, useState } from "react";
import {
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
import AntDesign from "@react-native-vector-icons/ant-design";
import HomeHeader from "../Home/HomeHeader";
import EmptyState from "../../components/ui/EmptyState";
import FilterChip from "../../components/ui/FilterChip";
import MenuItemCard from "../../components/ui/MenuItemCard";
import RestaurantCard from "../../components/ui/RestaurantCard";
import SectionHeader from "../../components/ui/SectionHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { useTheme } from "../../Context/ThemeProvider";
import {
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import {
  resolveFoodImage,
} from "../../constants/imageRegistry";
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
    <MenuItemCard
      image={resolveFoodImage(dish.image_path || dish.image_key || dish.name)}
      title={dish.name}
      subtitle={dish.restaurant.name}
      price={`Rs. ${dish.price || 0}`}
      imageSize={64}
      style={styles.dishCard}
      onPress={() => openDishMenu(dish)}
      accessibilityLabel={`${dish.name} from ${dish.restaurant.name}. Open menu`}
      trailing={<AntDesign name="arrow-right" size={16} color={colors.textSecondary} />}
    />
  );

  const renderSearchResult = ({ item, section }) =>
    section.key === "dishes" ? renderDish(item) : renderRestaurant(item);

  const renderRestaurant = (item) => (
    <RestaurantCard
      restaurant={item}
      variant="row"
      style={styles.resultCard}
      onPress={() => openRestaurant(item)}
      onMenuPress={() =>
        navigation.navigate("HomeStack", {
          screen: "MenuScreen",
          params: { restaurant: item },
        })
      }
    />
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
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onPress={() => setActiveFilter(filter.id)}
            />
          ))}
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
  },
  dishCard: {
    marginHorizontal: layout.pagePadding,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
