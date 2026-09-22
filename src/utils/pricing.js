// Single source of truth for cart and checkout money. AddToCartScreen, the
// Checkout screen and orderRepo.placeOrder all use computeTotals and
// validatePromo, so the price shown is always the price charged.

export const DELIVERY_FEE = 120;

export const PROMO_MESSAGES = {
  EMPTY: "Enter a promo code first.",
  NOT_FOUND: "We couldn't find that code.",
};

export const normalizePromo = (code) => String(code ?? "").trim().toUpperCase();

export const formatMoney = (amount) => {
  const value = Number(amount || 0);
  return `Rs. ${Number.isInteger(value) ? value : value.toFixed(2)}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Shown in UTC so a code reads the same expiry day on every device.
export const formatPromoDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

/**
 * Checks a promo row (from the promos table, or null when the code does not
 * exist) against a subtotal at a moment in time.
 *
 * @param {{ code: string, percent: number, min_order: number, expires_at: number|null }|null} promo
 * @param {number} subtotal
 * @param {number} [now] epoch ms
 * @returns {{ ok: true, discount: number } | { ok: false, message: string }}
 *   A code is valid up to and including its expires_at instant. The discount
 *   is Math.round(subtotal * percent / 100).
 */
export const validatePromo = (promo, subtotal, now = Date.now()) => {
  if (!promo) {
    return { ok: false, message: PROMO_MESSAGES.NOT_FOUND };
  }

  if (promo.expires_at != null && now > promo.expires_at) {
    return {
      ok: false,
      message: `${promo.code} expired on ${formatPromoDate(promo.expires_at)}.`,
    };
  }

  const minOrder = Number(promo.min_order || 0);
  if (subtotal < minOrder) {
    return {
      ok: false,
      message: `Add ${formatMoney(minOrder - subtotal)} more to use ${promo.code}.`,
    };
  }

  return { ok: true, discount: Math.round((subtotal * Number(promo.percent || 0)) / 100) };
};

/**
 * @param {{ subtotal: number, itemCount: number, promo?: object|null, now?: number }} input
 *   `promo` is a promos row. A promo that fails validatePromo is ignored.
 * @returns {{ subtotal: number, deliveryFee: number, discount: number, total: number, promoCode: string|null }}
 *   promoCode is the applied code, or null when none/invalid.
 */
export const computeTotals = ({ subtotal, itemCount, promo = null, now = Date.now() }) => {
  const check = promo ? validatePromo(promo, subtotal, now) : null;
  const promoApplied = check && check.ok ? promo.code : null;
  const discount = check && check.ok ? check.discount : 0;
  const deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return { subtotal, deliveryFee, discount, total, promoCode: promoApplied };
};
