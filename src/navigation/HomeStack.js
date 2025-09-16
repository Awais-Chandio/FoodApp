import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import DetailsScreen from "../components/DetailScreen";
import MenuScreen from "../components/MenuScreen";

const Stack = createNativeStackNavigator();

const HomeStack=()=> {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Default Home */}
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      {/* Extra screens that should keep the bottom tabs */}
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
    </Stack.Navigator>
  );
}
export default HomeStack
