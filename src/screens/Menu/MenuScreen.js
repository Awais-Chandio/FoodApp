import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

    return (
      <View
        style={[
          styles.itemCard,
          createShadow(colors.shadow, 10),
          { backgroundColor: colors.surface, borderColor: colors.borderSoft },
        ]}
      >
        <Image
          source={resolveFoodImage(item.image_key || item.name)}
          style={styles.itemImage}
        />
        <View style={styles.itemContent}>
          <AppText style={[styles.itemName, { color: colors.text }]}>{item.name}</AppText>
          <AppText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
            Freshly prepared and balanced for quick delivery
          </AppText>
          <AppText style={[styles.itemPrice, { color: colors.primaryStrong }]}>
            Rs. {item.price}
          </AppText>
        </View>

        {isAdmin ? (
          <View style={styles.adminColumn}>
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: colors.badge }]}
              onPress={() => editItem(item)}
            >
              <AntDesign name="edit" size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: colors.surfaceMuted }]}
              onPress={() => deleteItem(item.id)}
            >
              <AntDesign name="delete" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ) : null}

        {quantity > 0 ? (
          <View style={[styles.qtyStepper, { backgroundColor: colors.badge }]}>
            <TouchableOpacity onPress={() => decreaseQty(item)} hitSlop={8}>
              <AntDesign name="minus" size={16} color={colors.primaryStrong} />
            </TouchableOpacity>
            <AppText style={[styles.qtyValue, { color: colors.text }]}>{quantity}</AppText>
            <TouchableOpacity onPress={() => increaseQty(item)} hitSlop={8}>
              <AntDesign name="plus" size={16} color={colors.primaryStrong} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => increaseQty(item)}
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
      </View>
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
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={[styles.headerIcon, { backgroundColor: colors.surface }]}
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="arrow-left" size={20} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <AppText style={[styles.restaurantName, { color: colors.text }]}>
                  {restaurant.name}
                </AppText>
                <AppText style={[styles.headerMeta, { color: colors.textSecondary }]}>
                  Curated menu
                </AppText>
              </View>

              {isAdmin ? (
                <TouchableOpacity
                  style={[
                    styles.headerAction,
                    { backgroundColor: colors.primaryStrong },
                  ]}
                  onPress={() =>
                    navigation.navigate("ManageMenuItems", {
                      restaurantId: restaurant.id,
                    })
                  }
                >
                  <AppText style={[styles.headerActionText, { color: colors.onPrimary }]}>Add</AppText>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerPlaceholder} />
              )}
            </View>

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
              {filters.map((filter) => {
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
                    <AppText
                      style={[
                        styles.filterLabel,
                        { color: isActive ? colors.onPrimary : colors.text },
                      ]}
                    >
                      {filter.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  restaurantName: {
    ...typeScale.h2,
  },
  headerMeta: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  headerAction: {
    minWidth: 58,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  headerActionText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  headerPlaceholder: {
    width: 58,
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
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
    marginTop: spacing.sm,
  },
  filterLabel: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
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
    width: 88,
    height: 88,
    borderRadius: radius.md,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  itemSubtitle: {
    marginTop: spacing.xs,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
  },
  itemPrice: {
    marginTop: spacing.sm,
    ...typeScale.body,
    fontFamily: fontFamily.bold,
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
  qtyStepper: {
    height: 42,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    ...typeScale.body,
    fontFamily: fontFamily.bold,
    marginHorizontal: spacing.sm,
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
