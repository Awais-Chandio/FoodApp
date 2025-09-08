import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoaderScreen from "../screens/Loader/LoaderScreen";
import Onboarding1 from "../screens/Onboarding/Onboarding1";
import Onboarding2 from "../screens/Onboarding/Onboarding2";
import Onboarding3 from "../screens/Onboarding/Onboarding3";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import HomeHeader from "../components/HomeHeader";
import SearchScreen from "../components/SearchScreen";
import CategoryScreen from "../screens/Cart/CategoryScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen"

import { create } from "react-native/types_generated/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload";

const Stack = createStackNavigator();

export default function AppNavigator() {


  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HomeHeader" component={HomeHeader} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />


    </Stack.Navigator>
  );
}

