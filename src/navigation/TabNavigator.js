import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeStack from "../navigation/HomeStack";
import SearchScreen from "../components/SearchScreen";
import AddToCartScreen from "../screens/Cart/AddToCartScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (


    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: 65,
          elevation: 6,
        },
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === "HomeStack") {
            iconSource = require("../assets/home.png");
          } else if (route.name === "Search") {
            iconSource = require("../assets/search.png");
          } else if (route.name === "AddToCartScreen") {
            iconSource = require("../assets/cart.png");
          } else if (route.name === "Profile") {
            iconSource = require("../assets/user.png");
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: 26,
                height: 26,
                tintColor: focused ? "#FFD700" : "#888", 
                marginTop: 6,
              }}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: "#FFD700",
        tabBarInactiveTintColor: "#888",
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="AddToCartScreen" component={AddToCartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
