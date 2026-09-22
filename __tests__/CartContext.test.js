import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/database/repositories/cartRepo', () => ({
  list: jest.fn(),
  addItem: jest.fn(),
  setQuantity: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
}));

const cartRepo = require('../src/database/repositories/cartRepo');
const {CartProvider, useCart} = require('../src/Context/CartContext');

const burger = {id: 1, restaurant_id: 5, name: 'Burger', price: 170, image_key: 'food2'};
const pizza = {id: 2, restaurant_id: 5, name: 'Pizza', price: 180, image_key: 'food3'};

// Simulates the cart table so reloads after writes return realistic data.
let table;
const setUpFakeTable = (initial = []) => {
  table = initial.map(row => ({...row}));
  cartRepo.list.mockImplementation(() => Promise.resolve(table.map(row => ({...row}))));
  cartRepo.addItem.mockImplementation(item => {
    const row = table.find(r => r.menu_item_id === item.id);
    if (row) {
      row.quantity += 1;
    } else {
      table.push({
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        image_key: item.image_key,
        restaurant_id: item.restaurant_id ?? null,
        quantity: 1,
      });
    }
    return Promise.resolve();
  });
  cartRepo.setQuantity.mockImplementation((id, quantity) => {
    table = quantity <= 0
      ? table.filter(r => r.menu_item_id !== id)
      : table.map(r => (r.menu_item_id === id ? {...r, quantity} : r));
    return Promise.resolve();
  });
  cartRepo.remove.mockImplementation(id => {
    table = table.filter(r => r.menu_item_id !== id);
    return Promise.resolve();
  });
  cartRepo.clear.mockImplementation(() => {
    table = [];
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

  await run(() => cart.updateQty(1, 5));
  expect(cart.getQty(1)).toBe(5);

  await run(() => cart.updateQty(1, 0));
  expect(cart.items.map(row => row.menu_item_id)).toEqual([2]);
});

it('remove() and clear() empty the cart', async () => {
  await mount();
  await run(() => cart.add(burger));
  await run(() => cart.add(pizza));

  await run(() => cart.remove(1));
  expect(cart.items.map(row => row.menu_item_id)).toEqual([2]);

  await run(() => cart.clear());
  expect(cart.items).toEqual([]);
  expect(cart.count).toBe(0);
  expect(cart.subtotal).toBe(0);
  expect(table).toEqual([]);
});

it('rejects when a write fails and resyncs from the database', async () => {
  await mount();
  cartRepo.addItem.mockImplementationOnce(() => Promise.reject(new Error('disk full')));

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
