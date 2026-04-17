import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import HomeHeader from "./HomeHeader";
import EmptyState from "./ui/EmptyState";
import SectionHeader from "./ui/SectionHeader";
import SkeletonCard from "./ui/SkeletonCard";
import { useTheme } from "../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../constants/designSystem";
import { resolveRestaurantImage } from "../constants/imageRegistry";
import { fetchRestaurants } from "../database/dbs";

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

  const loadSearchData = useCallback(async () => {
    setLoading(true);
    try {
      const savedSearches = await AsyncStorage.getItem(STORAGE_KEY);
      setRecentSearches(savedSearches ? JSON.parse(savedSearches) : []);

      const { nearest, popular } = await fetchRestaurants();
      const allRestaurants = [...nearest, ...popular].filter(
        (item, index, list) => list.findIndex((entry) => entry.id === item.id) === index
      );
      setRestaurants(allRestaurants);
    } catch (error) {
      console.log("search load error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearchData();
  }, [loadSearchData]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return restaurants.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name?.toLowerCase().includes(normalizedQuery) ||
        item.offer?.toLowerCase().includes(normalizedQuery) ||
        item.time?.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) {
        return false;
      }

      switch (activeFilter) {
        case "offers":
          return Boolean(item.offer);
        case "top":
          return Number(item.rating || 0) >= 4.8;
        default:
          return true;
      }
    });
  }, [activeFilter, query, restaurants]);

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

  const renderSearchResult = ({ item }) => (
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
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
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
              <Text style={styles.menuButtonText}>Menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
          ⭐ {item.rating || "4.6"} • {item.time || "20 min"}
        </Text>
        {item.offer ? (
          <View style={[styles.dealPill, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.dealText, { color: colors.accent }]}>
              {item.offer}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSearchData}
            tintColor={colors.primary}
          />
        }
      >
        <HomeHeader
          title="Search what you're craving"
          subtitle="Find restaurants, offers, and favorites from one place."
          searchValue={query}
          onChangeSearch={setQuery}
          searchPlaceholder="Search restaurant, offer, or delivery time"
        />

        <View style={styles.content}>
          <SectionHeader title="Filters" subtitle="Sharpen your search in one tap." />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
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
                  <Text
                    style={[
                      styles.filterText,
                      { color: isActive ? colors.white : colors.text },
                    ]}
                  >
                    {filter.label}
                  </Text>
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
                    <Text style={[styles.recentText, { color: colors.text }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <SectionHeader
            title="Results"
            subtitle={
              query.trim()
                ? `${searchResults.length} places matching "${query.trim()}"`
                : "Popular spots and current offers"
            }
          />

          {loading ? (
            <View>
              {[1, 2, 3].map((item) => (
                <SkeletonCard
                  key={item}
                  width={null}
                  height={142}
                  style={styles.searchSkeleton}
                />
              ))}
            </View>
          ) : searchResults.length ? (
            <FlatList
              data={searchResults}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderSearchResult}
            />
          ) : (
            <EmptyState
              title="No restaurants found"
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
    fontSize: 14,
    fontWeight: "700",
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
    fontSize: 13,
    fontWeight: "600",
  },
  searchSkeleton: {
    width: "100%",
    marginBottom: spacing.md,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
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
    fontSize: 18,
    fontWeight: "800",
    minWidth: 160,
  },
  menuButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    marginTop: spacing.xs,
  },
  menuButtonText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  resultMeta: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  dealPill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginTop: spacing.md,
  },
  dealText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
