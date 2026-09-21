import { formatMoney, formatPromoDate } from "./pricing";

/**
 * Turns active promos and restaurants that have an `offer` into banner data:
 * { id, kind: "promo" | "restaurant", title, subtitle, code?, restaurant? }.
 * Promos come first (best discount first, as given).
 */
export const buildOffers = ({ promos = [], restaurants = [] }) => [
  ...promos.map((promo) => {
    const details = [];
    if (Number(promo.min_order) > 0) {
      details.push(`Orders over ${formatMoney(promo.min_order)}`);
    }
    if (promo.expires_at != null) {
      details.push(`Until ${formatPromoDate(promo.expires_at)}`);
    }
    return {
      id: `promo-${promo.code}`,
      kind: "promo",
      code: promo.code,
      title: `${promo.percent}% off with ${promo.code}`,
      subtitle: details.length ? details.join(" · ") : "Tap to apply to your cart",
    };
  }),
  ...restaurants
    .filter((restaurant) => restaurant.offer)
    .map((restaurant) => ({
      id: `restaurant-${restaurant.id}`,
      kind: "restaurant",
      restaurant,
      title: `${restaurant.offer} at ${restaurant.name}`,
      subtitle: `${restaurant.time || "20 min"} delivery · tap to see the menu`,
    })),
];
