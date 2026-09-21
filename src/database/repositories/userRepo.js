import { execute, query } from "../sql";
import {
  hashPassword,
  isHashed,
  legacyPlaintextMatches,
  needsRehash,
  verifyPassword,
} from "../../services/passwordHash";

// Only these fields ever leave the repository. Passwords and hashes stay here.
const toPublicUser = (row) => ({ id: row.id, email: row.email, role: row.role });

/** Creates a user with a hashed password. Rejects with a "UNIQUE constraint" error if the email exists. */
export const register = async ({ email, password, role = "user" }) => {
  const passwordHash = await hashPassword(password);
  return execute(
    "INSERT INTO users (email, password, password_hash, role) VALUES (?, NULL, ?, ?)",
    [email, passwordHash, role]
  );
};

const storeHash = async (userId, password) => {
  const passwordHash = await hashPassword(password);
  // Also clears any legacy plaintext copy. If two upgrades race they store two
  // valid hashes of the same password, which is harmless.
  await execute(
    "UPDATE users SET password_hash = ?, password = NULL WHERE id = ?",
    [passwordHash, userId]
  );
};

/**
 * Resolves with { id, email, role } when the credentials are right, or null.
 * Rows created before hashing existed (plaintext `password`) are upgraded to a
 * hash on their first successful login.
 */
export const login = async (email, password) => {
  const [row] = await query("SELECT * FROM users WHERE email = ?", [email]);

  if (!row) {
    // Do comparable work so response time does not reveal which emails exist.
    await hashPassword(password);
    return null;
  }

  if (isHashed(row.password_hash)) {
    if (!(await verifyPassword(password, row.password_hash))) {
      return null;
    }
    if (needsRehash(row.password_hash)) {
      await storeHash(row.id, password);
    }
    return toPublicUser(row);
  }

  if (legacyPlaintextMatches(password, row.password)) {
    await storeHash(row.id, password);
    return toPublicUser(row);
  }

  await hashPassword(password);
  return null;
};

/**
 * Hashes every remaining plaintext password so nothing is left readable at
 * rest after an upgrade, including accounts that never log in again.
 * Safe to run on every start; does nothing when there is nothing to upgrade.
 */
export const upgradeLegacyPasswords = async () => {
  const rows = await query(
    "SELECT id, password FROM users WHERE password_hash IS NULL AND password IS NOT NULL"
  );

  for (const row of rows) {
    await storeHash(row.id, row.password);
  }
  return rows.length;
};
