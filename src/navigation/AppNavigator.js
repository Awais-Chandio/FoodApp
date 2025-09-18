import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoaderScreen from "../screens/Loader/LoaderScreen";
import Onboarding1 from "../screens/Onboarding/Onboarding1";
import Onboarding2 from "../screens/Onboarding/Onboarding2";
import Onboarding3 from "../screens/Onboarding/Onboarding3";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import HomeHeader from "../components/HomeHeader";
import DetailScreen from "../components/DetailScreen";
import TrackOrderScreen from "../screens/Cart/TrackOrderScreen";


import TabNavigator from "./TabNavigator";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loader"
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />


      <Stack.Screen name="Tab" component={TabNavigator} />


      <Stack.Screen name="HomeHeader" component={HomeHeader} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />

    </Stack.Navigator>
  );
}
