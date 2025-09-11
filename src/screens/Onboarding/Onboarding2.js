import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Onboarding2({ navigation }) {
  const handleNext = () => navigation.navigate("Onboarding3");
  const handleSkip = () => navigation.replace("Login");

  return (
    <View style={styles.container}>
   
      <View style={styles.centerContent}>
        <Image
          source={require("../../assets/money.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Easy Payment</Text>

        <Text style={styles.subtitle}>
          Payment made easy through debit card, credit card, and more ways to pay for your food
        </Text>

      
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Image
          source={require("../../assets/Vector-3.png")}
          style={styles.bottomImage}
          resizeMode="stretch"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
            <Text style={styles.actionButtonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSkip}>
            <Text style={styles.actionButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const DOT_ACTIVE = "#FFD700";
const DOT_INACTIVE = "#9CC7E8";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 50,
  },
  image: { width: 220, height: 220, marginBottom: 25 },
  title: { fontSize: 22, fontWeight: "bold", color: "#000", textAlign: "center", marginBottom: 10 },
  subtitle: {
    fontSize: 15,
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  dotsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  dotActive: { backgroundColor: DOT_ACTIVE },
  dotInactive: { backgroundColor: DOT_INACTIVE },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bottomImage: { width: width, height: 180 },
  buttonRow: {
    position: "absolute",
    bottom: 40,
    width: "75%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  actionButtonText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
