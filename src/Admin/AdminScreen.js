import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AdminScreen({ navigation, route }) {
  const adminName = route?.params?.name || "Admin";

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {adminName} 👋</Text>
      <Text style={styles.subText}>Choose where you’d like to go:</Text>

      {/* Go directly to MenuScreen inside HomeStack inside Tab */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Tab", {
            screen: "HomeStack",                // the name of the tab that holds HomeStack
            params: {
              screen: "MenuScreen",           // the screen inside HomeStack
            },
          })
        }
      >
        <Text style={styles.buttonText}>Go to Menu Screen</Text>
      </TouchableOpacity>

      {/* Go directly to HomeScreen inside HomeStack inside Tab */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Tab", {
            screen: "HomeStack",          // the name of the tab that holds HomeStack
            params: {
              screen: "HomeScreen",
            },
          })
        }
      >
        <Text style={styles.buttonText}>Go to Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcome: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subText: { fontSize: 16, color: "#555", marginBottom: 24, textAlign: "center" },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: { fontSize: 18, fontWeight: "600", color: "#000" },
});
