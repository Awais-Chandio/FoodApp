import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import AppButton from "./ui/AppButton";
import AppText from "./ui/AppText";
import ReviewSheet from "./ReviewSheet";
import StarRating from "./ui/StarRating";
import useAsyncData from "../hooks/useAsyncData";
import * as reviewRepo from "../database/repositories/reviewRepo";
import { useAuth } from "../screens/Auth/AuthContext";
import { spacing } from "../constants/designSystem";
import { REVIEW_ERRORS } from "../utils/ratings";

const messageFor = (error) => {
  switch (error?.message) {
    case REVIEW_ERRORS.ALREADY_REVIEWED:
      return "You already reviewed this restaurant for this order.";
    case REVIEW_ERRORS.NOT_DELIVERED:
      return "You can review an order once it is delivered.";
    default:
      return "Could not save your review. Please try again.";
  }
};

/**
 * "Rate your order" for a DELIVERED order. Shows a button for the first
 * restaurant of the order that has no review yet, or the stars given once all
 * are reviewed. Renders nothing for undelivered orders, guests, and orders from
 * before reviews existed (their items carry no restaurant).
 */
export default function RateOrderButton({ order, delivered, compact = false, onReviewed }) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = Boolean(delivered && userId && order);
  const { data: targets, reload } = useAsyncData(
    () => (enabled ? reviewRepo.listTargets(order.id, userId) : Promise.resolve([])),
    [order?.id, userId, enabled]
  );
  const [open, setOpen] = useState(false);

  if (!enabled || !targets || !targets.length) {
    return null;
  }

  const next = targets.find((target) => !target.review);

  const submit = async ({ rating, comment }) => {
    try {
      await reviewRepo.add({
        orderId: order.id,
        restaurantId: next.restaurant_id,
        userId,
        rating,
        comment,
      });
      setOpen(false);
      Toast.show({ type: "success", text1: "Thanks for your review", text2: `${next.name} now shows your rating.` });
      reload({ quiet: true });
      onReviewed?.();
    } catch (error) {
      console.log("review error", error);
      Toast.show({ type: "error", text1: "Review not saved", text2: messageFor(error) });
      if (error?.message === REVIEW_ERRORS.ALREADY_REVIEWED) {
        setOpen(false);
        reload({ quiet: true });
      }
    }
  };

  if (!next) {
    const done = targets[0].review;
    return compact ? (
      <View style={styles.doneCompact}>
        <StarRating value={done.rating} size={14} />
      </View>
    ) : (
      <View style={styles.done}>
        <AppText variant="label" muted>
          You rated this order
        </AppText>
        <StarRating value={done.rating} size={20} />
      </View>
    );
  }

  return (
    <View>
      <AppButton
        label={compact ? "Rate" : `Rate your order${targets.length > 1 ? ` · ${next.name}` : ""}`}
        variant={compact ? "outline" : "primary"}
        onPress={() => setOpen(true)}
      />
      <ReviewSheet
        visible={open}
        restaurantName={next.name}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  done: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  doneCompact: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
