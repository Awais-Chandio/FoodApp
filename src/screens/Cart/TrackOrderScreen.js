import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useNavigation, useRoute } from "@react-navigation/native";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusStepper from "../../components/OrderStatusStepper";
import { useTheme } from "../../Context/ThemeProvider";
import { useAuth } from "../Auth/AuthContext";
import {
  createShadow,
  fontFamily,
  layout,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { getPaymentMethodLabel } from "../../constants/paymentMethods";
import { appImages } from "../../constants/imageRegistry";
import * as orderRepo from "../../database/repositories/orderRepo";
import { formatMoney } from "../../utils/pricing";
import {
  isDelivered,
  minutesUntilDelivery,
  msUntilNextStatus,
  ORDER_STEPS,
  statusIndex,
} from "../../utils/orderStatus";

// Small margin so the timer fires just after the status is due, not just before.
const TIMER_MARGIN_MS = 50;
const ETA_REFRESH_MS = 10000;

const parseOrderId = (params) => {
  const raw = params?.orderId ?? params?.notification?.orderId;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export default function TrackOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { user } = useAuth();

  const orderId = parseOrderId(route.params);
  const [order, setOrder] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | notFound | error
  const [, setTick] = useState(0);

  const loadOrder = useCallback(async () => {
    if (!orderId || !user?.id) {
      setLoadState("notFound");
      return;
    }

    setLoadState("loading");
    try {
      const found = await orderRepo.getOrderForUser(orderId, user.id);
      if (!found) {
        setLoadState("notFound");
        return;
      }
      setOrder(await orderRepo.advanceIfDue(found));
      setLoadState("ready");
    } catch (error) {
      console.log("track order load error", error);
      setLoadState("error");
    }
  }, [orderId, user?.id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Move the order to its next status when it becomes due, and keep going
  // until it is delivered. Timers can be paused while the app is in the
  // background, so also re-check whenever the app comes back to the foreground.
  const status = order?.status;
  useEffect(() => {
    if (!order || isDelivered(order.status)) {
      return undefined;
    }

    let cancelled = false;
    const advance = async () => {
      try {
        const next = await orderRepo.advanceIfDue(order);
        if (!cancelled && next.status !== order.status) {
          setOrder(next);
        }
      } catch (error) {
        console.log("could not advance order", error);
      }
    };

    const timer = setTimeout(advance, (msUntilNextStatus(order) ?? 0) + TIMER_MARGIN_MS);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        advance();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      appStateSubscription.remove();
    };
    // `order` is captured on purpose; the effect re-runs when the status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, status]);

  // Refresh the "arriving in N min" text while the order is in progress.
  useEffect(() => {
    if (!order || isDelivered(order.status)) {
      return undefined;
    }
    const interval = setInterval(() => setTick((value) => value + 1), ETA_REFRESH_MS);
    return () => clearInterval(interval);
  }, [order]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Opened from a notification with nothing behind it.
      navigation.reset({ index: 0, routes: [{ name: "Tab" }] });
    }
  };

  if (loadState !== "ready") {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        {loadState === "loading" ? (
          <ActivityIndicator size="large" color={colors.primaryStrong} />
        ) : (
          <View style={styles.stateWrap}>
            <EmptyState
              title={loadState === "error" ? "Could not load your order" : "Order not found"}
              message={
                loadState === "error"
                  ? "Something went wrong while reading the order."
                  : "We couldn't find this order on your account."
              }
              icon="warning"
              actionLabel={loadState === "error" ? "Try again" : "Back to home"}
              onActionPress={loadState === "error" ? loadOrder : goBack}
            />
          </View>
        )}
      </View>
    );
  }

  const delivered = isDelivered(order.status);
  const minutes = minutesUntilDelivery(order);
  const currentStep = ORDER_STEPS[statusIndex(order.status)];
  const subtotal = Math.round((order.total - order.delivery_fee + order.discount) * 100) / 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={appImages.heroBackground}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={colors.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroOverlay}
          />
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={goBack}
            accessibilityLabel="Go back"
          >
            <AntDesign name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <AppText style={[styles.heroLabel, { color: colors.onPrimary }]}>
              {delivered ? "Order status" : "Estimated arrival"}
            </AppText>
            <AppText style={[styles.heroTime, { color: colors.onPrimary }]}>
              {delivered ? "Delivered" : `${minutes} min`}
            </AppText>
            <AppText style={[styles.heroMeta, { color: colors.onPrimary }]}>{currentStep.description}</AppText>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <AppText style={[styles.sectionTitle, { color: colors.text }]}>Order status</AppText>
            <OrderStatusStepper status={order.status} />
          </View>

          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <AppText style={[styles.sectionTitle, { color: colors.text }]}>Order #{order.id}</AppText>
            <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
              Placed {new Date(order.created_at).toLocaleString()}
            </AppText>

            <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

            {order.items.map((item) => (
              <View key={item.id} style={styles.row}>
                <AppText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.quantity} × {item.name}
                </AppText>
                <AppText style={[styles.value, { color: colors.text }]}>
                  {formatMoney(item.price * item.quantity)}
                </AppText>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

            <View style={styles.row}>
              <AppText style={[styles.label, { color: colors.textSecondary }]}>Subtotal</AppText>
              <AppText style={[styles.value, { color: colors.text }]}>{formatMoney(subtotal)}</AppText>
            </View>
            <View style={styles.row}>
              <AppText style={[styles.label, { color: colors.textSecondary }]}>Delivery</AppText>
              <AppText style={[styles.value, { color: colors.text }]}>{formatMoney(order.delivery_fee)}</AppText>
            </View>
            {order.discount > 0 ? (
              <View style={styles.row}>
                <AppText style={[styles.label, { color: colors.textSecondary }]}>
                  Discount{order.promo_code ? ` (${order.promo_code})` : ""}
                </AppText>
                <AppText style={[styles.value, { color: colors.success }]}>
                  - {formatMoney(order.discount)}
                </AppText>
              </View>
            ) : null}
            <View style={styles.row}>
              <AppText style={[styles.totalText, { color: colors.text }]}>Total</AppText>
              <AppText style={[styles.totalText, { color: colors.text }]}>{formatMoney(order.total)}</AppText>
            </View>
          </View>

          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <AppText style={[styles.label, { color: colors.textSecondary }]}>Delivering to</AppText>
            <AppText style={[styles.detailText, { color: colors.text }]}>{order.address}</AppText>
            <AppText style={[styles.label, styles.detailGap, { color: colors.textSecondary }]}>Payment</AppText>
            <AppText style={[styles.detailText, { color: colors.text }]}>
              {getPaymentMethodLabel(order.payment_method)}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  stateWrap: {
    width: "100%",
    padding: layout.pagePadding,
  },
  hero: {
    height: 300,
    justifyContent: "space-between",
  },
  heroImage: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxxl,
    marginLeft: layout.pagePadding,
  },
  heroContent: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.xxl,
  },
  heroLabel: {
    opacity: 0.8,
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
  },
  heroTime: {
    ...typeScale.display,
    marginTop: spacing.sm,
  },
  heroMeta: {
    opacity: 0.9,
    ...typeScale.body,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: layout.cardGap + spacing.sm,
  },
  sectionTitle: {
    ...typeScale.h2,
    marginBottom: spacing.md,
  },
  metaText: {
    ...typeScale.caption,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  itemName: {
    flex: 1,
    marginRight: spacing.md,
    ...typeScale.body,
    fontFamily: fontFamily.semibold,
  },
  label: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  value: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  totalText: {
    ...typeScale.h2,
  },
  detailText: {
    marginTop: spacing.xs,
    ...typeScale.body,
  },
  detailGap: {
    marginTop: spacing.lg,
  },
});
