import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoaderScreen from "../screens/Loader/LoaderScreen";
import Onboarding1 from "../screens/Onboarding/Onboarding1";
import Onboarding2 from "../screens/Onboarding/Onboarding2";
import Onboarding3 from "../screens/Onboarding/Onboarding3";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import TrackOrderScreen from "../screens/Cart/TrackOrderScreen";
import CheckoutScreen from "../screens/Checkout/CheckoutScreen";
import ManageMenuItem from "../Admin/ManageMenuItems";
import ManageUsers from "../screens/Profile/ManageUsers";
import TabNavigator from "./TabNavigator";
import Users from "../screens/Profile/Users";
import { useAuth } from "../screens/Auth/AuthContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { role } = useAuth();

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
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      {/* Admin-only routes are not registered for other roles. */}
      {role === "admin" ? (
        <>
          <Stack.Screen name="ManageMenuItems" component={ManageMenuItem} />
          <Stack.Screen name="ManageUsers" component={ManageUsers} />
          <Stack.Screen name="Users" component={Users} />
        </>
      ) : null}
    </Stack.Navigator>
  );
}
