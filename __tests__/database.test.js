/**
 * Repository and schema tests. The SQLite client is replaced with a fake
 * `runStatements`, so these check which statements run, in what order and how
 * many transactions are used, not SQLite itself.
 */

jest.mock('../src/database/client', () => ({
  __esModule: true,
  default: {},
  runStatements: jest.fn(),
}));

jest.mock('../src/database/schema', () => ({
  initDatabase: jest.fn(() => Promise.resolve()),
}));

// The seed hashes the demo admin password; the native crypto is not available in Jest.
jest.mock('../src/services/passwordHash', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed-password')),
}));

const {runStatements} = require('../src/database/client');
const {initDatabase} = require('../src/database/schema');
const restaurantRepo = require('../src/database/repositories/restaurantRepo');
const cartRepo = require('../src/database/repositories/cartRepo');

const result = (rows = [], extra = {}) => ({rows, ...extra});

beforeEach(() => {
  runStatements.mockReset();
  initDatabase.mockClear();
  initDatabase.mockImplementation(() => Promise.resolve());
});

describe('restaurantRepo.listWithMenus', () => {
  const restaurants = [
    {id: 1, name: 'Westway', category: 'nearest'},
    {id: 2, name: 'Fortune', category: 'nearest'},
    {id: 7, name: 'Moonland', category: 'popular'},
    {id: 9, name: 'Other', category: 'somewhere-else'},
  ];
  const menuItems = [
    {id: 10, restaurant_id: 1, name: 'Burger'},
    {id: 11, restaurant_id: 1, name: 'Pizza'},
    {id: 12, restaurant_id: 7, name: 'Noodles'},
  ];

  it('loads everything with two queries in ONE transaction (no N+1)', async () => {
    runStatements.mockResolvedValue([result(restaurants), result(menuItems)]);

    await restaurantRepo.listWithMenus();

    expect(runStatements).toHaveBeenCalledTimes(1);
    const statements = runStatements.mock.calls[0][0];
    expect(statements).toHaveLength(2);
    expect(statements[0][0]).toMatch(/FROM restaurants/);
    expect(statements[1][0]).toMatch(/FROM menu_items/);
  });

  it('nests menu items and splits by category', async () => {
    runStatements.mockResolvedValue([result(restaurants), result(menuItems)]);

    const {nearest, popular} = await restaurantRepo.listWithMenus();

    expect(nearest.map(r => r.name)).toEqual(['Westway', 'Fortune']);
    expect(popular.map(r => r.name)).toEqual(['Moonland']);
    expect(nearest[0].menu_items.map(i => i.name)).toEqual(['Burger', 'Pizza']);
    expect(nearest[1].menu_items).toEqual([]);
    expect(popular[0].menu_items).toHaveLength(1);
  });
});

describe('restaurantRepo.remove', () => {
  it('deletes menu items, favorites, reviews, then the restaurant in one transaction', async () => {
    runStatements.mockResolvedValue([result(), result(), result(), result()]);

    await restaurantRepo.remove(5);

    expect(runStatements).toHaveBeenCalledTimes(1);
    expect(runStatements.mock.calls[0][0]).toEqual([
      ['DELETE FROM menu_items WHERE restaurant_id = ?', [5]],
      ['DELETE FROM favorites WHERE restaurant_id = ?', [5]],
      ['DELETE FROM reviews WHERE restaurant_id = ?', [5]],
      ['DELETE FROM restaurants WHERE id = ?', [5]],
    ]);
  });
});

describe('cartRepo', () => {
  const dish = {
    id: 3,
    restaurant_id: 1,
    name: 'Burger',
    price: 170,
    image_key: 'food2',
  };
  const large = {id: 12, name: 'Large', price_delta: 60, group_id: 4, group_name: 'Size'};

  it('addItem increments then inserts-if-missing in ONE transaction, keyed by line_key', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.addItem(dish);

    expect(runStatements).toHaveBeenCalledTimes(1);
    const [update, insert] = runStatements.mock.calls[0][0];
    expect(update[0]).toMatch(/^UPDATE cart_items SET quantity = quantity \+ \?/);
    expect(update[1]).toEqual([1, '3']);
    expect(insert[0]).toMatch(/WHERE NOT EXISTS/);
    expect(insert[1]).toEqual(['3', 3, 1, 'Burger', 170, 170, '[]', 'food2', 1, '3']);
  });

  it('addItem stores a null restaurant_id when the dish has none', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.addItem({id: 4, name: 'Soup', price: 90});

    const insert = runStatements.mock.calls[0][0][1];
    expect(insert[1]).toEqual(['4', 4, null, 'Soup', 90, 90, '[]', null, 1, '4']);
  });

  it('addLine keys a line by dish + sorted option ids and prices it with the options', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.addLine(dish, [large], 2);

    const [update, insert] = runStatements.mock.calls[0][0];
    expect(update[1]).toEqual([2, '3:12']);
    expect(insert[1].slice(0, 9)).toEqual([
      '3:12', 3, 1, 'Burger', 170, 230,
      JSON.stringify([{id: 12, name: 'Large', price_delta: 60, group_id: 4, group_name: 'Size'}]),
      'food2', 2,
    ]);
  });

  it('replaceLine deletes the old line and upserts the new one in one transaction', async () => {
    runStatements.mockResolvedValue([result(), result(), result()]);

    await cartRepo.replaceLine('3', dish, [large], 1);

    expect(runStatements).toHaveBeenCalledTimes(1);
    const statements = runStatements.mock.calls[0][0];
    expect(statements[0]).toEqual(['DELETE FROM cart_items WHERE line_key = ?', ['3']]);
    expect(statements[1][1]).toEqual([1, '3:12']);
    expect(statements).toHaveLength(3);
  });

  it('changeQuantity updates then deletes lines at or below zero atomically', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.changeQuantity('3', -1);

    expect(runStatements).toHaveBeenCalledTimes(1);
    const [update, cleanup] = runStatements.mock.calls[0][0];
    expect(update).toEqual([
      'UPDATE cart_items SET quantity = quantity + ? WHERE line_key = ?',
      [-1, '3'],
    ]);
    expect(cleanup[0]).toMatch(/DELETE FROM cart_items WHERE quantity <= 0/);
  });

  it('setQuantity deletes the line when the quantity is 0 or less', async () => {
    runStatements.mockResolvedValue([result()]);

    await cartRepo.setQuantity('3', 0);

    expect(runStatements.mock.calls[0][0][0][0]).toMatch(/^DELETE FROM cart_items/);
  });

  it('setQuantity writes an absolute quantity otherwise', async () => {
    runStatements.mockResolvedValue([result()]);

    await cartRepo.setQuantity('3', 4);

    expect(runStatements.mock.calls[0][0]).toEqual([
      ['UPDATE cart_items SET quantity = ? WHERE line_key = ?', [4, '3']],
    ]);
  });
});

describe('repositories wait for the schema', () => {
  it('does not touch the database until initDatabase resolves', async () => {
    let release;
    initDatabase.mockImplementation(
      () => new Promise(resolve => (release = resolve)),
    );
    runStatements.mockResolvedValue([result([])]);

    const pending = cartRepo.list();
    await Promise.resolve();
    expect(runStatements).not.toHaveBeenCalled();

    release();
    await pending;
    expect(runStatements).toHaveBeenCalledTimes(1);
  });
});

describe('schema migrations', () => {
  // Fresh copy of the real schema module (its init promise is module state),
  // together with the fake runStatements from the SAME module registry.
  const load = () => {
    let loaded;
    jest.isolateModules(() => {
      jest.unmock('../src/database/schema');
      const schema = require('../src/database/schema');
      loaded = {
        initDatabase: schema.initDatabase,
        latest: schema.SCHEMA_VERSION,
        run: require('../src/database/client').runStatements,
      };
    });
    return loaded;
  };

  // Queues `count` successful, empty migration batches.
  const queueMigrations = (run, count) => {
    for (let i = 0; i < count; i += 1) {
      run.mockResolvedValueOnce([]);
    }
  };

  const versionOf = statements =>
    statements.find(([sql]) => /^PRAGMA user_version = /.test(sql))?.[0];

  it('runs every migration in order on a fresh database, then seeds', async () => {
    const {initDatabase: init, run, latest} = load();
    run.mockResolvedValueOnce([result([{user_version: 0}])]); // read version
    queueMigrations(run, latest); // v1 .. latest
    run
      .mockResolvedValueOnce([
        result([{count: 0}]),
        result([{count: 0}]),
        result([{count: 0}]),
      ]) // seed counts
      .mockResolvedValueOnce([]); // seed inserts

    await init();

    for (let version = 1; version <= latest; version += 1) {
      expect(versionOf(run.mock.calls[version][0])).toBe(`PRAGMA user_version = ${version}`);
    }
    expect(run.mock.calls[2][0][0][0]).toMatch(/ALTER TABLE cart ADD COLUMN restaurant_id/);
    expect(run.mock.calls[3][0][0][0]).toMatch(/ALTER TABLE users ADD COLUMN password_hash/);
    expect(run.mock.calls[4][0][0][0]).toMatch(/CREATE TABLE orders/);

    const inserts = run.mock.calls[latest + 2][0];
    const {MENU_SEED, RESTAURANT_SEED, optionSeedStatements} = require('../src/database/seedData');
    // admin + restaurants + every dish + every dish's option groups and options
    expect(inserts).toHaveLength(1 + RESTAURANT_SEED.length + MENU_SEED.length + optionSeedStatements().length);
    // The seeded admin gets a hash and no plaintext password.
    const adminInsert = inserts.find(([sql]) => /INTO users/.test(sql));
    expect(adminInsert[0]).toMatch(/VALUES \(\?, NULL, \?, \?\)/);
    expect(adminInsert[1]).toEqual(['admin@foodapp.com', 'hashed-password', 'admin']);
  });

  it('skips migrations that already ran and never reseeds existing data', async () => {
    const {initDatabase: init, run, latest} = load();
    run
      .mockResolvedValueOnce([result([{user_version: latest}])])
      .mockResolvedValueOnce([
        result([{count: 6}]),
        result([{count: 4}]),
        result([{count: 1}]),
      ]);

    await init();

    expect(run).toHaveBeenCalledTimes(2); // version read + seed counts only
  });

  it('upgrades an install that only has v3: creates the orders tables, then the later migrations', async () => {
    const {initDatabase: init, run, latest} = load();
    run.mockResolvedValueOnce([result([{user_version: 3}])]);
    queueMigrations(run, latest - 3); // v4 .. latest
    run.mockResolvedValueOnce([
      result([{count: 6}]),
      result([{count: 4}]),
      result([{count: 1}]),
    ]);

    await init();

    expect(run).toHaveBeenCalledTimes(1 + (latest - 3) + 1);
    const statements = run.mock.calls[1][0].map(([sql]) => sql);
    expect(statements.some(sql => /CREATE TABLE orders/.test(sql))).toBe(true);
    expect(statements.some(sql => /CREATE TABLE order_items/.test(sql))).toBe(true);
    expect(statements.some(sql => /idx_orders_user_created/.test(sql))).toBe(true);
    expect(statements[statements.length - 1]).toBe('PRAGMA user_version = 4');
  });

  it('upgrades a pre-versioning install (user_version 0) without reseeding', async () => {
    const {initDatabase: init, run, latest} = load();
    run.mockResolvedValueOnce([result([{user_version: 0}])]);
    queueMigrations(run, latest);
    run.mockResolvedValueOnce([
      result([{count: 6}]),
      result([{count: 4}]),
      result([{count: 1}]),
    ]);

    await init();

    expect(run).toHaveBeenCalledTimes(1 + latest + 1); // no seed insert batch
  });

  it('runs initialisation only once for concurrent callers', async () => {
    const {initDatabase: init, run, latest} = load();
    run
      .mockResolvedValueOnce([result([{user_version: latest}])])
      .mockResolvedValueOnce([
        result([{count: 1}]),
        result([{count: 1}]),
        result([{count: 1}]),
      ]);

    await Promise.all([init(), init(), init()]);

    expect(run).toHaveBeenCalledTimes(2);
  });
});
