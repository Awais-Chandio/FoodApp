import { query, queryMany, transaction } from "../sql";
import { REVIEW_ERRORS, reviewBlocker, validateReview } from "../../utils/ratings";

const rowsOf = (resultSet) => {
  const rows = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    rows.push(resultSet.rows.item(i));
  }
  return rows;
};

/**
 * Saves a review and updates the restaurant's blended rating and review count
 * in ONE transaction. The order must belong to `userId`, be delivered, include
 * the restaurant, and not be reviewed for it already; otherwise it rejects with
 * an Error whose message is one of REVIEW_ERRORS and nothing is written.
 * Resolves with { id, rating, reviewCount } (the restaurant's new figures).
 */
export const add = async ({ orderId, restaurantId, userId, rating, comment = "" }) => {
  if (!userId) {
    throw new Error(REVIEW_ERRORS.NOT_LOGGED_IN);
  }
  if (validateReview({ rating, comment })) {
    throw new Error(REVIEW_ERRORS.INVALID_REVIEW);
  }
  const cleanComment = String(comment || "").trim() || null;

  return transaction((tx, control) => {
    tx.executeSql(
      "SELECT * FROM orders WHERE id = ?",
      [orderId],
      control.guard((_tx, orderResult) => {
        const order = rowsOf(orderResult)[0] || null;

        tx.executeSql(
          "SELECT DISTINCT restaurant_id FROM order_items WHERE order_id = ? AND restaurant_id IS NOT NULL",
          [orderId],
          control.guard((_tx2, itemResult) => {
            const orderRestaurantIds = rowsOf(itemResult).map((row) => row.restaurant_id);

            tx.executeSql(
              "SELECT id FROM reviews WHERE order_id = ? AND restaurant_id = ?",
              [orderId, restaurantId],
              control.guard((_tx3, existing) => {
                const blocker = reviewBlocker({
                  order,
                  userId,
                  restaurantId,
                  orderRestaurantIds,
                  alreadyReviewed: existing.rows.length > 0,
                });
                if (blocker) {
                  control.abort(new Error(blocker));
                  return;
                }

                tx.executeSql(
                  `INSERT INTO reviews (order_id, restaurant_id, user_id, rating, comment, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [orderId, restaurantId, userId, rating, cleanComment, Date.now()],
                  control.guard((_tx4, inserted) => {
                    const reviewId = inserted.insertId;
                    tx.executeSql(
                      `UPDATE restaurants
                       SET review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?),
                           rating = CASE
                             WHEN base_rating IS NULL THEN
                               ROUND(1.0 * (SELECT SUM(rating) FROM reviews WHERE restaurant_id = ?)
                                     / (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?), 1)
                             ELSE ROUND(
                               (base_rating * 5 + (SELECT SUM(rating) FROM reviews WHERE restaurant_id = ?))
                               / (5 + (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?)), 1)
                           END
                       WHERE id = ?`,
                      [restaurantId, restaurantId, restaurantId, restaurantId, restaurantId, restaurantId],
                      control.guard(() => {
                        tx.executeSql(
                          "SELECT rating, review_count FROM restaurants WHERE id = ?",
                          [restaurantId],
                          control.guard((_tx5, restaurant) => {
                            const row = rowsOf(restaurant)[0] || {};
                            control.resolve({
                              id: reviewId,
                              rating: row.rating ?? null,
                              reviewCount: row.review_count ?? 0,
                            });
                          })
                        );
                      })
                    );
                  })
                );
              })
            );
          })
        );
      })
    );
  });
};

/**
 * A restaurant's rating summary and its newest reviews (reviewer email included
 * so the UI can mask it): { rating, reviewCount, reviews }. Two queries.
 */
export const listForRestaurant = async (restaurantId, limit = 5) => {
  const [restaurants, reviews] = await queryMany([
    ["SELECT rating, review_count FROM restaurants WHERE id = ?", [restaurantId]],
    [
      `SELECT r.id, r.rating, r.comment, r.created_at, u.email AS reviewer_email
       FROM reviews r LEFT JOIN users u ON u.id = r.user_id
       WHERE r.restaurant_id = ?
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ?`,
      [restaurantId, limit],
    ],
  ]);
  return {
    rating: restaurants[0]?.rating ?? null,
    reviewCount: restaurants[0]?.review_count ?? 0,
    reviews,
  };
};

/**
 * The restaurants an order can be reviewed for, with the user's review if it
 * exists: [{ restaurant_id, name, review: { rating, comment } | null }].
 * Orders from before reviews existed return [].
 */
export const listTargets = async (orderId, userId) => {
  const rows = await query(
    `SELECT DISTINCT oi.restaurant_id AS restaurant_id, r.name AS name,
            rv.rating AS review_rating, rv.comment AS review_comment
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN restaurants r ON r.id = oi.restaurant_id
     LEFT JOIN reviews rv ON rv.order_id = oi.order_id AND rv.restaurant_id = oi.restaurant_id
     WHERE oi.order_id = ? AND o.user_id = ? AND oi.restaurant_id IS NOT NULL
     ORDER BY oi.restaurant_id`,
    [orderId, userId]
  );
  return rows.map((row) => ({
    restaurant_id: row.restaurant_id,
    name: row.name,
    review: row.review_rating ? { rating: row.review_rating, comment: row.review_comment } : null,
  }));
};
