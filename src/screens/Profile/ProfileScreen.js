import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Auth/AuthContext";   
import { ThemeContext } from "../../Context/ThemeProvider";  

export default function ProfileScreen({ route }) {
  const navigation = useNavigation();
  const { role } = useAuth();       
  const adminName = route?.params?.name || "Admin";
  const { theme, toggleTheme, colors } = useContext(ThemeContext); 

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userRole");
    navigation.replace("Login");
  };

  if (!role) {
    return (
      <View style={[styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  
  if (role === "admin") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        </View>

        <View style={styles.centerContent}>
          <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {adminName} 👋</Text>
          <Text style={[styles.subText, { color: colors.text }]}>Choose where you’d like to go:</Text>

          <TouchableOpacity
            style={[styles.adminButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate("Tab", {
                screen: "HomeStack",
                params: { screen: "MenuScreen" },
              })
            }
          >
            <Text style={styles.adminButtonText}>Go to Menu Screen</Text>
          </TouchableOpacity>

         
          <TouchableOpacity
            style={[styles.adminButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate("Tab", {
                screen: "HomeStack",
                params: { screen: "HomeScreen" },
              })
            }
          >
            <Text style={styles.adminButtonText}>Go to Home Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("ManageUsers")}
          >
            <Text style={styles.adminButtonText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

       
        <View style={styles.bottomLogout}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={toggleTheme}
          >
            <Text style={[styles.logoutText, { color: colors.text }]}>
              Switch to {theme === "light" ? "Dark" : "Light"} Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 },
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: colors.text }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Screen</Text>
      </View>

      <View style={styles.centerContent}></View>

     
      <View style={styles.bottomLogout}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={toggleTheme}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bottomLogout: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  logoutText: { color: "#1b1a1aff", fontWeight: "bold", fontSize: 16 },
  header: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f1e1eff",
    textAlign: "left",
  },
  welcome: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
    textAlign: "center",
  },
  adminButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    elevation: 3,
  },
  adminButtonText: { fontSize: 18, fontWeight: "600", color: "#000" },
});
