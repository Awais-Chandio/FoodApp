import {
  Buffer,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from "react-native-quick-crypto";

// Stored format:  pbkdf2-sha256$<iterations>$<salt base64>$<hash base64>
// The iteration count is stored with each hash, so it can be raised later
// without invalidating existing passwords (see needsRehash).
const SCHEME = "pbkdf2-sha256";
export const ITERATIONS = 600000; // OWASP guidance for PBKDF2-HMAC-SHA256
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MAX_ITERATIONS = 5000000; // refuse absurd values from a tampered database

const derive = (password, salt, iterations) =>
  new Promise((resolve, reject) => {
    pbkdf2(password, salt, iterations, KEY_LENGTH, "sha256", (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });

const parse = (stored) => {
  const [scheme, iterations, salt, hash] = String(stored || "").split("$");
  const count = Number(iterations);

  if (
    scheme !== SCHEME ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > MAX_ITERATIONS ||
    !salt ||
    !hash
  ) {
    return null;
  }

  return {
    iterations: count,
    salt: Buffer.from(salt, "base64"),
    hash: Buffer.from(hash, "base64"),
  };
};

/** Resolves with a salted PBKDF2 hash string suitable for storing. */
export const hashPassword = async (password) => {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, ITERATIONS);
  return [SCHEME, ITERATIONS, salt.toString("base64"), key.toString("base64")].join("$");
};

/** True when `stored` looks like a hash produced by hashPassword. */
export const isHashed = (stored) => parse(stored) !== null;

/** Compares a password with a stored hash in constant time. */
export const verifyPassword = async (password, stored) => {
  const parsed = parse(stored);
  if (!parsed) {
    return false;
  }

  const key = await derive(password, parsed.salt, parsed.iterations);
  return key.length === parsed.hash.length && timingSafeEqual(key, parsed.hash);
};

/** True when a valid hash was made with fewer iterations than we use today. */
export const needsRehash = (stored) => {
  const parsed = parse(stored);
  return parsed !== null && parsed.iterations < ITERATIONS;
};

/** Constant-time string comparison, used only for legacy plaintext rows. */
export const legacyPlaintextMatches = (candidate, stored) => {
  if (typeof candidate !== "string" || typeof stored !== "string") {
    return false;
  }
  if (candidate.length !== stored.length) {
    return false;
  }
  // Bitwise on purpose: accumulate every difference so the loop always runs to
  // the end instead of returning at the first mismatch.
  let difference = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    difference |= candidate.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return difference === 0;
};
