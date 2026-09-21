import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/database/repositories/cartRepo', () => ({
  list: jest.fn(),
  addLine: jest.fn(),
  replaceLine: jest.fn(),
  setQuantity: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  replaceAll: jest.fn(),
}));

jest.mock('../src/database/repositories/promoRepo', () => ({findByCode: jest.fn()}));
jest.mock('react-native-toast-message', () => ({__esModule: true, default: {show: jest.fn()}}));

const cartRepo = require('../src/database/repositories/cartRepo');
const promoRepo = require('../src/database/repositories/promoRepo');
const Toast = require('react-native-toast-message').default;
const {CartProvider, useCart} = require('../src/Context/CartContext');

const burger = {id: 1, restaurant_id: 5, name: 'Burger', price: 170, image_key: 'food2'};
const pizza = {id: 2, restaurant_id: 5, name: 'Pizza', price: 180, image_key: 'food3'};

const {buildCartRow} = require('../src/utils/cartLines');

// Simulates the cart_items table so reloads after writes return realistic data.
let table;
const upsert = row => {
  const existing = table.find(r => r.line_key === row.line_key);
  if (existing) {
    existing.quantity += row.quantity;
  } else {
    table.push({...row});
  }
};
const setUpFakeTable = (initial = []) => {
  table = initial.map(row => ({line_key: String(row.menu_item_id), selected_options: '[]', ...row}));
  cartRepo.list.mockImplementation(() => Promise.resolve(table.map(row => ({...row}))));
  cartRepo.addLine.mockImplementation((item, options = [], quantity = 1) => {
    upsert(buildCartRow(item, options, quantity));
    return Promise.resolve();
  });
  cartRepo.replaceLine.mockImplementation((oldKey, item, options, quantity) => {
    table = table.filter(r => r.line_key !== oldKey);
    upsert(buildCartRow(item, options, quantity));
    return Promise.resolve();
  });
  cartRepo.setQuantity.mockImplementation((key, quantity) => {
    table = quantity <= 0
      ? table.filter(r => r.line_key !== key)
      : table.map(r => (r.line_key === key ? {...r, quantity} : r));
    return Promise.resolve();
  });
  cartRepo.remove.mockImplementation(key => {
    table = table.filter(r => r.line_key !== key);
    return Promise.resolve();
  });
  cartRepo.clear.mockImplementation(() => {
    table = [];
    return Promise.resolve();
  });
  cartRepo.replaceAll.mockImplementation(lines => {
    table = [];
    lines.forEach(({item, quantity, selectedOptions = []}) => upsert(buildCartRow(item, selectedOptions, quantity)));
    return Promise.resolve();
  });
};

let cart;
const Probe = () => {
  cart = useCart();
  return null;
};

const mount = async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
  });
};

const run = fn => ReactTestRenderer.act(async () => fn());

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  setUpFakeTable();
});

afterEach(() => {
  console.log.mockRestore();
});

it('starts loading, then exposes the stored cart with count and subtotal', async () => {
  setUpFakeTable([
    {menu_item_id: 1, name: 'Burger', price: 170, quantity: 2},
    {menu_item_id: 2, name: 'Pizza', price: 180, quantity: 1},
  ]);

  await mount();

  expect(cart.loading).toBe(false);
  expect(cart.items).toHaveLength(2);
  expect(cart.count).toBe(3); // sum of quantities
  expect(cart.subtotal).toBe(170 * 2 + 180);
});

it('add() inserts a new line, then increments an existing one', async () => {
  await mount();

  await run(() => cart.add(burger));
  expect(cart.items).toHaveLength(1);
  expect(cart.getQty(1)).toBe(1);

  await run(() => cart.add(burger));
  expect(cart.items).toHaveLength(1);
  expect(cart.getQty(1)).toBe(2);
  expect(cart.count).toBe(2);
  expect(cart.subtotal).toBe(340);
});

it('keeps the restaurant_id on the line (schema only, no rule yet)', async () => {
  await mount();

  await run(() => cart.add(burger));

  expect(cart.items[0].restaurant_id).toBe(5);
});

it('applies two rapid adds in the same tick without losing one', async () => {
  await mount();

  await run(async () => {
    const first = cart.add(burger);
    const second = cart.add(burger); // before the first write has finished
    await Promise.all([first, second]);
  });

  expect(cart.getQty(1)).toBe(2);
  expect(table[0].quantity).toBe(2); // the database agrees
});

it('updateQty() sets an absolute quantity and removes the line at 0', async () => {
  await mount();
  await run(() => cart.add(burger));
  await run(() => cart.add(pizza));

  await run(() => cart.updateQty('1', 5));
  expect(cart.getQty(1)).toBe(5);

  await run(() => cart.updateQty('1', 0));
  expect(cart.items.map(row => row.menu_item_id)).toEqual([2]);
});

it('remove() and clear() empty the cart', async () => {
  await mount();
  await run(() => cart.add(burger));
  await run(() => cart.add(pizza));

  await run(() => cart.remove('1'));
  expect(cart.items.map(row => row.menu_item_id)).toEqual([2]);

  await run(() => cart.clear());
  expect(cart.items).toEqual([]);
  expect(cart.count).toBe(0);
  expect(cart.subtotal).toBe(0);
  expect(table).toEqual([]);
});

it('replaceAll() swaps the whole cart for the given lines', async () => {
  await mount();
  await run(() => cart.add(burger));
  await run(() => cart.add(burger));

  await run(() => cart.replaceAll([{item: pizza, quantity: 3}]));

  expect(cart.items.map(row => [row.menu_item_id, row.quantity])).toEqual([[2, 3]]);
  expect(cart.count).toBe(3);
  expect(cart.subtotal).toBe(540);
  expect(table).toHaveLength(1); // the database agrees
});

it('rejects when a write fails and resyncs from the database', async () => {
  await mount();
  cartRepo.addLine.mockImplementationOnce(() => Promise.reject(new Error('disk full')));

  let failure;
  await run(async () => {
    try {
      await cart.add(burger);
    } catch (error) {
      failure = error;
    }
  });

  expect(failure.message).toBe('disk full');
  // The optimistic line is rolled back because nothing was stored.
  expect(cart.items).toEqual([]);
});

it('useCart throws a clear error outside the provider', async () => {
  let caught;
  class Boundary extends React.Component {
    state = {failed: false};
    static getDerivedStateFromError(error) {
      caught = error;
      return {failed: true};
    }
    render() {
      return this.state.failed ? null : this.props.children;
    }
  }
  const Broken = () => {
    useCart();
    return null;
  };
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <Boundary>
        <Broken />
      </Boundary>,
    );
  });

  expect(caught.message).toBe('useCart must be used inside a CartProvider');
  console.error.mockRestore();
});

describe('lines with options', () => {
  const large = {id: 12, name: 'Large', price_delta: 60, group_id: 4, group_name: 'Size'};
  const small = {id: 10, name: 'Small', price_delta: -30, group_id: 4, group_name: 'Size'};
  const cheese = {id: 20, name: 'Extra cheese', price_delta: 30, group_id: 5, group_name: 'Add-ons'};

  it('the same dish with different options is two lines; identical choices merge', async () => {
    await mount();
    await run(() => cart.add(burger, {selectedOptions: [large]}));
    await run(() => cart.add(burger, {selectedOptions: [small]}));
    await run(() => cart.add(burger, {selectedOptions: [large]}));

    expect(cart.items.map(l => [l.line_key, l.quantity, l.price])).toEqual([
      ['1:12', 2, 230],
      ['1:10', 1, 140],
    ]);
    expect(cart.count).toBe(3);
    expect(cart.subtotal).toBe(2 * 230 + 140);
    expect(table.map(r => r.line_key)).toEqual(['1:12', '1:10']);
  });

  it('option order does not matter for the line key', async () => {
    await mount();
    await run(() => cart.add(burger, {selectedOptions: [cheese, large]}));
    await run(() => cart.add(burger, {selectedOptions: [large, cheese]}));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({line_key: '1:12,20', quantity: 2, price: 260, base_price: 170});
  });

  it('getQty is the total across all lines of a dish; getLineQty is per line', async () => {
    await mount();
    await run(() => cart.add(burger, {selectedOptions: [large], quantity: 2}));
    await run(() => cart.add(burger));
    expect(cart.getQty(1)).toBe(3);
    expect(cart.getLineQty('1:12')).toBe(2);
    expect(cart.getLineQty('1')).toBe(1);
  });

  it('updateQty and remove act on one line only', async () => {
    await mount();
    await run(() => cart.add(burger, {selectedOptions: [large]}));
    await run(() => cart.add(burger));

    await run(() => cart.updateQty('1:12', 4));
    expect(cart.getLineQty('1:12')).toBe(4);
    expect(cart.getLineQty('1')).toBe(1);

    await run(() => cart.remove('1:12'));
    expect(cart.items.map(l => l.line_key)).toEqual(['1']);
  });

  it('replaceLine turns a line into another choice, and merges with an existing line', async () => {
    await mount();
    await run(() => cart.add(pizza));
    await run(() => cart.add(burger, {selectedOptions: [large]}));
    await run(() => cart.add(burger, {selectedOptions: [small]}));

    await run(() => cart.replaceLine('1:12', burger, [cheese], 3));
    expect(cart.items.map(l => [l.line_key, l.quantity])).toEqual([['2', 1], ['1:10', 1], ['1:20', 3]]);

    // choosing the same combination as another line merges the two
    await run(() => cart.replaceLine('1:20', burger, [small], 2));
    expect(cart.items.map(l => [l.line_key, l.quantity])).toEqual([['2', 1], ['1:10', 3]]);
    expect(table.map(r => [r.line_key, r.quantity])).toEqual([['2', 1], ['1:10', 3]]);
  });

  it('replaceAll keeps the chosen options of reordered lines', async () => {
    await mount();
    await run(() => cart.replaceAll([{item: burger, quantity: 2, selectedOptions: [large, cheese]}]));
    expect(cart.items[0]).toMatchObject({line_key: '1:12,20', quantity: 2, price: 260});
    expect(JSON.parse(cart.items[0].selected_options).map(o => o.name)).toEqual(['Large', 'Extra cheese']);
  });
});

describe('applied promo', () => {
  const save10 = {code: 'SAVE10', percent: 10, min_order: 0, expires_at: null};
  const welcome = {code: 'WELCOME20', percent: 20, min_order: 400, expires_at: null};
  const promos = {SAVE10: save10, WELCOME20: welcome};

  beforeEach(() => {
    promoRepo.findByCode.mockImplementation(code =>
      Promise.resolve(promos[String(code).trim().toUpperCase()] || null),
    );
  });

  it('starts without a promo', async () => {
    await mount();
    expect(cart.promo).toBeNull();
    expect(cart.promoCode).toBeNull();
  });

  it('applyPromo holds a valid promo in the context', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 2}]);
    await mount();

    let result;
    await run(async () => {
      result = await cart.applyPromo(' save10 ');
    });

    expect(result).toEqual({ok: true, promo: save10, discount: 34});
    expect(cart.promoCode).toBe('SAVE10');
    expect(cart.promo).toBe(save10);
  });

  it('reports empty input, an unknown code, and an empty cart without applying anything', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 1}]);
    await mount();

    let empty;
    let unknown;
    await run(async () => {
      empty = await cart.applyPromo('   ');
      unknown = await cart.applyPromo('NOPE');
    });
    expect(empty).toEqual({ok: false, message: 'Enter a promo code first.'});
    expect(unknown).toEqual({ok: false, message: "We couldn't find that code."});
    expect(cart.promo).toBeNull();

    setUpFakeTable([]);
    await run(() => cart.reload());
    let noItems;
    await run(async () => {
      noItems = await cart.applyPromo('SAVE10');
    });
    expect(noItems.ok).toBe(false);
    expect(cart.promo).toBeNull();
  });

  it('refuses a code whose minimum order is not met', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 1}]);
    await mount();

    let result;
    await run(async () => {
      result = await cart.applyPromo('WELCOME20');
    });

    expect(result).toEqual({ok: false, message: 'Add Rs. 230 more to use WELCOME20.'});
    expect(cart.promo).toBeNull();
  });

  it('removes the promo, with a toast saying why, when the subtotal drops below the minimum', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 3}]); // 510
    await mount();
    await run(() => cart.applyPromo('WELCOME20'));
    expect(cart.promoCode).toBe('WELCOME20');

    await run(() => cart.updateQty('1', 2)); // 340 < 400

    expect(cart.promo).toBeNull();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({text1: 'Promo removed', text2: 'Add Rs. 60 more to use WELCOME20.'}),
    );
  });

  it('keeps the promo while the subtotal still qualifies', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 3}]);
    await mount();
    await run(() => cart.applyPromo('SAVE10'));

    await run(() => cart.updateQty('1', 1));

    expect(cart.promoCode).toBe('SAVE10');
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('removePromo() clears it', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 1}]);
    await mount();
    await run(() => cart.applyPromo('SAVE10'));

    await run(async () => cart.removePromo());

    expect(cart.promo).toBeNull();
  });

  it('clears silently when the cart becomes empty (order placed, cart cleared, logout)', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 1}]);
    await mount();
    await run(() => cart.applyPromo('SAVE10'));

    await run(() => cart.clear());

    expect(cart.promo).toBeNull();
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('clears when the table is emptied behind its back (placeOrder empties the cart in SQL)', async () => {
    setUpFakeTable([{menu_item_id: 1, name: 'Burger', price: 170, quantity: 1}]);
    await mount();
    await run(() => cart.applyPromo('SAVE10'));

    setUpFakeTable([]);
    await run(() => cart.reload());

    expect(cart.promo).toBeNull();
    expect(Toast.show).not.toHaveBeenCalled();
  });
});
