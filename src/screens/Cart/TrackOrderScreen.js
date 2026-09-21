import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useNavigation, useRoute } from "@react-navigation/native";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusStepper from "../../components/OrderStatusStepper";
import { useTheme } from "../../Context/ThemeProvider";
import { useAuth } from "../Auth/AuthContext";
import {
  createShadow,
  layout,
  radius,
  spacing,
  typography,
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
            <Text style={[styles.heroLabel, { color: colors.onPrimary }]}>
              {delivered ? "Order status" : "Estimated arrival"}
            </Text>
            <Text style={[styles.heroTime, { color: colors.onPrimary }]}>
              {delivered ? "Delivered" : `${minutes} min`}
            </Text>
            <Text style={[styles.heroMeta, { color: colors.onPrimary }]}>{currentStep.description}</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order status</Text>
            <OrderStatusStepper status={order.status} />
          </View>

          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order #{order.id}</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Placed {new Date(order.created_at).toLocaleString()}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

            {order.items.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.quantity} × {item.name}
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatMoney(item.price * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatMoney(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Delivery</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatMoney(order.delivery_fee)}</Text>
            </View>
            {order.discount > 0 ? (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Discount{order.promo_code ? ` (${order.promo_code})` : ""}
                </Text>
                <Text style={[styles.value, { color: colors.success }]}>
                  - {formatMoney(order.discount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Text style={[styles.totalText, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalText, { color: colors.text }]}>{formatMoney(order.total)}</Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              createShadow(colors.shadow, 12),
              { backgroundColor: colors.surface, borderColor: colors.borderSoft },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>Delivering to</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{order.address}</Text>
            <Text style={[styles.label, styles.detailGap, { color: colors.textSecondary }]}>Payment</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>
              {getPaymentMethodLabel(order.payment_method)}
            </Text>
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
    fontSize: typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  heroTime: {
    fontSize: typography.hero,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  heroMeta: {
    opacity: 0.9,
    fontSize: typography.body,
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
    fontSize: typography.h2,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  metaText: {
    fontSize: typography.caption,
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
    fontSize: typography.body,
    fontWeight: "600",
  },
  label: {
    fontSize: typography.caption,
    fontWeight: "700",
  },
  value: {
    fontSize: typography.body,
    fontWeight: "700",
  },
  totalText: {
    fontSize: typography.h2,
    fontWeight: "800",
  },
  detailText: {
    marginTop: spacing.xs,
    fontSize: typography.body,
  },
  detailGap: {
    marginTop: spacing.lg,
  },
});
