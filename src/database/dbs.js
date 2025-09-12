import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened ✅"),
  (error) => console.log("Error opening database:", error)
);

// ------------------- SAMPLE DATA -------------------
const nearestRestaurants = [
  {
    id: "1",
    name: "Westway",
    image: "../../assets/Westway.png",
    rating: 4.6,
    time: "15 min",
    offer: "50% OFF",
  },
  {
    id: "2",
    name: "Fortune",
    image: "../../assets/Fortune.png",
    rating: 4.8,
    time: "25 min",
  },
  {
    id: "3",
    name: "Seafood",
    image: "../../assets/Seafood.png",
    rating: 4.6,
    time: "20 min",
  },
  {
    id: "4",
    name: "Food Special 1",
    image: "../../assets/food1.jpg",
    rating: 4.5,
    time: "18 min",
  },
  {
    id: "5",
    name: "Food Special 2",
    image: "../../assets/food2.jpg",
    rating: 4.7,
    time: "22 min",
  },
  {
    id: "6",
    name: "Food Special 3",
    image: "../../assets/food3.jpg",
    rating: 4.9,
    time: "12 min",
  },
];

const popularRestaurants = [
  {
    id: "1",
    name: "Moonland",
    image: "../../assets/Moonland.png",
    rating: 4.6,
    time: "15 min",
  },
  {
    id: "2",
    name: "Starfish",
    image: "../../assets/Starfish.png",
    rating: 4.8,
    time: "25 min",
    offer: "30% OFF",
  },
  {
    id: "3",
    name: "Black Noodles",
    image: "../../assets/BlackNodles.png",
    rating: 4.9,
    time: "20 min",
  },
  {
    id: "4",
    name: "Food Special 1",
    image: "../../assets/food1.jpg",
    rating: 4.5,
    time: "18 min",
  },
  {
    id: "5",
    name: "Food Special 2",
    image: "../../assets/food2.jpg",
    rating: 4.7,
    time: "22 min",
  },
  {
    id: "6",
    name: "Food Special 3",
    image: "../../assets/food3.jpg",
    rating: 4.9,
    time: "12 min",
  },
];

// ------------------- TABLE CREATION -------------------
export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        image TEXT
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY,
        name TEXT,
        image TEXT,
        price REAL,
        quantity INTEGER
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS restaurants (
        id TEXT PRIMARY KEY,
        name TEXT,
        image TEXT,
        rating REAL,
        time TEXT,
        offer TEXT,
        type TEXT
      );`
    );

    console.log("All tables created ✅");
  });

  // Insert seed data if empty
  seedRestaurants();
};

// ------------------- SEEDING DATA -------------------
const seedRestaurants = () => {
  db.transaction((tx) => {
    tx.executeSql("SELECT COUNT(*) as count FROM restaurants;", [], (_, result) => {
      if (result.rows.item(0).count === 0) {
        console.log("Seeding restaurants data...");

        nearestRestaurants.forEach((r) => {
          tx.executeSql(
            "INSERT INTO restaurants (id, name, image, rating, time, offer, type) VALUES (?, ?, ?, ?, ?, ?, ?);",
            [r.id, r.name, r.image, r.rating, r.time, r.offer || "", "nearest"]
          );
        });

        popularRestaurants.forEach((r) => {
          tx.executeSql(
            "INSERT INTO restaurants (id, name, image, rating, time, offer, type) VALUES (?, ?, ?, ?, ?, ?, ?);",
            [r.id, r.name, r.image, r.rating, r.time, r.offer || "", "popular"]
          );
        });

        console.log("Restaurants seeded ✅");
      }
    });
  });
};

// ------------------- RESTAURANTS FUNCTIONS -------------------
export const getRestaurants = (type, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM restaurants WHERE type = ?;",
      [type],
      (_, { rows }) => {
        callback(rows._array || []);
      }
    );
  });
};

// ------------------- USER FUNCTIONS -------------------
export const registerUser = (email, password, successCallback, errorCallback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO users (email, password) VALUES (?, ?);",
      [email, password],
      (_, result) => successCallback?.(result),
      (_, error) => {
        errorCallback?.(error);
        return false;
      }
    );
  });
};

export const loginUser = (email, password, successCallback, errorCallback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM users WHERE email = ? AND password = ?;",
      [email, password],
      (_, { rows }) => {
        if (rows.length > 0) {
          successCallback?.(rows.item(0));
        } else {
          errorCallback?.("Invalid login");
        }
      },
      (_, error) => {
        errorCallback?.(error);
        return false;
      }
    );
  });
};

// ------------------- ITEMS FUNCTIONS -------------------
export const insertItem = (name, price, image) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO items (name, price, image) VALUES (?, ?, ?);",
      [name, price, image]
    );
  });
};

export const getItems = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM items;", [], (_, { rows }) => {
      callback(rows._array || []);
    });
  });
};

// ------------------- CART FUNCTIONS -------------------
export const addToCart = (item, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM cart WHERE id = ?;",
      [item.id],
      (_, { rows }) => {
        if (rows.length > 0) {
          tx.executeSql(
            "UPDATE cart SET quantity = quantity + 1 WHERE id = ?;",
            [item.id],
            () => callback?.()
          );
        } else {
          tx.executeSql(
            "INSERT INTO cart (id, name, image, price, quantity) VALUES (?, ?, ?, ?, ?);",
            [
              item.id,
              item.name,
              item.image,
              item.price || 0,
              1,
            ],
            () => callback?.()
          );
        }
      }
    );
  });
};

export const getCartItems = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM cart;", [], (_, { rows }) => {
      callback(rows._array || []);
    });
  });
};

export const updateCartQuantity = (id, newQty, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE cart SET quantity = ? WHERE id = ?;",
      [newQty, id],
      () => callback?.()
    );
  });
};

export const removeFromCart = (itemId, callback) => {
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM cart WHERE id = ?;", [itemId], () => {
      callback?.();
    });
  });
};

export const clearCart = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM cart;", [], () => {
      callback?.();
    });
  });
};
