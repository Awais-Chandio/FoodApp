const {
  activeCategoryAt, buildMenuRows, HEADER_HEIGHT, makeGetItemLayout, ROW_HEIGHT,
} = require('../src/utils/menuLayout');

const dish = (id, name, category) => ({id, name, category});
const items = [
  dish(1, 'Kheer', 'Desserts'),
  dish(2, 'Burger', 'Mains'),
  dish(3, 'Wings', 'Starters'),
  dish(4, 'Pizza', 'Mains'),
  dish(5, 'Lassi', 'Drinks'),
  dish(6, 'Mystery', null),
  dish(7, 'Special', 'Chef Picks'),
];

describe('buildMenuRows', () => {
  const {rows, rowOffsets, tabs} = buildMenuRows(items);

  it('orders categories Starters, Mains, Desserts, Drinks, then other names, Other last', () => {
    expect(tabs.map(t => t.category)).toEqual(['Starters', 'Mains', 'Desserts', 'Drinks', 'Other', 'Chef Picks']);
  });

  it('puts a header before each category and keeps the dish order within it', () => {
    expect(rows.map(r => (r.type === 'header' ? `#${r.category}` : r.item.name))).toEqual([
      '#Starters', 'Wings', '#Mains', 'Burger', 'Pizza', '#Desserts', 'Kheer', '#Drinks', 'Lassi', '#Other', 'Mystery', '#Chef Picks', 'Special',
    ]);
    expect(tabs.find(t => t.category === 'Mains').count).toBe(2);
  });

  it('computes fixed offsets from the row heights', () => {
    expect(tabs[0].offset).toBe(0);
    expect(tabs[1].offset).toBe(HEADER_HEIGHT + ROW_HEIGHT); // after Starters (1 dish)
    expect(rowOffsets[2]).toBe(tabs[1].offset);
    expect(rowOffsets[3]).toBe(tabs[1].offset + HEADER_HEIGHT);
    expect(rowOffsets).toHaveLength(rows.length);
  });

  it('getItemLayout matches, and adds the list header height', () => {
    const layout = makeGetItemLayout(rows, rowOffsets, 100);
    expect(layout(null, 0)).toEqual({length: HEADER_HEIGHT, offset: 100, index: 0});
    expect(layout(null, 1)).toEqual({length: ROW_HEIGHT, offset: 100 + HEADER_HEIGHT, index: 1});
  });

  it('handles an empty menu', () => {
    expect(buildMenuRows([])).toEqual({rows: [], rowOffsets: [], tabs: []});
  });
});

describe('activeCategoryAt', () => {
  const {tabs} = buildMenuRows(items);

  it('follows the scroll position, switching slightly before a header reaches the top', () => {
    expect(activeCategoryAt(tabs, 0)).toBe('Starters');
    expect(activeCategoryAt(tabs, tabs[1].offset - 20)).toBe('Starters');
    expect(activeCategoryAt(tabs, tabs[1].offset - 8)).toBe('Mains');
    expect(activeCategoryAt(tabs, tabs[2].offset + 30)).toBe('Desserts');
    expect(activeCategoryAt(tabs, 99999)).toBe('Chef Picks');
  });

  it('is null with no tabs and stays on the first tab above the list', () => {
    expect(activeCategoryAt([], 50)).toBeNull();
    expect(activeCategoryAt(tabs, -500)).toBe('Starters');
  });
});
