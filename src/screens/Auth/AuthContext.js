import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AuthContext = createContext();


export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       
  const [loading, setLoading] = useState(true); 
 
  useEffect(() => {
    AsyncStorage.getItem('user')
      .then((stored) => {
        if (stored) setUser(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, []);

 
  const login = async (userData) => {
   
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
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
