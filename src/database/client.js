import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: "foodapp.db", location: "default" },
  () => console.log("Database opened"),
  (e) => console.log("DB open error", e)
);

const toRows = (resultSet) => {
  const rows = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    rows.push(resultSet.rows.item(i));
  }
  return rows;
};

const toError = (error) =>
  error instanceof Error ? error : new Error((error && error.message) || String(error));

/**
 * Runs the given [sql, params] statements inside ONE transaction and resolves
 * with a result per statement: { rows, insertId, rowsAffected }.
 * Any failing statement rolls the whole transaction back and rejects.
 *
 * This does not wait for the schema to be ready; repositories should go
 * through ./sql instead. Only the schema/migration code uses it directly.
 */
export const runStatements = (statements) =>
  new Promise((resolve, reject) => {
    const results = new Array(statements.length);
    db.transaction(
      (tx) => {
        statements.forEach(([sql, params = []], index) => {
          tx.executeSql(sql, params, (_tx, resultSet) => {
            results[index] = {
              rows: toRows(resultSet),
              insertId: resultSet.insertId,
              rowsAffected: resultSet.rowsAffected,
            };
          });
        });
      },
      (error) => reject(toError(error)),
      () => resolve(results)
    );
  });

export default db;
