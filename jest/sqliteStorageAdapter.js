/**
 * Test stand-in for react-native-sqlite-storage, backed by Node's built-in
 * node:sqlite (an in-memory database per openDatabase call), so tests run REAL
 * SQL. It copies the behaviours of the real library that matter here:
 *
 *  - db.transaction(work, onError, onSuccess) queues statements; callbacks may
 *    queue more; they run in order.
 *  - A failed statement aborts the transaction and rolls everything back.
 *  - An exception thrown inside a statement callback is swallowed (the real
 *    library only logs it) and does NOT abort the transaction.
 *
 * Requires Node 22+ (node:sqlite). Tests using it skip themselves otherwise.
 */
let DatabaseSync = null;
try {
  DatabaseSync = process.getBuiltinModule('node:sqlite').DatabaseSync;
} catch (error) {
  DatabaseSync = null;
}

const isRead = sql =>
  /^\s*(SELECT|WITH)\b/i.test(sql) || /^\s*PRAGMA\s+[a-z_]+\s*$/i.test(sql);

const run = (sqlite, sql, params) => {
  const statement = sqlite.prepare(sql);
  if (isRead(sql)) {
    const rows = statement.all(...params);
    return {rows: {length: rows.length, item: i => rows[i]}, rowsAffected: 0};
  }
  const info = statement.run(...params);
  return {
    rows: {length: 0, item: () => undefined},
    insertId: Number(info.lastInsertRowid),
    rowsAffected: info.changes,
  };
};

const createDatabase = () => {
  const sqlite = new DatabaseSync(':memory:');

  return {
    raw: sqlite, // for assertions and for setting up legacy states in tests
    transaction(work, onError, onSuccess) {
      const queue = [];
      let failure = null;
      const tx = {
        executeSql(sql, params = [], success, error) {
          queue.push({sql, params, success, error});
        },
      };

      sqlite.exec('BEGIN');
      try {
        work(tx);
      } catch (error) {
        failure = error;
      }

      while (!failure && queue.length) {
        const {sql, params, success, error} = queue.shift();
        let result;
        try {
          result = run(sqlite, sql, params);
        } catch (statementError) {
          failure = statementError;
          if (error) {
            try {
              error(tx, statementError);
            } catch (ignored) {
              // swallowed, like the real library
            }
          }
          break;
        }
        if (success) {
          try {
            success(tx, result);
          } catch (ignored) {
            // swallowed, like the real library: does NOT abort the transaction
          }
        }
      }

      if (failure) {
        sqlite.exec('ROLLBACK');
        setImmediate(() => onError && onError(failure));
      } else {
        sqlite.exec('COMMIT');
        setImmediate(() => onSuccess && onSuccess());
      }
    },
  };
};

module.exports = {
  sqliteAvailable: DatabaseSync !== null,
  enablePromise: () => {},
  openDatabase: (config, onOpen) => {
    const db = createDatabase();
    if (onOpen) {
      setImmediate(onOpen);
    }
    return db;
  },
  __esModule: false,
};
