import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppButton from "./ui/AppButton";
import AppText from "./ui/AppText";
import BottomSheet from "./ui/BottomSheet";
import StarRating from "./ui/StarRating";
import TextField from "./ui/TextField";
import { layout, spacing } from "../constants/designSystem";
import { COMMENT_MAX_LENGTH } from "../utils/ratings";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * "Rate your order" form in a bottom sheet: tap-to-select stars, an optional
 * comment (500 characters) and a Submit that stays disabled until a rating is
 * chosen. onSubmit({ rating, comment }) may return a promise; the button shows
 * "Submitting..." until it settles.
 */
export default function ReviewSheet({ visible, restaurantName, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
      setSubmitting(false);
    }
  }, [visible]);

  const submit = async () => {
    if (!rating || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Rate your order">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="h3">How was {restaurantName}?</AppText>
        <AppText variant="label" muted style={styles.subtitle}>
          Your rating helps others choose.
        </AppText>

        <View style={styles.stars}>
          <StarRating value={rating} onChange={setRating} size={36} />
        </View>
        <AppText variant="label" color={rating ? "text" : "textSecondary"} style={styles.rateLabel}>
          {rating ? LABELS[rating] : "Tap a star to rate"}
        </AppText>

        <TextField
          label="Comment (optional)"
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us what you liked or what could be better"
          multiline
          maxLength={COMMENT_MAX_LENGTH}
          helper={`${comment.length}/${COMMENT_MAX_LENGTH}`}
        />

        <AppButton
          label={submitting ? "Submitting..." : "Submit review"}
          onPress={submit}
          disabled={!rating || submitting}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  stars: {
    marginTop: spacing.xl,
  },
  rateLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
