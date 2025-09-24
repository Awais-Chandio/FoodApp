// import SQLite from "react-native-sqlite-storage";
// import { useEffect, useState } from "react";

// SQLite.enablePromise(false);

// const db = SQLite.openDatabase(
//   { name: "foodapp.db", location: "default" },
//   () => console.log("Database opened ✅"),
//   (e) => console.log("DB open error ❌", e)
// );


// export const useCreateTables = () => {
//   useEffect(() => {
//     db.transaction((tx) => {
//       // Users table
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS users (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//         );`
//       );


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


//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS menu_items (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           restaurant_id INTEGER,
//           name TEXT,
//           price REAL,
//           type TEXT,
//           image_key TEXT,
//           FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
//         );`
//       );

//       // Cart table
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS cart (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           menu_item_id INTEGER UNIQUE,
//           name TEXT,
//           price REAL,
//           image_key TEXT,
//           quantity INTEGER
//         );`
//       );

//       // Seed restaurants if empty
//       tx.executeSql(
//         "SELECT COUNT(*) as count FROM restaurants",
//         [],
//         (_t, { rows }) => {
//           if (rows.item(0).count === 0) {
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
//                 r
//               )
//             );
//           }
//         }
//       );

//       // Seed menu_items if empty
//       tx.executeSql(
//         "SELECT COUNT(*) as count FROM menu_items",
//         [],
//         (_t, { rows }) => {
//           if (rows.item(0).count === 0) {
//             const menuSeed = [
//               [1, "Moonland Special", 210, "Best Seller", "Moonland"],
//               [1, "Burger Deluxe", 170, "Best Seller", "food2"],
//               [1, "Veggie Supreme", 150, "Best Seller", "food1"],
//               [1, "Margherita Pizza", 180, "Best Seller", "food3"],
//             ];
//             menuSeed.forEach((m) =>
//               tx.executeSql(
//                 "INSERT INTO menu_items (restaurant_id,name,price,type,image_key) VALUES (?,?,?,?,?)",
//                 m
//               )
//             );
//           }
//         }
//       );
//     });
//   }, []);
// };

// // ✅ Cart helpers
// export const toggleCartItem = (item, callback) => {
//   db.transaction((tx) => {
//     tx.executeSql(
//       "SELECT * FROM cart WHERE menu_item_id=?",
//       [item.id],
//       (_t, res) => {
//         if (res.rows.length > 0) {
//           // Item exists → remove
//           tx.executeSql(
//             "DELETE FROM cart WHERE menu_item_id=?",
//             [item.id],
//             callback
//           );
//         } else {
//           // Add new item with quantity 1
//           tx.executeSql(
//             `INSERT INTO cart (menu_item_id, name, price, image_key, quantity)
//              VALUES (?, ?, ?, ?, 1)`,
//             [item.id, item.name, item.price, item.image_key],
//             callback
//           );
//         }
//       }
//     );
//   });
// };

// // dbs.js
// export const updateQuantity = (menuItemId, delta) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         // increment or decrement
//         tx.executeSql(
//           `UPDATE cart 
//            SET quantity = MAX(quantity + ?, 0) 
//            WHERE menu_item_id = ?`,
//           [delta, menuItemId]
//         );
//         // remove rows that hit 0
//         tx.executeSql(
//           `DELETE FROM cart WHERE quantity = 0`
//         );
//       },
//       (err) => reject(err),
//       () => resolve()   // <- resolve only after the whole transaction commits
//     );
//   });
// };


// export const removeFromCart = (menuItemId) => {
//   db.transaction((tx) => {
//     tx.executeSql(`DELETE FROM cart WHERE menu_item_id=?`, [menuItemId]);
//   });
// };

// export const getCartItems = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           "SELECT * FROM cart",
//           [],
//           (_t, res) => {
//             const arr = [];
//             for (let i = 0; i < res.rows.length; i++) {
//               arr.push(res.rows.item(i));
//             }
//             resolve(arr);
//           },
//           (_t, err) => reject(err)
//         );
//       },
//       (err) => reject(err)
//     );
//   });
// };



// // ✅ Hook to fetch menu items for a restaurant
// export const useMenuItems = (restaurantId) => {
//   const [items, setItems] = useState([]);
//   useEffect(() => {
//     if (!restaurantId) return;
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM menu_items WHERE restaurant_id=?",
//         [restaurantId],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setItems(arr);
//         }
//       );
//     });
//   }, [restaurantId]);
//   return items;
// };

// // ✅ Hook to fetch restaurants
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
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setNearest(arr);
//         }
//       );
//       tx.executeSql(
//         "SELECT * FROM restaurants WHERE category='popular'",
//         [],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setPopular(arr);
//         }
//       );
//     });
//   }, []);

//   return { nearest, popular };
// };


// // ✅ ===== USER AUTH HELPERS =====

// // Register a new user
// export const registerUser = (email, password, onSuccess, onError) => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `INSERT INTO users (email, password) VALUES (?, ?)`,
//         [email, password],
//         () => onSuccess && onSuccess(),
//         (_, err) => {
//           // Email must be unique; handle constraint errors
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };

// // Login existing user
// export const loginUser = (email, password, onSuccess, onError) => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `SELECT * FROM users WHERE email = ? AND password = ?`,
//         [email, password],
//         (_t, res) => {
//           if (res.rows.length > 0) {
//             // success → send back the first matching row
//             onSuccess && onSuccess(res.rows.item(0));
//           } else {
//             onError && onError(new Error("Invalid email or password"));
//           }
//         },
//         (_, err) => {
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };

// export default db;


//  working fine users, restaurants, menu_items, cart tables with seed data but for admin 










// import SQLite from "react-native-sqlite-storage";
// import { useEffect, useState } from "react";

// SQLite.enablePromise(false);

// const db = SQLite.openDatabase(
//   { name: "foodapp.db", location: "default" },
//   () => console.log("Database opened ✅"),
//   (e) => console.log("DB open error ❌", e)
// );

// export const useCreateTables = () => {
//   useEffect(() => {
//     db.transaction((tx) => {
//       // --- USERS TABLE with role ---
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS users (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT,
//           role TEXT DEFAULT 'user'
//         );`
//       );

//       // ✅ ensure a default admin exists (insert only if missing)
//       tx.executeSql(
//         `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
//         ["admin@foodapp.com"],
//         (_t, { rows }) => {
//           if (rows.item(0).count === 0) {
//             tx.executeSql(
//               `INSERT INTO users (email, password, role)
//                VALUES (?, ?, ?)`,
//               ["admin@foodapp.com", "admin123", "admin"],
//               () => console.log("Admin user inserted ✅")
//             );
//           } else {
//             console.log("Admin user already present");
//           }
//         }
//       );

//       // ---------- Restaurants ----------
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

//       // ---------- Menu Items ----------
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS menu_items (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           restaurant_id INTEGER,
//           name TEXT,
//           price REAL,
//           type TEXT,
//           image_key TEXT,
//           FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
//         );`
//       );

//       // ---------- Cart ----------
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS cart (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           menu_item_id INTEGER UNIQUE,
//           name TEXT,
//           price REAL,
//           image_key TEXT,
//           quantity INTEGER
//         );`
//       );

//       // ---------- Seed data ----------
//       tx.executeSql(
//         "SELECT COUNT(*) as count FROM restaurants",
//         [],
//         (_t, { rows }) => {
//           if (rows.item(0).count === 0) {
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
//                 r
//               )
//             );
//           }
//         }
//       );

//       tx.executeSql(
//         "SELECT COUNT(*) as count FROM menu_items",
//         [],
//         (_t, { rows }) => {
//           if (rows.item(0).count === 0) {
//             const menuSeed = [
//               [1, "Moonland Special", 210, "Best Seller", "Moonland"],
//               [1, "Burger Deluxe", 170, "Best Seller", "food2"],
//               [1, "Veggie Supreme", 150, "Best Seller", "food1"],
//               [1, "Margherita Pizza", 180, "Best Seller", "food3"],
//             ];
//             menuSeed.forEach((m) =>
//               tx.executeSql(
//                 "INSERT INTO menu_items (restaurant_id,name,price,type,image_key) VALUES (?,?,?,?,?)",
//                 m
//               )
//             );
//           }
//         }
//       );
//     });
//   }, []);
// };

// // ✅ Cart helpers (unchanged)
// export const toggleCartItem = (item, callback) => {
//   db.transaction((tx) => {
//     tx.executeSql(
//       "SELECT * FROM cart WHERE menu_item_id=?",
//       [item.id],
//       (_t, res) => {
//         if (res.rows.length > 0) {
//           tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [item.id], callback);
//         } else {
//           tx.executeSql(
//             `INSERT INTO cart (menu_item_id, name, price, image_key, quantity)
//              VALUES (?, ?, ?, ?, 1)`,
//             [item.id, item.name, item.price, item.image_key],
//             callback
//           );
//         }
//       }
//     );
//   });
// };

// export const updateQuantity = (menuItemId, delta) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           `UPDATE cart SET quantity = MAX(quantity + ?, 0) WHERE menu_item_id = ?`,
//           [delta, menuItemId]
//         );
//         tx.executeSql(`DELETE FROM cart WHERE quantity = 0`);
//       },
//       (err) => reject(err),
//       () => resolve()
//     );
//   });
// };

// export const removeFromCart = (menuItemId) => {
//   db.transaction((tx) => {
//     tx.executeSql(`DELETE FROM cart WHERE menu_item_id=?`, [menuItemId]);
//   });
// };

// export const getCartItems = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           "SELECT * FROM cart",
//           [],
//           (_t, res) => {
//             const arr = [];
//             for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//             resolve(arr);
//           },
//           (_t, err) => reject(err)
//         );
//       },
//       (err) => reject(err)
//     );
//   });
// };

// // ✅ Menu/Restaurants hooks (unchanged)
// export const useMenuItems = (restaurantId) => {
//   const [items, setItems] = useState([]);
//   useEffect(() => {
//     if (!restaurantId) return;
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM menu_items WHERE restaurant_id=?",
//         [restaurantId],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setItems(arr);
//         }
//       );
//     });
//   }, [restaurantId]);
//   return items;
// };

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
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setNearest(arr);
//         }
//       );
//       tx.executeSql(
//         "SELECT * FROM restaurants WHERE category='popular'",
//         [],
//         (_t, result) => {
//           const arr = [];
//           for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
//           setPopular(arr);
//         }
//       );
//     });
//   }, []);

//   return { nearest, popular };
// };

// // ✅ ===== USER AUTH HELPERS =====
// export const registerUser = (email, password, onSuccess, onError, role = "user") => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
//         [email, password, role],
//         () => onSuccess && onSuccess(),
//         (_, err) => {
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };

// export const loginUser = (email, password, onSuccess, onError) => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `SELECT * FROM users WHERE email = ? AND password = ?`,
//         [email, password],
//         (_t, res) => {
//           if (res.rows.length > 0) {
//             onSuccess && onSuccess(res.rows.item(0));
//           } else {
//             onError && onError(new Error("Invalid email or password"));
//           }
//         },
//         (_, err) => {
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };

// // fetch restaurants (returns a Promise resolving { nearest, popular })
// export const fetchRestaurants = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           "SELECT * FROM restaurants WHERE category='nearest'",
//           [],
//           (_t, resNearest) => {
//             const nearest = [];
//             for (let i = 0; i < resNearest.rows.length; i++) nearest.push(resNearest.rows.item(i));

//             tx.executeSql(
//               "SELECT * FROM restaurants WHERE category='popular'",
//               [],
//               (_t2, resPopular) => {
//                 const popular = [];
//                 for (let i = 0; i < resPopular.rows.length; i++) popular.push(resPopular.rows.item(i));
//                 resolve({ nearest, popular });
//               },
//               (_t2, err2) => reject(err2)
//             );
//           },
//           (_t, err) => reject(err)
//         );
//       },
//       (err) => reject(err)
//     );
//   });
// };

// // delete a restaurant and its menu_items
// export const deleteRestaurant = (restaurantId, onSuccess, onError) => {
//   db.transaction(
//     (tx) => {
//       // remove menu items for that restaurant first (avoid orphan rows)
//       tx.executeSql("DELETE FROM menu_items WHERE restaurant_id = ?", [restaurantId]);
//       // then delete the restaurant
//       tx.executeSql(
//         "DELETE FROM restaurants WHERE id = ?",
//         [restaurantId],
//         () => onSuccess && onSuccess(),
//         (_t, err) => {
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };

// // update a restaurant
// export const updateRestaurant = (id, name, rating, time, offer, category, onSuccess, onError) => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `UPDATE restaurants
//            SET name = ?, rating = ?, time = ?, offer = ?, category = ?
//          WHERE id = ?`,
//         [name, rating, time, offer, category, id],
//         () => onSuccess && onSuccess(),
//         (_t, err) => {
//           onError && onError(err);
//           return false;
//         }
//       );
//     },
//     (err) => onError && onError(err)
//   );
// };


// export default db;



// src/database/dbs.js






import SQLite from "react-native-sqlite-storage";
import { useEffect, useState } from "react";

SQLite.enablePromise(false);

// ---------- OPEN DB ----------
const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened ✅"),
  (e) => console.log("DB open error ❌", e)
);

// ---------- CREATE & SEED TABLES ----------
export const useCreateTables = () => {
  useEffect(() => {
    db.transaction((tx) => {
      // USERS (with role)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'user'
        );
      `);

      // ensure default admin
      tx.executeSql(
        "SELECT COUNT(*) AS count FROM users WHERE email = ?",
        ["admin@foodapp.com"],
        (_t, { rows }) => {
          if (rows.item(0).count === 0) {
            tx.executeSql(
              `INSERT INTO users (email, password, role)
               VALUES (?, ?, ?)`,
              ["admin@foodapp.com", "admin123", "admin"],
              () => console.log("Admin user inserted ✅")
            );
          }
        }
      );

      // RESTAURANTS
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id INTEGER PRIMARY KEY,
          name TEXT,
          rating REAL,
          time TEXT,
          offer TEXT,
          category TEXT
        );
      `);

      // MENU ITEMS
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          restaurant_id INTEGER,
          name TEXT,
          price REAL,
          type TEXT,
          image_key TEXT,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
        );
      `);

      // CART
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_item_id INTEGER UNIQUE,
          name TEXT,
          price REAL,
          image_key TEXT,
          quantity INTEGER
        );
      `);

      // ---- Seed sample restaurants ----
      tx.executeSql("SELECT COUNT(*) as count FROM restaurants", [], (_t, { rows }) => {
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
      });

      // ---- Seed menu items ----
      tx.executeSql("SELECT COUNT(*) as count FROM menu_items", [], (_t, { rows }) => {
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
      });
    });
  }, []);
};

// ---------- CART HELPERS ----------
export const toggleCartItem = (item, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM cart WHERE menu_item_id=?",
      [item.id],
      (_t, res) => {
        if (res.rows.length > 0) {
          tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [item.id], callback);
        } else {
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

export const updateQuantity = (menuItemId, delta) =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE cart SET quantity = MAX(quantity + ?, 0) WHERE menu_item_id = ?`,
          [delta, menuItemId]
        );
        tx.executeSql(`DELETE FROM cart WHERE quantity = 0`);
      },
      (err) => reject(err),
      () => resolve()
    );
  });

export const removeFromCart = (menuItemId) => {
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [menuItemId]);
  });
};

export const getCartItems = () =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT * FROM cart",
          [],
          (_t, res) => {
            const arr = [];
            for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
            resolve(arr);
          },
          (_t, err) => reject(err)
        );
      },
      (err) => reject(err)
    );
  });

// ---------- HOOKS ----------
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

export const useRestaurants = () => {
  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM restaurants WHERE category='nearest'", [], (_t, r) => {
        const arr = [];
        for (let i = 0; i < r.rows.length; i++) arr.push(r.rows.item(i));
        setNearest(arr);
      });
      tx.executeSql("SELECT * FROM restaurants WHERE category='popular'", [], (_t, r) => {
        const arr = [];
        for (let i = 0; i < r.rows.length; i++) arr.push(r.rows.item(i));
        setPopular(arr);
      });
    });
  }, []);
  return { nearest, popular };
};

// ---------- AUTH ----------
export const registerUser = (email, password, onSuccess, onError, role = "user") => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
        [email, password, role],
        () => onSuccess && onSuccess(),
        (_, err) => {
          onError && onError(err);
          return false;
        }
      );
    },
    (err) => onError && onError(err)
  );
};

export const loginUser = (email, password, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `SELECT * FROM users WHERE email = ? AND password = ?`,
        [email, password],
        (_t, res) => {
          if (res.rows.length > 0) onSuccess && onSuccess(res.rows.item(0));
          else onError && onError(new Error("Invalid email or password"));
        },
        (_, err) => {
          onError && onError(err);
          return false;
        }
      );
    },
    (err) => onError && onError(err)
  );
};

// ---------- RESTAURANT CRUD ----------
export const fetchRestaurants = () =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT * FROM restaurants WHERE category='nearest'",
          [],
          (_t, resNearest) => {
            const nearest = [];
            for (let i = 0; i < resNearest.rows.length; i++) nearest.push(resNearest.rows.item(i));

            tx.executeSql(
              "SELECT * FROM restaurants WHERE category='popular'",
              [],
              (_t2, resPopular) => {
                const popular = [];
                for (let i = 0; i < resPopular.rows.length; i++)
                  popular.push(resPopular.rows.item(i));
                resolve({ nearest, popular });
              },
              (_t2, err2) => reject(err2)
            );
          },
          (_t, err) => reject(err)
        );
      },
      (err) => reject(err)
    );
  });

export const deleteRestaurant = (restaurantId, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql("DELETE FROM menu_items WHERE restaurant_id = ?", [restaurantId]);
      tx.executeSql(
        "DELETE FROM restaurants WHERE id = ?",
        [restaurantId],
        () => onSuccess && onSuccess(),
        (_t, err) => {
          onError && onError(err);
          return false;
        }
      );
    },
    (err) => onError && onError(err)
  );
};

export const updateRestaurant = (
  id,
  name,
  rating,
  time,
  offer,
  category,
  onSuccess,
  onError
) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `UPDATE restaurants
           SET name = ?, rating = ?, time = ?, offer = ?, category = ?
         WHERE id = ?`,
        [name, rating, time, offer, category, id],
        () => onSuccess && onSuccess(),
        (_t, err) => {
          onError && onError(err);
          return false;
        }
      );
    },
    (err) => onError && onError(err)
  );
};




export const insertRestaurant = (name, rating, time, offer, category, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `INSERT INTO restaurants (name, rating, time, offer, category)
         VALUES (?, ?, ?, ?, ?)`,
        [name, rating, time, offer, category],
        () => onSuccess && onSuccess(),
        (_t, err) => {
          onError && onError(err);
          return false;
        }
      );
    },
    (err) => onError && onError(err)
  );
};


export default db;
