import { execute, query, queryMany, transaction } from "../sql";
import * as optionsRepo from "./optionsRepo";
import { parseSelectedOptions, reconcileSelection } from "../../utils/cartLines";
import { PAYMENT_METHOD_IDS } from "../../constants/paymentMethods";
import { computeTotals, normalizePromo, validatePromo } from "../../utils/pricing";
import { statusForElapsed, statusIndex } from "../../utils/orderStatus";
import { validateAddress } from "../../utils/validation";

// Error messages callers can match on (the transaction layer only keeps the message).
export const ORDER_ERRORS = {
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  EMPTY_CART: "EMPTY_CART",
  INVALID_PROMO: "INVALID_PROMO",
  INVALID_PAYMENT_METHOD: "INVALID_PAYMENT_METHOD",
};

const rowsOf = (resultSet) => {
  const rows = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    rows.push(resultSet.rows.item(i));
  }
  return rows;
};

const groupItems = (orders, items) => {
  const byOrder = new Map();
  items.forEach((item) => {
    const list = byOrder.get(item.order_id) || [];
    list.push(item);
    byOrder.set(item.order_id, list);
  });
  return orders.map((order) => ({ ...order, items: byOrder.get(order.id) || [] }));
};

/**
 * Turns the current cart into an order, and empties the cart, in ONE
 * transaction: either the order, its items and the emptied cart all happen, or
 * none of it does. Totals are computed here from the cart rows, never taken
 * from the caller, and the promo is read from the promos table INSIDE the
 * transaction, so a code that expired or no longer applies while the user was
 * checking out is rejected. That rejection is an Error whose message is
 * ORDER_ERRORS.INVALID_PROMO and whose `promoMessage` says why (for example
 * "WELCOME20 expired on 31 Dec 2026."); the cart is left as it was. Resolves
 * with { id, status, total, deliveryFee, discount, promoCode, createdAt }.
 */
export const placeOrder = async ({ userId, address, paymentMethod, promoCode = null }) => {
  if (!userId) {
    throw new Error(ORDER_ERRORS.NOT_LOGGED_IN);
  }
  const addressError = validateAddress(address);
  if (addressError) {
    throw new Error(addressError);
  }
  if (!PAYMENT_METHOD_IDS.includes(paymentMethod)) {
    throw new Error(ORDER_ERRORS.INVALID_PAYMENT_METHOD);
  }

  const requestedPromo = normalizePromo(promoCode);
  const cleanAddress = String(address).trim();

  return transaction((tx, control) => {
    tx.executeSql(
      "SELECT * FROM cart_items ORDER BY id",
      [],
      control.guard((_tx, cartResult) => {
        const lines = rowsOf(cartResult);
        if (lines.length === 0) {
          control.abort(new Error(ORDER_ERRORS.EMPTY_CART));
          return;
        }

        const subtotal = lines.reduce(
          (sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 0),
          0
        );

        // One clock reading for the promo check, the totals and created_at.
        const now = Date.now();

        const insertOrder = (promo) => {
          const totals = computeTotals({
            subtotal,
            itemCount: lines.length,
            promo,
            now,
          });

          tx.executeSql(
            `INSERT INTO orders
               (user_id, status, total, delivery_fee, discount, promo_code,
                address, payment_method, created_at, updated_at)
             VALUES (?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              totals.total,
              totals.deliveryFee,
              totals.discount,
              totals.promoCode,
              cleanAddress,
              paymentMethod,
              now,
              now,
            ],
            control.guard((_tx2, insertResult) => {
              const orderId = insertResult.insertId;

              tx.executeSql(
                `INSERT INTO order_items
                   (order_id, menu_item_id, name, price, quantity, image_key, selected_options, restaurant_id)
                 SELECT ?, menu_item_id, name, price, quantity, image_key, selected_options, restaurant_id
                 FROM cart_items`,
                [orderId]
              );
              tx.executeSql("DELETE FROM cart_items");

              control.resolve({
                id: orderId,
                status: "placed",
                total: totals.total,
                deliveryFee: totals.deliveryFee,
                discount: totals.discount,
                promoCode: totals.promoCode,
                createdAt: now,
              });
            })
          );
        };

        if (!requestedPromo) {
          insertOrder(null);
          return;
        }

        tx.executeSql(
          "SELECT * FROM promos WHERE code = ? COLLATE NOCASE",
          [requestedPromo],
          control.guard((_tx3, promoResult) => {
            const promo = promoResult.rows.length ? promoResult.rows.item(0) : null;
            const check = validatePromo(promo, subtotal, now);
            if (!check.ok) {
              const error = new Error(ORDER_ERRORS.INVALID_PROMO);
              error.promoMessage = check.message;
              control.abort(error);
              return;
            }
            insertOrder(promo);
          })
        );
      })
    );
  });
};

/** One order with its items, only if it belongs to `userId`; otherwise null. */
export const getOrderForUser = async (orderId, userId) => {
  const [orders, items] = await queryMany([
    ["SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]],
    ["SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [orderId]],
  ]);
  return orders.length ? groupItems(orders, items)[0] : null;
};

/** All of a user's orders, newest first, each with its items. Two queries total. */
export const listOrders = async (userId) => {
  const [orders, items] = await queryMany([
    ["SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC", [userId]],
    [
      `SELECT * FROM order_items
       WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)
       ORDER BY id`,
      [userId],
    ],
  ]);
  return groupItems(orders, items);
};

/** A user's newest `limit` orders with their items (two queries). */
export const listRecentOrders = async (userId, limit = 5) => {
  const [orders, items] = await queryMany([
    ["SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?", [userId, limit]],
    [
      `SELECT * FROM order_items
       WHERE order_id IN (
         SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?
       )
       ORDER BY id`,
      [userId, limit],
    ],
  ]);
  return groupItems(orders, items);
};

/** The address of the user's most recent order, or "" if they have none. */
export const getLastAddress = async (userId) => {
  const [row] = await query(
    "SELECT address FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1",
    [userId]
  );
  return row ? row.address : "";
};

/**
 * Moves an order forward to the status it should have by now and saves it.
 * Never moves backwards. The UPDATE only applies if the status is still the one
 * we read, so two screens advancing the same order cannot fight.
 */
export const advanceIfDue = async (order, now = Date.now()) => {
  const target = statusForElapsed(now - order.created_at);
  if (statusIndex(target) <= statusIndex(order.status)) {
    return order;
  }

  await execute(
    "UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND status = ?",
    [target, now, order.id, order.status]
  );
  const [fresh] = await query("SELECT * FROM orders WHERE id = ?", [order.id]);
  return { ...order, ...fresh };
};

export const advanceAllDue = (orders, now = Date.now()) =>
  Promise.all(orders.map((order) => advanceIfDue(order, now)));

/**
 * The dishes of a past order that can still be ordered, at their CURRENT
 * price, as [{ item, quantity, selectedOptions }] for cartRepo.replaceAll.
 * The choices (size, add-ons) are re-applied to the current option groups:
 * options that no longer exist are dropped and counted in `optionsDropped`, and
 * a required group left empty gets its default. `unavailable` counts dishes
 * that were deleted from the menu since. Only for the order's owner.
 */
export const getReorderLines = async (orderId, userId) => {
  const [available, totals] = await queryMany([
    [
      `SELECT oi.quantity AS quantity, oi.selected_options AS selected_options,
              m.id AS id, m.restaurant_id AS restaurant_id,
              m.name AS name, m.price AS price, m.image_key AS image_key
       FROM order_items oi
       JOIN menu_items m ON m.id = oi.menu_item_id
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.order_id = ? AND o.user_id = ?
       ORDER BY oi.id`,
      [orderId, userId],
    ],
    [
      `SELECT COUNT(*) AS count FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.order_id = ? AND o.user_id = ?`,
      [orderId, userId],
    ],
  ]);

  const groupsByItem = await optionsRepo.listGroupsForItems(available.map((row) => row.id));
  let optionsDropped = 0;
  const lines = available.map(({ quantity, selected_options: saved, ...item }) => {
    const { selected, dropped } = reconcileSelection(
      groupsByItem.get(item.id) || [],
      parseSelectedOptions(saved)
    );
    optionsDropped += dropped;
    return { item, quantity, selectedOptions: selected };
  });
  return { lines, unavailable: totals[0].count - lines.length, optionsDropped };
};
