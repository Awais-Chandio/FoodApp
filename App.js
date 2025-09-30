import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useCreateTables } from "./src/database/dbs";
import { AuthProvider } from "./src/screens/Auth/AuthContext";


const App=()=> {
  
  useCreateTables(); 

  return (
    <AuthProvider>
      <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </AuthProvider>
  );
}

export default App

