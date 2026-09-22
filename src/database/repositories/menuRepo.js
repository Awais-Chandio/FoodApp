import { execute, query } from "../sql";

export const listByRestaurant = (restaurantId) =>
  query("SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY id", [restaurantId]);

export const insert = ({ restaurantId, name, price, type, imageKey }) =>
  execute(
    `INSERT INTO menu_items (restaurant_id, name, price, type, image_key)
     VALUES (?, ?, ?, ?, ?)`,
    [restaurantId, name, price, type || null, imageKey || null]
  );

export const update = (id, { name, price, type, imageKey }) =>
  execute(
    `UPDATE menu_items
     SET name = ?, price = ?, type = ?, image_key = ?
     WHERE id = ?`,
    [name, price, type || null, imageKey || null, id]
  );

export const remove = (id) => execute("DELETE FROM menu_items WHERE id = ?", [id]);
