import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";

import HomeStack from "../navigation/HomeStack";
import SearchScreen from "../components/SearchScreen";
import AddToCartScreen from "../screens/Cart/AddToCartScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { useTheme } from "../Context/ThemeProvider";
import { createShadow, radius } from "../constants/designSystem";

const Tab = createBottomTabNavigator();

function TabBarIcon({ backgroundColor, color, name }) {
  if (backgroundColor === "gradient") {
    return (
      <LinearGradient
        colors={["#FF5A3C", "#FF8B3D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconShell}
      >
        <AntDesign name={name} size={20} color={color} />
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.iconShell, { backgroundColor }]}>
      <AntDesign name={name} size={20} color={color} />
    </View>
  );
}

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          height: 78,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: colors.borderSoft,
          ...createShadow(colors.shadow, 18),
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused }) => {
          const iconMap = {
            HomeStack: "home",
            Search: "search",
            AddToCartScreen: "shopping-cart",
            Profile: "user",
          };

          return (
            <TabBarIcon
              name={iconMap[route.name]}
              backgroundColor={focused ? "gradient" : colors.badge}
              color={focused ? colors.white : colors.textSecondary}
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

const styles = StyleSheet.create({
  tabBarItem: {
    paddingTop: 4,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
