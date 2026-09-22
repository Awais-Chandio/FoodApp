import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Node's crypto stands in for the native library: same pbkdf2/randomBytes/
// timingSafeEqual signatures, so the real hashing code is exercised.
jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = require('crypto');
  return {
    Buffer: require('buffer').Buffer,
    pbkdf2: nodeCrypto.pbkdf2,
    randomBytes: nodeCrypto.randomBytes,
    timingSafeEqual: nodeCrypto.timingSafeEqual,
  };
});

jest.mock('../src/database/sql', () => ({
  query: jest.fn(),
  execute: jest.fn(() => Promise.resolve({})),
}));

const store = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
  setItem: jest.fn((key, value) => {
    store[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn(key => {
    delete store[key];
    return Promise.resolve();
  }),
}));

const nodeCrypto = require('crypto');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const {query, execute} = require('../src/database/sql');
const passwordHash = require('../src/services/passwordHash');
const userRepo = require('../src/database/repositories/userRepo');
const {AuthProvider, useAuth} = require('../src/screens/Auth/AuthContext');

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(store).forEach(key => delete store[key]);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

const hashWithIterations = (password, iterations) => {
  const salt = nodeCrypto.randomBytes(16);
  const key = nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `pbkdf2-sha256$${iterations}$${salt.toString('base64')}$${key.toString('base64')}`;
};

describe('passwordHash', () => {
  it('produces a salted, self-describing hash that never contains the password', async () => {
    const stored = await passwordHash.hashPassword('correct horse');

    const [scheme, iterations, salt, hash] = stored.split('$');
    expect(scheme).toBe('pbkdf2-sha256');
    expect(Number(iterations)).toBe(passwordHash.ITERATIONS);
    expect(salt).toBeTruthy();
    expect(hash).toBeTruthy();
    expect(stored).not.toContain('correct horse');
    expect(passwordHash.isHashed(stored)).toBe(true);
  });

  it('uses a different salt every time', async () => {
    const [a, b] = await Promise.all([
      passwordHash.hashPassword('same'),
      passwordHash.hashPassword('same'),
    ]);
    expect(a).not.toBe(b);
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const stored = await passwordHash.hashPassword('secret123');

    expect(await passwordHash.verifyPassword('secret123', stored)).toBe(true);
    expect(await passwordHash.verifyPassword('secret124', stored)).toBe(false);
    expect(await passwordHash.verifyPassword('', stored)).toBe(false);
  });

  it.each([
    ['plaintext', 'admin123'],
    ['empty', ''],
    ['null', null],
    ['wrong scheme', 'md5$1$abc$def'],
    ['zero iterations', 'pbkdf2-sha256$0$abc$def'],
    ['absurd iterations', 'pbkdf2-sha256$999999999$abc$def'],
    ['missing hash', 'pbkdf2-sha256$1000$abc'],
  ])('treats %s as not a hash and never verifies it', async (_name, value) => {
    expect(passwordHash.isHashed(value)).toBe(false);
    expect(await passwordHash.verifyPassword('admin123', value)).toBe(false);
  });

  it('flags hashes made with fewer iterations for an upgrade', () => {
    expect(passwordHash.needsRehash(hashWithIterations('pw', 1000))).toBe(true);
    expect(passwordHash.needsRehash('admin123')).toBe(false);
  });

  it('compares legacy plaintext strictly', () => {
    expect(passwordHash.legacyPlaintextMatches('admin123', 'admin123')).toBe(true);
    expect(passwordHash.legacyPlaintextMatches('admin124', 'admin123')).toBe(false);
    expect(passwordHash.legacyPlaintextMatches('admin', 'admin123')).toBe(false);
    expect(passwordHash.legacyPlaintextMatches('x', null)).toBe(false);
  });
});

describe('userRepo', () => {
  it('register stores only a hash: the plaintext is never written', async () => {
    await userRepo.register({email: 'a@b.com', password: 'hunter2hunter2'});

    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO users \(email, password, password_hash, role\)/);
    expect(sql).toMatch(/VALUES \(\?, NULL, \?, \?\)/);
    expect(params[0]).toBe('a@b.com');
    expect(params[1]).toMatch(/^pbkdf2-sha256\$/);
    expect(params[2]).toBe('user');
    expect(JSON.stringify(params)).not.toContain('hunter2hunter2');
  });

  it('login succeeds with the right password and returns only id, email, role', async () => {
    const password_hash = await passwordHash.hashPassword('secret123');
    query.mockResolvedValueOnce([
      {id: 7, email: 'a@b.com', role: 'user', password: null, password_hash},
    ]);

    const user = await userRepo.login('a@b.com', 'secret123');

    expect(user).toEqual({id: 7, email: 'a@b.com', role: 'user'});
    expect(execute).not.toHaveBeenCalled(); // already current, nothing to upgrade
  });

  it('login fails with a wrong password', async () => {
    const password_hash = await passwordHash.hashPassword('secret123');
    query.mockResolvedValueOnce([
      {id: 7, email: 'a@b.com', role: 'user', password: null, password_hash},
    ]);

    expect(await userRepo.login('a@b.com', 'nope')).toBeNull();
  });

  it('login fails for an unknown email without writing anything', async () => {
    query.mockResolvedValueOnce([]);

    expect(await userRepo.login('ghost@b.com', 'whatever')).toBeNull();
    expect(execute).not.toHaveBeenCalled();
  });

  it('upgrades a legacy plaintext account to a hash on first successful login', async () => {
    query.mockResolvedValueOnce([
      {id: 1, email: 'admin@foodapp.com', role: 'admin', password: 'admin123', password_hash: null},
    ]);

    const user = await userRepo.login('admin@foodapp.com', 'admin123');

    expect(user).toEqual({id: 1, email: 'admin@foodapp.com', role: 'admin'});
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE users SET password_hash = \?, password = NULL WHERE id = \?/);
    expect(params[0]).toMatch(/^pbkdf2-sha256\$/);
    expect(params[1]).toBe(1);
  });

  it('a wrong password on a legacy account does not upgrade or log in', async () => {
    query.mockResolvedValueOnce([
      {id: 1, email: 'admin@foodapp.com', role: 'admin', password: 'admin123', password_hash: null},
    ]);

    expect(await userRepo.login('admin@foodapp.com', 'wrong')).toBeNull();
    expect(execute).not.toHaveBeenCalled();
  });

  it('re-hashes a valid hash that used fewer iterations than today', async () => {
    query.mockResolvedValueOnce([
      {id: 3, email: 'c@d.com', role: 'user', password: null, password_hash: hashWithIterations('pw', 1000)},
    ]);

    expect(await userRepo.login('c@d.com', 'pw')).toEqual({id: 3, email: 'c@d.com', role: 'user'});

    const newHash = execute.mock.calls[0][1][0];
    expect(newHash.split('$')[1]).toBe(String(passwordHash.ITERATIONS));
  });

  it('upgradeLegacyPasswords hashes every remaining plaintext row', async () => {
    query.mockResolvedValueOnce([
      {id: 1, password: 'one'},
      {id: 2, password: 'two'},
    ]);

    expect(await userRepo.upgradeLegacyPasswords()).toBe(2);

    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute.mock.calls.map(call => call[1][1])).toEqual([1, 2]);
    execute.mock.calls.forEach(call => {
      expect(call[1][0]).toMatch(/^pbkdf2-sha256\$/);
      expect(JSON.stringify(call[1])).not.toMatch(/"(one|two)"/);
    });
  });

  it('upgradeLegacyPasswords does nothing when there is nothing to upgrade', async () => {
    query.mockResolvedValueOnce([]);

    expect(await userRepo.upgradeLegacyPasswords()).toBe(0);
    expect(execute).not.toHaveBeenCalled();
  });
});

describe('AuthProvider session', () => {
  let auth;
  const Probe = () => {
    auth = useAuth();
    return null;
  };

  const mount = async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });
  };

  it('login keeps only id, email and role, even if given credentials', async () => {
    await mount();

    await ReactTestRenderer.act(async () => {
      await auth.login({
        id: 5,
        email: 'a@b.com',
        role: 'user',
        password: 'plaintext',
        password_hash: 'pbkdf2-sha256$1$x$y',
      });
    });

    const saved = JSON.parse(store.user);
    expect(saved).toEqual({id: 5, email: 'a@b.com', role: 'user'});
    expect(auth.user).toEqual({id: 5, email: 'a@b.com', role: 'user'});
    expect(auth.isLoggedIn).toBe(true);
  });

  it('removes the password from a session stored by an older version', async () => {
    store.user = JSON.stringify({id: 2, email: 'old@b.com', role: 'user', password: 'oldsecret'});

    await mount();

    expect(auth.user).toEqual({id: 2, email: 'old@b.com', role: 'user'});
    expect(store.user).not.toContain('oldsecret');
    expect(JSON.parse(store.user)).toEqual({id: 2, email: 'old@b.com', role: 'user'});
  });

  it('does not rewrite a session that is already clean', async () => {
    store.user = JSON.stringify({id: 2, email: 'ok@b.com', role: 'user'});

    await mount();

    expect(auth.isLoggedIn).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it.each([
    ['corrupted JSON', '{not json'],
    ['a stored object without an email', JSON.stringify({role: 'admin'})],
  ])('discards %s and starts logged out', async (_name, value) => {
    store.user = value;

    await mount();

    expect(auth.isLoggedIn).toBe(false);
    expect(auth.role).toBe('guest');
    expect(store.user).toBeUndefined();
  });

  it('logout clears the stored session', async () => {
    store.user = JSON.stringify({id: 2, email: 'ok@b.com', role: 'user'});
    await mount();

    await ReactTestRenderer.act(async () => {
      await auth.logout();
    });

    expect(auth.isLoggedIn).toBe(false);
    expect(store.user).toBeUndefined();
  });
});
