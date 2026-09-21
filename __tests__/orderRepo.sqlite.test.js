/**
 * Runs the real migrations and repositories against a real (in-memory) SQLite
 * database through jest/sqliteStorageAdapter.js. Skipped on Node versions
 * without node:sqlite.
 */
jest.mock('react-native-sqlite-storage', () => require('../jest/sqliteStorageAdapter'));
jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = require('crypto');
  return {
    Buffer: require('buffer').Buffer,
    pbkdf2: nodeCrypto.pbkdf2,
    randomBytes: nodeCrypto.randomBytes,
    timingSafeEqual: nodeCrypto.timingSafeEqual,
  };
});

const {sqliteAvailable} = require('../jest/sqliteStorageAdapter');
const {MENU_BY_RESTAURANT, MENU_SEED, RESTAURANT_SEED} = require('../src/database/seedData');
const describeSqlite = sqliteAvailable ? describe : describe.skip;

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterAll(() => console.log.mockRestore());

const USER = 7;
const ADDRESS = 'House 12, Street 4, Clifton, Karachi';

// Fresh module registry = fresh in-memory database and fresh init promise.
const load = () => {
  let modules;
  jest.isolateModules(() => {
    modules = {
      client: require('../src/database/client'),
      schema: require('../src/database/schema'),
      orders: require('../src/database/repositories/orderRepo'),
      cart: require('../src/database/repositories/cartRepo'),
      menu: require('../src/database/repositories/menuRepo'),
      restaurants: require('../src/database/repositories/restaurantRepo'),
      promos: require('../src/database/repositories/promoRepo'),
      options: require('../src/database/repositories/optionsRepo'),
    };
  });
  modules.raw = modules.client.default.raw;
  return modules;
};

const count = (raw, table) => raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

// Westway's first four seeded dishes: Moonland Special 210, Burger Deluxe 170, Veggie Supreme 150, Margherita 180.
const fillCart = async m => {
  await m.schema.initDatabase();
  const menu = await m.menu.listByRestaurant(1);
  const byName = name => menu.find(item => item.name === name);
  await m.cart.addItem(byName('Burger Deluxe'));
  await m.cart.addItem(byName('Burger Deluxe'));
  await m.cart.addItem(byName('Margherita Pizza'));
  return menu;
};

describeSqlite('schema on real SQLite', () => {
  it('creates everything on a fresh database and seeds it', async () => {
    const m = load();
    await m.schema.initDatabase();

    const version = m.raw.prepare('PRAGMA user_version').get().user_version;
    expect(version).toBe(9);
    expect(count(m.raw, 'orders')).toBe(0);
    expect(count(m.raw, 'order_items')).toBe(0);
    expect(count(m.raw, 'restaurants')).toBe(6);
    expect(count(m.raw, 'menu_items')).toBe(MENU_SEED.length);
    expect(count(m.raw, 'promos')).toBe(3);
    const admin = m.raw.prepare("SELECT password, password_hash FROM users WHERE role = 'admin'").get();
    expect(admin.password).toBeNull();
    expect(admin.password_hash).toMatch(/^pbkdf2-sha256\$/);
  });

  it('upgrades a pre-versioning install, keeping its data', async () => {
    const m = load();
    // The schema exactly as it was before any migration existed, with real data.
    m.raw.exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user');
      CREATE TABLE admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
      CREATE TABLE restaurants (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rating REAL, time TEXT, offer TEXT, category TEXT, image_path TEXT);
      CREATE TABLE menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id INTEGER, name TEXT, price REAL, type TEXT, image_key TEXT);
      CREATE TABLE cart (id INTEGER PRIMARY KEY AUTOINCREMENT, menu_item_id INTEGER UNIQUE, name TEXT, price REAL, image_key TEXT, quantity INTEGER);
      INSERT INTO users (email, password, role) VALUES ('admin@foodapp.com', 'admin123', 'admin');
      INSERT INTO users (email, password, role) VALUES ('sam@x.com', 'pw', 'user');
      INSERT INTO restaurants (id, name, rating, time, offer, category) VALUES (1, 'Mine', 4.5, '10 min', NULL, 'nearest');
      INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (1, 'Kept Dish', 99, NULL, 'food1');
      INSERT INTO cart (menu_item_id, name, price, image_key, quantity) VALUES (1, 'Kept Dish', 99, 'food1', 3);
    `);

    await m.schema.initDatabase();

    expect(m.raw.prepare('PRAGMA user_version').get().user_version).toBe(9);
    expect(count(m.raw, 'restaurants')).toBe(1); // not reseeded over existing data
    expect(count(m.raw, 'menu_items')).toBe(1);
    const cartRow = m.raw.prepare('SELECT * FROM cart_items').get();
    expect(cartRow.quantity).toBe(3);
    expect(cartRow).toMatchObject({line_key: '1', menu_item_id: 1, name: 'Kept Dish', base_price: 99, price: 99, selected_options: '[]'});
    expect(cartRow.restaurant_id).toBeNull();
    expect(m.raw.prepare("SELECT name FROM sqlite_master WHERE name = 'cart'").get()).toBeUndefined(); // old table dropped
    expect(count(m.raw, 'orders')).toBe(0);
    // Legacy plaintext is still there for the later upgrade pass, and the new column exists.
    const sam = m.raw.prepare("SELECT password, password_hash FROM users WHERE email = 'sam@x.com'").get();
    expect(sam).toEqual({password: 'pw', password_hash: null});
  });
});

describeSqlite('runTransaction rollback rules', () => {
  it('rolls everything back when a callback THROWS (the library would only log it)', async () => {
    const m = load();
    await m.schema.initDatabase();

    await expect(
      m.client.runTransaction((tx, control) => {
        tx.executeSql(
          "INSERT INTO restaurants (name, category) VALUES ('Ghost', 'nearest')",
          [],
          control.guard(() => {
            throw new Error('bug in a callback');
          }),
        );
      }),
    ).rejects.toThrow('bug in a callback');

    expect(m.raw.prepare("SELECT COUNT(*) AS n FROM restaurants WHERE name = 'Ghost'").get().n).toBe(0);
  });

  it('WITHOUT guard a throwing callback silently commits (documents the library trap)', async () => {
    const m = load();
    await m.schema.initDatabase();

    await m.client.runTransaction(tx => {
      tx.executeSql(
        "INSERT INTO restaurants (name, category) VALUES ('Ghost', 'nearest')",
        [],
        () => {
          throw new Error('swallowed');
        },
      );
    });

    expect(m.raw.prepare("SELECT COUNT(*) AS n FROM restaurants WHERE name = 'Ghost'").get().n).toBe(1);
  });
});

describeSqlite('orderRepo.placeOrder on real SQLite', () => {
  it('creates the order, snapshots the items and empties the cart in one go', async () => {
    const m = load();
    await fillCart(m); // Burger x2 (340) + Pizza x1 (180) = 520

    const placed = await m.orders.placeOrder({
      userId: USER,
      address: `  ${ADDRESS}  `,
      paymentMethod: 'cod',
      promoCode: 'save10',
    });

    // 520 subtotal + 120 delivery - 52 discount
    expect(placed).toMatchObject({status: 'placed', total: 588, deliveryFee: 120, discount: 52, promoCode: 'SAVE10'});

    const order = m.raw.prepare('SELECT * FROM orders WHERE id = ?').get(placed.id);
    expect(order).toMatchObject({
      user_id: USER,
      status: 'placed',
      total: 588,
      delivery_fee: 120,
      discount: 52,
      promo_code: 'SAVE10',
      address: ADDRESS, // trimmed
      payment_method: 'cod',
    });
    expect(order.created_at).toBe(order.updated_at);

    const items = m.raw.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(placed.id);
    expect(items.map(i => [i.name, i.price, i.quantity])).toEqual([
      ['Burger Deluxe', 170, 2],
      ['Margherita Pizza', 180, 1],
    ]);
    expect(count(m.raw, 'cart_items')).toBe(0);
  });

  it('leaves order history intact after the menu changes', async () => {
    const m = load();
    const menu = await fillCart(m);
    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});

    m.raw.prepare('UPDATE menu_items SET price = 999, name = ? WHERE id = ?').run('Renamed', menu[1].id);
    m.raw.prepare('DELETE FROM menu_items WHERE name = ?').run('Margherita Pizza');

    const order = await m.orders.getOrderForUser(placed.id, USER);
    expect(order.items.map(i => [i.name, i.price])).toEqual([
      ['Burger Deluxe', 170],
      ['Margherita Pizza', 180],
    ]);
  });

  it('rejects an empty cart and writes nothing', async () => {
    const m = load();
    await m.schema.initDatabase();

    await expect(
      m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'}),
    ).rejects.toThrow('EMPTY_CART');
    expect(count(m.raw, 'orders')).toBe(0);
  });

  it('rejects an invalid promo without touching the cart or creating an order', async () => {
    const m = load();
    await fillCart(m);

    await expect(
      m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod', promoCode: 'BOGUS'}),
    ).rejects.toThrow('INVALID_PROMO');

    expect(count(m.raw, 'orders')).toBe(0);
    expect(count(m.raw, 'cart_items')).toBe(2);
  });

  it('re-reads the promo inside the transaction: an expired code is rejected with the reason', async () => {
    const m = load();
    await fillCart(m);
    m.raw.prepare("UPDATE promos SET expires_at = ? WHERE code = 'SAVE10'").run(Date.now() - 1000);

    const error = await m.orders
      .placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod', promoCode: 'save10'})
      .catch(e => e);

    expect(error.message).toBe('INVALID_PROMO');
    expect(error.promoMessage).toMatch(/^SAVE10 expired on \d{1,2} \w{3} \d{4}\.$/);
    expect(count(m.raw, 'orders')).toBe(0);
    expect(count(m.raw, 'cart_items')).toBe(2); // cart stays intact
  });

  it('rejects a code whose minimum order is not met, naming the shortfall', async () => {
    const m = load();
    await m.schema.initDatabase();
    const menu = await m.menu.listByRestaurant(1);
    await m.cart.addItem(menu.find(item => item.name === 'Margherita Pizza')); // Rs. 180
    m.raw.prepare("UPDATE promos SET expires_at = ? WHERE code = 'WELCOME20'").run(Date.now() + 86400000);

    const error = await m.orders
      .placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod', promoCode: 'WELCOME20'})
      .catch(e => e);

    expect(error.message).toBe('INVALID_PROMO');
    expect(error.promoMessage).toBe('Add Rs. 220 more to use WELCOME20.');
    expect(count(m.raw, 'orders')).toBe(0);
  });

  it('applies WELCOME20 once the minimum is met and the code has not expired', async () => {
    const m = load();
    await fillCart(m); // 520
    m.raw.prepare("UPDATE promos SET expires_at = ? WHERE code = 'WELCOME20'").run(Date.now() + 86400000);

    const placed = await m.orders.placeOrder({
      userId: USER, address: ADDRESS, paymentMethod: 'cod', promoCode: ' welcome20 ',
    });

    // 520 + 120 delivery - 104 (20%)
    expect(placed).toMatchObject({total: 536, discount: 104, promoCode: 'WELCOME20'});
  });

  it('a rejected promo reports the message with an unknown code too', async () => {
    const m = load();
    await fillCart(m);
    const error = await m.orders
      .placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod', promoCode: 'NOPE'})
      .catch(e => e);
    expect(error.promoMessage).toBe("We couldn't find that code.");
  });

  it.each([
    ['no user', {userId: null, address: ADDRESS, paymentMethod: 'cod'}, 'NOT_LOGGED_IN'],
    ['a short address', {userId: USER, address: 'home', paymentMethod: 'cod'}, /address/i],
    ['an unknown payment method', {userId: USER, address: ADDRESS, paymentMethod: 'bitcoin'}, 'INVALID_PAYMENT_METHOD'],
  ])('rejects %s before touching the database', async (_name, input, message) => {
    const m = load();
    await fillCart(m);

    await expect(m.orders.placeOrder(input)).rejects.toThrow(message);
    expect(count(m.raw, 'orders')).toBe(0);
    expect(count(m.raw, 'cart_items')).toBe(2);
  });

  it('is atomic: if a later step fails, no order exists and the cart is untouched', async () => {
    const m = load();
    await fillCart(m);
    m.raw.exec('DROP TABLE order_items'); // make the second write fail

    await expect(
      m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'}),
    ).rejects.toThrow();

    expect(count(m.raw, 'orders')).toBe(0); // the order INSERT was rolled back
    expect(count(m.raw, 'cart_items')).toBe(2); // cart not cleared
  });

  it('two orders in a row get their own items', async () => {
    const m = load();
    await fillCart(m);
    const first = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});
    await fillCart(m);
    const second = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'card'});

    expect(second.id).not.toBe(first.id);
    expect(count(m.raw, 'order_items')).toBe(4);
    const payments = m.raw.prepare('SELECT payment_method FROM orders ORDER BY id').all();
    expect(payments.map(p => p.payment_method)).toEqual(['cod', 'card']);
  });
});

describeSqlite('orderRepo reads and status', () => {
  const place = (m, userId = USER) =>
    m.orders.placeOrder({userId, address: ADDRESS, paymentMethod: 'cod'});

  it('only returns an order to its owner', async () => {
    const m = load();
    await fillCart(m);
    const {id} = await place(m);

    expect((await m.orders.getOrderForUser(id, USER)).id).toBe(id);
    expect(await m.orders.getOrderForUser(id, 999)).toBeNull();
    expect(await m.orders.getOrderForUser(12345, USER)).toBeNull();
  });

  it('lists a user\'s orders newest first with items, and no one else\'s', async () => {
    const m = load();
    await fillCart(m);
    const a = await place(m);
    await fillCart(m);
    const b = await place(m);
    await fillCart(m);
    await place(m, 99); // someone else

    const list = await m.orders.listOrders(USER);

    expect(list.map(o => o.id)).toEqual([b.id, a.id]);
    expect(list[0].items).toHaveLength(2);
  });

  it('remembers the last address used', async () => {
    const m = load();
    await m.schema.initDatabase();
    expect(await m.orders.getLastAddress(USER)).toBe('');

    await fillCart(m);
    await place(m);
    expect(await m.orders.getLastAddress(USER)).toBe(ADDRESS);
    expect(await m.orders.getLastAddress(99)).toBe('');
  });

  it('advances an order to the status it should have by now, and persists it', async () => {
    const m = load();
    await fillCart(m);
    const placed = await place(m);
    const order = await m.orders.getOrderForUser(placed.id, USER);

    const t = order.created_at;
    expect((await m.orders.advanceIfDue(order, t + 5000)).status).toBe('placed');

    const preparing = await m.orders.advanceIfDue(order, t + 25000);
    expect(preparing.status).toBe('preparing');
    expect(preparing.items).toHaveLength(2); // items preserved
    expect(m.raw.prepare('SELECT status, updated_at FROM orders WHERE id = ?').get(placed.id))
      .toEqual({status: 'preparing', updated_at: t + 25000});

    // Skips straight ahead after a long absence, and stays delivered.
    const delivered = await m.orders.advanceIfDue(preparing, t + 10 * 60000);
    expect(delivered.status).toBe('delivered');
    expect((await m.orders.advanceIfDue(delivered, t + 20 * 60000)).status).toBe('delivered');
  });

  it('never moves an order backwards', async () => {
    const m = load();
    await fillCart(m);
    const placed = await place(m);
    let order = await m.orders.getOrderForUser(placed.id, USER);
    order = await m.orders.advanceIfDue(order, order.created_at + 70000); // on_the_way

    const earlier = await m.orders.advanceIfDue(order, order.created_at + 1000);

    expect(earlier.status).toBe('on_the_way');
  });

  it('advanceAllDue updates every order in a list', async () => {
    const m = load();
    await fillCart(m);
    await place(m);
    await fillCart(m);
    await place(m);
    const orders = await m.orders.listOrders(USER);

    const later = Math.max(...orders.map(o => o.created_at)) + 130000;
    const advanced = await m.orders.advanceAllDue(orders, later);

    expect(advanced.map(o => o.status)).toEqual(['delivered', 'delivered']);
  });
});

describeSqlite('reorder', () => {
  it('rebuilds the cart at current prices and reports dishes that no longer exist', async () => {
    const m = load();
    const menu = await fillCart(m); // Burger x2, Pizza x1
    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});

    // Something else is in the cart, the price changed, and the pizza was removed.
    await m.cart.addItem(menu.find(i => i.name === 'Moonland Special'));
    m.raw.prepare("UPDATE menu_items SET price = 200 WHERE name = 'Burger Deluxe'").run();
    m.raw.prepare("DELETE FROM menu_items WHERE name = 'Margherita Pizza'").run();

    const {lines, unavailable} = await m.orders.getReorderLines(placed.id, USER);
    expect(unavailable).toBe(1);
    expect(lines).toHaveLength(1);

    await m.cart.replaceAll(lines);

    const cart = m.raw.prepare('SELECT name, price, quantity, restaurant_id FROM cart_items').all();
    expect(cart).toEqual([{name: 'Burger Deluxe', price: 200, quantity: 2, restaurant_id: 1}]); // old cart replaced
  });

  it('refuses to reorder someone else\'s order', async () => {
    const m = load();
    await fillCart(m);
    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});

    expect(await m.orders.getReorderLines(placed.id, 999)).toEqual({lines: [], unavailable: 0, optionsDropped: 0});
  });
});

describeSqlite('promoRepo on real SQLite', () => {
  it('seeds SAVE10, FOOD5 and WELCOME20 with their rules', async () => {
    const m = load();
    await m.schema.initDatabase();

    expect(await m.promos.findByCode('SAVE10')).toEqual({code: 'SAVE10', percent: 10, min_order: 0, expires_at: null});
    expect(await m.promos.findByCode('FOOD5')).toEqual({code: 'FOOD5', percent: 5, min_order: 0, expires_at: null});
    expect(await m.promos.findByCode('WELCOME20')).toEqual({
      code: 'WELCOME20', percent: 20, min_order: 400, expires_at: Date.UTC(2026, 11, 31, 23, 59, 59, 999),
    });
  });

  it('finds codes in any case, ignoring spaces, and returns null for unknown or blank codes', async () => {
    const m = load();
    await m.schema.initDatabase();

    expect((await m.promos.findByCode('  welcome20 ')).code).toBe('WELCOME20');
    expect(await m.promos.findByCode('NOPE')).toBeNull();
    expect(await m.promos.findByCode('')).toBeNull();
    expect(await m.promos.findByCode(null)).toBeNull();
    expect(await m.promos.findByCode('constructor')).toBeNull();
  });
});

describeSqlite('full menu seeds on real SQLite', () => {
  const namesOf = (m, restaurantName) =>
    m.raw
      .prepare(
        `SELECT m.name FROM menu_items m JOIN restaurants r ON r.id = m.restaurant_id
         WHERE r.name = ? ORDER BY m.id`,
      )
      .all(restaurantName)
      .map(row => row.name);

  it('a fresh install gets every dish for every seeded restaurant, once', async () => {
    const m = load();
    await m.schema.initDatabase();

    RESTAURANT_SEED.forEach(([, name]) => {
      expect(namesOf(m, name)).toEqual(MENU_BY_RESTAURANT[name].map(dish => dish[0]));
    });
    // Westway keeps ids 1..4 for its original dishes.
    expect(m.raw.prepare('SELECT name FROM menu_items WHERE id <= 4 ORDER BY id').all().map(r => r.name)).toEqual([
      'Moonland Special', 'Burger Deluxe', 'Veggie Supreme', 'Margherita Pizza',
    ]);
  });

  // The schema as it was at version 6: seeded restaurants, Westway with only its 4 original dishes.
  const oldInstall = (m, extraSql = '') => {
    m.raw.exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user');
      CREATE TABLE admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
      CREATE TABLE restaurants (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rating REAL, time TEXT, offer TEXT, category TEXT, image_path TEXT);
      CREATE TABLE menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id INTEGER, name TEXT, price REAL, type TEXT, image_key TEXT);
      CREATE TABLE cart (id INTEGER PRIMARY KEY AUTOINCREMENT, menu_item_id INTEGER UNIQUE, name TEXT, price REAL, image_key TEXT, quantity INTEGER);
      INSERT INTO restaurants (id, name, rating, time, category) VALUES (10, 'Westway', 4.6, '15 min', 'nearest');
      INSERT INTO restaurants (id, name, rating, time, category) VALUES (11, 'Moonland', 4.6, '15 min', 'popular');
      INSERT INTO restaurants (id, name, rating, time, category) VALUES (12, 'My Own Place', 4.0, '30 min', 'nearest');
      INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (10, 'Burger Deluxe', 999, 'Best Seller', 'food2');
      INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (10, 'Margherita Pizza', 180, 'Best Seller', 'food3');
      INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (12, 'House Special', 75, NULL, 'food1');
      ${extraSql}
    `);
  };

  it('an existing install gets the missing dishes, matched by restaurant NAME not id', async () => {
    const m = load();
    oldInstall(m);

    await m.schema.initDatabase();

    const westway = m.raw.prepare("SELECT * FROM menu_items WHERE restaurant_id = 10 ORDER BY id").all();
    expect(westway.map(d => d.name)).toEqual([
      'Burger Deluxe', 'Margherita Pizza', // kept, in place
      'Moonland Special', 'Veggie Supreme', 'Peri Peri Wings', 'Loaded Fries', 'Chocolate Brownie',
    ]);
    // Moonland is matched by name even though its id (11) differs from the seed's (7).
    expect(m.raw.prepare('SELECT COUNT(*) AS n FROM menu_items WHERE restaurant_id = 11').get().n).toBe(
      MENU_BY_RESTAURANT.Moonland.length,
    );
  });

  it('never overwrites an admin\'s edits and never touches admin-created restaurants', async () => {
    const m = load();
    oldInstall(m);

    await m.schema.initDatabase();

    expect(m.raw.prepare("SELECT price FROM menu_items WHERE name = 'Burger Deluxe'").get().price).toBe(999);
    expect(m.raw.prepare('SELECT name FROM menu_items WHERE restaurant_id = 12').all().map(r => r.name)).toEqual([
      'House Special',
    ]);
    // Restaurants the install does not have are not created.
    expect(m.raw.prepare("SELECT COUNT(*) AS n FROM restaurants WHERE name = 'Fortune'").get().n).toBe(0);
  });

  it('a fresh install stores description, category, veg and spice for every dish', async () => {
    const m = load();
    await m.schema.initDatabase();
    const dish = m.raw.prepare("SELECT * FROM menu_items WHERE name = 'Peri Peri Wings'").get();
    expect(dish).toMatchObject({category: 'Starters', is_veg: 0, spice_level: 3});
    expect(dish.description).toMatch(/wings/i);
    expect(m.raw.prepare("SELECT COUNT(*) AS n FROM menu_items WHERE description IS NULL OR category = 'Other'").get().n).toBe(0);
  });

  it('an existing install gets the details back-filled, and admin dishes default to Other', async () => {
    const m = load();
    oldInstall(m);
    await m.schema.initDatabase();

    expect(m.raw.prepare("SELECT category, is_veg, spice_level FROM menu_items WHERE name = 'Margherita Pizza'").get()).toEqual({
      category: 'Mains', is_veg: 1, spice_level: 0,
    });
    // the admin-created restaurant's dish was never seeded: defaults apply
    expect(m.raw.prepare("SELECT description, category, is_veg, spice_level FROM menu_items WHERE name = 'House Special'").get()).toEqual({
      description: null, category: 'Other', is_veg: 0, spice_level: 0,
    });
  });

  it('menuRepo.insert stores the details and clamps the spice level', async () => {
    const m = load();
    await m.schema.initDatabase();
    await m.menu.insert({restaurantId: 1, name: 'Test Curry', price: 99, imageKey: 'food1', description: ' Hot  ', category: 'Mains', isVeg: true, spiceLevel: 9});
    await m.menu.insert({restaurantId: 1, name: 'Plain', price: 50});
    const rows = m.raw.prepare("SELECT * FROM menu_items WHERE name IN ('Test Curry','Plain') ORDER BY id").all();
    expect(rows[0]).toMatchObject({description: 'Hot', category: 'Mains', is_veg: 1, spice_level: 3});
    expect(rows[1]).toMatchObject({description: null, category: 'Other', is_veg: 0, spice_level: 0});
  });

  it('creates no duplicate dish names within a restaurant', async () => {
    const m = load();
    oldInstall(m);
    await m.schema.initDatabase();

    const duplicates = m.raw
      .prepare('SELECT restaurant_id, name, COUNT(*) AS n FROM menu_items GROUP BY restaurant_id, name HAVING n > 1')
      .all();
    expect(duplicates).toEqual([]);
  });
});

describeSqlite('Home data on real SQLite', () => {
  it('promoRepo.listActive returns only usable promos, best discount first', async () => {
    const m = load();
    await m.schema.initDatabase();
    const now = Date.UTC(2026, 8, 21);
    expect((await m.promos.listActive(now)).map(p => p.code)).toEqual(['WELCOME20', 'SAVE10', 'FOOD5']);
    // after WELCOME20 expires it is gone; the never-expiring ones stay
    expect((await m.promos.listActive(Date.UTC(2027, 0, 2))).map(p => p.code)).toEqual(['SAVE10', 'FOOD5']);
  });

  it('orderRepo.listRecentOrders returns the newest N orders with their items only', async () => {
    const m = load();
    await fillCart(m);
    const first = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});
    await fillCart(m);
    const second = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});
    await fillCart(m);
    const third = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});
    m.raw.prepare('UPDATE orders SET created_at = id * 1000');

    const recent = await m.orders.listRecentOrders(USER, 2);
    expect(recent.map(o => o.id)).toEqual([third.id, second.id]);
    recent.forEach(o => expect(o.items.length).toBe(2));
    expect(recent.map(o => o.id)).not.toContain(first.id);
    expect(await m.orders.listRecentOrders(999, 2)).toEqual([]);
  });
});

describeSqlite('dish options on real SQLite', () => {
  const dishId = (m, name) => m.raw.prepare('SELECT id FROM menu_items WHERE name = ?').get(name).id;

  it('seeds Size + Add-ons on mains, Size on drinks, and nothing on breads and desserts', async () => {
    const m = load();
    await m.schema.initDatabase();

    const burger = await m.options.listGroupsForItem(dishId(m, 'Burger Deluxe'));
    expect(burger.map(g => [g.name, g.type, g.required, g.max_select])).toEqual([
      ['Size', 'single', true, 1],
      ['Add-ons', 'multi', false, 3],
    ]);
    expect(burger[0].options.map(o => [o.name, o.price_delta, o.is_default])).toEqual([
      ['Small', -30, false], ['Regular', 0, true], ['Large', 60, false],
    ]);
    expect((await m.options.listGroupsForItem(dishId(m, 'Sweet Lassi'))).map(g => g.name)).toEqual(['Size']);
    expect(await m.options.listGroupsForItem(dishId(m, 'Garlic Naan'))).toEqual([]);
    expect(await m.options.listGroupsForItem(dishId(m, 'Kheer'))).toEqual([]);
  });

  it('every seeded main has exactly one default size, and customizable ids are reported per restaurant', async () => {
    const m = load();
    await m.schema.initDatabase();
    const groups = m.raw.prepare("SELECT id FROM option_groups WHERE name = 'Size'").all();
    groups.forEach(g => {
      expect(m.raw.prepare('SELECT COUNT(*) AS n FROM options WHERE group_id = ? AND is_default = 1').get(g.id).n).toBe(1);
    });
    const ids = await m.options.listCustomizableIds(1);
    expect(ids).toContain(dishId(m, 'Burger Deluxe'));
    expect(ids).not.toContain(dishId(m, 'Loaded Fries'));
    expect(await m.options.filterCustomizable([dishId(m, 'Burger Deluxe'), dishId(m, 'Kheer')])).toEqual([dishId(m, 'Burger Deluxe')]);
    expect(await m.options.filterCustomizable([])).toEqual([]);
  });

  it('cart lines: same dish with different options are separate rows, identical ones merge', async () => {
    const m = load();
    await m.schema.initDatabase();
    const burger = m.raw.prepare("SELECT * FROM menu_items WHERE name = 'Burger Deluxe'").get();
    const [size] = await m.options.listGroupsForItem(burger.id);
    const large = {...size.options[2], group_id: size.id, group_name: 'Size'};
    const small = {...size.options[0], group_id: size.id, group_name: 'Size'};

    await m.cart.addLine(burger, [large], 1);
    await m.cart.addLine(burger, [small], 1);
    await m.cart.addLine(burger, [large], 2);

    const rows = m.raw.prepare('SELECT line_key, price, base_price, quantity FROM cart_items ORDER BY id').all();
    expect(rows).toEqual([
      {line_key: `${burger.id}:${large.id}`, price: 230, base_price: 170, quantity: 3},
      {line_key: `${burger.id}:${small.id}`, price: 140, base_price: 170, quantity: 1},
    ]);
  });

  it('replaceLine swaps one line and merges into an existing identical one', async () => {
    const m = load();
    await m.schema.initDatabase();
    const burger = m.raw.prepare("SELECT * FROM menu_items WHERE name = 'Burger Deluxe'").get();
    const [size] = await m.options.listGroupsForItem(burger.id);
    const opt = i => ({...size.options[i], group_id: size.id, group_name: 'Size'});
    await m.cart.addLine(burger, [opt(2)], 1);
    await m.cart.addLine(burger, [opt(0)], 1);

    await m.cart.replaceLine(`${burger.id}:${opt(2).id}`, burger, [opt(0)], 2);

    expect(m.raw.prepare('SELECT line_key, quantity FROM cart_items').all()).toEqual([
      {line_key: `${burger.id}:${opt(0).id}`, quantity: 3},
    ]);
  });

  it('placeOrder snapshots the chosen options and restaurant on the order item', async () => {
    const m = load();
    await m.schema.initDatabase();
    const burger = m.raw.prepare("SELECT * FROM menu_items WHERE name = 'Burger Deluxe'").get();
    const [size, addons] = await m.options.listGroupsForItem(burger.id);
    const large = {...size.options[2], group_id: size.id, group_name: 'Size'};
    const cheese = {...addons.options[0], group_id: addons.id, group_name: 'Add-ons'};
    await m.cart.addLine(burger, [large, cheese], 2);

    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});

    expect(placed.total).toBe(2 * 260 + 120);
    const item = m.raw.prepare('SELECT * FROM order_items WHERE order_id = ?').get(placed.id);
    expect(item).toMatchObject({name: 'Burger Deluxe', price: 260, quantity: 2, restaurant_id: 1});
    expect(JSON.parse(item.selected_options).map(o => o.name)).toEqual(['Large', 'Extra cheese']);
  });

  it('reorder re-applies the choices to the CURRENT options: drops removed ones, uses new prices', async () => {
    const m = load();
    await m.schema.initDatabase();
    const burger = m.raw.prepare("SELECT * FROM menu_items WHERE name = 'Burger Deluxe'").get();
    const [size, addons] = await m.options.listGroupsForItem(burger.id);
    const large = {...size.options[2], group_id: size.id, group_name: 'Size'};
    const cheese = {...addons.options[0], group_id: addons.id, group_name: 'Add-ons'};
    await m.cart.addLine(burger, [large, cheese], 1);
    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});

    m.raw.prepare('DELETE FROM options WHERE id = ?').run(cheese.id); // the menu changed
    m.raw.prepare('UPDATE options SET price_delta = 80 WHERE id = ?').run(large.id);
    m.raw.prepare('UPDATE menu_items SET price = 200 WHERE id = ?').run(burger.id);

    const {lines, optionsDropped} = await m.orders.getReorderLines(placed.id, USER);
    expect(optionsDropped).toBe(1);
    expect(lines).toHaveLength(1);
    expect(lines[0].selectedOptions.map(o => o.name)).toEqual(['Large']);
    expect(lines[0].item.price).toBe(200);

    await m.cart.replaceAll(lines);
    expect(m.raw.prepare('SELECT price FROM cart_items').get().price).toBe(280); // 200 + 80
  });

  it('reordering an order from before options existed gives required groups their default', async () => {
    const m = load();
    await fillCart(m); // plain lines, no options chosen
    const placed = await m.orders.placeOrder({userId: USER, address: ADDRESS, paymentMethod: 'cod'});
    const {lines, optionsDropped} = await m.orders.getReorderLines(placed.id, USER);
    expect(optionsDropped).toBe(0);
    expect(lines[0].selectedOptions.map(o => o.name)).toEqual(['Regular']);
    expect(lines[0].item.price).toBe(170);
  });
});
