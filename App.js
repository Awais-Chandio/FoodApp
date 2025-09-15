import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { createTables } from "./src/database/dbs";

const App=()=> {
  useEffect(() => {
    createTables();
  }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default App

