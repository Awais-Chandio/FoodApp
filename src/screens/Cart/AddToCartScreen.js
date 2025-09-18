
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

  useEffect(() => {
    refreshCart();
  }, []);

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
      <View style={styles.itemCard}>
        {/* Left: product image */}
        <Image source={imgSource} style={styles.itemImage} />

        {/* Middle: name + quantity controls */}
        <View style={styles.middleSection}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.quantityRow}>
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

        {/* Right: delete icon on top, price below */}
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={() => deleteItem(item.menu_item_id)}>
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
        </View>
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
    backgroundColor: "#FF7000",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deliveryLabel: {
    fontSize: 14,
    color: "white",
    marginBottom: 4,
    fontWeight: "600",
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
    color: "white",
  },
  /* ----- New Card Layout Styles ----- */
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  middleSection: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  qtyButtonText: { fontSize: 18 },
  qtyText: { marginHorizontal: 8, fontSize: 16 },
  rightSection: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  deleteText: { fontSize: 22, color: "red", marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#333" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
});
