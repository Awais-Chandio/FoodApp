/**
 * favoritesRepo and the restaurant delete against real (in-memory) SQLite
 * through jest/sqliteStorageAdapter.js. Skipped on Node versions without
 * node:sqlite.
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
const describeSqlite = sqliteAvailable ? describe : describe.skip;

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterAll(() => console.log.mockRestore());

const load = () => {
  let modules;
  jest.isolateModules(() => {
    modules = {
      client: require('../src/database/client'),
      schema: require('../src/database/schema'),
      favorites: require('../src/database/repositories/favoritesRepo'),
      restaurants: require('../src/database/repositories/restaurantRepo'),
    };
  });
  modules.raw = modules.client.default.raw;
  return modules;
};

const rowsIn = (raw, userId) =>
  raw.prepare('SELECT restaurant_id FROM favorites WHERE user_id = ? ORDER BY restaurant_id').all(userId).map(r => r.restaurant_id);

describeSqlite('favoritesRepo on real SQLite', () => {
  it('toggle saves, then removes, and reports the new state', async () => {
    const m = load();
    await m.schema.initDatabase();

    expect(await m.favorites.toggle(7, 1)).toBe(true);
    expect(rowsIn(m.raw, 7)).toEqual([1]);

    expect(await m.favorites.toggle(7, 1)).toBe(false);
    expect(rowsIn(m.raw, 7)).toEqual([]);
  });

  it('a double tap can never create a duplicate row', async () => {
    const m = load();
    await m.schema.initDatabase();

    m.raw.prepare('INSERT INTO favorites (user_id, restaurant_id, created_at) VALUES (7, 1, 1)').run();
    // The primary key makes INSERT OR IGNORE a no-op for an existing pair.
    m.raw.prepare('INSERT OR IGNORE INTO favorites (user_id, restaurant_id, created_at) VALUES (7, 1, 2)').run();

    expect(rowsIn(m.raw, 7)).toEqual([1]);
  });

  it('keeps favorites per user', async () => {
    const m = load();
    await m.schema.initDatabase();

    await m.favorites.toggle(7, 1);
    await m.favorites.toggle(8, 2);

    expect(await m.favorites.listIds(7)).toEqual([1]);
    expect(await m.favorites.listIds(8)).toEqual([2]);
    expect((await m.favorites.listRestaurants(7)).map(r => r.name)).toEqual(['Westway']);
  });

  it('lists the newest favorite first', async () => {
    const m = load();
    await m.schema.initDatabase();

    m.raw.prepare('INSERT INTO favorites (user_id, restaurant_id, created_at) VALUES (7, 1, 100)').run();
    m.raw.prepare('INSERT INTO favorites (user_id, restaurant_id, created_at) VALUES (7, 2, 200)').run();

    expect((await m.favorites.listRestaurants(7)).map(r => r.id)).toEqual([2, 1]);
  });

  it('the JOIN hides a favorite whose restaurant no longer exists', async () => {
    const m = load();
    await m.schema.initDatabase();
    m.raw.prepare('INSERT INTO favorites (user_id, restaurant_id, created_at) VALUES (7, 999, 1)').run();
    await m.favorites.toggle(7, 1);

    expect((await m.favorites.listRestaurants(7)).map(r => r.id)).toEqual([1]);
  });

  it('deleting a restaurant also deletes everyone\'s favorites of it', async () => {
    const m = load();
    await m.schema.initDatabase();
    await m.favorites.toggle(7, 1);
    await m.favorites.toggle(8, 1);
    await m.favorites.toggle(7, 2);

    await m.restaurants.remove(1);

    expect(rowsIn(m.raw, 7)).toEqual([2]);
    expect(rowsIn(m.raw, 8)).toEqual([]);
  });

  it('creates the favorites table as a numbered migration', async () => {
    const m = load();
    await m.schema.initDatabase();
    expect(m.raw.prepare('PRAGMA user_version').get().user_version).toBeGreaterThanOrEqual(5);
    expect(m.raw.prepare("SELECT name FROM sqlite_master WHERE name = 'favorites'").get()).toBeTruthy();
  });
});
