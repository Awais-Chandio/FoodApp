import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const AddToCartScreen = ({ route }) => {
  const navigation = useNavigation();
  const { cartItems: initialCart = [] } = route.params || {};
  const [cartItems, setCartItems] = useState(
    initialCart.map((i) => ({
      ...i,
      quantity: i.quantity || 1, 
      price: i.price || 100, 
    }))
  );
  const [promoCode, setPromoCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false); 

 
  useEffect(() => {
    if (route.params?.item) {
      const newItem = {
        ...route.params.item,
        quantity: 1,
        price: route.params.item.price || 100,
      };
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === newItem.id);
        if (existing) {
          return prev.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, newItem];
      });
    }
  }, [route.params]);

 
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };


  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = promoCode === "SAVE10" ? 10 : 0;
  const tax = 2;
  const total = itemTotal - discount + tax;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={typeof item.image === "string" ? { uri: item.image } : item.image}
        style={styles.itemImage}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.id)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQuantity(item.id)}
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
      
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate("Main", { screen: "Home" })}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 30 }} />
      </View>

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

     
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thanks for buying food with us!</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  
  backBtn: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    padding: 5,
  },
  backArrow: { fontSize: 26, fontWeight: "bold", color: "#000" },

  header: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },

  addressBox: {
    backgroundColor: "#FF7F32",
    padding: 15,
    borderRadius: 8,
    margin: 15,
  },
  addressText: { color: "#fff", fontSize: 14 },
  addressDetail: { color: "#fff", fontWeight: "bold", marginTop: 3 },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemName: { fontSize: 14, fontWeight: "bold" },
  itemPrice: { fontSize: 12, color: "#555" },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  qtyButton: {
    width: 25,
    height: 25,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  qtyButtonText: { fontSize: 16, fontWeight: "bold" },
  qtyText: { marginHorizontal: 8, fontSize: 14 },
  deleteText: { color: "red", fontSize: 20, paddingHorizontal: 6 },

  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 10,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  promoAddButton: {
    marginLeft: 10,
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    justifyContent: "flex-end",
  },
  bottomDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  summaryWrapper: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  continueButton: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: { fontWeight: "bold", color: "#000" },


  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  trackButton: {
    backgroundColor: "#FF7F32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  trackButtonText: { color: "#fff", fontWeight: "bold" },
});

export default AddToCartScreen;
