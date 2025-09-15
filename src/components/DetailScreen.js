// src/screens/DetailScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { addToCart, removeFromCart, getCartItems } from "../database/dbs";

// local mapping of keys -> require
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

const foodItems = [
  { id: 6, name: "Cheese Burger", price: 5.99, type: "Best Seller", image_key: "food1" },
  { id: 7, name: "Veg Pizza", price: 7.49, type: "Best Seller", image_key: "food2" },
  { id: 8, name: "Cold Coffee", price: 3.99, type: "Best Seller", image_key: "food3" },
];

export default function DetailScreen({ route }) {
  const { restaurant } = route.params; // DB row
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState("Best Seller");
  const [cart, setCart] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      getCartItems((items) => setCart(items));
    }, [])
  );

  const isInCart = (id) => cart.some((c) => String(c.id) === String(id));

  const handleCart = (item) => {
    const dbItem = {
      id: String(item.id),
      name: item.name,
      price: item.price || 0,
      image_key: item.image_key || item.imageKey || item.image || "",
    };

    if (isInCart(dbItem.id)) {
      removeFromCart(dbItem.id, () => getCartItems(setCart));
    } else {
      addToCart(dbItem, () => getCartItems(setCart));
    }
  };

  const restaurantImgKey = restaurant.image_key || restaurant.imageKey || restaurant.image;
  const restaurantImgSource = imageMap[restaurantImgKey] || (typeof restaurant.image === "string" && restaurant.image.startsWith("http") ? { uri: restaurant.image } : require("../assets/food1.jpg"));

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={restaurantImgSource} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.details}>
          {restaurant.rating} ⭐ | {restaurant.time}
        </Text>
        {restaurant.offer && <Text style={styles.offer}>{restaurant.offer}</Text>}

        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => handleCart({
            id: restaurant.id,
            name: restaurant.name,
            price: restaurant.price || 0,
            image_key: restaurant.image_key || restaurant.imageKey || ""
          })}
        >
          <Text style={styles.addCartText}>
            {isInCart(restaurant.id) ? "Remove from Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.description}>
          Welcome to {restaurant.name}! Enjoy a variety of delicious foods prepared with love.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {["Best Seller", "Veg", "Non-Veg", "Beverages"].map((f) => (
            <TouchableOpacity key={f} style={[styles.filterBtn, activeFilter === f && styles.activeFilter]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={foodItems.filter((i) => i.type === activeFilter)}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => {
            const imgSource = imageMap[item.image_key] || require("../assets/food1.jpg");
            return (
              <View style={styles.foodCard}>
                <Image source={imgSource} style={styles.foodImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.cartBtn} onPress={() => handleCart(item)}>
                  <Text style={styles.cartBtnText}>{isInCart(item.id) ? "Remove" : "Add"}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 240, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  backBtn: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 },
  backArrow: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 10 },
  details: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 4 },
  offer: { fontSize: 16, color: "red", textAlign: "center", marginTop: 6 },
  addCartBtn: { backgroundColor: "#FFD700", padding: 12, borderRadius: 8, alignSelf: "center", marginVertical: 10 },
  addCartText: { fontWeight: "bold", color: "#333" },
  description: { fontSize: 15, color: "#444", paddingHorizontal: 20, marginVertical: 12, lineHeight: 22, textAlign: "center" },
  filterContainer: { flexDirection: "row", marginVertical: 10, paddingLeft: 15 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#ccc", marginRight: 10 },
  activeFilter: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  filterText: { color: "#555", fontSize: 14 },
  activeFilterText: { color: "#000", fontWeight: "600" },
  foodCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fafafa", marginHorizontal: 15, marginVertical: 8, padding: 10, borderRadius: 10 },
  foodImage: { width: 70, height: 70, borderRadius: 8 },
  foodName: { fontSize: 16, fontWeight: "600" },
  foodPrice: { fontSize: 14, color: "#888" },
  cartBtn: { backgroundColor: "#FFD700", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  cartBtnText: { fontSize: 13, fontWeight: "600" },
});
