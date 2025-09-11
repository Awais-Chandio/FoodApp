import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

const foodItems = [
  {
    id: "1",
    name: "Vegetable Salad",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food1.jpg"),
    discount: "50% OFF",
  },
  {
    id: "2",
    name: "Burger with some",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food2.jpg"),
    discount: "30% OFF",
  },
  {
    id: "3",
    name: "Vegetable Salad",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food3.jpg"),
    discount: "30% OFF",
  },
  {
    id: "4",
    name: "Burger with some",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food1.jpg"),
  },
  {
    id: "5",
    name: "Burger with some",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food2.jpg"),
    discount: "10% OFF",
  },
  {
    id: "6",
    name: "Burger with some",
    restaurant: "In Pizza Mania",
    price: 152.0,
    image: require("../../assets/food3.jpg"),
  },
];

export default function CategoryScreen() {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("Best Seller");
  const [cart, setCart] = useState([]);

  
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const toggleCart = (item) => {
    const exists = cart.find((cartItem) => cartItem.id === item.id);
    if (exists) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    } else {
      setCart([...cart, item]);

     
      setSnackbarMessage("Successfully Added to Cart");
      setSnackbarVisible(true);

     
      setTimeout(() => setSnackbarVisible(false), 3000);
    }
  };

  const renderItem = ({ item }) => {
    const inCart = cart.find((cartItem) => cartItem.id === item.id);
    return (
      <View style={styles.itemCard}>
        <Image source={item.image} style={styles.itemImage} />
        {item.discount && (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemRestaurant}>{item.restaurant}</Text>
          <Text style={styles.itemPrice}>Price. {item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            inCart && { backgroundColor: "#32CD32" },
          ]}
          onPress={() => toggleCart(item)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {inCart ? "✓" : "+"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
   
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}></Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>Westway</Text>
          <Text style={styles.subTitle}>Menu</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

     
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              selectedFilter === f && styles.activeFilter,
            ]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f && styles.activeFilterText,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Best sellers</Text>
      <FlatList
        data={foodItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

  
      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartText}>{cart.length} Item</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("AddToCartScreen", { cartItems: cart })}
          >
            <Text style={styles.cartButtonText}>View Cart</Text>
          </TouchableOpacity>

          <Text style={styles.cartPrice}>
            $
            {cart
              .reduce((sum, item) => sum + item.price, 0)
              .toFixed(2)}
          </Text>
        </View>
      )}

      {snackbarVisible && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
          <TouchableOpacity
            onPress={() => {
              setSnackbarVisible(false);
              navigation.navigate("AddToCartScreen", { cartItems: cart });
            }}
          >
            <Text style={styles.snackbarAction}>Checkout Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  backButton: { fontSize: 22, fontWeight: "bold" },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#000" },
  subTitle: { fontSize: 12, color: "#555" },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: "#eee",
  },
  filterText: { fontSize: 12, color: "#555" },
  activeFilter: { backgroundColor: "#FF7F32" },
  activeFilterText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    alignItems: "center",
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  discountTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF4500",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { fontSize: 10, fontWeight: "bold", color: "#fff" },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: "bold" },
  itemRestaurant: { fontSize: 12, color: "#777" },
  itemPrice: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  addButton: {
    backgroundColor: "#FF7F32",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  cartText: { fontSize: 14, color: "#333" },
  cartButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cartButtonText: { color: "#fff", fontWeight: "bold" },
  cartPrice: { fontSize: 14, fontWeight: "bold", color: "#000" },
  snackbar: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 5,
  },
  snackbarText: {
    color: "#fff",
    fontSize: 14,
  },
  snackbarAction: {
    color: "#FF7F32",
    fontWeight: "bold",
  },
});
