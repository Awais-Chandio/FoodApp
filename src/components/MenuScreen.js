import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import db from "../database/dbs";
import { useAuth } from "../screens/Auth/AuthContext";
import EmptyState from "./ui/EmptyState";
import SectionHeader from "./ui/SectionHeader";
import { useTheme } from "../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../constants/designSystem";
import { resolveFoodImage } from "../constants/imageRegistry";

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

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadData = useCallback(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM menu_items WHERE restaurant_id=?",
        [restaurant.id],
        (_t, result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            items.push(result.rows.item(i));
          }
          setMenuItems(items);
        }
      );

      tx.executeSql("SELECT * FROM cart", [], (_t, result) => {
        const items = [];
        for (let i = 0; i < result.rows.length; i += 1) {
          items.push(result.rows.item(i));
        }
        setCart(items);
      });
    });
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

  const getCartRow = (id) => cart.find((item) => item.menu_item_id === id);
  const getQuantity = (id) => getCartRow(id)?.quantity || 0;

  const increaseQty = (item) => {
    const existing = getCartRow(item.id);

    db.transaction(
      (tx) => {
        if (existing) {
          tx.executeSql(
            "UPDATE cart SET quantity = quantity + 1 WHERE menu_item_id=?",
            [item.id]
          );
        } else {
          tx.executeSql(
            `INSERT INTO cart (menu_item_id, name, price, image_key, quantity)
             VALUES (?, ?, ?, ?, 1)`,
            [item.id, item.name, item.price, item.image_key || null]
          );
        }
      },
      (error) => console.log("increase cart error", error),
      () => {
        loadData();
        Toast.show({
          type: "success",
          text1: existing ? "Quantity updated" : "Added to cart",
          text2: `${item.name} is ready for checkout.`,
        });
      }
    );
  };

  const decreaseQty = (item) => {
    const existing = getCartRow(item.id);
    if (!existing) {
      return;
    }

    db.transaction(
      (tx) => {
        if ((existing.quantity || 0) <= 1) {
          tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [item.id]);
        } else {
          tx.executeSql(
            "UPDATE cart SET quantity = quantity - 1 WHERE menu_item_id=?",
            [item.id]
          );
        }
      },
      (error) => console.log("decrease cart error", error),
      () => loadData()
    );
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
        onPress: () => {
          db.transaction((tx) => {
            tx.executeSql("DELETE FROM menu_items WHERE id=?", [id], () => {
              setMenuItems((current) => current.filter((item) => item.id !== id));
            });
          });
        },
      },
    ]);
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const renderMenuItem = ({ item }) => {
    const quantity = getQuantity(item.id);

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
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
            Freshly prepared and balanced for quick delivery
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primaryStrong }]}>
            Rs. {item.price}
          </Text>
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
            <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
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
              <AntDesign name="plus" size={16} color={colors.white} />
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
                <Text style={[styles.restaurantName, { color: colors.text }]}>
                  {restaurant.name}
                </Text>
                <Text style={[styles.headerMeta, { color: colors.textSecondary }]}>
                  Curated menu
                </Text>
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
                  <Text style={styles.headerActionText}>Add</Text>
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
                  <Text style={[styles.quickStatValue, { color: colors.text }]}>
                    {menuItems.length}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    Items
                  </Text>
                </View>
                <View style={[styles.quickStat, { backgroundColor: colors.badge }]}>
                  <Text style={[styles.quickStatValue, { color: colors.text }]}>
                    {totalItems}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    In cart
                  </Text>
                </View>
                <View style={[styles.quickStat, { backgroundColor: colors.badge }]}>
                  <Text style={[styles.quickStatValue, { color: colors.text }]}>
                    Rs. {totalPrice}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                    Running total
                  </Text>
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
              <Text style={styles.cartTitle}>{totalItems} items selected</Text>
              <Text style={styles.cartSubtitle}>Ready for checkout</Text>
            </View>
            <View style={styles.cartRight}>
              <Text style={styles.cartPrice}>Rs. {totalPrice}</Text>
              <Text style={styles.cartLink}>View cart</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.emptyCartState}>
            <Text style={[styles.emptyCartPrompt, { color: colors.text }]}>
              Select any item you want
            </Text>
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
    fontSize: 21,
    fontWeight: "800",
  },
  headerMeta: {
    marginTop: spacing.xs,
    fontSize: 13,
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
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
    fontSize: 15,
    fontWeight: "800",
  },
  quickStatLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: "700",
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
    fontSize: 16,
    fontWeight: "800",
  },
  itemSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
  },
  itemPrice: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "800",
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
    fontSize: 15,
    fontWeight: "800",
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  cartSubtitle: {
    marginTop: spacing.xs,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
  },
  cartRight: {
    alignItems: "flex-end",
  },
  cartPrice: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  cartLink: {
    marginTop: spacing.xs,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyCartPrompt: {
    fontSize: 14,
    fontWeight: "700",
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
