import { execute, query } from "../sql";

export const listByRestaurant = (restaurantId) =>
  query("SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY id", [restaurantId]);

const detailsOf = ({ description, category, isVeg, spiceLevel }) => [
  description ? String(description).trim() : null,
  category || "Other",
  isVeg ? 1 : 0,
  Math.min(Math.max(Number(spiceLevel) || 0, 0), 3),
];

export const insert = ({ restaurantId, name, price, type, imageKey, ...details }) =>
  execute(
    `INSERT INTO menu_items
       (restaurant_id, name, price, type, image_key, description, category, is_veg, spice_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [restaurantId, name, price, type || null, imageKey || null, ...detailsOf(details)]
  );

export const update = (id, { name, price, type, imageKey, ...details }) =>
  execute(
    `UPDATE menu_items
     SET name = ?, price = ?, type = ?, image_key = ?,
         description = ?, category = ?, is_veg = ?, spice_level = ?
     WHERE id = ?`,
    [name, price, type || null, imageKey || null, ...detailsOf(details), id]
  );

export const remove = (id) => execute("DELETE FROM menu_items WHERE id = ?", [id]);
