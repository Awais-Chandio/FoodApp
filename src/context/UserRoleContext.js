import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1️⃣ Create context
const UserRoleContext = createContext({
  role: "user",
  setRole: () => {},
});

// 2️⃣ Provider component
export const UserRoleProvider = ({ children }) => {
  const [role, setRole] = useState("user");

  // Load role from AsyncStorage on app start
  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole) setRole(savedRole);
      } catch (err) {
        console.log("Failed to load role from storage:", err);
      }
    };
    loadRole();
  }, []);

  // Persist role whenever it changes
  const updateRole = async (newRole) => {
    try {
      setRole(newRole);
      await AsyncStorage.setItem("userRole", newRole);
    } catch (err) {
      console.log("Failed to save role:", err);
    }
  };

  return (
    <UserRoleContext.Provider value={{ role, setRole: updateRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// 3️⃣ Custom hook
export const useUserRole = () => useContext(UserRoleContext);
