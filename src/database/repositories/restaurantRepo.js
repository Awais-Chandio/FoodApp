import { batch, execute, queryMany } from "../sql";

/**
 * All restaurants with their menu items nested as `menu_items`, split by
 * category into { nearest, popular }.
 *
 * Two queries in one transaction (restaurants, menu items) grouped in JS,
 * instead of one extra query per restaurant.
 */
export const listWithMenus = async () => {
  const [restaurants, menuItems] = await queryMany([
    ["SELECT * FROM restaurants ORDER BY id"],
    ["SELECT * FROM menu_items ORDER BY id"],
  ]);

  const menusByRestaurant = new Map();
  menuItems.forEach((item) => {
    const list = menusByRestaurant.get(item.restaurant_id) || [];
    list.push(item);
    menusByRestaurant.set(item.restaurant_id, list);
  });

  const nearest = [];
  const popular = [];
  restaurants.forEach((restaurant) => {
    const withMenu = {
      ...restaurant,
      menu_items: menusByRestaurant.get(restaurant.id) || [],
    };
    if (withMenu.category === "nearest") {
      nearest.push(withMenu);
    } else if (withMenu.category === "popular") {
      popular.push(withMenu);
    }
  });

  return { nearest, popular };
};

// `rating` here is the BASE rating (what the admin enters). The displayed
// rating is that base blended with real reviews (see utils/ratings.js).
export const insert = ({ name, rating, time, offer, category, imagePath }) =>
  execute(
    `INSERT INTO restaurants (name, rating, base_rating, time, offer, category, image_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, rating, rating, time, offer, category, imagePath]
  );

// Saving a new base rating recomputes the blended rating from the existing reviews.
export const update = (id, { name, rating, time, offer, category, imagePath }) =>
  execute(
    `UPDATE restaurants
     SET name = ?, base_rating = ?, time = ?, offer = ?, category = ?, image_path = ?,
         rating = CASE
           WHEN ? IS NULL THEN
             (SELECT ROUND(1.0 * SUM(rating) / COUNT(*), 1) FROM reviews WHERE restaurant_id = restaurants.id)
           ELSE ROUND(
             (? * 5 + COALESCE((SELECT SUM(rating) FROM reviews WHERE restaurant_id = restaurants.id), 0))
             / (5 + review_count), 1)
         END
     WHERE id = ?`,
    [name, rating, time, offer, category, imagePath, rating, rating, id]
  );

/** Deletes a restaurant, its menu items and everyone's favorites of it atomically. */
export const remove = (id) =>
  batch([
    ["DELETE FROM menu_items WHERE restaurant_id = ?", [id]],
    ["DELETE FROM favorites WHERE restaurant_id = ?", [id]],
    ["DELETE FROM reviews WHERE restaurant_id = ?", [id]],
    ["DELETE FROM restaurants WHERE id = ?", [id]],
  ]);
