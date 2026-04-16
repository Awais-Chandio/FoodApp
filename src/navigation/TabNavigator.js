import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AntDesign from "@react-native-vector-icons/ant-design";

import HomeStack from "../navigation/HomeStack";
import SearchScreen from "../components/SearchScreen";
import AddToCartScreen from "../screens/Cart/AddToCartScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { useTheme } from "../Context/ThemeProvider";
import { createShadow, radius } from "../constants/designSystem";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          ...createShadow(colors.shadow, 20),
        },
        tabBarIcon: ({ focused }) => {
          const iconMap = {
            HomeStack: "home",
            Search: "search",
            AddToCartScreen: "shopping-cart",
            Profile: "user",
          };

          return (
            <AntDesign
              name={iconMap[route.name]}
              size={20}
              color={focused ? colors.primaryStrong : colors.textSecondary}
            />
          );
        },
        tabBarActiveTintColor: colors.primaryStrong,
        tabBarInactiveTintColor: colors.textSecondary,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="AddToCartScreen"
        component={AddToCartScreen}
        options={{ title: "Cart" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
