import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import { useCart } from "../../Context/CartContext";
import EmptyState from "../../components/ui/EmptyState";
import DishOptionsSheet from "../../components/DishOptionsSheet";
import useAsyncData from "../../hooks/useAsyncData";
import * as optionsRepo from "../../database/repositories/optionsRepo";
import CartLine from "../../components/CartLine";
import FreeDeliveryBar from "../../components/FreeDeliveryBar";
import SkeletonCard from "../../components/ui/SkeletonCard";
import ScreenHeader from "../../components/ui/ScreenHeader";
import TextField from "../../components/ui/TextField";
import SectionHeader from "../../components/ui/SectionHeader";
import { useAuth } from "../Auth/AuthContext";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { parseSelectedOptions } from "../../utils/cartLines";
import { computeTotals, formatMoney } from "../../utils/pricing";

export default function AddToCartScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const {
    items: cartItems,
    subtotal,
    promo,
    applyPromo,
    removePromo,
    reload: reloadCart,
    loading: cartLoading,
    error: cartError,
    add,
    updateQty,
    remove,
    replaceLine,
    getLineQty,
  } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [editingLine, setEditingLine] = useState(null);

  // Which cart dishes have options, so those lines offer "Customize".
  const cartDishIds = cartItems.map((line) => line.menu_item_id).join(",");
  const { data: customizableIds } = useAsyncData(
    () => optionsRepo.filterCustomizable(cartItems.map((line) => line.menu_item_id)),
    [cartDishIds]
  );
  const customizable = new Set(customizableIds || []);
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const refreshCart = async () => {
    setRefreshing(true);
    await reloadCart();
    setRefreshing(false);
  };

  const showCartError = () =>
    Toast.show({ type: "error", text1: "Could not update your cart" });

  // Deleting shows an Undo toast (tap it) that puts the line back with its
  // options and quantity.
  const removeItem = (line) => {
    const restore = () => {
      Toast.hide();
      add(
        {
          id: line.menu_item_id,
          name: line.name,
          price: line.base_price ?? line.price,
          image_key: line.image_key,
          restaurant_id: line.restaurant_id,
        },
        { selectedOptions: parseSelectedOptions(line.selected_options), quantity: line.quantity }
      ).catch(showCartError);
    };

    remove(line.line_key).then(
      () =>
        Toast.show({
          type: "info",
          text1: `${line.name} removed`,
          text2: "Tap to undo",
          visibilityTime: 5000,
          onPress: restore,
        }),
      showCartError
    );
  };

  const increaseQty = (line) =>
    updateQty(line.line_key, getLineQty(line.line_key) + 1).catch(showCartError);

  // Minus at quantity 1 removes the line (with Undo), like swiping it away.
  const decreaseQty = (line) => {
    const quantity = getLineQty(line.line_key);
    if (quantity <= 1) {
      return removeItem(line);
    }
    return updateQty(line.line_key, quantity - 1).catch(showCartError);
  };

  const {
    deliveryFee,
    discount,
    total: totalPrice,
    promoCode: appliedCode,
  } = computeTotals({
    subtotal,
    itemCount: cartItems.length,
    promo,
  });
  const isCompact = width < 390;

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout");
    } else {
      navigation.navigate("Login");
    }
  };

  const applyPromoCode = async () => {
    if (applyingPromo) {
      return;
    }
    setApplyingPromo(true);
    const result = await applyPromo(promoInput);
    setApplyingPromo(false);

    if (!result.ok) {
      Toast.show({ type: "error", text1: result.message });
      return;
    }

    setPromoInput("");
    Toast.show({
      type: "success",
      text1: "Promo applied",
      text2: `${result.promo.code} takes ${result.promo.percent}% off (${formatMoney(result.discount)}).`,
    });
  };

  const renderCartItem = ({ item, index }) => (
    <CartLine
      item={item}
      index={index}
      onIncrease={increaseQty}
      onDecrease={decreaseQty}
      onDelete={removeItem}
      onCustomize={customizable.has(item.menu_item_id) ? setEditingLine : undefined}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.line_key}
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
            <ScreenHeader
              title="Your cart"
              subtitle={
                cartItems.length
                  ? `${cartItems.length} selected dishes ready for checkout`
                  : "Add dishes to start building your order"
              }
              onBack={() => navigation.goBack()}
            />

            {cartItems.length ? (
              <>
                <View
                  style={[
                    styles.summaryStrip,
                    isCompact ? styles.summaryStripStack : null,
                    createShadow(colors.shadow, layout.cardElevation),
                    { backgroundColor: colors.surface, borderColor: colors.borderSoft },
                  ]}
                >
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <AppText style={[styles.summaryValue, { color: colors.text }]}>
                      {cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </AppText>
                    <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Items
                    </AppText>
                  </View>
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <AppText style={[styles.summaryValue, { color: colors.text }]}>
                      Rs. {subtotal}
                    </AppText>
                    <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Subtotal
                    </AppText>
                  </View>
                  <View style={[styles.summaryBubble, { backgroundColor: colors.badge }]}>
                    <AppText style={[styles.summaryValue, { color: colors.text }]}>
                      {isLoggedIn ? "Express" : "Login"}
                    </AppText>
                    <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Checkout
                    </AppText>
                  </View>
                </View>

                <SectionHeader
                  title="Promo code"
                  subtitle="Have a code? Enter it to see your discount."
                />
                {appliedCode ? (
                  <View
                    style={[
                      styles.appliedPromo,
                      { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                    ]}
                  >
                    <AntDesign name="tag" size={18} color={colors.accentText} />
                    <View style={styles.appliedPromoText}>
                      <AppText style={[styles.appliedPromoCode, { color: colors.text }]}>
                        {appliedCode} · {promo.percent}% off
                      </AppText>
                      <AppText style={[styles.appliedPromoMeta, { color: colors.textSecondary }]}>
                        You save {formatMoney(discount)}
                        {promo.min_order > 0 ? ` · min. order ${formatMoney(promo.min_order)}` : ""}
                      </AppText>
                    </View>
                    <TouchableOpacity
                      onPress={removePromo}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove promo code ${appliedCode}`}
                    >
                      <AppText style={[styles.removePromoText, { color: colors.primaryStrong }]}>Remove</AppText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.promoRow, isCompact ? styles.promoRowStack : null]}>
                    <TextField
                      value={promoInput}
                      onChangeText={setPromoInput}
                      placeholder="Try SAVE10, FOOD5 or WELCOME20"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      onSubmitEditing={applyPromoCode}
                      accessibilityLabel="Promo code"
                      containerStyle={[styles.promoField, isCompact ? styles.promoFieldStack : null]}
                    />
                    <TouchableOpacity
                      style={[
                        styles.applyButton,
                        isCompact ? styles.applyButtonStack : null,
                      ]}
                      onPress={applyPromoCode}
                      disabled={applyingPromo}
                    >
                      <LinearGradient
                        colors={colors.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.applyButtonGradient}
                      >
                        <AppText style={[styles.applyButtonText, { color: colors.onPrimary }]}>Apply</AppText>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                <SectionHeader
                  title="Order items"
                  subtitle="Adjust quantities before checkout."
                />
              </>
            ) : null}
          </>
        }
        ListEmptyComponent={
          cartLoading ? (
            <View>
              {[1, 2].map((key) => (
                <SkeletonCard key={key} width={null} height={120} style={styles.skeleton} />
              ))}
            </View>
          ) : cartError ? (
            <EmptyState
              title="Could not load your cart"
              message="Check your connection and try again."
              icon="warning"
              actionLabel="Try again"
              onActionPress={refreshCart}
            />
          ) : (
            <EmptyState
              title="Your cart is empty"
              message="Browse the menu and add a few dishes to see your summary here."
              icon="shopping-cart"
              actionLabel="Browse menu"
              onActionPress={() => navigation.navigate("HomeStack")}
            />
          )
        }
        ListFooterComponent={
          <View style={cartItems.length ? styles.footerLarge : styles.footerSmall} />
        }
      />

      {cartItems.length ? (
        <View
          style={[
            styles.checkoutCard,
            createShadow(colors.shadow, layout.cardElevation),
            { backgroundColor: colors.surface, borderColor: colors.borderSoft },
          ]}
        >
          <FreeDeliveryBar subtotal={subtotal} />
          <SectionHeader title="Payment summary" />
          <View style={styles.summaryRow}>
            <AppText style={[styles.summaryText, { color: colors.textSecondary }]}>
              Subtotal
            </AppText>
            <AppText style={[styles.summaryText, { color: colors.text }]}>Rs. {subtotal}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={[styles.summaryText, { color: colors.textSecondary }]}>
              Delivery
            </AppText>
            <AppText style={[styles.summaryText, { color: colors.text }]}>
              Rs. {deliveryFee}
            </AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={[styles.summaryText, { color: colors.textSecondary }]}>
              {appliedCode ? `Discount (${appliedCode})` : "Discount"}
            </AppText>
            <AppText style={[styles.summaryText, { color: colors.success }]}>
              - Rs. {discount}
            </AppText>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <AppText style={[styles.totalLabel, { color: colors.text }]}>Total</AppText>
            <AppText style={[styles.totalValue, { color: colors.text }]}>
              Rs. {Math.max(totalPrice, 0)}
            </AppText>
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
              <AppText style={[styles.checkoutButtonText, { color: colors.onPrimary }]}>
                {isLoggedIn ? "Proceed to checkout" : "Login to checkout"}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
      <DishOptionsSheet
        visible={Boolean(editingLine)}
        mode="edit"
        item={
          editingLine
            ? {
                id: editingLine.menu_item_id,
                name: editingLine.name,
                price: editingLine.base_price ?? editingLine.price,
                image_key: editingLine.image_key,
                restaurant_id: editingLine.restaurant_id,
              }
            : null
        }
        initialOptions={editingLine ? parseSelectedOptions(editingLine.selected_options) : null}
        initialQuantity={editingLine ? editingLine.quantity : 1}
        onClose={() => setEditingLine(null)}
        onSubmit={({ selectedOptions, quantity }) => {
          const line = editingLine;
          setEditingLine(null);
          replaceLine(
            line.line_key,
            {
              id: line.menu_item_id,
              name: line.name,
              price: line.base_price ?? line.price,
              image_key: line.image_key,
              restaurant_id: line.restaurant_id,
            },
            selectedOptions,
            quantity
          ).catch(showCartError);
        }}
      />
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
  summaryStrip: {
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
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
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  summaryLabel: {
    marginTop: spacing.xs,
    ...typeScale.caption,
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
  promoField: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.sm,
  },
  promoFieldStack: {
    marginRight: 0,
    marginBottom: spacing.md,
  },
  skeleton: {
    width: "100%",
    marginBottom: spacing.lg,
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
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  appliedPromo: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.sectionGap,
  },
  appliedPromoText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  appliedPromoCode: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  appliedPromoMeta: {
    marginTop: spacing.xs,
    ...typeScale.caption,
  },
  removePromoText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  checkoutCard: {
    position: "absolute",
    left: layout.pagePadding,
    right: layout.pagePadding,
    bottom: 92,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typeScale.label,
  },
  totalRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typeScale.h3,
    fontFamily: fontFamily.bold,
  },
  totalValue: {
    ...typeScale.h2,
  },
  checkoutButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  footerLarge: {
    height: 340,
  },
  footerSmall: {
    height: 72,
  },
});
