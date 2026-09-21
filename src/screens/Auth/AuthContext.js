import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const SESSION_KEY = 'user';

export function useAuth() {
  return useContext(AuthContext);
}

// The session is the only user data kept in AsyncStorage, so it holds identity
// and role and nothing else. Never add credentials here.
const toSession = (user) => ({
  id: user.id ?? null,
  email: user.email ?? null,
  role: user.role ?? 'user',
});

const isValidStoredUser = (value) =>
  !!value && typeof value === 'object' && !!value.email && !!value.role;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored);
        if (!isValidStoredUser(parsed)) {
          await AsyncStorage.removeItem(SESSION_KEY);
          return;
        }

        const session = toSession(parsed);
        setUser(session);

        // Sessions saved by older versions also contain the password. Rewrite
        // them so it does not stay on the device.
        const hasExtraFields = Object.keys(parsed).some((key) => !(key in session));
        if (hasExtraFields) {
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
      } catch (error) {
        console.log('Could not restore session', error);
        await AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
      }
    };

    restoreSession().finally(() => setLoading(false));
  }, []);

  const login = async (userData) => {
    const session = toSession(userData);
    setUser(session);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const loginAsGuest = async () => {
    setUser({ role: 'guest' });
  };

  const value = {
    user,
    role: user?.role ?? 'guest',
    isLoggedIn: !!user && user.role !== 'guest',
    login,
    logout,
    loginAsGuest,
  };

  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
