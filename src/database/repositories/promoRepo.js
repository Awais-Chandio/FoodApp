import { query } from "../sql";
import { normalizePromo } from "../../utils/pricing";

/**
 * The promo with this code (any case, spaces ignored), or null. The row is
 * { code, percent, min_order, expires_at }; check it with validatePromo.
 */
export const findByCode = async (code) => {
  const normalized = normalizePromo(code);
  if (!normalized) {
    return null;
  }
  const [promo] = await query("SELECT * FROM promos WHERE code = ? COLLATE NOCASE", [normalized]);
  return promo || null;
};
