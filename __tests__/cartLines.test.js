const {
  buildCartRow, buildLineKey, defaultSelectionIds, describeOptions, lineLabel, parseSelectedOptions,
  priceWithOptions, reconcileSelection, snapshotOptions, toggleOption, validateSelection,
} = require('../src/utils/cartLines');

const groups = [
  {id: 1, name: 'Size', type: 'single', required: true, max_select: 1, options: [
    {id: 10, name: 'Small', price_delta: -30, is_default: false},
    {id: 11, name: 'Regular', price_delta: 0, is_default: true},
    {id: 12, name: 'Large', price_delta: 60, is_default: false},
  ]},
  {id: 2, name: 'Add-ons', type: 'multi', required: false, max_select: 2, options: [
    {id: 20, name: 'Extra cheese', price_delta: 30, is_default: false},
    {id: 21, name: 'Extra sauce', price_delta: 20, is_default: false},
    {id: 22, name: 'Side salad', price_delta: 40, is_default: false},
  ]},
];
const opt = (id, name, delta, gid = 1, gname = 'Size') => ({id, name, price_delta: delta, group_id: gid, group_name: gname});

describe('line key and price', () => {
  it('is the dish id alone for a plain dish, else the sorted option ids', () => {
    expect(buildLineKey(3)).toBe('3');
    expect(buildLineKey(3, [opt(21, 'x', 0), opt(12, 'y', 0)])).toBe('3:12,21');
    expect(buildLineKey(3, [opt(12, 'y', 0), opt(21, 'x', 0)])).toBe('3:12,21');
    expect(buildLineKey(3, [opt(100, 'a', 0), opt(9, 'b', 0)])).toBe('3:9,100'); // numeric, not text, order
  });

  it('adds every option delta to the base price, including negative ones', () => {
    expect(priceWithOptions(170, [])).toBe(170);
    expect(priceWithOptions(170, [opt(12, 'Large', 60), opt(20, 'Cheese', 30, 2, 'Add-ons')])).toBe(260);
    expect(priceWithOptions(170, [opt(10, 'Small', -30)])).toBe(140);
    expect(priceWithOptions(undefined, [opt(12, 'Large', 60)])).toBe(60);
  });

  it('builds a cart row with the snapshot, sorted by option id', () => {
    const row = buildCartRow({id: 3, name: 'Burger', price: 170, image_key: 'food2', restaurant_id: 1}, [opt(21, 'Sauce', 20, 2, 'Add-ons'), opt(12, 'Large', 60)], 2);
    expect(row).toMatchObject({line_key: '3:12,21', menu_item_id: 3, restaurant_id: 1, base_price: 170, price: 250, quantity: 2, image_key: 'food2'});
    expect(JSON.parse(row.selected_options).map(o => o.name)).toEqual(['Large', 'Sauce']);
  });

  it('describes and parses selections safely', () => {
    expect(describeOptions([opt(21, 'Sauce', 20), opt(12, 'Large', 60)])).toBe('Large, Sauce');
    expect(describeOptions([])).toBe('');
    expect(parseSelectedOptions('not json')).toEqual([]);
    expect(parseSelectedOptions(null)).toEqual([]);
    expect(parseSelectedOptions('{"a":1}')).toEqual([]);
    expect(lineLabel({name: 'Burger', selected_options: JSON.stringify(snapshotOptions([opt(12, 'Large', 60)]))})).toBe('Burger (Large)');
    expect(lineLabel({name: 'Naan', selected_options: '[]'})).toBe('Naan');
  });
});

describe('selection rules', () => {
  it('preselects the default of a required single group', () => {
    expect(defaultSelectionIds(groups)).toEqual([11]);
    expect(validateSelection(groups, [11]).ok).toBe(true);
  });

  it('a required single group with no choice is invalid, with a message', () => {
    const result = validateSelection(groups, []);
    expect(result.ok).toBe(false);
    expect(result.errors[1]).toMatch(/size/i);
  });

  it('single groups swap the choice, and a required one cannot be cleared', () => {
    expect(toggleOption(groups, [11], 1, 12)).toEqual([12]);
    expect(toggleOption(groups, [12], 1, 12)).toEqual([12]);
  });

  it('multi groups toggle and never exceed max_select', () => {
    let ids = [11];
    ids = toggleOption(groups, ids, 2, 20);
    ids = toggleOption(groups, ids, 2, 21);
    expect(ids.sort()).toEqual([11, 20, 21]);
    expect(toggleOption(groups, ids, 2, 22).sort()).toEqual([11, 20, 21]); // at the limit: ignored
    expect(toggleOption(groups, ids, 2, 20).sort()).toEqual([11, 21]); // toggle off
    expect(validateSelection(groups, [11, 20, 21, 22]).ok).toBe(false);
  });

  it('an unknown group changes nothing', () => {
    expect(toggleOption(groups, [11], 99, 1)).toEqual([11]);
  });
});

describe('reconcileSelection (reorder / edit)', () => {
  it('keeps options that still exist', () => {
    const {selected, dropped} = reconcileSelection(groups, [opt(12, 'Large', 60), opt(20, 'Extra cheese', 30, 2, 'Add-ons')]);
    expect(selected.map(o => o.id).sort()).toEqual([12, 20]);
    expect(dropped).toBe(0);
  });

  it('drops removed options, counts them, and re-applies the default for a required group', () => {
    const {selected, dropped} = reconcileSelection(groups, [opt(99, 'Gone', 10), opt(21, 'Extra sauce', 20, 2, 'Add-ons')]);
    expect(dropped).toBe(1);
    expect(selected.map(o => o.id).sort()).toEqual([11, 21]);
  });

  it('uses CURRENT deltas, not the saved ones', () => {
    const repriced = [{...groups[0], options: groups[0].options.map(o => (o.id === 12 ? {...o, price_delta: 80} : o))}];
    expect(reconcileSelection(repriced, [opt(12, 'Large', 60)]).selected[0].price_delta).toBe(80);
  });

  it('a dish that gained a required group gets its default; a dish without groups gets nothing', () => {
    expect(reconcileSelection(groups, []).selected.map(o => o.id)).toEqual([11]);
    expect(reconcileSelection([], [opt(12, 'Large', 60)])).toEqual({selected: [], dropped: 1});
  });
});
