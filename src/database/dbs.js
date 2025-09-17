// import SQLite from "react-native-sqlite-storage";
// import { useEffect, useState } from "react";

// SQLite.enablePromise(false);

// // ✅ Open or create the DB
// const db = SQLite.openDatabase(
//   { name: "foodapp.db", location: "default" },
//   () => console.log("Database opened ✅"),
//   (e) => console.log("DB open error ❌", e)
// );

// // ✅ Create tables and seed data (call this ONCE, e.g. in HomeScreen)
// export const useCreateTables = () => {
//   useEffect(() => {
//     db.transaction((tx) => {
//       // --- Users table ---
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS users (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//         );`
//       );

//       // --- Restaurants table ---
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS restaurants (
//           id INTEGER PRIMARY KEY,
//           name TEXT,
//           rating REAL,
//           time TEXT,
//           offer TEXT,
//           category TEXT
//         );`
//       );

//       // --- Seed data only if empty ---
//       tx.executeSql(
//         "SELECT COUNT(*) as count FROM restaurants",
//         [],
//         (_t, { rows }) => {
//           const count = rows.item(0).count;
//           console.log("Restaurant table count:", count);
//           if (count === 0) {
//             console.log("Seeding restaurants…");
//             const seed = [
//               [1, "Westway", 4.6, "15 min", "50% OFF", "nearest"],
//               [2, "Fortune", 4.8, "25 min", null, "nearest"],
//               [3, "Seafood", 4.6, "20 min", null, "nearest"],
//               [7, "Moonland", 4.6, "15 min", null, "popular"],
//               [8, "Starfish", 4.8, "25 min", "30% OFF", "popular"],
//               [9, "Black Noodles", 4.9, "20 min", null, "popular"],
//             ];
//             seed.forEach((r) =>
//               tx.executeSql(
//                 "INSERT INTO restaurants (id,name,rating,time,offer,category) VALUES (?,?,?,?,?,?)",
//                 r,
//                 () => console.log("Inserted:", r[1]),
//                 (_e, err) => console.log("Insert error:", err)
//               )
//             );
//           }
//         },
//         (_e, err) => console.log("Count query error:", err)
//       );
//     });
//   }, []);
// };


// // ✅ Hook to fetch nearest & popular restaurants
// export const useRestaurants = () => {
//   const [nearest, setNearest] = useState([]);
//   const [popular, setPopular] = useState([]);

//   useEffect(() => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM restaurants WHERE category='nearest'",
//         [],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) {
//             arr.push(result.rows.item(i));
//           }
//           console.log("Fetched nearest:", arr);
//           setNearest(arr);
//         },
//         (_e, err) => console.log("Nearest query error:", err)
//       );

//       tx.executeSql(
//         "SELECT * FROM restaurants WHERE category='popular'",
//         [],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) {
//             arr.push(result.rows.item(i));
//           }
//           console.log("Fetched popular:", arr);
//           setPopular(arr);
//         },
//         (_e, err) => console.log("Popular query error:", err)
//       );
//     });
//   }, []);

//   return { nearest, popular };
// };

// export default db;
//  working with the homescreen sqlite and user login and register i think 
import SQLite from "react-native-sqlite-storage";
import { useEffect, useState } from "react";

SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened ✅"),
  (e) => console.log("DB open error ❌", e)
);

// ✅ Create tables and seed data
export const useCreateTables = () => {
  useEffect(() => {
    db.transaction((tx) => {
      // Users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT
        );`
      );

      // Restaurants table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS restaurants (
          id INTEGER PRIMARY KEY,
          name TEXT,
          rating REAL,
          time TEXT,
          offer TEXT,
          category TEXT
        );`
      );

      // Menu Items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          restaurant_id INTEGER,
          name TEXT,
          price REAL,
          type TEXT,
          image_key TEXT,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
        );`
      );

      // Cart table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_item_id INTEGER UNIQUE,
          name TEXT,
          price REAL,
          image_key TEXT,
          quantity INTEGER
        );`
      );

      // Seed restaurants if empty
      tx.executeSql(
        "SELECT COUNT(*) as count FROM restaurants",
        [],
        (_t, { rows }) => {
          if (rows.item(0).count === 0) {
            const seed = [
              [1, "Westway", 4.6, "15 min", "50% OFF", "nearest"],
              [2, "Fortune", 4.8, "25 min", null, "nearest"],
              [3, "Seafood", 4.6, "20 min", null, "nearest"],
              [7, "Moonland", 4.6, "15 min", null, "popular"],
              [8, "Starfish", 4.8, "25 min", "30% OFF", "popular"],
              [9, "Black Noodles", 4.9, "20 min", null, "popular"],
            ];
            seed.forEach((r) =>
              tx.executeSql(
                "INSERT INTO restaurants (id,name,rating,time,offer,category) VALUES (?,?,?,?,?,?)",
                r
              )
            );
          }
        }
      );

      // Seed menu_items if empty
      tx.executeSql(
        "SELECT COUNT(*) as count FROM menu_items",
        [],
        (_t, { rows }) => {
          if (rows.item(0).count === 0) {
            const menuSeed = [
              [1, "Moonland Special", 210, "Best Seller", "Moonland"],
              [1, "Burger Deluxe", 170, "Best Seller", "food2"],
              [1, "Veggie Supreme", 150, "Best Seller", "food1"],
              [1, "Margherita Pizza", 180, "Best Seller", "food3"],
            ];
            menuSeed.forEach((m) =>
              tx.executeSql(
                "INSERT INTO menu_items (restaurant_id,name,price,type,image_key) VALUES (?,?,?,?,?)",
                m
              )
            );
          }
        }
      );
    });
  }, []);
};

// ✅ Cart helpers
export const toggleCartItem = (item, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM cart WHERE menu_item_id=?",
      [item.id],
      (_t, res) => {
        if (res.rows.length > 0) {
          // Item exists → remove
          tx.executeSql(
            "DELETE FROM cart WHERE menu_item_id=?",
            [item.id],
            callback
          );
        } else {
          // Add new item with quantity 1
          tx.executeSql(
            `INSERT INTO cart (menu_item_id, name, price, image_key, quantity)
             VALUES (?, ?, ?, ?, 1)`,
            [item.id, item.name, item.price, item.image_key],
            callback
          );
        }
      }
    );
  });
};

export const updateQuantity = (menuItemId, delta) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE cart SET quantity = MAX(quantity + ?, 0) WHERE menu_item_id=?`,
      [delta, menuItemId]
    );
    tx.executeSql(`DELETE FROM cart WHERE quantity = 0`);
  });
};

export const removeFromCart = (menuItemId) => {
  db.transaction((tx) => {
    tx.executeSql(`DELETE FROM cart WHERE menu_item_id=?`, [menuItemId]);
  });
};

export const getCartItems = (setState) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM cart", [], (_t, res) => {
      const arr = [];
      for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
      setState(arr);
    });
  });
};

// ✅ Hook to fetch menu items for a restaurant
export const useMenuItems = (restaurantId) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!restaurantId) return;
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM menu_items WHERE restaurant_id=?",
        [restaurantId],
        (_t, result) => {
          const arr = [];
          for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
          setItems(arr);
        }
      );
    });
  }, [restaurantId]);
  return items;
};

// ✅ Hook to fetch restaurants
export const useRestaurants = () => {
  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM restaurants WHERE category='nearest'",
        [],
        (_t, result) => {
          const arr = [];
          for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
          setNearest(arr);
        }
      );
      tx.executeSql(
        "SELECT * FROM restaurants WHERE category='popular'",
        [],
        (_t, result) => {
          const arr = [];
          for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
          setPopular(arr);
        }
      );
    });
  }, []);

  return { nearest, popular };
};

export default db;
