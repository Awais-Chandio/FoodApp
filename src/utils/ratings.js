import { isDelivered, statusForElapsed } from "./orderStatus";

// Restaurant ratings blend the seeded (base) rating with real reviews, so one
// 3-star review cannot drop a seeded 4.8 straight to 3.0. The base counts as
// this many reviews.
export const RATING_PRIOR_WEIGHT = 5;
export const COMMENT_MAX_LENGTH = 500;

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * rating = (base x 5 + sum of ratings) / (5 + review count), 1 decimal.
 * Without a base rating the plain average is used, and null with no reviews.
 */
export const blendRating = (baseRating, ratingSum, reviewCount) => {
  const count = Number(reviewCount) || 0;
  const hasBase = baseRating !== null && baseRating !== undefined && baseRating !== "";
  if (!hasBase) {
    return count ? round1(Number(ratingSum) / count) : null;
  }
  return round1(
    (Number(baseRating) * RATING_PRIOR_WEIGHT + Number(ratingSum || 0)) /
      (RATING_PRIOR_WEIGHT + count)
  );
};

/** "aw***" from an email, so reviews do not expose addresses. */
export const maskReviewer = (email) => {
  const name = String(email || "").split("@")[0].trim();
  if (!name) {
    return "Guest";
  }
  return `${name.slice(0, 2)}***`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatReviewDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

export const validateReview = ({ rating, comment }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Choose a rating from 1 to 5.";
  }
  if (String(comment || "").trim().length > COMMENT_MAX_LENGTH) {
    return `Keep your comment under ${COMMENT_MAX_LENGTH} characters.`;
  }
  return null;
};

export const REVIEW_ERRORS = {
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  INVALID_REVIEW: "INVALID_REVIEW",
  NOT_YOUR_ORDER: "NOT_YOUR_ORDER",
  NOT_DELIVERED: "NOT_DELIVERED",
  RESTAURANT_NOT_IN_ORDER: "RESTAURANT_NOT_IN_ORDER",
  ALREADY_REVIEWED: "ALREADY_REVIEWED",
};

/**
 * May this user review this restaurant for this order? Returns null when yes,
 * else a REVIEW_ERRORS code. `order` is an orders row (or null), `orderRestaurantIds`
 * the restaurants its items came from (orders from before reviews existed have none).
 * An order counts as delivered by its stored status OR by the clock, since the
 * status is only saved when someone opens the app.
 */
export const reviewBlocker = ({
  order,
  userId,
  restaurantId,
  orderRestaurantIds,
  alreadyReviewed,
  now = Date.now(),
}) => {
  if (!order || order.user_id !== userId) {
    return REVIEW_ERRORS.NOT_YOUR_ORDER;
  }
  const delivered =
    isDelivered(order.status) || isDelivered(statusForElapsed(now - order.created_at));
  if (!delivered) {
    return REVIEW_ERRORS.NOT_DELIVERED;
  }
  if (!orderRestaurantIds.includes(restaurantId)) {
    return REVIEW_ERRORS.RESTAURANT_NOT_IN_ORDER;
  }
  if (alreadyReviewed) {
    return REVIEW_ERRORS.ALREADY_REVIEWED;
  }
  return null;
};
