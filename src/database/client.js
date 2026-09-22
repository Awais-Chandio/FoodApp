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

/**
 * Runs `work(tx, control)` as ONE transaction and resolves with the value the
 * work passed to control.resolve(...) once the transaction has committed.
 *
 * Use nested tx.executeSql callbacks (not async/await) inside `work`: a
 * transaction commits as soon as its statement queue is empty, so awaiting a
 * promise in the middle would end it early.
 *
 * Rolling back: this SQLite library CATCHES exceptions thrown inside statement
 * callbacks and only logs them, so throwing does NOT cancel the transaction.
 * The only thing that rolls it back is a failed statement. control.abort(error)
 * therefore queues a statement that cannot succeed, and the promise rejects
 * with `error`. control.guard(callback) wraps a callback so an unexpected
 * exception becomes an abort instead of a silent partial write.
 */
export const runTransaction = (work) =>
  new Promise((resolve, reject) => {
    let result;
    let failure = null;

    db.transaction(
      (tx) => {
        const control = {
          resolve: (value) => {
            result = value;
          },
          abort: (error) => {
            if (failure) {
              return;
            }
            failure = toError(error);
            tx.executeSql("SELECT 1 FROM __abort_transaction__");
          },
          guard:
            (callback) =>
            (...args) => {
              try {
                return callback(...args);
              } catch (error) {
                control.abort(error);
                return undefined;
              }
            },
        };

        try {
          work(tx, control);
        } catch (error) {
          control.abort(error);
        }
      },
      (error) => reject(failure || toError(error)),
      () => resolve(result)
    );
  });

export default db;
