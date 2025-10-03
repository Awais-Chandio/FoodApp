import React, { useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../../Context/ThemeProvider";  

export default function LoaderScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);   

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1"); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.wordRow}>
        <Text style={[styles.letter, { color: colors.text }]}>F</Text>
        <Text style={[styles.letter, { color: "#FFD700" }]}>O</Text>
        <Text style={[styles.letter, { color: "#FFD700" }]}>O</Text>
        <Text style={[styles.letter, { color: colors.text }]}>D</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        No wait for the food
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wordRow: {
    flexDirection: "row",
  },
  letter: {
    fontSize: 48,
    fontWeight: "bold",
    paddingHorizontal: 0, 
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
  },
});
