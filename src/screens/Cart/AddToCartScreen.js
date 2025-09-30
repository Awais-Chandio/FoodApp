import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import db from "../../database/dbs";
import { useAuth } from "../Auth/AuthContext";   


const imageMap = {
  Westway: require("../../assets/Westway.png"),
  Fortune: require("../../assets/Fortune.png"),
  Seafood: require("../../assets/Seafood.png"),
  food1: require("../../assets/food1.jpg"),
  food2: require("../../assets/food2.jpg"),
  food3: require("../../assets/food3.jpg"),
  BlackNoodles: require("../../assets/BlackNodles.png"),
  Starfish: require("../../assets/Starfish.png"),
  Moonland: require("../../assets/Moonland.png"),
};

export default function AddToCartScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();        
  const [cartItems, setCartItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  const fetchCart = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM cart",
        [],
        (_t, res) => {
          const arr = [];
          for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
          setCartItems(arr);
        },
        (_t, err) => console.log("Cart fetch error", err)
      );
    });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const removeItem = (menu_item_id) => {
    db.transaction(
      (tx) => {
        tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [menu_item_id]);
      },
      (err) => console.log(err),
      () => fetchCart()
    );
  };

  const increaseQty = (menu_item_id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE cart SET quantity = quantity + 1 WHERE menu_item_id=?",
          [menu_item_id]
        );
      },
      (err) => console.log(err),
      () => fetchCart()
    );
  };

  const decreaseQty = (menu_item_id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE cart SET quantity = quantity - 1 WHERE menu_item_id=? AND quantity > 1",
          [menu_item_id]
        );
        tx.executeSql("DELETE FROM cart WHERE quantity <= 0 AND menu_item_id=?", [
          menu_item_id,
        ]);
      },
      (err) => console.log(err),
      () => fetchCart()
    );
  };

  const resolveImageForRow = (item) => {
    if (!item) return imageMap.food1;
    const dbPath = (item.image_path || item.image_key || "").trim();
    if (dbPath) {
      if (/^(https?:|file:|data:)/i.test(dbPath)) return { uri: dbPath };
      if (imageMap[dbPath]) return imageMap[dbPath];
      const key = dbPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      if (imageMap[key]) return imageMap[key];
    }
    if (item.name && imageMap[item.name]) return imageMap[item.name];
    return imageMap.food1;
  };

  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
    0
  );

  
  const handleCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("TrackOrder");
    } else {
      navigation.navigate("Login");  
    }
  };

  return (
    <View style={styles.container}>
  
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.menu_item_id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Image source={resolveImageForRow(item)} style={styles.itemImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decreaseQty(item.menu_item_id)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity || 1}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => increaseQty(item.menu_item_id)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.menu_item_id)}>
                <Text style={styles.removeBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {cartItems.length > 0 && (
        <View style={styles.checkoutCard}>
          <Text style={styles.totalText}>Total: Rs. {totalPrice}</Text>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backArrow: { width: 40, justifyContent: "center", alignItems: "flex-start" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#555" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#222" },
  itemPrice: { fontSize: 14, color: "#666", marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 18, fontWeight: "600", color: "#000" },
  qtyValue: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  removeBtn: { color: "#FF3B30", fontWeight: "600" },
  checkoutCard: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "#d4f5d4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  totalText: { fontSize: 16, fontWeight: "600", color: "#222" },
  checkoutBtn: {
    backgroundColor: "#FF7F32",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkoutText: { color: "#fff", fontWeight: "700" },
});
