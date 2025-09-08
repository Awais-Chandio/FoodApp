import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(false);


const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log(" Database opened"),
  (error) => console.log("Error opening database:", error)
);

export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      );`,
      [],
      () => console.log("Users table ready"),
      (_, error) => {
        console.log("Error creating table:", error);
        return false;
      }
    );
  });
};


export const registerUser = (email, password, successCallback, errorCallback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO users (email, password) VALUES (?, ?);",
      [email, password],
      (_, result) => {
        console.log("User registered:", result);
        if (successCallback) successCallback(result);
      },
      (_, error) => {
        console.log("Register error:", error);
        if (errorCallback) errorCallback(error);
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
          const user = rows.item(0); 
          console.log("Login success:", user);
          if (successCallback) successCallback(user);
        } else {
          console.log("Invalid login");
          if (errorCallback) errorCallback();
        }
      },
      (_, error) => {
        console.log("Login query error:", error);
        if (errorCallback) errorCallback(error);
        return false;
      }
    );
  });
};
