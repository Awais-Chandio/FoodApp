import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

const AddToCartScreen = () => {
  const [cartItems, setCartItems] = useState([
    { id: "1", name: "Pizza", price: 10, quantity: 1, image: "https://via.placeholder.com/80" },
    { id: "2", name: "Burger", price: 5, quantity: 2, image: "https://via.placeholder.com/80" },
  ]);

  const [promoCode, setPromoCode] = useState("");

  const increaseQuantity = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const itemTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoCode === "SAVE10" ? itemTotal * 0.1 : 0;
  const tax = (itemTotal - discount) * 0.05; // 5% tax
  const total = itemTotal - discount + tax;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.qtyButton}>
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.qtyButton}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // Scroll handled by ScrollView
      />

      {/* Promo Code */}
      <View style={styles.promoContainer}>
        <TextInput
          placeholder="Enter promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          style={styles.promoInput}
        />
      </View>

      {/* Price Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text>Item Total</Text>
          <Text>${itemTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Discount</Text>
          <Text>-${discount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Tax</Text>
          <Text>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ fontWeight: "bold" }}>Total</Text>
          <Text style={{ fontWeight: "bold" }}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "bold" },
  itemPrice: { fontSize: 14, color: "#555" },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  qtyButton: {
    width: 30,
    height: 30,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  qtyButtonText: { fontSize: 18 },
  qtyText: { marginHorizontal: 10, fontSize: 16 },
  deleteText: { color: "red" },
  promoContainer: { marginVertical: 20 },
  promoInput: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  summaryContainer: { marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  continueButton: {
    backgroundColor: "#ff9900",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  continueText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default AddToCartScreen;
