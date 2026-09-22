import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import TextField from "../../components/ui/TextField";
import AppButton from "../../components/ui/AppButton";
import ScreenHeader from "../../components/ui/ScreenHeader";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../Auth/AuthContext";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { PAYMENT_METHODS } from "../../constants/paymentMethods";
import * as orderRepo from "../../database/repositories/orderRepo";
import { lineLabel } from "../../utils/cartLines";
import { computeTotals, formatMoney } from "../../utils/pricing";
import { validateAddress } from "../../utils/validation";

const ADDRESS_MAX_LENGTH = 200;

const getPlaceOrderErrorMessage = (error) => {
  switch (error?.message) {
    case orderRepo.ORDER_ERRORS.EMPTY_CART:
      return "Your cart is empty.";
    case orderRepo.ORDER_ERRORS.INVALID_PROMO:
      return error.promoMessage || "That promo code is no longer valid.";
    default:
      return "Could not place your order. Please try again.";
  }
};

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const { items, subtotal, promo, removePromo, reload } = useCart();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [showAddressError, setShowAddressError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Checkout needs an account: guests are sent to sign in.
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace("Login");
    }
  }, [isLoggedIn, navigation]);

  // Start from the address used last time.
  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }
    let cancelled = false;
    orderRepo
      .getLastAddress(user.id)
      .then((lastAddress) => {
        if (!cancelled && lastAddress) {
          setAddress((current) => current || lastAddress);
        }
      })
      .catch((error) => console.log("could not load last address", error));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const totals = computeTotals({ subtotal, itemCount: items.length, promo });
  const addressError = validateAddress(address);

  const handlePlaceOrder = async () => {
    setShowAddressError(true);
    if (addressError || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderRepo.placeOrder({
        userId: user.id,
        address,
        paymentMethod,
        // Send the code the user applied, not just the one that still applies
        // now: placeOrder re-checks it and explains a rejection.
        promoCode: promo ? promo.code : null,
      });
      await reload();
      Toast.show({ type: "success", text1: "Order placed", text2: `Order #${order.id} is on its way to the kitchen.` });
      // Back from tracking should land on the tabs, not on a finished checkout.
      navigation.reset({
        index: 1,
        routes: [{ name: "Tab" }, { name: "TrackOrder", params: { orderId: order.id } }],
      });
    } catch (error) {
      console.log("place order error", error);
      if (error?.message === orderRepo.ORDER_ERRORS.INVALID_PROMO) {
        // The cart is untouched; drop the code so the totals match what will be charged.
        removePromo();
      }
      Toast.show({
        type: "error",
        text1: "Order not placed",
        text2: getPlaceOrderErrorMessage(error),
      });
      setSubmitting(false);
    }
  };

  const header = (
    <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
  );

  if (!items.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {header}
          <EmptyState
            title="Your cart is empty"
            message="Add a few dishes before checking out."
            icon="shopping-cart"
            actionLabel="Back to cart"
            onActionPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {header}

        <SectionHeader title="Delivery address" subtitle="Where should we bring your order?" />
        <TextField
          value={address}
          onChangeText={setAddress}
          onBlur={() => setShowAddressError(true)}
          placeholder="House number, street, area, city"
          multiline
          maxLength={ADDRESS_MAX_LENGTH}
          accessibilityLabel="Delivery address"
          error={showAddressError && addressError ? addressError : undefined}
          helper={`${address.trim().length}/${ADDRESS_MAX_LENGTH}`}
        />

        <SectionHeader title="Payment" subtitle="Choose how you would like to pay." />
        {PAYMENT_METHODS.map((method) => {
          const selected = method.id === paymentMethod;
          return (
            <Pressable
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.paymentCard,
                createShadow(colors.shadow, 8),
                {
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primaryStrong : colors.borderSoft,
                },
              ]}
            >
              <View style={[styles.radioOuter, { borderColor: selected ? colors.primaryStrong : colors.border }]}>
                {selected ? (
                  <View style={[styles.radioInner, { backgroundColor: colors.primaryStrong }]} />
                ) : null}
              </View>
              <View style={styles.paymentText}>
                <AppText style={[styles.paymentLabel, { color: colors.text }]}>{method.label}</AppText>
                <AppText style={[styles.helperText, { color: colors.textSecondary }]}>{method.hint}</AppText>
              </View>
            </Pressable>
          );
        })}

        <SectionHeader title="Order summary" subtitle={`${items.length} ${items.length === 1 ? "dish" : "dishes"}`} />
        <View
          style={[
            styles.summaryCard,
            createShadow(colors.shadow, 8),
            { backgroundColor: colors.surface, borderColor: colors.borderSoft },
          ]}
        >
          {items.map((item) => (
            <View key={item.line_key} style={styles.summaryRow}>
              <AppText style={[styles.summaryName, { color: colors.text }]} numberOfLines={1}>
                {item.quantity} × {lineLabel(item)}
              </AppText>
              <AppText style={[styles.summaryValue, { color: colors.text }]}>
                {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
              </AppText>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

          <View style={styles.summaryRow}>
            <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</AppText>
            <AppText style={[styles.summaryValue, { color: colors.text }]}>{formatMoney(totals.subtotal)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery</AppText>
            <AppText style={[styles.summaryValue, { color: colors.text }]}>{formatMoney(totals.deliveryFee)}</AppText>
          </View>
          {totals.promoCode ? (
            <View style={styles.summaryRow}>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Discount ({totals.promoCode})
              </AppText>
              <AppText style={[styles.summaryValue, { color: colors.success }]}>
                - {formatMoney(totals.discount)}
              </AppText>
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

          <View style={styles.summaryRow}>
            <AppText style={[styles.totalLabel, { color: colors.text }]}>Total</AppText>
            <AppText style={[styles.totalValue, { color: colors.text }]}>{formatMoney(totals.total)}</AppText>
          </View>
          <AppText style={[styles.helperText, { color: colors.textSecondary }]}>
            Paying by {selectedMethod.label.toLowerCase()}.
          </AppText>
        </View>

        <AppButton
          label={submitting ? "Placing order..." : `Place order · ${formatMoney(totals.total)}`}
          onPress={handlePlaceOrder}
          disabled={submitting}
          style={styles.placeButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: layout.pagePadding,
    paddingTop: spacing.huge,
    paddingBottom: spacing.huge + spacing.xl,
  },
  helperText: {
    marginTop: spacing.xs,
    ...typeScale.caption,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  paymentText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  paymentLabel: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryName: {
    flex: 1,
    marginRight: spacing.md,
    ...typeScale.body,
    fontFamily: fontFamily.semibold,
  },
  summaryLabel: {
    ...typeScale.body,
  },
  summaryValue: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typeScale.h2,
  },
  totalValue: {
    ...typeScale.h2,
  },
  placeButton: {
    marginTop: spacing.xxl,
  },
});
