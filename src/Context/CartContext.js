import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import * as cartRepo from "../database/repositories/cartRepo";
import * as promoRepo from "../database/repositories/promoRepo";
import { normalizePromo, PROMO_MESSAGES, validatePromo } from "../utils/pricing";

const CartContext = createContext(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return value;
}

/**
 * Single source of truth for the cart, backed by the SQLite `cart` table.
 *
 * Updates are optimistic (the UI changes immediately) and the database writes
 * run one after another through a queue, so rapid taps never lose an update.
 * When the queue drains, or a write fails, the state is re-read from the
 * database so the UI always converges on what is actually stored.
 *
 * It also holds the applied promo (`promo`, a promos row) so the Cart and the
 * Checkout screens agree on the discount. The promo lives only in memory. It
 * is re-validated whenever the cart changes and removed, with a toast saying
 * why, if it stops applying (for example the subtotal drops below its minimum).
 * It is dropped silently when the cart becomes empty, which also covers a
 * placed order and logout.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promo, setPromo] = useState(null);

  // Mirror of `items` that is updated synchronously, so getQty()/add() called
  // twice in the same tick see the result of the first call.
  const itemsRef = useRef([]);
  const queueRef = useRef(Promise.resolve());
  const pendingRef = useRef(0);

  const commit = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const reload = useCallback(async () => {
    try {
      commit(await cartRepo.list());
      setError(null);
    } catch (loadError) {
      console.log("cart load error", loadError);
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, [commit]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Queues a database write. Resolves once persisted; rejects (after resyncing
  // from the database) if the write failed.
  const enqueue = useCallback(
    (write) => {
      pendingRef.current += 1;
      const run = queueRef.current
        .then(write)
        .then(() => null, (writeError) => writeError);
      queueRef.current = run;

      return run.then(async (writeError) => {
        pendingRef.current -= 1;
        if (writeError) {
          console.log("cart write failed", writeError);
        }
        if (writeError || pendingRef.current === 0) {
          await reload();
        }
        if (writeError) {
          throw writeError;
        }
      });
    },
    [reload]
  );

  const add = useCallback(
    (menuItem) => {
      const current = itemsRef.current;
      const existing = current.find((row) => row.menu_item_id === menuItem.id);

      commit(
        existing
          ? current.map((row) =>
              row === existing ? { ...row, quantity: (row.quantity || 0) + 1 } : row
            )
          : [
              ...current,
              {
                menu_item_id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                image_key: menuItem.image_key || null,
                restaurant_id: menuItem.restaurant_id ?? null,
                quantity: 1,
              },
            ]
      );

      return enqueue(() => cartRepo.addItem(menuItem));
    },
    [commit, enqueue]
  );

  // Sets an absolute quantity; 0 or less removes the line.
  const updateQty = useCallback(
    (menuItemId, quantity) => {
      commit(
        quantity <= 0
          ? itemsRef.current.filter((row) => row.menu_item_id !== menuItemId)
          : itemsRef.current.map((row) =>
              row.menu_item_id === menuItemId ? { ...row, quantity } : row
            )
      );
      return enqueue(() => cartRepo.setQuantity(menuItemId, quantity));
    },
    [commit, enqueue]
  );

  const remove = useCallback(
    (menuItemId) => {
      commit(itemsRef.current.filter((row) => row.menu_item_id !== menuItemId));
      return enqueue(() => cartRepo.remove(menuItemId));
    },
    [commit, enqueue]
  );

  const clear = useCallback(() => {
    commit([]);
    setPromo(null);
    return enqueue(() => cartRepo.clear());
  }, [commit, enqueue]);

  // Replaces the whole cart with `lines` ([{ item, quantity }], `item` being a
  // menu_items row). Used by "Reorder".
  const replaceAll = useCallback(
    (lines) => {
      commit(
        lines.map(({ item, quantity }) => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          image_key: item.image_key || null,
          restaurant_id: item.restaurant_id ?? null,
          quantity,
        }))
      );
      return enqueue(() => cartRepo.replaceAll(lines));
    },
    [commit, enqueue]
  );

  // Looks the code up and applies it if it is valid for the current cart.
  // Resolves with { ok: true, promo, discount } or { ok: false, message }.
  const applyPromo = useCallback(async (code) => {
    const normalized = normalizePromo(code);
    if (!normalized) {
      return { ok: false, message: PROMO_MESSAGES.EMPTY };
    }
    if (itemsRef.current.length === 0) {
      return { ok: false, message: "Add a dish to your cart first." };
    }

    try {
      const found = await promoRepo.findByCode(normalized);
      const subtotalNow = itemsRef.current.reduce(
        (sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0),
        0
      );
      const check = validatePromo(found, subtotalNow, Date.now());
      if (!check.ok) {
        return check;
      }
      setPromo(found);
      return { ok: true, promo: found, discount: check.discount };
    } catch (promoError) {
      console.log("promo lookup failed", promoError);
      return { ok: false, message: "Could not check that code. Please try again." };
    }
  }, []);

  const removePromo = useCallback(() => setPromo(null), []);

  useEffect(() => {
    if (!promo || loading) {
      return;
    }
    if (items.length === 0) {
      setPromo(null);
      return;
    }
    const currentSubtotal = items.reduce(
      (sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0),
      0
    );
    const check = validatePromo(promo, currentSubtotal, Date.now());
    if (!check.ok) {
      setPromo(null);
      Toast.show({ type: "info", text1: "Promo removed", text2: check.message });
    }
  }, [promo, items, loading]);

  const getQty = useCallback(
    (menuItemId) =>
      itemsRef.current.find((row) => row.menu_item_id === menuItemId)?.quantity || 0,
    []
  );

  const value = useMemo(() => {
    const count = items.reduce((sum, row) => sum + (row.quantity || 0), 0);
    const subtotal = items.reduce(
      (sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0),
      0
    );

    return {
      items,
      count,
      subtotal,
      loading,
      error,
      promo,
      promoCode: promo ? promo.code : null,
      applyPromo,
      removePromo,
      getQty,
      add,
      updateQty,
      remove,
      clear,
      replaceAll,
      reload,
    };
  }, [
    items,
    loading,
    error,
    promo,
    applyPromo,
    removePromo,
    getQty,
    add,
    updateQty,
    remove,
    clear,
    replaceAll,
    reload,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
