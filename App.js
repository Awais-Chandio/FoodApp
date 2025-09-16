import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useCreateTables } from "./src/database/dbs";


const App=()=> {
  // useEffect(() => {
  //   createTables();
  // }, []);
  useCreateTables(); 

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default App

