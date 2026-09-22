import { runStatements } from "./client";
import { hashPassword } from "../services/passwordHash";
import {
  menuBackfillStatements,
  menuDetailsBackfillStatements,
  MENU_SEED,
  optionSeedStatements,
  RESTAURANT_SEED,
} from "./seedData";

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
  {
    // Dish details for the Menu screen. Dishes added later by an admin default
    // to category "Other", not veg, no spice. The seeded dishes are filled in.
    version: 8,
    statements: [
      "ALTER TABLE menu_items ADD COLUMN description TEXT",
      "ALTER TABLE menu_items ADD COLUMN category TEXT NOT NULL DEFAULT 'Other'",
      "ALTER TABLE menu_items ADD COLUMN is_veg INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE menu_items ADD COLUMN spice_level INTEGER NOT NULL DEFAULT 0",
      ...menuDetailsBackfillStatements(),
    ],
  },
  {
    // Dish customization. option_groups/options describe the choices for a dish.
    // The single-row-per-dish `cart` table is replaced by cart_items, where a
    // line is a dish PLUS its chosen options (line_key is UNIQUE): SQLite cannot
    // drop the old UNIQUE(menu_item_id), so the table is rebuilt (create, copy,
    // drop). `price` stays the unit price including options and base_price is
    // the dish's own price. Orders keep a snapshot of the choices too.
    version: 9,
    statements: [
      `CREATE TABLE option_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        required INTEGER NOT NULL DEFAULT 0,
        max_select INTEGER NOT NULL DEFAULT 1,
        sort INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price_delta REAL NOT NULL DEFAULT 0,
        is_default INTEGER NOT NULL DEFAULT 0
      )`,
      "CREATE INDEX idx_option_groups_item ON option_groups (menu_item_id)",
      "CREATE INDEX idx_options_group ON options (group_id)",
      `CREATE TABLE cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        line_key TEXT NOT NULL UNIQUE,
        menu_item_id INTEGER,
        restaurant_id INTEGER,
        name TEXT,
        base_price REAL,
        price REAL,
        selected_options TEXT NOT NULL DEFAULT '[]',
        image_key TEXT,
        quantity INTEGER
      )`,
      `INSERT INTO cart_items
         (line_key, menu_item_id, restaurant_id, name, base_price, price, selected_options, image_key, quantity)
       SELECT CAST(menu_item_id AS TEXT), menu_item_id, restaurant_id, name, price, price, '[]', image_key, quantity
       FROM cart`,
      "DROP TABLE cart",
      "ALTER TABLE order_items ADD COLUMN selected_options TEXT",
      "ALTER TABLE order_items ADD COLUMN restaurant_id INTEGER",
      ...optionSeedStatements(),
    ],
  },
  {
    // Reviews. One review per (order, restaurant). restaurants.rating becomes a
    // blend of base_rating (the seeded/admin value) and the real reviews, kept up
    // to date by reviewRepo.add; review_count counts them. Orders placed before
    // this migration have no restaurant_id on their items and cannot be reviewed.
    version: 10,
    statements: [
      `CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at INTEGER NOT NULL,
        UNIQUE (order_id, restaurant_id)
      )`,
      "CREATE INDEX idx_reviews_restaurant ON reviews (restaurant_id, created_at DESC)",
      "ALTER TABLE restaurants ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE restaurants ADD COLUMN base_rating REAL",
      "UPDATE restaurants SET base_rating = rating",
    ],
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
        "INSERT INTO restaurants (id, name, rating, time, offer, category, image_path, base_rating) VALUES (?,?,?,?,?,?,?,?)",
        [...row, row[2]],
      ])
    );
  }

  if (menuItems.rows[0].count === 0) {
    MENU_SEED.forEach((row) =>
      statements.push([
        "INSERT INTO menu_items (restaurant_id, name, price, type, image_key, description, category, is_veg, spice_level) VALUES (?,?,?,?,?,?,?,?,?)",
        row,
      ])
    );
    // The dishes' size/add-on options go in the same batch, after the dishes.
    statements.push(...optionSeedStatements());
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
