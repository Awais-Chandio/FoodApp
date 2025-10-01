// context/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); // detects system dark/light
  const [theme, setTheme] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    setTheme(systemTheme); // auto-update on system change
  }, [systemTheme]);

  const colors = theme === "light"
    ? {
        background: "#fff",
        text: "#000",
        card: "#f1f1f1",
        input: "#fff",
        border: "#ccc",
        primary: "#FFD700",
        secondary: "#4CAF50",
        danger: "#E53935",
      }
    : {
        background: "#121212",
        text: "#fff",
        card: "#1E1E1E",
        input: "#2A2A2A",
        border: "#444",
        primary: "#FFD700",
        secondary: "#4CAF50",
        danger: "#E53935",
      };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
