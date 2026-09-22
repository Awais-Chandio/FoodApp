import { runStatements } from "./client";
import { hashPassword } from "../services/passwordHash";
import { menuBackfillStatements, MENU_SEED, RESTAURANT_SEED } from "./seedData";

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
  {
    // Passwords are stored as salted PBKDF2 hashes in password_hash. The old
    // plaintext `password` column stays only so existing accounts can be
    // upgraded; it is emptied as each account is converted.
    version: 3,
    statements: ["ALTER TABLE users ADD COLUMN password_hash TEXT"],
  },
  {
    // Orders. order_items copies name/price/image at purchase time, so history
    // stays correct after a menu item is edited or deleted; menu_item_id is
    // kept only so an order can be reordered and has no foreign key.
    version: 4,
    statements: [
      `CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        total REAL NOT NULL,
        delivery_fee REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0,
        promo_code TEXT,
        address TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image_key TEXT
      )`,
      "CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC)",
      "CREATE INDEX idx_order_items_order ON order_items (order_id)",
    ],
  },
  {
    // Favorite restaurants, one row per (user, restaurant). The primary key
    // makes a repeated insert a no-op instead of a duplicate. No foreign keys:
    // restaurantRepo.remove clears a restaurant's favorites explicitly.
    version: 5,
    statements: [
      `CREATE TABLE favorites (
        user_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, restaurant_id)
      )`,
    ],
  },
  {
    // Promo codes move from a hardcoded object into a table. percent is a whole
    // number; min_order is a subtotal in Rs. (0 = none); expires_at is epoch ms
    // (NULL = never). SAVE10 and FOOD5 keep their old behaviour; WELCOME20 is
    // the demo for a minimum order and an expiry (31 Dec 2026, end of day UTC).
    version: 6,
    statements: [
      `CREATE TABLE promos (
        code TEXT PRIMARY KEY COLLATE NOCASE,
        percent INTEGER NOT NULL,
        min_order REAL NOT NULL DEFAULT 0,
        expires_at INTEGER
      )`,
      "INSERT INTO promos (code, percent, min_order, expires_at) VALUES ('SAVE10', 10, 0, NULL)",
      "INSERT INTO promos (code, percent, min_order, expires_at) VALUES ('FOOD5', 5, 0, NULL)",
      "INSERT INTO promos (code, percent, min_order, expires_at) VALUES ('WELCOME20', 20, 400, 1798761599999)",
    ],
  },
  {
    // Full demo menus for existing installs (fresh installs get them from
    // seed()). See menuBackfillStatements in ./seedData for the matching rules.
    version: 7,
    statements: menuBackfillStatements(),
  },
];

// The version a fully migrated database ends at.
export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

const ADMIN_EMAIL = "admin@foodapp.com";
const ADMIN_PASSWORD = "admin123";

const migrate = async () => {
  const [{ rows }] = await runStatements([["PRAGMA user_version"]]);
  const current = rows[0]?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      await runStatements([
        // A statement is a SQL string, or a [sql, params] pair.
        ...migration.statements.map((statement) =>
          Array.isArray(statement) ? statement : [statement]
        ),
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
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    statements.push([
      "INSERT INTO users (email, password, password_hash, role) VALUES (?, NULL, ?, ?)",
      [ADMIN_EMAIL, passwordHash, "admin"],
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
