import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// 🔹 IMPORT SQLite helper functions
import {
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartQuantity,
} from "../../database/dbs";

const AddToCartScreen = ({ route }) => {
  const navigation = useNavigation();

  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // 🔹 Load cart items when screen opens
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    getCartItems((items) => {
      setCartItems(items);
    });
  };

  // 🔹 If item passed from DetailScreen, add it
  useEffect(() => {
    if (route.params?.item) {
      const newItem = {
        ...route.params.item,
        quantity: 1,
        price: route.params.item.price || 100,
      };

      addToCart(newItem, () => loadCart());
    }
  }, [route.params]);

  // 🔹 Update quantity
  const increaseQuantity = (id, quantity) => {
    const newQty = quantity + 1;
    updateCartQuantity(id, newQty, () => loadCart());
  };

  const decreaseQuantity = (id, quantity) => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      updateCartQuantity(id, newQty, () => loadCart());
    }
  };

  // 🔹 Delete item
  const deleteItem = (id) => {
    removeFromCart(id, () => loadCart());
  };

  // 🔹 Cart calculations
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = promoCode === "SAVE10" ? 10 : 0;
  const tax = 2;
  const total = itemTotal - discount + tax;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* ✅ Render only if item.image exists */}
      {item.image && (
        <Image
          source={
            typeof item.image === "string" ? { uri: item.image } : item.image
          }
          style={styles.itemImage}
        />
      )}

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.id, item.quantity)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQuantity(item.id, item.quantity)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate("Main", { screen: "Home" })}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Cart Items */}
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>Deliver to</Text>
          <Text style={styles.addressDetail}>242 ST Marks Eve, Finland</Text>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {/* Promo code */}
        <View style={styles.promoContainer}>
          <TextInput
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            style={styles.promoInput}
          />
          <TouchableOpacity style={styles.promoAddButton}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <Image
          source={require("../../assets/Vector-3.png")}
          style={styles.bottomDecoration}
        />
        <View style={styles.summaryWrapper}>
          <View style={styles.summaryRow}>
            <Text>Item total</Text>
            <Text>${itemTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Discount</Text>
            <Text>- ${discount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Tax</Text>
            <Text>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ fontWeight: "bold" }}>Total</Text>
            <Text style={{ fontWeight: "bold" }}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Thanks for buying food with us!
            </Text>
            <Text style={styles.modalSubtitle}>
              Your food will arrive in 3 minutes.
            </Text>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("TrackOrder");
              }}
            >
              <Text style={styles.trackButtonText}>Track your order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddToCartScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backBtn: { padding: 10 },
  backArrow: { fontSize: 22 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { color: "gray", marginTop: 4 },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyButton: {
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  qtyButtonText: { fontSize: 18 },
  qtyText: { marginHorizontal: 8, fontSize: 16 },
  deleteText: { fontSize: 22, color: "red", marginLeft: 10 },
  addressBox: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: 10,
  },
  addressText: { fontSize: 14, color: "gray" },
  addressDetail: { fontSize: 16, fontWeight: "bold" },
  promoContainer: {
    flexDirection: "row",
    margin: 15,
    alignItems: "center",
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
  promoAddButton: {
    marginLeft: 8,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
  },
  bottomContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  bottomDecoration: { width: "100%", height: 80, resizeMode: "cover" },
  summaryWrapper: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  continueButton: {
    backgroundColor: "#ff9900",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  continueText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: "gray", marginBottom: 20 },
  trackButton: { backgroundColor: "#ff9900", padding: 12, borderRadius: 8 },
  trackButtonText: { color: "#fff", fontWeight: "bold" },
});
