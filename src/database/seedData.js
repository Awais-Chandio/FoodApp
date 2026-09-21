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

// Menu categories in the order the Menu screen shows them. Dishes with any
// other category (admin-created dishes default to "Other") come last.
export const MENU_CATEGORIES = ["Starters", "Mains", "Sides", "Desserts", "Drinks", "Other"];

// Restaurant name -> [name, price (Rs.), type, image key, description, category,
// is_veg (1/0), spice_level (0..3)]. Westway's first four are the original demo
// dishes and keep their ids on existing installs.
export const MENU_BY_RESTAURANT = {
  Westway: [
    ["Moonland Special", 210, BEST_SELLER, "Moonland", "Our signature grill platter with house spice rub and a smoky sauce.", "Mains", 0, 2],
    ["Burger Deluxe", 170, BEST_SELLER, "food2", "Double patty, cheddar and pickles in a toasted bun.", "Mains", 0, 1],
    ["Veggie Supreme", 150, BEST_SELLER, "food1", "Garden-fresh veggie stack with peppers, olives and melted cheese.", "Mains", 1, 1],
    ["Margherita Pizza", 180, BEST_SELLER, "food3", "Stone-baked crust, tomato sauce, mozzarella and basil.", "Mains", 1, 0],
    ["Peri Peri Wings", 240, null, "chicken", "Crispy wings tossed in a fiery peri peri glaze.", "Starters", 0, 3],
    ["Loaded Fries", 130, null, "food2", "Golden fries with cheese sauce, jalapeños and herbs.", "Sides", 1, 1],
    ["Chocolate Brownie", 110, null, "food1", "Warm fudgy brownie with a molten chocolate centre.", "Desserts", 1, 0],
  ],
  Fortune: [
    ["Kung Pao Chicken", 320, null, "chicken", "Wok-tossed chicken, peanuts and dried chillies in a sweet-spicy sauce.", "Mains", 0, 2],
    ["Chicken Manchurian", 290, null, "chicken", "Crispy chicken bites in a tangy garlic-soy gravy.", "Mains", 0, 2],
    ["Veg Spring Rolls", 140, null, "food1", "Crunchy rolls stuffed with cabbage, carrot and glass noodles.", "Starters", 1, 0],
    ["Egg Fried Rice", 180, null, "food2", "Wok-fried rice with scrambled egg, spring onion and soy.", "Mains", 0, 0],
    ["Hot & Sour Soup", 120, null, "food3", "Peppery, tangy vegetable soup with mushrooms and tofu.", "Starters", 1, 2],
    ["Chow Mein", 210, null, "food1", "Stir-fried noodles with crisp vegetables and light soy.", "Mains", 1, 1],
  ],
  Seafood: [
    ["Grilled Fish Fillet", 420, null, "food3", "Flame-grilled fillet with lemon butter and steamed greens.", "Mains", 0, 1],
    ["Garlic Butter Prawns", 480, null, "food1", "Juicy prawns sautéed in garlic butter and parsley.", "Starters", 0, 1],
    ["Fish & Chips", 310, null, "food2", "Beer-battered fish with thick-cut chips and tartar sauce.", "Mains", 0, 0],
    ["Calamari Rings", 290, null, "food3", "Lightly crumbed squid rings with a zesty aioli dip.", "Starters", 0, 0],
    ["Seafood Chowder", 220, null, "food1", "Creamy chowder packed with fish, prawns and potato.", "Starters", 0, 0],
    ["Lemon Tuna Salad", 200, null, "food2", "Flaked tuna, crisp greens and a bright lemon dressing.", "Starters", 0, 0],
  ],
  Moonland: [
    ["Chicken Tikka", 260, null, "chicken", "Charcoal-grilled chicken marinated in yoghurt and spices.", "Starters", 0, 2],
    ["Seekh Kebab Platter", 340, null, "food3", "Minced-meat skewers with mint chutney and salad.", "Mains", 0, 2],
    ["Chicken Karahi", 520, null, "chicken", "Slow-cooked chicken in a rich tomato, ginger and chilli masala.", "Mains", 0, 3],
    ["Garlic Naan", 40, null, "food1", "Tandoor-baked bread brushed with garlic butter.", "Sides", 1, 0],
    ["Mint Raita", 60, null, "food2", "Cooling yoghurt with cucumber and fresh mint.", "Sides", 1, 0],
    ["Kheer", 100, null, "food3", "Creamy rice pudding with cardamom and pistachios.", "Desserts", 1, 0],
    ["Sweet Lassi", 90, null, "food1", "Chilled sweet yoghurt drink, thick and frothy.", "Drinks", 1, 0],
  ],
  Starfish: [
    ["Fettuccine Alfredo", 290, null, "food2", "Ribbon pasta in a silky parmesan cream sauce.", "Mains", 1, 0],
    ["Chicken Lasagna", 320, null, "chicken", "Layered pasta, chicken ragù and bubbling cheese.", "Mains", 0, 0],
    ["Penne Arrabbiata", 240, null, "food3", "Penne in a spicy tomato, garlic and chilli sauce.", "Mains", 1, 2],
    ["Caesar Salad", 190, null, "food1", "Romaine, grilled chicken, croutons and parmesan.", "Starters", 0, 0],
    ["Garlic Bread", 110, null, "food2", "Toasted baguette with garlic butter and herbs.", "Sides", 1, 0],
    ["Tiramisu", 160, null, "food3", "Espresso-soaked sponge layered with mascarpone cream.", "Desserts", 1, 0],
  ],
  "Black Noodles": [
    ["Black Bean Noodles", 250, null, "food1", "Springy noodles in a savoury black bean sauce with vegetables.", "Mains", 1, 1],
    ["Spicy Ramen", 280, null, "food2", "Rich chilli broth, noodles, egg and spring onion.", "Mains", 0, 3],
    ["Pad Thai", 300, null, "food3", "Rice noodles with prawns, peanuts, lime and tamarind.", "Mains", 0, 1],
    ["Teriyaki Chicken Bowl", 270, null, "chicken", "Glazed chicken over steamed rice with sesame greens.", "Mains", 0, 0],
    ["Gyoza (6 pcs)", 180, null, "food1", "Pan-seared dumplings with a chilli-soy dipping sauce.", "Starters", 0, 1],
    ["Mango Bubble Tea", 150, null, "food2", "Fresh mango tea with chewy tapioca pearls.", "Drinks", 1, 0],
  ],
};

// [restaurant_id, name, price, type, image_key, description, category, is_veg,
// spice_level] for a fresh install (the version-8 columns exist by then).
export const MENU_SEED = RESTAURANT_SEED.flatMap(([id, restaurantName]) =>
  (MENU_BY_RESTAURANT[restaurantName] || []).map((dish) => [id, ...dish])
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

// Version-8 back-fill for dishes that already exist: the same name matching as
// above, and only dishes that have not been described yet.
export const menuDetailsBackfillStatements = () =>
  Object.entries(MENU_BY_RESTAURANT).flatMap(([restaurantName, dishes]) =>
    dishes.map(([name, , , , description, category, isVeg, spice]) => [
      `UPDATE menu_items
       SET description = ?, category = ?, is_veg = ?, spice_level = ?
       WHERE name = ?
         AND restaurant_id = (SELECT MIN(id) FROM restaurants WHERE name = ?)
         AND description IS NULL`,
      [description, category, isVeg, spice, name, restaurantName],
    ])
  );
