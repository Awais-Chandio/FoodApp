import { execute, query } from "../sql";

/** Creates a user. Rejects with a "UNIQUE constraint" error if the email exists. */
export const register = ({ email, password, role = "user" }) =>
  execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [
    email,
    password,
    role,
  ]);

/** Resolves with the matching user row, or null when the credentials are wrong. */
export const login = async (email, password) => {
  const rows = await query("SELECT * FROM users WHERE email = ? AND password = ?", [
    email,
    password,
  ]);
  return rows[0] || null;
};
