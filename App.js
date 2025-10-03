// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import AppNavigator from "./src/navigation/AppNavigator";
// import { useCreateTables } from "./src/database/dbs";
// import { AuthProvider } from "./src/screens/Auth/AuthContext";


// const App=()=> {
  
//   useCreateTables(); 

//   return (
//     <AuthProvider>
//       <NavigationContainer>
//       <AppNavigator />
//     </NavigationContainer>
//     </AuthProvider>
//   );
// }

// export default App



import React from "react";
import { NavigationContainer} from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useCreateTables } from "./src/database/dbs";
import { AuthProvider } from "./src/screens/Auth/AuthContext";
import Toast from "react-native-toast-message"; 
import { ThemeProvider } from "./src/Context/ThemeProvider"; 

const App = () => {
  useCreateTables();

  return (
    <ThemeProvider>
      <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast /> 
      </NavigationContainer>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
