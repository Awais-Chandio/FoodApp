import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AppButton from "../../components/ui/AppButton";
import ScreenHeader from "../../components/ui/ScreenHeader";
import EmptyState from "../../components/ui/EmptyState";
import SkeletonCard from "../../components/ui/SkeletonCard";
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
import * as orderRepo from "../../database/repositories/orderRepo";
import { formatMoney } from "../../utils/pricing";
import { getStatusLabel, isDelivered, ORDER_STATUS } from "../../utils/orderStatus";

const SKELETON_COUNT = 3;

const getStatusColors = (status, colors) => {
  switch (status) {
    case ORDER_STATUS.DELIVERED:
      return { background: colors.accentSoft, text: colors.success };
    case ORDER_STATUS.ON_THE_WAY:
      return { background: colors.badge, text: colors.primaryStrong };
    case ORDER_STATUS.PREPARING:
      return { background: colors.secondarySoft, text: colors.primaryDeep };
    default:
      return { background: colors.surfaceMuted, text: colors.textSecondary };
  }
};

const summarizeItems = (items) =>
  items.map((item) => `${item.quantity}× ${item.name}`).join(", ");

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const { count: cartCount, replaceAll } = useCart();
  const { width } = useWindowDimensions();

  const [orders, setOrders] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [reorderingId, setReorderingId] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    setLoadState("loading");
    try {
      const list = await orderRepo.listOrders(user.id);
      // Bring any order that is due up to its current status before showing it.
      setOrders(await orderRepo.advanceAllDue(list));
      setLoadState("ready");
    } catch (error) {
      console.log("order history load error", error);
      setLoadState("error");
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const performReorder = async (order) => {
    setReorderingId(order.id);
    try {
      const { lines, unavailable } = await orderRepo.getReorderLines(order.id, user.id);

      if (!lines.length) {
        Toast.show({
          type: "error",
          text1: "Can't reorder",
          text2: "None of these dishes are on the menu anymore.",
        });
        return;
      }

      await replaceAll(lines);
      Toast.show({
        type: "success",
        text1: "Cart updated",
        text2: unavailable
          ? `${unavailable} ${unavailable === 1 ? "dish is" : "dishes are"} no longer available.`
          : "Your previous order is back in the cart.",
      });
      navigation.navigate("Tab", { screen: "AddToCartScreen" });
    } catch (error) {
      console.log("reorder error", error);
      Toast.show({ type: "error", text1: "Could not reorder", text2: "Please try again." });
    } finally {
      setReorderingId(null);
    }
  };

  const handleReorder = (order) => {
    if (cartCount === 0) {
      performReorder(order);
      return;
    }

    Alert.alert(
      "Replace your cart?",
      `Your cart has ${cartCount} ${cartCount === 1 ? "item" : "items"}. Reordering will replace ${
        cartCount === 1 ? "it" : "them"
      }.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Replace", style: "destructive", onPress: () => performReorder(order) },
      ]
    );
  };

  const openTracking = (order) => navigation.navigate("TrackOrder", { orderId: order.id });

  const header = (
    <ScreenHeader title="Order history" onBack={() => navigation.goBack()} />
  );

  const renderOrder = ({ item: order }) => {
    const statusColors = getStatusColors(order.status, colors);
    const delivered = isDelivered(order.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openTracking(order)}
        accessibilityLabel={`Order ${order.id}, ${getStatusLabel(order.status)}`}
        style={[
          styles.card,
          createShadow(colors.shadow, 10),
          { backgroundColor: colors.surface, borderColor: colors.borderSoft },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTitleWrap}>
            <AppText style={[styles.orderNumber, { color: colors.text }]}>Order #{order.id}</AppText>
            <AppText style={[styles.dateText, { color: colors.textSecondary }]}>
              {new Date(order.created_at).toLocaleString()}
            </AppText>
          </View>
          <View style={[styles.pill, { backgroundColor: statusColors.background }]}>
            <AppText style={[styles.pillText, { color: statusColors.text }]}>
              {getStatusLabel(order.status)}
            </AppText>
          </View>
        </View>

        <AppText style={[styles.itemsText, { color: colors.textSecondary }]} numberOfLines={2}>
          {summarizeItems(order.items)}
        </AppText>
        <AppText style={[styles.totalText, { color: colors.text }]}>{formatMoney(order.total)}</AppText>

        <View style={styles.actions}>
          {!delivered ? (
            <View style={styles.actionCell}>
              <AppButton label="Track order" variant="outline" onPress={() => openTracking(order)} />
            </View>
          ) : null}
          <View style={styles.actionCell}>
            <AppButton
              label={reorderingId === order.id ? "Reordering..." : "Reorder"}
              variant={delivered ? "primary" : "secondary"}
              disabled={reorderingId !== null}
              onPress={() => handleReorder(order)}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBody = () => {
    if (!isLoggedIn) {
      return (
        <EmptyState
          title="Sign in to see your orders"
          message="Your order history is saved to your account."
          icon="profile"
          actionLabel="Sign in"
          onActionPress={() => navigation.navigate("Login")}
        />
      );
    }

    if (loadState === "loading") {
      const cardWidth = width - layout.pagePadding * 2;
      return (
        <View>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <SkeletonCard key={index} width={cardWidth} height={150} style={styles.skeleton} />
          ))}
        </View>
      );
    }

    if (loadState === "error") {
      return (
        <EmptyState
          title="Could not load your orders"
          message="Something went wrong while reading your order history."
          icon="warning"
          actionLabel="Try again"
          onActionPress={loadOrders}
        />
      );
    }

    return null;
  };

  const showList = isLoggedIn && loadState === "ready";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={showList ? orders : []}
        keyExtractor={(order) => String(order.id)}
        renderItem={renderOrder}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          showList ? (
            <EmptyState
              title="No orders yet"
              message="Your past orders will show up here."
              icon="inbox"
              actionLabel="Browse restaurants"
              onActionPress={() => navigation.navigate("Tab", { screen: "HomeStack" })}
            />
          ) : (
            renderBody()
          )
        }
      />
    </View>
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
  skeleton: {
    marginBottom: layout.cardGap,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: layout.cardGap,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  orderNumber: {
    ...typeScale.h2,
  },
  dateText: {
    marginTop: spacing.xs,
    ...typeScale.caption,
  },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pillText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  itemsText: {
    marginTop: spacing.md,
    ...typeScale.body,
  },
  totalText: {
    marginTop: spacing.sm,
    ...typeScale.h2,
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionCell: {
    flex: 1,
  },
});
