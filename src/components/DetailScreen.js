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
import { useNavigation } from "@react-navigation/native";

const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];


const foodItems = [
  {
    id: "1",
    name: "Cheese Burger",
    price: 5.99,
    type: "Best Seller",
    image: require("../assets/food1.jpg"),
  },
  {
    id: "2",
    name: "Veg Pizza",
    price: 7.49,
    type: "Best Seller",
    image: require("../assets/food2.jpg"),
  },
  {
    id: "3",
    name: "Cold Coffee",
    price: 3.99,
    type: "Best Seller",
    image: require("../assets/food3.jpg"),
  },
  {
    id: "1",
    name: "Westway",
    image: require("../assets/Westway.png"),
    rating: 4.6,
    time: "15 min",
    offer: "50% OFF",
  },
  {
    id: "2",
    name: "Fortune",
    image: require("../assets/Fortune.png"),
    rating: 4.8,
    time: "25 min",
  },
  {
    id: "3",
    name: "Seafood",
    image: require("../assets/Seafood.png"),
    rating: 4.6,
    time: "20 min",
  },
  {
    id: "4",
    name: "Food Special 1",
    image: require("../assets/food1.jpg"),
    rating: 4.5,
    time: "18 min",
  },
  {
    id: "5",
    name: "Food Special 2",
    image: require("../assets/food2.jpg"),
    rating: 4.7,
    time: "22 min",
  },
  {
    id: "6",
    name: "Food Special 3",
    image: require("../assets/food3.jpg"),
    rating: 4.9,
    time: "12 min",
  },
   {
    id: "1",
    name: "Moonland",
    image: require("../assets/Moonland.png"),
    rating: 4.6,
    time: "15 min",
  },
  {
    id: "2",
    name: "Starfish",
    image: require("../assets/Starfish.png"),
    rating: 4.8,
    time: "25 min",
    offer: "30% OFF",
  },
  {
    id: "3",
    name: "Black Noodles",
    image: require("../assets/BlackNodles.png"),
    rating: 4.9,
    time: "20 min",
  },
  {
    id: "4",
    name: "Food Special 1",
    image: require("../assets/food1.jpg"),
    rating: 4.5,
    time: "18 min",
  },
  {
    id: "5",
    name: "Food Special 2",
    image: require("../assets/food2.jpg"),
    rating: 4.7,
    time: "22 min",
  },
  {
    id: "6",
    name: "Food Special 3",
    image: require("../assets/food3.jpg"),
    rating: 4.9,
    time: "12 min",
  },
];

export default function DetailScreen({ route }) {
  const { restaurant } = route.params;
  const navigation = useNavigation();

  const [activeFilter, setActiveFilter] = useState("Best Seller");
  const [cart, setCart] = useState([]);

 
  const restaurantItem = { ...restaurant, id: restaurant.id || "restaurant" };

  const toggleCart = (item) => {
    if (cart.find((cartItem) => cartItem.id === item.id)) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id)); 
    } else {
      setCart([...cart, item]); 
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
      
        <View>
          <Image source={restaurant.image} style={styles.image} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Main", { screen: "Home" })}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.details}>
          {restaurant.rating} ⭐ | {restaurant.time}
        </Text>
        {restaurant.offer && <Text style={styles.offer}>{restaurant.offer}</Text>}

       
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => toggleCart(restaurantItem)}
        >
          <Text style={styles.addCartText}>
            {cart.find((c) => c.id === restaurantItem.id)
              ? "Remove from Cart"
              : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        
        <Text style={styles.description}>
          Welcome to {restaurant.name}! Enjoy a variety of delicious foods
          prepared with love. Fresh, hot, and tasty for every mood.
        </Text>

       
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

       
        <FlatList
          data={foodItems.filter((item) => item.type === activeFilter)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.foodCard}>
              <Image source={item.image} style={styles.foodImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.cartBtn}
                onPress={() => toggleCart(item)}
              >
                <Text style={styles.cartBtnText}>
                  {cart.find((c) => c.id === item.id) ? "Remove" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 240, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  backArrow: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 10 },
  details: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 4 },
  offer: { fontSize: 16, color: "red", textAlign: "center", marginTop: 6 },
  addCartBtn: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  addCartText: { fontWeight: "bold", color: "#333" },
  description: {
    fontSize: 15,
    color: "#444",
    paddingHorizontal: 20,
    marginVertical: 12,
    lineHeight: 22,
    textAlign: "center",
  },
  filterContainer: { flexDirection: "row", marginVertical: 10, paddingLeft: 15 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  activeFilter: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  filterText: { color: "#555", fontSize: 14 },
  activeFilterText: { color: "#000", fontWeight: "600" },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  foodImage: { width: 70, height: 70, borderRadius: 8 },
  foodName: { fontSize: 16, fontWeight: "600" },
  foodPrice: { fontSize: 14, color: "#888" },
  cartBtn: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cartBtnText: { fontSize: 13, fontWeight: "600" },
});
