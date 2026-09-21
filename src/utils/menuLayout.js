import { MENU_CATEGORIES } from "../database/seedData";

// The Menu list has fixed-height rows, so a category's scroll position is known
// without measuring. That is what lets the category tabs jump to a section.
export const HEADER_HEIGHT = 48;
export const ROW_HEIGHT = 144;

const categoryOf = (item) => item.category || "Other";

const categoryRank = (category) => {
  const index = MENU_CATEGORIES.indexOf(category);
  return index === -1 ? MENU_CATEGORIES.length - 1 + 0.5 : index; // unknown: just before... after Other
};

/**
 * Groups dishes by category (in MENU_CATEGORIES order) into flat list rows.
 * @returns {{ rows: Array, rowOffsets: number[], tabs: Array<{category, count, offset}> }}
 *   rows: { type: "header", key, category, count } | { type: "dish", key, item }.
 *   rowOffsets[i] is the y of row i; tabs[i].offset is the y of its header.
 */
export const buildMenuRows = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const category = categoryOf(item);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push(item);
  });

  const categories = [...groups.keys()].sort(
    (a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b)
  );

  const rows = [];
  const rowOffsets = [];
  const tabs = [];
  let y = 0;
  categories.forEach((category) => {
    const dishes = groups.get(category);
    tabs.push({ category, count: dishes.length, offset: y });
    rowOffsets.push(y);
    rows.push({ type: "header", key: `h-${category}`, category, count: dishes.length });
    y += HEADER_HEIGHT;
    dishes.forEach((item) => {
      rowOffsets.push(y);
      rows.push({ type: "dish", key: `d-${item.id}`, item });
      y += ROW_HEIGHT;
    });
  });

  return { rows, rowOffsets, tabs };
};

/** getItemLayout for the rows above, with `headerOffset` px of list header before them. */
export const makeGetItemLayout = (rows, rowOffsets, headerOffset = 0) => (_data, index) => ({
  length: rows[index]?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT,
  offset: headerOffset + (rowOffsets[index] ?? 0),
  index,
});

/**
 * The category whose section contains the scroll position `y` (measured from the
 * top of the rows). `slack` makes a tab switch a little before its header reaches the top.
 */
export const activeCategoryAt = (tabs, y, slack = 8) => {
  let active = tabs.length ? tabs[0].category : null;
  tabs.forEach((tab) => {
    if (y + slack >= tab.offset) {
      active = tab.category;
    }
  });
  return active;
};
