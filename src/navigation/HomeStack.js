import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import DetailsScreen from "../screens/Details/DetailScreen";
import MenuScreen from "../screens/Menu/MenuScreen";
import ManageItems from "../Admin/ManageItems";
import { useAuth } from "../screens/Auth/AuthContext";

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  const { role } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
      {role === "admin" ? (
        <Stack.Screen name="ManageItems" component={ManageItems} />
      ) : null}
    </Stack.Navigator>
  );
};

export default HomeStack;
