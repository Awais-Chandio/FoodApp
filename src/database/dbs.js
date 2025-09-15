import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened "),
  (e) => console.log("DB open error ", e)
);

// ---------- SEED DATA ----------
const nearestRestaurants = [
  { id: "1", name: "Westway", rating: 4.6, time: "15 min", offer: "50% OFF", type: "nearest" },
  { id: "2", name: "Fortune", rating: 4.8, time: "25 min", type: "nearest" },
  { id: "3", name: "Seafood", rating: 4.6, time: "20 min", type: "nearest" },
  { id: "4", name: "Food Special 1", rating: 4.5, time: "18 min", type: "nearest" },
  { id: "5", name: "Food Special 2", rating: 4.7, time: "22 min", type: "nearest" },
  { id: "6", name: "Food Special 3", rating: 4.9, time: "12 min", type: "nearest" },
];

const popularRestaurants = [
  { id: "7", name: "Moonland", rating: 4.6, time: "15 min", type: "popular" },
  { id: "8", name: "Starfish", rating: 4.8, time: "25 min", offer: "30% OFF", type: "popular" },
  { id: "9", name: "Black Noodles", rating: 4.9, time: "20 min", type: "popular" },
];


export const createTables = (onComplete) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id TEXT PRIMARY KEY,
          name TEXT,
          image BLOB,
          price REAL,
          quantity INTEGER
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS restaurants (
          id TEXT PRIMARY KEY,
          name TEXT,
          rating REAL,
          time TEXT,
          offer TEXT,
          type TEXT
        );`
      );
    },
    (err) => console.log("createTables transaction error:", err),
    () => seedRestaurantsIfEmpty(onComplete)
  );
};

const seedRestaurantsIfEmpty = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT COUNT(*) as count FROM restaurants;", [], (_, res) => {
      if (res.rows.item(0).count === 0) {
        [...nearestRestaurants, ...popularRestaurants].forEach((r) => {
          tx.executeSql(
            `INSERT INTO restaurants (id, name, rating, time, offer, type) VALUES (?, ?, ?, ?, ?, ?);`,
            [r.id, r.name, r.rating, r.time, r.offer || "", r.type]
          );
        });
      }
      callback?.(); 
    });
  });
};


export const getRestaurants = (type, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM restaurants WHERE type = ?;",
      [type],
      (_, { rows }) => callback(rows._array || []),
      (_, error) => { console.log("getRestaurants error:", error); return false; }
    );
  });
};

export default db;
