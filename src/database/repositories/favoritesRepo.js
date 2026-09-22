import { query, transaction } from "../sql";

/** Restaurant ids a user has saved, newest first. */
export const listIds = async (userId) => {
  const rows = await query(
    "SELECT restaurant_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC, restaurant_id",
    [userId]
  );
  return rows.map((row) => row.restaurant_id);
};

/**
 * A user's saved restaurants (full restaurant rows), newest first. The JOIN
 * also hides any favorite whose restaurant no longer exists.
 */
export const listRestaurants = (userId) =>
  query(
    `SELECT r.* FROM favorites f
     JOIN restaurants r ON r.id = f.restaurant_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC, r.id`,
    [userId]
  );

/**
 * Saves the restaurant if it is not a favorite yet, otherwise removes it, in
 * ONE transaction. Resolves with the new state: true = now a favorite.
 * INSERT OR IGNORE plus the primary key mean a double tap can never create a
 * duplicate row.
 */
export const toggle = (userId, restaurantId) =>
  transaction((tx, control) => {
    tx.executeSql(
      "SELECT 1 AS found FROM favorites WHERE user_id = ? AND restaurant_id = ?",
      [userId, restaurantId],
      control.guard((_tx, existing) => {
        if (existing.rows.length > 0) {
          tx.executeSql(
            "DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?",
            [userId, restaurantId],
            control.guard(() => control.resolve(false))
          );
          return;
        }
        tx.executeSql(
          `INSERT OR IGNORE INTO favorites (user_id, restaurant_id, created_at)
           VALUES (?, ?, ?)`,
          [userId, restaurantId, Date.now()],
          control.guard(() => control.resolve(true))
        );
      })
    );
  });
