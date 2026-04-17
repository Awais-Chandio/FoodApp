import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import db from "../../database/dbs";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useAuth } from "../Auth/AuthContext";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  layout,
  radius,
  spacing,
} from "../../constants/designSystem";
import { resolveFoodImage } from "../../constants/imageRegistry";

const VALID_PROMOS = {
  SAVE10: 0.1,
  FOOD5: 0.05,
};

export default function AddToCartScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const [cartItems, setCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const fetchCart = useCallback(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM cart",
        [],
        (_t, result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            items.push(result.rows.item(i));
          }
          setCartItems(items);
        },
        (_t, error) => console.log("Cart fetch error", error)
      );
    });
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const refreshCart = async () => {
    setRefreshing(true);
    fetchCart();
    setRefreshing(false);
  };

  const removeItem = (menuItemId) => {
    db.transaction(
      (tx) => {
        tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [menuItemId]);
      },
      (error) => console.log("remove cart error", error),
      () => fetchCart()
    );
  };

  const increaseQty = (menuItemId) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE cart SET quantity = quantity + 1 WHERE menu_item_id=?",
          [menuItemId]
        );
      },
      (error) => console.log("increase qty error", error),
      () => fetchCart()
    );
  };

  const decreaseQty = (menuItemId) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE cart SET quantity = quantity - 1 WHERE menu_item_id=? AND quantity > 1",
          [menuItemId]
        );
        tx.executeSql("DELETE FROM cart WHERE quantity <= 0 AND menu_item_id=?", [
          menuItemId,
        ]);
      },
      (error) => console.log("decrease qty error", error),
      () => fetchCart()
    );
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const discount = appliedPromo
    ? Math.round(subtotal * VALID_PROMOS[appliedPromo])
    : 0;
  const deliveryFee = cartItems.length ? 120 : 0;
  const totalPrice = subtotal + deliveryFee - discount;
  const isCompact = width < 390;

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("TrackOrder");
    } else {
      navigation.navigate("Login");
    }
  };

  const applyPromoCode = () => {
    const normalized = promoCode.trim().toUpperCase();

    if (!normalized) {
      Toast.show({
        type: "error",
        text1: "Enter a promo code first",
      });
      return;
    }

    if (!VALID_PROMOS[normalized]) {
      Toast.show({
        type: "error",
        text1: "Promo code not valid",
        text2: "Try SAVE10 or FOOD5.",
      });
      return;
    }

    setAppliedPromo(normalized);
    Toast.show({
      type: "success",
      text1: "Promo applied",
      text2: `${normalized} is now active.`,
    });
  };

  const renderCartItem = ({ item }) => (
    <View
      style={[
        styles.itemRow,
        createShadow(colors.shadow, 10),
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
      ]}
    >
      <Image
        source={resolveFoodImage(item.image_path || item.image_key || item.name)}
        style={styles.itemImage}
      />

      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
          Prepared fresh for checkout
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primaryStrong }]}>
          Rs. {item.price}
        </Text>

        <View style={[styles.qtyRow, { backgroundColor: colors.badge }]}>
          <TouchableOpacity onPress={() => decreaseQty(item.menu_item_id)} hitSlop={8}>
            <AntDesign name="minus" size={16} color={colors.primaryStrong} />
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: colors.text }]}>
            {item.quantity || 1}
          </Text>
          <TouchableOpacity onPress={() => increaseQty(item.menu_item_id)} hitSlop={8}>
            <AntDesign name="plus" size={16} color={colors.primaryStrong} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: colors.surfaceMuted }]}
        onPress={() => removeItem(item.menu_item_id)}
      >
        <AntDesign name="delete" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.menu_item_id)}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshCart}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.surface }]}
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="arrow-left" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Your cart</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {cartItems.length
                    ? `${cartItems.length} selected dishes ready for checkout`
                    : "Add dishes to start building your order"}
                </Text>
              </View>
            </View>

            {cartItems.length ? (
              <>
                <View
                  style={[
                    styles.summaryStrip,
                    isCompact ? styles.summaryStripStack : null,
                    createShadow(colors.shadow, 10),
                    { backgroundColor: colors.surface, borderColor: colors.borderSoft },
                  ]}
                >
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Items
                    </Text>
                  </View>
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      Rs. {subtotal}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Subtotal
                    </Text>
                  </View>
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {isLoggedIn ? "Express" : "Login"}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Checkout
                    </Text>
                  </View>
                </View>

                <SectionHeader
                  title="Promo code"
                  subtitle="Optional frontend-only discount preview."
                />
                <View style={[styles.promoRow, isCompact ? styles.promoRowStack : null]}>
                  <TextInput
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Try SAVE10 or FOOD5"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.promoInput,
                      isCompact ? styles.promoInputStack : null,
                      {
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      isCompact ? styles.applyButtonStack : null,
                    ]}
                    onPress={applyPromoCode}
                  >
                    <LinearGradient
                      colors={colors.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.applyButtonGradient}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <SectionHeader
                  title="Order items"
                  subtitle="Adjust quantities before checkout."
                />
              </>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Your cart is empty"
            message="Browse the menu and add a few dishes to see your summary here."
            icon="shopping-cart"
            actionLabel="Browse menu"
            onActionPress={() => navigation.navigate("HomeStack")}
          />
        }
        ListFooterComponent={
          <View style={cartItems.length ? styles.footerLarge : styles.footerSmall} />
        }
      />

      {cartItems.length ? (
        <View
          style={[
            styles.checkoutCard,
            createShadow(colors.shadow, 14),
            { backgroundColor: colors.surface, borderColor: colors.borderSoft },
          ]}
        >
          <SectionHeader title="Payment summary" />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>Rs. {subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              Delivery
            </Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Rs. {deliveryFee}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              Discount
            </Text>
            <Text style={[styles.summaryText, { color: colors.success }]}>
              - Rs. {discount}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              Rs. {Math.max(totalPrice, 0)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
          >
            <LinearGradient
              colors={colors.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutButton}
            >
              <Text style={styles.checkoutButtonText}>
                {isLoggedIn ? "Proceed to tracking" : "Login to checkout"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
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
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  summaryStrip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    marginBottom: layout.sectionGap,
  },
  summaryStripStack: {
    flexWrap: "wrap",
  },
  summaryBubble: {
    flex: 1,
    minWidth: 92,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  summaryLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.sectionGap,
  },
  promoRowStack: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  promoInput: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    fontSize: 15,
  },
  promoInputStack: {
    marginRight: 0,
    marginBottom: spacing.md,
  },
  applyButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  applyButtonStack: {
    width: "100%",
  },
  applyButtonGradient: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  itemRow: {
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
  itemMeta: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  itemPrice: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "800",
  },
  qtyRow: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    marginHorizontal: spacing.sm,
    fontSize: 15,
    fontWeight: "800",
  },
  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutCard: {
    position: "absolute",
    left: layout.pagePadding,
    right: layout.pagePadding,
    bottom: 92,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  checkoutButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  footerLarge: {
    height: 284,
  },
  footerSmall: {
    height: 72,
  },
});
