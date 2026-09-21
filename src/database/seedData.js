// Demo catalog. Fresh installs insert it through schema.js `seed()`, and the
// version-7 migration back-fills it into existing installs, so both read from
// this one file and cannot drift apart. Dish photos are reused (food1, food2,
// food3, chicken and Moonland) until real ones exist.

// [id, name, rating, time, offer, category, image_path]
export const RESTAURANT_SEED = [
  [1, "Westway", 4.6, "15 min", "50% OFF", "nearest", null],
  [2, "Fortune", 4.8, "25 min", null, "nearest", null],
  [3, "Seafood", 4.6, "20 min", null, "nearest", null],
  [7, "Moonland", 4.6, "15 min", null, "popular", null],
  [8, "Starfish", 4.8, "25 min", "30% OFF", "popular", null],
  [9, "Black Noodles", 4.9, "20 min", null, "popular", null],
];

const BEST_SELLER = "Best Seller";

// Restaurant name -> [name, price (Rs.), type, image key]. Westway's first four
// are the original demo dishes and keep their ids on existing installs.
export const MENU_BY_RESTAURANT = {
  Westway: [
    ["Moonland Special", 210, BEST_SELLER, "Moonland"],
    ["Burger Deluxe", 170, BEST_SELLER, "food2"],
    ["Veggie Supreme", 150, BEST_SELLER, "food1"],
    ["Margherita Pizza", 180, BEST_SELLER, "food3"],
    ["Peri Peri Wings", 240, null, "chicken"],
    ["Loaded Fries", 130, null, "food2"],
    ["Chocolate Brownie", 110, null, "food1"],
  ],
  Fortune: [
    ["Kung Pao Chicken", 320, null, "chicken"],
    ["Chicken Manchurian", 290, null, "chicken"],
    ["Veg Spring Rolls", 140, null, "food1"],
    ["Egg Fried Rice", 180, null, "food2"],
    ["Hot & Sour Soup", 120, null, "food3"],
    ["Chow Mein", 210, null, "food1"],
  ],
  Seafood: [
    ["Grilled Fish Fillet", 420, null, "food3"],
    ["Garlic Butter Prawns", 480, null, "food1"],
    ["Fish & Chips", 310, null, "food2"],
    ["Calamari Rings", 290, null, "food3"],
    ["Seafood Chowder", 220, null, "food1"],
    ["Lemon Tuna Salad", 200, null, "food2"],
  ],
  Moonland: [
    ["Chicken Tikka", 260, null, "chicken"],
    ["Seekh Kebab Platter", 340, null, "food3"],
    ["Chicken Karahi", 520, null, "chicken"],
    ["Garlic Naan", 40, null, "food1"],
    ["Mint Raita", 60, null, "food2"],
    ["Kheer", 100, null, "food3"],
    ["Sweet Lassi", 90, null, "food1"],
  ],
  Starfish: [
    ["Fettuccine Alfredo", 290, null, "food2"],
    ["Chicken Lasagna", 320, null, "chicken"],
    ["Penne Arrabbiata", 240, null, "food3"],
    ["Caesar Salad", 190, null, "food1"],
    ["Garlic Bread", 110, null, "food2"],
    ["Tiramisu", 160, null, "food3"],
  ],
  "Black Noodles": [
    ["Black Bean Noodles", 250, null, "food1"],
    ["Spicy Ramen", 280, null, "food2"],
    ["Pad Thai", 300, null, "food3"],
    ["Teriyaki Chicken Bowl", 270, null, "chicken"],
    ["Gyoza (6 pcs)", 180, null, "food1"],
    ["Mango Bubble Tea", 150, null, "food2"],
  ],
};

// [restaurant_id, name, price, type, image_key] for a fresh install.
export const MENU_SEED = RESTAURANT_SEED.flatMap(([id, restaurantName]) =>
  (MENU_BY_RESTAURANT[restaurantName] || []).map(([name, price, type, imageKey]) => [
    id,
    name,
    price,
    type,
    imageKey,
  ])
);

// Statements for the upgrade migration: for each seeded restaurant, matched by
// NAME (never by id, which may differ on an existing install), insert only the
// dishes it does not already have. An admin-created restaurant never matches.
// Once run, a dish an admin deletes later does not come back.
export const menuBackfillStatements = () =>
  Object.entries(MENU_BY_RESTAURANT).flatMap(([restaurantName, dishes]) =>
    dishes.map(([name, price, type, imageKey]) => [
      `INSERT INTO menu_items (restaurant_id, name, price, type, image_key)
       SELECT r.id, ?, ?, ?, ?
       FROM restaurants r
       WHERE r.id = (SELECT MIN(id) FROM restaurants WHERE name = ?)
         AND NOT EXISTS (
           SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = ?
         )`,
      [name, price, type, imageKey, restaurantName, name],
    ])
  );
