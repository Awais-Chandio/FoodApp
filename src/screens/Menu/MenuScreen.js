import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import * as menuRepo from "../../database/repositories/menuRepo";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../Auth/AuthContext";
import useAsyncData from "../../hooks/useAsyncData";
import EmptyState from "../../components/ui/EmptyState";
import FilterChip from "../../components/ui/FilterChip";
import MenuItemCard from "../../components/ui/MenuItemCard";
import QtyStepper from "../../components/ui/QtyStepper";
import ScreenHeader from "../../components/ui/ScreenHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { DietMark, SpiceLevel } from "../../components/ui/DishTags";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { resolveFoodImage } from "../../constants/imageRegistry";
import { tapHaptic } from "../../utils/haptics";
import {
  activeCategoryAt,
  buildMenuRows,
  HEADER_HEIGHT,
  makeGetItemLayout,
  ROW_HEIGHT,
} from "../../utils/menuLayout";

const priceFilters = [
  { id: "all", label: "All items" },
  { id: "budget", label: "Under Rs. 200" },
  { id: "premium", label: "Premium" },
];

// After tapping a tab, ignore scroll events for this long so the tab that was
// tapped stays highlighted while the list animates to its section.
const TAP_LOCK_MS = 700;

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = useAuth();
  const { colors } = useTheme();
  const isAdmin = role === "admin";
  const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

  const { count: totalItems, subtotal: totalPrice, getQty, add, updateQty } = useCart();
  const {
    data: menuItems,
    loading,
    error,
    reload,
  } = useAsyncData(() => menuRepo.listByRestaurant(restaurant.id), [restaurant.id]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const listRef = useRef(null);
  const tapLockUntil = useRef(0);
  const firstFocus = useRef(true);

  // Refresh quietly when coming back to the screen (an admin may have edited dishes).
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload({ quiet: true });
    }, [reload])
  );

  const filteredItems = useMemo(() => {
    const items = menuItems || [];
    return items.filter((item) => {
      if (vegOnly && !item.is_veg) {
        return false;
      }
      const price = Number(item.price || 0);
      if (priceFilter === "budget") {
        return price <= 200;
      }
      if (priceFilter === "premium") {
        return price > 200;
      }
      return true;
    });
  }, [priceFilter, vegOnly, menuItems]);

  const { rows, rowOffsets, tabs } = useMemo(() => buildMenuRows(filteredItems), [filteredItems]);
  const getItemLayout = useMemo(
    () => makeGetItemLayout(rows, rowOffsets, headerHeight),
    [rows, rowOffsets, headerHeight]
  );
  const currentCategory =
    activeCategory && tabs.some((tab) => tab.category === activeCategory)
      ? activeCategory
      : tabs[0]?.category ?? null;

  // Keep the tab strip scrolled to the active tab.
  const tabScrollRef = useRef(null);
  const tabXs = useRef({});
  useEffect(() => {
    const x = tabXs.current[currentCategory];
    if (x != null) {
      tabScrollRef.current?.scrollTo({ x: Math.max(x - spacing.xl, 0), animated: true });
    }
  }, [currentCategory]);

  const handleScroll = (event) => {
    if (Date.now() < tapLockUntil.current) {
      return;
    }
    const y = event.nativeEvent.contentOffset.y - headerHeight;
    const next = activeCategoryAt(tabs, y);
    if (next && next !== activeCategory) {
      setActiveCategory(next);
    }
  };

  const jumpToCategory = (tab) => {
    setActiveCategory(tab.category);
    tapLockUntil.current = Date.now() + TAP_LOCK_MS;
    listRef.current?.scrollToOffset({ offset: headerHeight + tab.offset, animated: true });
  };

  const increaseQty = async (item) => {
    const existing = getQty(item.id) > 0;

    try {
      tapHaptic();
      await add(item);
      Toast.show({
        type: "success",
        text1: existing ? "Quantity updated" : "Added to cart",
        text2: `${item.name} is ready for checkout.`,
      });
    } catch (addError) {
      Toast.show({ type: "error", text1: "Could not update your cart" });
    }
  };

  const decreaseQty = async (item) => {
    const quantity = getQty(item.id);
    if (!quantity) {
      return;
    }

    try {
      await updateQty(item.id, quantity - 1);
    } catch (updateError) {
      Toast.show({ type: "error", text1: "Could not update your cart" });
    }
  };

  const editItem = (item) => {
    if (!isAdmin) {
      return;
    }
    navigation.navigate("ManageMenuItems", {
      restaurantId: restaurant.id,
      menuItem: item,
    });
  };

  const deleteItem = (id) => {
    if (!isAdmin) {
      return;
    }

    Alert.alert("Delete Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await menuRepo.remove(id);
            reload({ quiet: true });
          } catch (deleteError) {
            console.log("delete menu item error", deleteError);
          }
        },
      },
    ]);
  };

  const renderDish = (item) => {
    const quantity = getQty(item.id);
    const adminButtons = isAdmin ? (
      <View style={styles.adminColumn}>
        <TouchableOpacity
          style={[styles.adminButton, { backgroundColor: colors.badge }]}
          onPress={() => editItem(item)}
          accessibilityLabel={`Edit ${item.name}`}
        >
          <AntDesign name="edit" size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.adminButton, { backgroundColor: colors.surfaceMuted }]}
          onPress={() => deleteItem(item.id)}
          accessibilityLabel={`Delete ${item.name}`}
        >
          <AntDesign name="delete" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    ) : null;

    return (
      <MenuItemCard
        image={resolveFoodImage(item.image_key || item.name)}
        title={item.name}
        titleLines={1}
        titleAccessory={
          <View style={styles.tags}>
            <DietMark isVeg={Boolean(item.is_veg)} />
            <SpiceLevel level={item.spice_level} />
          </View>
        }
        subtitle={item.description}
        price={`Rs. ${item.price}`}
        imageSize={96}
        style={styles.dishCard}
        trailing={
          <>
            {adminButtons}
            {quantity > 0 ? (
              <QtyStepper
                vertical
                value={quantity}
                onIncrease={() => increaseQty(item)}
                onDecrease={() => decreaseQty(item)}
              />
            ) : (
              <TouchableOpacity
                onPress={() => increaseQty(item)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name} to cart`}
              >
                <LinearGradient
                  colors={colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addButton}
                >
                  <AntDesign name="plus" size={16} color={colors.onPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        }
      />
    );
  };

  const renderRow = ({ item: row }) =>
    row.type === "header" ? (
      <View style={styles.sectionHeader}>
        <AppText variant="h3">{row.category}</AppText>
        <AppText variant="label" muted>
          {row.count} {row.count === 1 ? "dish" : "dishes"}
        </AppText>
      </View>
    ) : (
      renderDish(row.item)
    );

  const addDish = () => navigation.navigate("ManageMenuItems", { restaurantId: restaurant.id });
  const hasMenu = (menuItems || []).length > 0;

  const renderEmpty = () => {
    if (loading) {
      return (
        <View>
          {[1, 2, 3, 4].map((key) => (
            <SkeletonCard key={key} width={null} height={ROW_HEIGHT - spacing.lg} style={styles.skeleton} />
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <EmptyState
          title="Could not load the menu"
          message="Check your connection and try again."
          icon="warning"
          actionLabel="Try again"
          onActionPress={() => reload()}
        />
      );
    }
    if (hasMenu) {
      return (
        <EmptyState
          title="No dishes match"
          message="Try another price filter or turn off Veg only."
          icon="search"
          actionLabel="Clear filters"
          onActionPress={() => {
            setPriceFilter("all");
            setVegOnly(false);
          }}
        />
      );
    }
    return (
      <EmptyState
        title="No menu items yet"
        message={
          isAdmin
            ? "Add a few dishes to start taking orders from this restaurant."
            : "This restaurant will show dishes here once the menu is available."
        }
        icon="profile"
        actionLabel={isAdmin ? "Add item" : undefined}
        onActionPress={isAdmin ? addDish : undefined}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.top}>
        <ScreenHeader
          title={restaurant.name}
          subtitle="Curated menu"
          centered
          onBack={() => navigation.goBack()}
          style={styles.screenHeader}
          right={
            isAdmin ? (
              <TouchableOpacity
                style={[styles.headerAction, { backgroundColor: colors.primaryStrong }]}
                onPress={addDish}
              >
                <AppText variant="label" color="onPrimary">
                  Add
                </AppText>
              </TouchableOpacity>
            ) : null
          }
        />

        {tabs.length > 1 ? (
          <View style={[styles.tabBar, { borderBottomColor: colors.borderSoft }]}>
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {tabs.map((tab) => (
                <View
                  key={tab.category}
                  onLayout={(event) => {
                    tabXs.current[tab.category] = event.nativeEvent.layout.x;
                  }}
                >
                  <FilterChip
                    label={tab.category}
                    active={tab.category === currentCategory}
                    onPress={() => jumpToCategory(tab)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
            <View style={styles.filterRow}>
              {priceFilters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  active={priceFilter === filter.id}
                  onPress={() => setPriceFilter(filter.id)}
                />
              ))}
              <FilterChip label="Veg only" active={vegOnly} onPress={() => setVegOnly((v) => !v)} />
            </View>
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={<View style={styles.listFooter} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        activeOpacity={totalItems ? 0.9 : 0.95}
        style={[
          styles.cartCard,
          createShadow(colors.shadow, 14),
          {
            backgroundColor: colors.surface,
            borderColor: totalItems ? colors.primaryStrong : colors.borderSoft,
          },
        ]}
        onPress={() => navigation.navigate("AddToCartScreen")}
      >
        {totalItems ? (
          <LinearGradient
            colors={colors.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartGradient}
          >
            <View>
              <AppText style={[styles.cartTitle, { color: colors.onPrimary }]}>{totalItems} items selected</AppText>
              <AppText style={[styles.cartSubtitle, { color: colors.onPrimary }]}>Ready for checkout</AppText>
            </View>
            <View style={styles.cartRight}>
              <AppText style={[styles.cartPrice, { color: colors.onPrimary }]}>Rs. {totalPrice}</AppText>
              <AppText style={[styles.cartLink, { color: colors.onPrimary }]}>View cart</AppText>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.emptyCartState}>
            <AppText style={[styles.emptyCartPrompt, { color: colors.text }]}>
              Select any item you want
            </AppText>
            <AntDesign name="shopping-cart" size={20} color={colors.text} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    paddingTop: spacing.xxxl,
  },
  screenHeader: {
    paddingHorizontal: layout.pagePadding,
    marginBottom: spacing.md,
  },
  tabBar: {
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  tabs: {
    paddingHorizontal: layout.pagePadding,
  },
  listContent: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.md,
    paddingBottom: 168,
  },
  headerAction: {
    minWidth: 58,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: spacing.sm,
  },
  sectionHeader: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  dishCard: {
    height: ROW_HEIGHT - spacing.lg,
    marginBottom: spacing.lg,
  },
  skeleton: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  adminColumn: {
    justifyContent: "space-between",
    marginRight: spacing.sm,
    height: 84,
  },
  adminButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCard: {
    position: "absolute",
    left: layout.pagePadding,
    right: layout.pagePadding,
    bottom: 92,
    borderWidth: 1,
    borderRadius: radius.lg,
    minHeight: 72,
    overflow: "hidden",
  },
  cartGradient: {
    minHeight: 72,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartTitle: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  cartSubtitle: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  cartRight: {
    alignItems: "flex-end",
  },
  cartPrice: {
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
  },
  cartLink: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  emptyCartPrompt: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  emptyCartState: {
    minHeight: 72,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listFooter: {
    height: 24,
  },
});
