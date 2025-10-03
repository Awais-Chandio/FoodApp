import SQLite from "react-native-sqlite-storage";
import { useEffect, useState } from "react";

SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened ✅"),
  (e) => console.log("DB open error ❌", e)
);

const cleanObject = (obj) => {
  const cleaned = {};
  for (let key in obj) {
    let value = obj[key];

    if (value === undefined) {
      cleaned[key] = null;
    } else if (value instanceof Date) {
      cleaned[key] = value.toISOString();
    } else if (typeof value === "function") {
      continue; 
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};




export const useCreateTables = () => {
  useEffect(() => {
    db.transaction((tx) => {
   
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'user'
        );
      `);

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT
        );`,
        [],
        () => console.log("✅ admin_users table ready"),
        (_, err) => console.log("❌ Error creating admin_users", err)
      );

      tx.executeSql(
        "SELECT COUNT(*) AS count FROM users WHERE email = ?",
        ["admin@foodapp.com"],
        (_t, { rows }) => {
          if (rows.item(0).count === 0) {
            tx.executeSql(
              "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
              ["admin@foodapp.com", "admin123", "admin"],
              () => console.log("Admin user created ✅"),
              (_t, err) => console.log("Admin insert error ❌", err)
            );
          }
        }
      );


      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          rating REAL,
          time TEXT,
          offer TEXT,
          category TEXT,
          image_path TEXT
        );
      `);

  
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

 
      
      

  
      tx.executeSql("SELECT COUNT(*) as count FROM restaurants", [], (_t, { rows }) => {
        if (rows.item(0).count === 0) {
          const seed = [
            [1, "Westway", 4.6, "15 min", "50% OFF", "nearest", null],
            [2, "Fortune", 4.8, "25 min", null, "nearest", null],
            [3, "Seafood", 4.6, "20 min", null, "nearest", null],
            [7, "Moonland", 4.6, "15 min", null, "popular", null],
            [8, "Starfish", 4.8, "25 min", "30% OFF", "popular", null],
            [9, "Black Noodles", 4.9, "20 min", null, "popular", null],
          ];
          seed.forEach((r) =>
            tx.executeSql(
              "INSERT INTO restaurants (id, name, rating, time, offer, category, image_path) VALUES (?,?,?,?,?,?,?)",
              r
            )
          );
        }
      });

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
              "INSERT INTO menu_items (restaurant_id, name, price, type, image_key) VALUES (?,?,?,?,?)",
              m
            )
          );
        }
      });
    });
  }, []);
};


export const insertAdminUser = (userObj, onSuccess) => {
  const safeUser = { ...userObj };
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO admin_users (data) VALUES (?)`,
      [JSON.stringify(safeUser)],
      (_, result) => {
        console.log("✅ Admin user inserted", result);
        if (onSuccess) onSuccess(result.insertId);
      },
      (_, error) => {
        console.log("❌ Insert error", error);
        return false;
      }
    );
  });
};

export const getAdminUsers = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM admin_users`,
      [],
      (_, { rows }) => {
        const data = [];
        for (let i = 0; i < rows.length; i++) {
          const item = rows.item(i);
          try {
            const parsed = JSON.parse(item.data);
            data.push({ id: item.id, ...parsed });
          } catch (e) {
            console.log("❌ JSON parse error", e);
          }
        }
        callback(data);
      },
      (_, error) => console.log("❌ Fetch error", error)
    );
  });
};


export const deleteAdminUser = (id, onSuccess) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM admin_users WHERE id = ?`,
      [id],
      (_, result) => {
        console.log("✅ Deleted user", result);
        if (onSuccess) onSuccess();
      },
      (_, error) => console.log("❌ Delete error", error)
    );
  });
};


export const updateAdminUser = (id, userObj, onSuccess) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE admin_users SET data = ? WHERE id = ?`,
      [JSON.stringify(userObj), id],
      (_, result) => {
        console.log("✅ Updated user", result);
        if (onSuccess) onSuccess();
      },
      (_, error) => console.log("❌ Update error", error)
    );
  });
};



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

export const registerUser = (email, password, onSuccess, onError, role = "user") => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
        [email, password, role],
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
        (_t, err) => onError && onError(err)
      );
    },
    (err) => onError && onError(err)
  );
};

export const fetchRestaurants = () =>
  new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT * FROM restaurants",
          [],
          async (_t, res) => {
            const nearest = [];
            const popular = [];
            const allRestaurants = [];

            for (let i = 0; i < res.rows.length; i++) {
              const r = res.rows.item(i);

              const menuItems = await new Promise((resMenu, rejMenu) => {
                db.transaction((tx2) => {
                  tx2.executeSql(
                    "SELECT * FROM menu_items WHERE restaurant_id=?",
                    [r.id],
                    (_t2, menuRes) => {
                      const items = [];
                      for (let j = 0; j < menuRes.rows.length; j++) {
                        items.push(menuRes.rows.item(j));
                      }
                      resMenu(items);
                    },
                    (_t2, err2) => rejMenu(err2)
                  );
                });
              });

              r.menu_items = menuItems;
              allRestaurants.push(r);
            }

            allRestaurants.forEach((r) => {
              if (r.category === "nearest") nearest.push(r);
              else if (r.category === "popular") popular.push(r);
            });

            resolve({ nearest, popular });
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

export const insertRestaurant = (name, rating, time, offer, category, imagePath, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `INSERT INTO restaurants (name, rating, time, offer, category, image_path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, rating, time, offer, category, imagePath],
        () => onSuccess && onSuccess(),
        (_t, err) => onError && onError(err)
      );
    },
    (err) => onError && onError(err)
  );
};

export const updateRestaurant = (id, name, rating, time, offer, category, imagePath, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `UPDATE restaurants
         SET name = ?, rating = ?, time = ?, offer = ?, category = ?, image_path = ?
         WHERE id = ?`,
        [name, rating, time, offer, category, imagePath, id],
        () => onSuccess && onSuccess(),
        (_t, err) => onError && onError(err)
      );
    },
    (err) => onError && onError(err)
  );
};

export const insertMenuItem = (restaurantId, name, price, type, imageKey, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `INSERT INTO menu_items (restaurant_id, name, price, type, image_key)
         VALUES (?, ?, ?, ?, ?)`,
        [restaurantId, name, price, type || null, imageKey || null],
        () => onSuccess && onSuccess(),
        (_t, err) => onError && onError(err)
      );
    },
    (err) => onError && onError(err)
  );
};

export const updateMenuItem = (id, name, price, type, imageKey, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `UPDATE menu_items
         SET name = ?, price = ?, type = ?, image_key = ?
         WHERE id = ?`,
        [name, price, type || null, imageKey || null, id],
        () => onSuccess && onSuccess(),
        (_t, err) => onError && onError(err)
      );
    },
    (err) => onError && onError(err)
  );
};

export const deleteMenuItem = (id, onSuccess, onError) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        "DELETE FROM menu_items WHERE id = ?",
        [id],
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
