import React, { createContext, useState, useEffect, useContext } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors } from "../constants/designSystem";

export const ThemeContext = createContext({
  mode: "system",
  theme: "light",
  colors: {},
  toggleTheme: () => {},
  setMode: () => {},
  setSystemMode: () => {},
});
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = "app_theme_mode";

export const ThemeProvider = ({ children }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState("system");
  const resolvedTheme = mode === "system" ? (system ?? "light") : mode;

  
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setMode(saved);
        }
      } catch (e) {
        console.warn("Failed to load theme mode", e);
      }
    })();
  }, []);

  
  const persistMode = async (newMode) => {
    try {
      if (newMode === "system") {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, newMode);
      }
    } catch (e) {
      console.warn("Failed to persist theme mode", e);
    }
  };

  const toggleTheme = async () => {
   
    const next =
      mode === "system"
        ? (resolvedTheme === "light" ? "dark" : "light")
        : (mode === "light" ? "dark" : "light");
    setMode(next);
    await persistMode(next);
  };

  const setSystemMode = async () => {
    setMode("system");
    await persistMode("system");
  };

  const colors = resolvedTheme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: resolvedTheme,
        colors,
        toggleTheme,
        setMode,
        setSystemMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
