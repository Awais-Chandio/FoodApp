// src/screens/DetailScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const imageMap = {
  food1: require("../assets/food1.jpg"),
  food2: require("../assets/food2.jpg"),
  food3: require("../assets/food3.jpg"),
  Westway: require("../assets/Westway.png"),
  Fortune: require("../assets/Fortune.png"),
  Seafood: require("../assets/Seafood.png"),
  Moonland: require("../assets/Moonland.png"),
  Starfish: require("../assets/Starfish.png"),
  BlackNodles: require("../assets/BlackNodles.png"),
};

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = route?.params?.restaurant; // ✅ safe access

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50, fontSize: 18 }}>
          No restaurant data available
        </Text>
      </View>
    );
  }

  const [activeFilter, setActiveFilter] = useState("Best Seller");

  // Restaurant image
  const imgKey = restaurant.image_key || restaurant.name;
  const imgSource =
    imageMap[imgKey] ||
    (typeof restaurant.image === "string" && restaurant.image.startsWith("http")
      ? { uri: restaurant.image }
      : require("../assets/food1.jpg")); // fallback

  const bestSellers = [
    { id: "1", name: "Margherita Pizza", price: "$12", image: imageMap.food3 },
    { id: "2", name: "Veggie Supreme", price: "$15", image: imageMap.food2 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={imgSource} style={styles.headerImage} />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{restaurant.name}</Text>
            <TouchableOpacity>
              <Text style={styles.moreInfo}>More info</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.details}>
            ⭐ {restaurant.rating} • {restaurant.time}
          </Text>
          <Text style={styles.description}>
            Healthy eating means eating a variety of foods that give you the
            nutrients you need to maintain your health, feel good, and have
            energy.
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["Best Seller", "Veg", "Non-Veg", "Beverages"].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.filterBtn,
                activeFilter === label && styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(label)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === label && styles.activeFilterText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Seller Section */}
        <Text style={styles.sectionTitle}>Best Seller</Text>
        {bestSellers.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>In Pizza Mania</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Right-aligned "See our menu" */}
        <TouchableOpacity
          style={styles.menuLinkRight}
          onPress={() => navigation.navigate("MenuScreen")}
        >
          <Text style={styles.menuText}>See our menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerImage: { width: "100%", height: 240, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 22, padding: 8 },
  backArrow: { color: "#fff", fontSize: 22, fontWeight: "700" },

  infoContainer: { paddingHorizontal: 20, paddingTop: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#222" },
  moreInfo: { color: "#f57c00", fontWeight: "600", fontSize: 14 },
  details: { marginTop: 4, fontSize: 15, color: "#666" },
  description: { marginTop: 12, fontSize: 15, color: "#444", lineHeight: 22 },

  filterContainer: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 24, marginBottom: 16, paddingHorizontal: 10 },
  filterBtn: { borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  activeFilter: { backgroundColor: "#FF7000", borderColor: "#FF7000" },
  filterText: { fontSize: 14, color: "#555" },
  activeFilterText: { color: "#fff", fontWeight: "600" },

  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#222", marginHorizontal: 20, marginTop: 10, marginBottom: 12 },

  itemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#222" },
  itemSubtitle: { fontSize: 14, color: "#777", marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: "#000", marginTop: 4 },

  addBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "#fff", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  addBtnText: { fontSize: 20, color: "#000", fontWeight: "700" },

  menuLinkRight: { alignItems: "flex-end", marginHorizontal: 20, marginVertical: 20 },
  menuText: { color: "#FF7000", fontWeight: "600", fontSize: 15 },
});
