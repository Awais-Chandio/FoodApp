import { batch, execute, query } from "../sql";
import { buildCartRow } from "../../utils/cartLines";

// A cart line is a dish plus one exact combination of options, identified by
// its line_key (see utils/cartLines). Plain dishes have line_key = String(id).

export const list = () => query("SELECT * FROM cart_items ORDER BY id");

const INSERT_LINE = `INSERT INTO cart_items
  (line_key, menu_item_id, restaurant_id, name, base_price, price, selected_options, image_key, quantity)
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
  WHERE NOT EXISTS (SELECT 1 FROM cart_items WHERE line_key = ?)`;

// Adds `row.quantity` to the line if it exists, otherwise inserts it. Both
// statements are meant to run in one transaction.
const upsertStatements = (row) => [
  ["UPDATE cart_items SET quantity = quantity + ? WHERE line_key = ?", [row.quantity, row.line_key]],
  [
    INSERT_LINE,
    [
      row.line_key,
      row.menu_item_id,
      row.restaurant_id,
      row.name,
      row.base_price,
      row.price,
      row.selected_options,
      row.image_key,
      row.quantity,
      row.line_key,
    ],
  ],
];

/**
 * Adds `quantity` of a dish with the chosen options: increments the matching
 * line, otherwise inserts a new one. `item` is a menu_items row and
 * `selectedOptions` a list of selected options (see utils/cartLines).
 */
export const addLine = (item, selectedOptions = [], quantity = 1) => {
  // TODO(me): enforce the single-restaurant rule here. Compare
  // item.restaurant_id with the restaurant already in the cart before adding.
  return batch(upsertStatements(buildCartRow(item, selectedOptions, quantity)));
};

/** One unit of a plain dish. */
export const addItem = (item) => addLine(item, [], 1);

/**
 * Replaces one line with another choice of options and quantity, in one
 * transaction. If the new choice matches a different existing line the two merge.
 */
export const replaceLine = (oldLineKey, item, selectedOptions, quantity) => {
  const row = buildCartRow(item, selectedOptions, quantity);
  return batch([
    ["DELETE FROM cart_items WHERE line_key = ?", [oldLineKey]],
    ...upsertStatements(row),
  ]);
};

/** Sets an absolute quantity. A quantity of 0 or less removes the line. */
export const setQuantity = (lineKey, quantity) => {
  if (quantity <= 0) {
    return remove(lineKey);
  }
  return execute("UPDATE cart_items SET quantity = ? WHERE line_key = ?", [quantity, lineKey]);
};

/**
 * Atomically adds `delta` to a line's quantity (delta may be negative).
 * Lines that drop to 0 or below are deleted. Safe against rapid repeated taps.
 */
export const changeQuantity = (lineKey, delta) =>
  batch([
    ["UPDATE cart_items SET quantity = quantity + ? WHERE line_key = ?", [delta, lineKey]],
    ["DELETE FROM cart_items WHERE quantity <= 0 AND line_key = ?", [lineKey]],
  ]);

export const remove = (lineKey) => execute("DELETE FROM cart_items WHERE line_key = ?", [lineKey]);

export const clear = () => execute("DELETE FROM cart_items");

/**
 * Replaces the whole cart with `lines` ([{ item, quantity, selectedOptions? }],
 * `item` being a menu_items row) in one transaction. Used by "Reorder".
 */
export const replaceAll = (lines) =>
  batch([
    ["DELETE FROM cart_items"],
    ...lines.flatMap(({ item, quantity, selectedOptions = [] }) =>
      upsertStatements(buildCartRow(item, selectedOptions, quantity))
    ),
  ]);
