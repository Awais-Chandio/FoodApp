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
  it('deletes menu items then the restaurant in one transaction', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await restaurantRepo.remove(5);

    expect(runStatements).toHaveBeenCalledTimes(1);
    expect(runStatements.mock.calls[0][0]).toEqual([
      ['DELETE FROM menu_items WHERE restaurant_id = ?', [5]],
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

  it('addItem increments then inserts-if-missing in ONE transaction', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.addItem(dish);

    expect(runStatements).toHaveBeenCalledTimes(1);
    const [update, insert] = runStatements.mock.calls[0][0];
    expect(update[0]).toMatch(/^UPDATE cart SET quantity = quantity \+ 1/);
    expect(update[1]).toEqual([3]);
    expect(insert[0]).toMatch(/WHERE NOT EXISTS/);
    expect(insert[1]).toEqual([3, 'Burger', 170, 'food2', 1, 3]);
  });

  it('addItem stores a null restaurant_id when the dish has none', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.addItem({id: 4, name: 'Soup', price: 90});

    const insert = runStatements.mock.calls[0][0][1];
    expect(insert[1]).toEqual([4, 'Soup', 90, null, null, 4]);
  });

  it('changeQuantity updates then deletes rows at or below zero atomically', async () => {
    runStatements.mockResolvedValue([result(), result()]);

    await cartRepo.changeQuantity(3, -1);

    expect(runStatements).toHaveBeenCalledTimes(1);
    const [update, cleanup] = runStatements.mock.calls[0][0];
    expect(update).toEqual([
      'UPDATE cart SET quantity = quantity + ? WHERE menu_item_id = ?',
      [-1, 3],
    ]);
    expect(cleanup[0]).toMatch(/DELETE FROM cart WHERE quantity <= 0/);
  });

  it('setQuantity deletes the row when the quantity is 0 or less', async () => {
    runStatements.mockResolvedValue([result()]);

    await cartRepo.setQuantity(3, 0);

    expect(runStatements.mock.calls[0][0][0][0]).toMatch(/^DELETE FROM cart/);
  });

  it('setQuantity writes an absolute quantity otherwise', async () => {
    runStatements.mockResolvedValue([result()]);

    await cartRepo.setQuantity(3, 4);

    expect(runStatements.mock.calls[0][0]).toEqual([
      ['UPDATE cart SET quantity = ? WHERE menu_item_id = ?', [4, 3]],
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
      loaded = {
        initDatabase: require('../src/database/schema').initDatabase,
        run: require('../src/database/client').runStatements,
      };
    });
    return loaded;
  };

  const versionOf = statements =>
    statements.find(([sql]) => /^PRAGMA user_version = /.test(sql))?.[0];

  it('runs every migration in order on a fresh database, then seeds', async () => {
    const {initDatabase: init, run} = load();
    run
      .mockResolvedValueOnce([result([{user_version: 0}])]) // read version
      .mockResolvedValueOnce([]) // v1
      .mockResolvedValueOnce([]) // v2
      .mockResolvedValueOnce([]) // v3
      .mockResolvedValueOnce([
        result([{count: 0}]),
        result([{count: 0}]),
        result([{count: 0}]),
      ]) // seed counts
      .mockResolvedValueOnce([]); // seed inserts

    await init();

    expect(versionOf(run.mock.calls[1][0])).toBe('PRAGMA user_version = 1');
    expect(versionOf(run.mock.calls[2][0])).toBe('PRAGMA user_version = 2');
    expect(versionOf(run.mock.calls[3][0])).toBe('PRAGMA user_version = 3');
    expect(run.mock.calls[2][0][0][0]).toMatch(/ALTER TABLE cart ADD COLUMN restaurant_id/);
    expect(run.mock.calls[3][0][0][0]).toMatch(/ALTER TABLE users ADD COLUMN password_hash/);

    const inserts = run.mock.calls[5][0];
    expect(inserts).toHaveLength(11); // 1 admin + 6 restaurants + 4 menu items
    // The seeded admin gets a hash and no plaintext password.
    const adminInsert = inserts.find(([sql]) => /INTO users/.test(sql));
    expect(adminInsert[0]).toMatch(/VALUES \(\?, NULL, \?, \?\)/);
    expect(adminInsert[1]).toEqual(['admin@foodapp.com', 'hashed-password', 'admin']);
  });

  it('skips migrations that already ran and never reseeds existing data', async () => {
    const {initDatabase: init, run} = load();
    run
      .mockResolvedValueOnce([result([{user_version: 3}])])
      .mockResolvedValueOnce([
        result([{count: 6}]),
        result([{count: 4}]),
        result([{count: 1}]),
      ]);

    await init();

    expect(run).toHaveBeenCalledTimes(2); // version read + seed counts only
  });

  it('upgrades an install that only has v2: adds password_hash and nothing else', async () => {
    const {initDatabase: init, run} = load();
    run
      .mockResolvedValueOnce([result([{user_version: 2}])])
      .mockResolvedValueOnce([]) // v3
      .mockResolvedValueOnce([
        result([{count: 6}]),
        result([{count: 4}]),
        result([{count: 1}]),
      ]);

    await init();

    expect(run).toHaveBeenCalledTimes(3);
    expect(versionOf(run.mock.calls[1][0])).toBe('PRAGMA user_version = 3');
    expect(run.mock.calls[1][0][0][0]).toMatch(/ALTER TABLE users ADD COLUMN password_hash/);
  });

  it('upgrades a pre-versioning install (user_version 0) without reseeding', async () => {
    const {initDatabase: init, run} = load();
    run
      .mockResolvedValueOnce([result([{user_version: 0}])])
      .mockResolvedValueOnce([]) // v1
      .mockResolvedValueOnce([]) // v2
      .mockResolvedValueOnce([]) // v3
      .mockResolvedValueOnce([
        result([{count: 6}]),
        result([{count: 4}]),
        result([{count: 1}]),
      ]);

    await init();

    expect(run).toHaveBeenCalledTimes(5); // no seed insert batch
  });

  it('runs initialisation only once for concurrent callers', async () => {
    const {initDatabase: init, run} = load();
    run
      .mockResolvedValueOnce([result([{user_version: 3}])])
      .mockResolvedValueOnce([
        result([{count: 1}]),
        result([{count: 1}]),
        result([{count: 1}]),
      ]);

    await Promise.all([init(), init(), init()]);

    expect(run).toHaveBeenCalledTimes(2);
  });
});
