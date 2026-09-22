import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
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
import EmptyState from "../../components/ui/EmptyState";
import FilterChip from "../../components/ui/FilterChip";
import MenuItemCard from "../../components/ui/MenuItemCard";
import QtyStepper from "../../components/ui/QtyStepper";
import ScreenHeader from "../../components/ui/ScreenHeader";
import SectionHeader from "../../components/ui/SectionHeader";
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

const filters = [
  { id: "all", label: "All items" },
  { id: "budget", label: "Under Rs. 200" },
  { id: "premium", label: "Premium" },
];

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = useAuth();
  const { colors } = useTheme();
  const isAdmin = role === "admin";
  const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

  const { count: totalItems, subtotal: totalPrice, getQty, add, updateQty } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      setMenuItems(await menuRepo.listByRestaurant(restaurant.id));
    } catch (error) {
      console.log("menu load error", error);
    }
  }, [restaurant.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case "budget":
        return menuItems.filter((item) => Number(item.price || 0) <= 200);
      case "premium":
        return menuItems.filter((item) => Number(item.price || 0) > 200);
      default:
        return menuItems;
    }
  }, [activeFilter, menuItems]);

  const increaseQty = async (item) => {
    const existing = getQty(item.id) > 0;

    try {
      await add(item);
      Toast.show({
        type: "success",
        text1: existing ? "Quantity updated" : "Added to cart",
        text2: `${item.name} is ready for checkout.`,
      });
    } catch (error) {
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
    } catch (error) {
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
            setMenuItems((current) => current.filter((item) => item.id !== id));
          } catch (error) {
            console.log("delete menu item error", error);
          }
        },
      },
    ]);
  };

  const renderMenuItem = ({ item }) => {
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
        subtitle="Freshly prepared and balanced for quick delivery"
        price={`Rs. ${item.price}`}
        footer={
          quantity > 0 ? (
            <QtyStepper
              value={quantity}
              onIncrease={() => increaseQty(item)}
              onDecrease={() => decreaseQty(item)}
              style={styles.stepper}
            />
          ) : null
        }
        trailing={
          <>
            {adminButtons}
            {quantity > 0 ? null : (
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title={restaurant.name}
              subtitle="Curated menu"
              centered
              onBack={() => navigation.goBack()}
              right={
                isAdmin ? (
                  <TouchableOpacity
                    style={[styles.headerAction, { backgroundColor: colors.primaryStrong }]}
                    onPress={() =>
                      navigation.navigate("ManageMenuItems", {
                        restaurantId: restaurant.id,
                      })
                    }
                  >
                    <AppText variant="label" color="onPrimary">
                      Add
                    </AppText>
                  </TouchableOpacity>
                ) : null
              }
            />

            <View
              style={[
                styles.heroCard,
                createShadow(colors.shadow, 12),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
            >
              <SectionHeader
                title="Menu highlights"
                subtitle="Clearer cards, better spacing, and quicker cart controls."
              />
              <View style={styles.quickStatsRow}>
                <View style={[styles.quickStat, { backgroundColor: colors.badge }]}>
                  <AppText style={[styles.quickStatValue, { color: colors.text }]}>
                    {menuItems.length}
                  </AppText>
                  <AppText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    Items
                  </AppText>
                </View>
                <View style={[styles.quickStat, { backgroundColor: colors.badge }]}>
                  <AppText style={[styles.quickStatValue, { color: colors.text }]}>
                    {totalItems}
                  </AppText>
                  <AppText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    In cart
                  </AppText>
                </View>
                <View style={[styles.quickStat, { backgroundColor: colors.badge }]}>
                  <AppText style={[styles.quickStatValue, { color: colors.text }]}>
                    Rs. {totalPrice}
                  </AppText>
                  <AppText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    Running total
                  </AppText>
                </View>
              </View>
            </View>

            <SectionHeader
              title="Browse items"
              subtitle="Use the quick filters to scan the menu faster."
            />
            <View style={styles.filterRow}>
              {filters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  active={activeFilter === filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                />
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No menu items yet"
            message={
              isAdmin
                ? "Add a few dishes to start taking orders from this restaurant."
                : "This restaurant will show dishes here once the menu is available."
            }
            icon="profile"
            actionLabel={isAdmin ? "Add item" : undefined}
            onActionPress={
              isAdmin
                ? () =>
                    navigation.navigate("ManageMenuItems", {
                      restaurantId: restaurant.id,
                    })
                : undefined
            }
          />
        }
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
  listContent: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxxl,
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
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: layout.sectionGap,
  },
  quickStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
  quickStat: {
    flex: 1,
    minWidth: 96,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickStatValue: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  quickStatLabel: {
    marginTop: spacing.xs,
    ...typeScale.caption,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  adminColumn: {
    justifyContent: "space-between",
    marginRight: spacing.sm,
    height: 84,
  },
  stepper: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
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
