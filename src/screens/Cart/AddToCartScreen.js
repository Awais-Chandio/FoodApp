import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // ✅ useFocusEffect
import { updateQuantity, removeFromCart, getCartItems } from "../../database/dbs";

const imageMap = {
  food1: require("../../assets/food1.jpg"),
  food2: require("../../assets/food2.jpg"),
  food3: require("../../assets/food3.jpg"),
  Moonland: require("../../assets/Moonland.png"),
  Starfish: require("../../assets/Starfish.png"),
  BlackNodles: require("../../assets/BlackNodles.png"),
};

export default function AddToCartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = async () => {
    const items = await getCartItems();
    setCartItems(items);
  };

  // 🔑 1. Initial load
  useEffect(() => {
    refreshCart();
  }, []);

  // 🔑 2. Refresh every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

  const increaseQuantity = async (id) => {
    await updateQuantity(id, 1);
    await refreshCart();
  };

  const decreaseQuantity = async (id) => {
    await updateQuantity(id, -1);
    await refreshCart();
  };

  const deleteItem = async (id) => {
    await removeFromCart(id);
    await refreshCart();
  };

  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const renderItem = ({ item }) => {
    const imgSource =
      imageMap[item.image_key] || require("../../assets/food1.jpg");
    return (
      <View style={styles.itemContainer}>
        <Image source={imgSource} style={styles.itemImage} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => decreaseQuantity(item.menu_item_id)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity || 1}</Text>
            <TouchableOpacity
              onPress={() => increaseQuantity(item.menu_item_id)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteItem(item.menu_item_id)}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>

      <View style={styles.deliveryHeader}>
        <Text style={styles.deliveryLabel}>Deliver to</Text>
        <Text style={styles.deliveryAddress}>
          242 ST Marks Eve,{"\n"}Finland
        </Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.menu_item_id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.summaryRow}>
        <Text style={{ fontWeight: "bold" }}>Total</Text>
        <Text style={{ fontWeight: "bold" }}>Rs. {itemTotal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backBtn: { padding: 10 },
  backArrow: { fontSize: 22 },
  header: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  deliveryHeader: {
    backgroundColor: "#f6f6f6",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deliveryLabel: { fontSize: 14, color: "gray", marginBottom: 4, fontWeight: "600" },
  deliveryAddress: { fontSize: 16, fontWeight: "bold", lineHeight: 20 },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { color: "gray", marginTop: 4 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: { paddingHorizontal: 10, backgroundColor: "#ddd", borderRadius: 4 },
  qtyButtonText: { fontSize: 18 },
  qtyText: { marginHorizontal: 8, fontSize: 16 },
  deleteText: { fontSize: 22, color: "red", marginLeft: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
});
