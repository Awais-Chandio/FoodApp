import SQLite from "react-native-sqlite-storage";
import { useEffect } from "react";


// Disable promise mode for simpler callbacks
SQLite.enablePromise(false);

// ✅ Open / create the database
const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened ✅"),
  (e) => console.log("DB open error ❌", e)
);
export const useCreateTables = () => {
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           email TEXT UNIQUE,
           password TEXT
        );`
      );
      console.log("Users table checked/created ✅");
    });
  }, []);
};

// ---------- INITIAL SETUP ----------
db.transaction((tx) => {
  // Create a table for users if it doesn't exist
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );`
  );
});

// ---------- REGISTER USER ----------
export const registerUser = (email, password, onSuccess, onError) => {
  if (!email || !password) {
    onError?.(new Error("Email and password required"));
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email.trim().toLowerCase(), password],
      () => {
        console.log("User registered:", email);
        onSuccess?.();
      },
      (_txObj, error) => {
        console.log("Register error:", error);
        onError?.(error);
      }
    );
  });
};

// ---------- LOGIN USER ----------
export const loginUser = (email, password, callback) => {
  if (!email || !password) {
    callback(false);
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email.trim().toLowerCase(), password],
      (_txObj, { rows }) => {
        if (rows.length > 0) {
          console.log("Login success:", email);
          callback(true);
        } else {
          console.log("Login failed for:", email);
          callback(false);
        }
      },
      (_txObj, error) => {
        console.log("Login error:", error);
        callback(false);
      }
    );
  });
};

// Optional: export db instance if needed elsewhere
export default db;
