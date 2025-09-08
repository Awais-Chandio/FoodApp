import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { createTables } from "./src/database/dbs";

export default function App() {
  useEffect(() => {
    createTables();
  }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
