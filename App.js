import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useCreateTables } from "./src/database/dbs";
import { AuthProvider } from "./src/screens/Auth/AuthContext";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./src/Context/ThemeProvider";
import notificationService from "./src/services/notificationService";

const App = () => {
  useCreateTables();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

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
