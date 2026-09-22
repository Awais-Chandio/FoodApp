import { query, queryMany } from "../sql";

const groupRows = (groups, options) => {
  const byGroup = new Map();
  options.forEach((option) => {
    const list = byGroup.get(option.group_id) || [];
    list.push({ ...option, is_default: Boolean(option.is_default) });
    byGroup.set(option.group_id, list);
  });
  return groups.map((group) => ({
    ...group,
    required: Boolean(group.required),
    options: byGroup.get(group.id) || [],
  }));
};

const placeholders = (values) => values.map(() => "?").join(", ");

/** A dish's option groups (in display order), each with its options nested. Two queries, one transaction. */
export const listGroupsForItem = async (menuItemId) => {
  const [groups, options] = await queryMany([
    ["SELECT * FROM option_groups WHERE menu_item_id = ? ORDER BY sort, id", [menuItemId]],
    [
      `SELECT o.* FROM options o
       JOIN option_groups g ON g.id = o.group_id
       WHERE g.menu_item_id = ?
       ORDER BY o.id`,
      [menuItemId],
    ],
  ]);
  return groupRows(groups, options);
};

/** Same, for several dishes at once: a Map of menu item id -> groups. Used by Reorder. */
export const listGroupsForItems = async (menuItemIds) => {
  const ids = [...new Set(menuItemIds)];
  if (!ids.length) {
    return new Map();
  }
  const [groups, options] = await queryMany([
    [`SELECT * FROM option_groups WHERE menu_item_id IN (${placeholders(ids)}) ORDER BY sort, id`, ids],
    [
      `SELECT o.* FROM options o
       JOIN option_groups g ON g.id = o.group_id
       WHERE g.menu_item_id IN (${placeholders(ids)})
       ORDER BY o.id`,
      ids,
    ],
  ]);
  const byItem = new Map();
  groupRows(groups, options).forEach((group) => {
    const list = byItem.get(group.menu_item_id) || [];
    list.push(group);
    byItem.set(group.menu_item_id, list);
  });
  return byItem;
};

/** Ids of the dishes that have any options, so the UI knows to open the sheet. Optionally for one restaurant. */
export const listCustomizableIds = async (restaurantId = null) => {
  const rows = restaurantId
    ? await query(
        `SELECT DISTINCT g.menu_item_id AS id FROM option_groups g
         JOIN menu_items m ON m.id = g.menu_item_id
         WHERE m.restaurant_id = ?`,
        [restaurantId]
      )
    : await query("SELECT DISTINCT menu_item_id AS id FROM option_groups");
  return rows.map((row) => row.id);
};

/** Which of these dish ids have options (for the cart's "Customize" action). */
export const filterCustomizable = async (menuItemIds) => {
  const ids = [...new Set(menuItemIds)];
  if (!ids.length) {
    return [];
  }
  const rows = await query(
    `SELECT DISTINCT menu_item_id AS id FROM option_groups WHERE menu_item_id IN (${placeholders(ids)})`,
    ids
  );
  return rows.map((row) => row.id);
};
