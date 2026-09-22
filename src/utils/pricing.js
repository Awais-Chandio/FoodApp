// Single source of truth for cart and checkout money. AddToCartScreen, the
// Checkout screen and orderRepo.placeOrder all use computeTotals, so the price
// shown is always the price charged.

export const DELIVERY_FEE = 120;

// Temporary hardcoded promo codes (percent as a fraction).
export const PROMO_RATES = { SAVE10: 0.1, FOOD5: 0.05 };

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export const normalizePromo = (code) => String(code ?? "").trim().toUpperCase();

export const isValidPromo = (code) => hasOwn(PROMO_RATES, normalizePromo(code));

/**
 * @param {{ subtotal: number, itemCount: number, promoCode?: string|null }} input
 * @returns {{ subtotal: number, deliveryFee: number, discount: number, total: number, promoCode: string|null }}
 *   promoCode is the applied code, or null when none/invalid.
 */
export const computeTotals = ({ subtotal, itemCount, promoCode }) => {
  const code = normalizePromo(promoCode);
  const promoApplied = isValidPromo(code) ? code : null;
  const discount = promoApplied ? Math.round(subtotal * PROMO_RATES[promoApplied]) : 0;
  const deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return { subtotal, deliveryFee, discount, total, promoCode: promoApplied };
};

export const formatMoney = (amount) => {
  const value = Number(amount || 0);
  return `Rs. ${Number.isInteger(value) ? value : value.toFixed(2)}`;
};
