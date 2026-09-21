import { runStatements, runTransaction } from "./client";
import { initDatabase } from "./schema";

// Promise helpers used by the repositories. Each one waits for the schema, so
// callers never need to care about initialisation order.

/** Runs one SELECT and resolves with an array of row objects. */
export const query = async (sql, params = []) => {
  await initDatabase();
  const [result] = await runStatements([[sql, params]]);
  return result.rows;
};

/** Runs one write and resolves with { insertId, rowsAffected }. */
export const execute = async (sql, params = []) => {
  await initDatabase();
  const [result] = await runStatements([[sql, params]]);
  return { insertId: result.insertId, rowsAffected: result.rowsAffected };
};

/** Runs several SELECTs in ONE transaction; resolves with one row array each. */
export const queryMany = async (statements) => {
  await initDatabase();
  const results = await runStatements(statements);
  return results.map((result) => result.rows);
};

/** Runs several writes atomically in ONE transaction. */
export const batch = async (statements) => {
  await initDatabase();
  await runStatements(statements);
};

/**
 * Runs `work(tx, control)` as one transaction, for writes that need a value
 * from an earlier statement (for example an insertId). See runTransaction.
 */
export const transaction = async (work) => {
  await initDatabase();
  return runTransaction(work);
};
