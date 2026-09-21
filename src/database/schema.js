import { runStatements } from "./client";

// Each migration runs once, in order, inside its own transaction together with
// the PRAGMA user_version bump. Never edit a released migration: add a new one.
const MIGRATIONS = [
  {
    // Baseline: the schema as it existed before versioning was introduced.
    // Uses IF NOT EXISTS so it is a no-op on installs that already have it.
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
      )`,
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        rating REAL,
        time TEXT,
        offer TEXT,
        category TEXT,
        image_path TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER,
        name TEXT,
        price REAL,
        type TEXT,
        image_key TEXT,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )`,
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER UNIQUE,
        name TEXT,
        price REAL,
        image_key TEXT,
        quantity INTEGER
      )`,
    ],
  },
  {
    // Schema only: lets cart rows remember their restaurant. No rule uses it yet.
    version: 2,
    statements: ["ALTER TABLE cart ADD COLUMN restaurant_id INTEGER"],
  },
];

const RESTAURANT_SEED = [
  [1, "Westway", 4.6, "15 min", "50% OFF", "nearest", null],
  [2, "Fortune", 4.8, "25 min", null, "nearest", null],
  [3, "Seafood", 4.6, "20 min", null, "nearest", null],
  [7, "Moonland", 4.6, "15 min", null, "popular", null],
  [8, "Starfish", 4.8, "25 min", "30% OFF", "popular", null],
  [9, "Black Noodles", 4.9, "20 min", null, "popular", null],
];

const MENU_SEED = [
  [1, "Moonland Special", 210, "Best Seller", "Moonland"],
  [1, "Burger Deluxe", 170, "Best Seller", "food2"],
  [1, "Veggie Supreme", 150, "Best Seller", "food1"],
  [1, "Margherita Pizza", 180, "Best Seller", "food3"],
];

const ADMIN_EMAIL = "admin@foodapp.com";
const ADMIN_PASSWORD = "admin123";

const migrate = async () => {
  const [{ rows }] = await runStatements([["PRAGMA user_version"]]);
  const current = rows[0]?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      await runStatements([
        ...migration.statements.map((sql) => [sql]),
        // PRAGMA does not accept bound parameters; version is a trusted integer.
        [`PRAGMA user_version = ${migration.version}`],
      ]);
    }
  }
};

const seed = async () => {
  const [restaurants, menuItems, admin] = await runStatements([
    ["SELECT COUNT(*) AS count FROM restaurants"],
    ["SELECT COUNT(*) AS count FROM menu_items"],
    ["SELECT COUNT(*) AS count FROM users WHERE email = ?", [ADMIN_EMAIL]],
  ]);

  const statements = [];

  if (admin.rows[0].count === 0) {
    statements.push([
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [ADMIN_EMAIL, ADMIN_PASSWORD, "admin"],
    ]);
  }

  if (restaurants.rows[0].count === 0) {
    RESTAURANT_SEED.forEach((row) =>
      statements.push([
        "INSERT INTO restaurants (id, name, rating, time, offer, category, image_path) VALUES (?,?,?,?,?,?,?)",
        row,
      ])
    );
  }

  if (menuItems.rows[0].count === 0) {
    MENU_SEED.forEach((row) =>
      statements.push([
        "INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (?,?,?,?,?)",
        row,
      ])
    );
  }

  if (statements.length) {
    await runStatements(statements);
  }
};

let initPromise = null;

/**
 * Creates/migrates/seeds the database exactly once per app run. Every
 * repository call awaits this, so nothing can query before the tables exist.
 */
export const initDatabase = () => {
  if (!initPromise) {
    initPromise = migrate()
      .then(seed)
      .catch((error) => {
        initPromise = null;
        console.log("Database init error", error);
        throw error;
      });
  }
  return initPromise;
};
