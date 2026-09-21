import { useEffect } from "react";
import db from "./client";
import { initDatabase } from "./schema";
import { upgradeLegacyPasswords } from "./repositories/userRepo";

// Schema, migrations and seed data live in ./schema. Restaurant, menu, cart and
// user queries live in ./repositories. This file keeps the app-start hook and
// the generic admin_users helpers.

export const useCreateTables = () => {
  useEffect(() => {
    // Hash any plaintext passwords left from before hashing existed. Runs in
    // the background: login also upgrades a row on the fly, so it never waits.
    initDatabase()
      .then(() => upgradeLegacyPasswords())
      .catch((error) => console.log("password upgrade error", error));
  }, []);
};

export const insertAdminUser = (userObj, onSuccess) => {
  const safeUser = { ...userObj };
  initDatabase().then(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO admin_users (data) VALUES (?)`,
        [JSON.stringify(safeUser)],
        (_, result) => {
          console.log("Admin user inserted", result);
          if (onSuccess) onSuccess(result.insertId);
        },
        (_, error) => {
          console.log("Insert error", error);
          return false;
        }
      );
    });
  });
};

export const getAdminUsers = (callback) => {
  initDatabase().then(() => {
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
              console.log("JSON parse error", e);
            }
          }
          callback(data);
        },
        (_, error) => console.log("Fetch error", error)
      );
    });
  });
};

export const deleteAdminUser = (id, onSuccess) => {
  initDatabase().then(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM admin_users WHERE id = ?`,
        [id],
        (_, result) => {
          console.log("Deleted user", result);
          if (onSuccess) onSuccess();
        },
        (_, error) => console.log("Delete error", error)
      );
    });
  });
};

export const updateAdminUser = (id, userObj, onSuccess) => {
  initDatabase().then(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE admin_users SET data = ? WHERE id = ?`,
        [JSON.stringify(userObj), id],
        (_, result) => {
          console.log("Updated user", result);
          if (onSuccess) onSuccess();
        },
        (_, error) => console.log("Update error", error)
      );
    });
  });
};

export default db;
