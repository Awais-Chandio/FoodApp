import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import DetailsScreen from "../components/DetailScreen";
import MenuScreen from "../components/MenuScreen";
import ManageItems from "../Admin/ManageItems";

const Stack = createNativeStackNavigator();

const HomeStack=()=> {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
      <Stack.Screen name="ManageItems" component={ManageItems} />
    </Stack.Navigator>
  );
}
export default HomeStack
