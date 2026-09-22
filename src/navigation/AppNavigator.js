import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoaderScreen from "../screens/Loader/LoaderScreen";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import TrackOrderScreen from "../screens/Cart/TrackOrderScreen";
import CheckoutScreen from "../screens/Checkout/CheckoutScreen";
import OrderHistoryScreen from "../screens/Orders/OrderHistoryScreen";
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
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Tab" component={TabNavigator} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
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
