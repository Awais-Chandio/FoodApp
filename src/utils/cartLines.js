// Pure helpers for cart lines with chosen options (size, add-ons). A "line" is a
// dish plus one exact combination of options: two Burgers with different sizes
// are two lines, identical choices merge into one.
//
// An option group looks like { id, name, type: "single" | "multi", required,
// max_select, options: [{ id, name, price_delta, is_default }] }. A selected
// option is { id, name, price_delta, group_id, group_name }.

/** The line's identity: the dish id, plus the sorted option ids when there are any. */
export const buildLineKey = (menuItemId, selectedOptions = []) => {
  const ids = selectedOptions.map((option) => Number(option.id)).sort((a, b) => a - b);
  return ids.length ? `${menuItemId}:${ids.join(",")}` : String(menuItemId);
};

/** Base price plus every chosen option's price change (deltas may be negative). */
export const priceWithOptions = (basePrice, selectedOptions = []) =>
  Number(basePrice || 0) +
  selectedOptions.reduce((sum, option) => sum + Number(option.price_delta || 0), 0);

/** What is stored with a cart or order line, so history survives menu edits. */
export const snapshotOptions = (selectedOptions = []) =>
  [...selectedOptions]
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(({ id, name, price_delta, group_id, group_name }) => ({
      id,
      name,
      price_delta: Number(price_delta || 0),
      group_id,
      group_name,
    }));

export const parseSelectedOptions = (json) => {
  try {
    const value = typeof json === "string" ? JSON.parse(json) : json;
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
};

/** "Large, Extra cheese" (empty string for a plain dish). */
export const describeOptions = (selectedOptions = []) =>
  snapshotOptions(selectedOptions)
    .map((option) => option.name)
    .join(", ");

/** A cart_items row for `quantity` of `item` (a menu_items row) with these options. */
export const buildCartRow = (item, selectedOptions = [], quantity = 1) => ({
  line_key: buildLineKey(item.id, selectedOptions),
  menu_item_id: item.id,
  restaurant_id: item.restaurant_id ?? null,
  name: item.name,
  base_price: item.price,
  price: priceWithOptions(item.price, selectedOptions),
  selected_options: JSON.stringify(snapshotOptions(selectedOptions)),
  image_key: item.image_key || null,
  quantity,
});

const flatten = (groups) =>
  groups.flatMap((group) =>
    group.options.map((option) => ({
      ...option,
      group_id: group.id,
      group_name: group.name,
    }))
  );

/** Selected option objects for a list of option ids (unknown ids are ignored). */
export const optionsByIds = (groups, ids) => {
  const wanted = new Set(ids.map(Number));
  return flatten(groups).filter((option) => wanted.has(Number(option.id)));
};

/** Ids of the default options, so a required group is valid the moment the sheet opens. */
export const defaultSelectionIds = (groups) =>
  groups.flatMap((group) => {
    const defaults = group.options.filter((option) => option.is_default);
    if (group.type === "single") {
      const chosen = defaults[0] || (group.required ? group.options[0] : null);
      return chosen ? [chosen.id] : [];
    }
    return defaults.slice(0, group.max_select || defaults.length).map((option) => option.id);
  });

/**
 * Applies a tap on one option and returns the new list of selected ids.
 * Single: picks it (tapping the chosen one again clears it unless the group is
 * required). Multi: toggles it, but never beyond max_select.
 */
export const toggleOption = (groups, selectedIds, groupId, optionId) => {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (!group) {
    return selectedIds;
  }
  const inGroup = new Set(group.options.map((option) => option.id));
  const others = selectedIds.filter((id) => !inGroup.has(id));
  const current = selectedIds.filter((id) => inGroup.has(id));
  const isSelected = current.includes(optionId);

  if (group.type === "single") {
    if (isSelected) {
      return group.required ? selectedIds : others;
    }
    return [...others, optionId];
  }

  if (isSelected) {
    return [...others, ...current.filter((id) => id !== optionId)];
  }
  if (group.max_select && current.length >= group.max_select) {
    return selectedIds;
  }
  return [...others, ...current, optionId];
};

/** { ok, errors: { [groupId]: message } } for a set of selected ids. */
export const validateSelection = (groups, selectedIds) => {
  const errors = {};
  groups.forEach((group) => {
    const count = group.options.filter((option) => selectedIds.includes(option.id)).length;
    if (group.required && count === 0) {
      errors[group.id] = `Choose ${group.type === "single" ? "one" : "at least one"} ${group.name.toLowerCase()} option.`;
    } else if (group.type === "single" && count > 1) {
      errors[group.id] = `Choose only one ${group.name.toLowerCase()} option.`;
    } else if (group.type === "multi" && group.max_select && count > group.max_select) {
      errors[group.id] = `Choose up to ${group.max_select} ${group.name.toLowerCase()}.`;
    }
  });
  return { ok: Object.keys(errors).length === 0, errors };
};

/**
 * Re-applies a saved choice to the CURRENT option groups (for Reorder and for
 * editing). Options that no longer exist are dropped and counted, and a
 * required group left empty falls back to its default.
 * @returns {{ selected: Array, dropped: number }}
 */
export const reconcileSelection = (groups, savedOptions) => {
  const available = flatten(groups);
  const kept = savedOptions
    .map((saved) => available.find((option) => Number(option.id) === Number(saved.id)))
    .filter(Boolean);
  const dropped = savedOptions.length - kept.length;

  let ids = kept.map((option) => option.id);
  groups.forEach((group) => {
    const chosen = group.options.some((option) => ids.includes(option.id));
    if (group.required && !chosen) {
      ids = [...ids, ...defaultSelectionIds([group])];
    }
  });

  return { selected: optionsByIds(groups, ids), dropped };
};

/** "Burger Deluxe (Large, Extra cheese)" for an order or cart line. */
export const lineLabel = (line) => {
  const details = describeOptions(parseSelectedOptions(line.selected_options));
  return details ? `${line.name} (${details})` : line.name;
};
