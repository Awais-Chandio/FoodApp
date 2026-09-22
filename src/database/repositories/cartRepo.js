import { batch, execute, query } from "../sql";

export const list = () => query("SELECT * FROM cart ORDER BY id");

/**
 * Adds one unit of a menu item: increments the row if the item is already in
 * the cart, otherwise inserts it with quantity 1. Both statements run in one
 * transaction. `item` is a menu_items row.
 */
export const addItem = (item) => {
  // TODO(me): enforce the single-restaurant rule here. Compare
  // item.restaurant_id with the restaurant already in the cart before adding.
  const restaurantId = item.restaurant_id ?? null;

  return batch([
    ["UPDATE cart SET quantity = quantity + 1 WHERE menu_item_id = ?", [item.id]],
    [
      `INSERT INTO cart (menu_item_id, name, price, image_key, restaurant_id, quantity)
       SELECT ?, ?, ?, ?, ?, 1
       WHERE NOT EXISTS (SELECT 1 FROM cart WHERE menu_item_id = ?)`,
      [item.id, item.name, item.price, item.image_key || null, restaurantId, item.id],
    ],
  ]);
};

/** Sets an absolute quantity. A quantity of 0 or less removes the row. */
export const setQuantity = (menuItemId, quantity) => {
  if (quantity <= 0) {
    return remove(menuItemId);
  }
  return execute("UPDATE cart SET quantity = ? WHERE menu_item_id = ?", [
    quantity,
    menuItemId,
  ]);
};

/**
 * Atomically adds `delta` to a row's quantity (delta may be negative).
 * Rows that drop to 0 or below are deleted. Safe against rapid repeated taps.
 */
export const changeQuantity = (menuItemId, delta) =>
  batch([
    ["UPDATE cart SET quantity = quantity + ? WHERE menu_item_id = ?", [delta, menuItemId]],
    ["DELETE FROM cart WHERE quantity <= 0 AND menu_item_id = ?", [menuItemId]],
  ]);

export const remove = (menuItemId) =>
  execute("DELETE FROM cart WHERE menu_item_id = ?", [menuItemId]);

export const clear = () => execute("DELETE FROM cart");
