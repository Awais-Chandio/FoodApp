import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as cartRepo from "../database/repositories/cartRepo";

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
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      getQty,
      add,
      updateQty,
      remove,
      clear,
      replaceAll,
      reload,
    };
  }, [items, loading, error, getQty, add, updateQty, remove, clear, replaceAll, reload]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
