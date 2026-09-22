import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import HomeHeader from "./HomeHeader";
import OfferCarousel from "../../components/OfferCarousel";
import OrderAgainRow from "../../components/OrderAgainRow";
import EmptyState from "../../components/ui/EmptyState";
import FilterChip from "../../components/ui/FilterChip";
import RestaurantCard from "../../components/ui/RestaurantCard";
import SectionHeader from "../../components/ui/SectionHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { useTheme } from "../../Context/ThemeProvider";
import {
  layout,
  spacing,
} from "../../constants/designSystem";
import * as restaurantRepo from "../../database/repositories/restaurantRepo";
import * as promoRepo from "../../database/repositories/promoRepo";
import * as orderRepo from "../../database/repositories/orderRepo";
import { useCart } from "../../Context/CartContext";
import useReorder from "../../hooks/useReorder";
import { buildOffers } from "../../utils/offers";
import { useFavorites } from "../../Context/FavoritesContext";
import { useAuth } from "../Auth/AuthContext";

const homeFilters = [
  { id: "all", label: "All", icon: "appstore" },
  { id: "offers", label: "Hot deals", icon: "tag" },
  { id: "fast", label: "Quick bites", icon: "thunderbolt" },
  { id: "top", label: "Top rated", icon: "star" },
];

const getDeliveryMinutes = (value = "") => {
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 999;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { role, user, isLoggedIn } = useAuth();
  const { applyPromo } = useCart();
  const { reorder, reorderingId } = useReorder();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { width } = useWindowDimensions();
  const isAdmin = role === "admin";

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [promos, setPromos] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  const cardWidth = Math.min(Math.max(width * 0.76, 248), 296);

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

  // Promos and the signed-in user's recent orders refresh whenever Home is focused.
  const loadExtras = useCallback(async () => {
    try {
      setPromos(await promoRepo.listActive());
    } catch (error) {
      console.log("promo load error", error);
    } finally {
      setOffersLoading(false);
    }

    if (!isLoggedIn || !user?.id) {
      setRecentOrders([]);
      return;
    }
    try {
      setRecentOrders(await orderRepo.listRecentOrders(user.id, 5));
    } catch (error) {
      console.log("recent orders load error", error);
    }
  }, [isLoggedIn, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
      loadExtras();
    }, [loadRestaurants, loadExtras])
  );

  const offers = useMemo(
    () => buildOffers({ promos, restaurants: [...nearest, ...popular] }),
    [promos, nearest, popular]
  );

  // A restaurant banner opens the restaurant; a promo banner tries to apply the
  // code and explains why when it cannot (empty cart, below the minimum, ...).
  const handleOfferPress = async (offer) => {
    if (offer.kind === "restaurant") {
      navigation.navigate("Details", { restaurant: offer.restaurant });
      return;
    }
    const result = await applyPromo(offer.code);
    if (result.ok) {
      Toast.show({
        type: "success",
        text1: "Promo applied",
        text2: `${offer.code} takes ${result.promo.percent}% off your cart.`,
      });
    } else {
      Toast.show({ type: "error", text1: result.message });
    }
  };

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
          <OfferCarousel
            offers={offers}
            loading={offersLoading}
            onOfferPress={handleOfferPress}
          />

          {isLoggedIn && recentOrders.length ? (
            <OrderAgainRow
              orders={recentOrders}
              onReorder={reorder}
              reorderingId={reorderingId}
            />
          ) : null}

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
                icon={filter.icon}
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
