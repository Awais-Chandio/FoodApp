import React, { useState, useEffect, useCallback } from "react";
import Snackbar from "react-native-snackbar";
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
  const discount = 10;
  const tax = 2;
  const grandTotal = itemTotal - discount + tax;

  const renderItem = ({ item }) => {
    const imgSource =
      imageMap[item.image_key] || require("../../assets/food1.jpg");

    return (
      <View style={styles.itemCard}>
        <Image source={imgSource} style={styles.itemImage} />
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
        contentContainerStyle={{ paddingBottom: 180 }}
      />


      <Image
        source={require("../../assets/BottamBar.png")}
        style={styles.bottomBarImage}
        resizeMode="stretch"
      />


      <View style={styles.bottomOverlay}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Items Total</Text>
          <Text style={styles.priceValue}>${itemTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Discount</Text>
          <Text style={styles.priceValue}>- $ {discount.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>$ {tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, { marginTop: 6 }]}>
          <Text style={[styles.priceLabel, { fontWeight: "bold" }]}>Total</Text>
          <Text style={[styles.priceValue, { fontWeight: "bold" }]}>
            ${grandTotal.toFixed(2)}
          </Text>
        </View>


        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => {
            Snackbar.show({
              text:
                "Thanks for Buying Food with Us\nYour food will arrive in 3 mint",
              duration: Snackbar.LENGTH_INDEFINITE,
              numberOfLines: 3,
              textColor: "white",
              backgroundColor: "#333",
              position: "center",
              action: {
                text: "Track Your Order",
                textColor: "yellow",
                onPress: () => navigation.navigate("TrackOrder"),
              },
            });
          }}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
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
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  middleSection: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  qtyButtonText: { fontSize: 18 },
  qtyText: { marginHorizontal: 8, fontSize: 16 },
  rightSection: { justifyContent: "space-between", alignItems: "flex-end" },
  deleteText: { fontSize: 22, color: "red", marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#333" },

  /* --- Bottom Bar --- */
  bottomBarImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 250,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  priceLabel: { fontSize: 16, fontWeight: "700", color: "#181717ff" },
  priceValue: { fontSize: 16, fontWeight: "700", color: "#201f1fff" },


  continueBtn: {
    backgroundColor: "#fff",
    marginTop: 5,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20
  },
  continueBtnText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
});
