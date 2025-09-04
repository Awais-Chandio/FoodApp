import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LoaderScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1"); // after 2s go to onboarding
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Custom FOOD Text */}
      <View style={styles.wordRow}>
        <Text style={[styles.letter, { color: "#000" }]}>F</Text>
        <Text style={[styles.letter, { color: "#FFD700" }]}>O</Text>
        <Text style={[styles.letter, { color: "#FFD700" }]}>O</Text>
        <Text style={[styles.letter, { color: "#000" }]}>D</Text>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>No wait for the food</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  wordRow: {
    flexDirection: "row",
  },
  letter: {
    fontSize: 48,
    fontWeight: "bold",
    paddingHorizontal: 0, // no extra spacing
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
});
