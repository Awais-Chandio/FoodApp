// Pure search over restaurants that carry their dishes as `menu_items`.
// The Search screen renders the result; nothing here touches the database.

export const normalizeQuery = (query) => String(query ?? "").trim().toLowerCase();

const includes = (value, needle) => String(value ?? "").toLowerCase().includes(needle);

/** The Deals / Top rated filters. Applies to a restaurant (or a dish's restaurant). */
export const matchesRestaurantFilter = (restaurant, filter) => {
  switch (filter) {
    case "offers":
      return Boolean(restaurant.offer);
    case "top":
      return Number(restaurant.rating || 0) >= 4.8;
    default:
      return true;
  }
};

/**
 * @param {Array} restaurants restaurant rows, each with `menu_items`
 * @param {string} query free text; case and surrounding spaces are ignored
 * @param {string} filter "all" | "offers" | "top"
 * @returns {{ restaurants: Array, dishes: Array }}
 *   Restaurants match on name, offer or delivery time; with an empty query they
 *   are all returned. Dishes match on name only, are returned only when there
 *   is a query (listing every dish would be noise), and each carries its
 *   `restaurant`. The filter applies to a dish's restaurant.
 */
export const searchAll = (restaurants, query, filter = "all") => {
  const needle = normalizeQuery(query);
  const visible = restaurants.filter((restaurant) => matchesRestaurantFilter(restaurant, filter));

  if (!needle) {
    return { restaurants: visible, dishes: [] };
  }

  return {
    restaurants: visible.filter(
      (restaurant) =>
        includes(restaurant.name, needle) ||
        includes(restaurant.offer, needle) ||
        includes(restaurant.time, needle)
    ),
    dishes: visible.flatMap((restaurant) =>
      (restaurant.menu_items || [])
        .filter((dish) => includes(dish.name, needle))
        .map((dish) => ({ ...dish, restaurant }))
    ),
  };
};
