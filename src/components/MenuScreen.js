import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import db, { useMenuItems } from "../database/dbs";


const imageMap = {
  food1: require("../assets/food1.jpg"),
  food2: require("../assets/food2.jpg"),
  food3: require("../assets/food3.jpg"),
  BlackNodles: require("../assets/BlackNodles.png"),
  Starfish: require("../assets/Starfish.png"),
  Moonland: require("../assets/Moonland.png"),
};

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

  
  const menuItems = useMenuItems(restaurant.id);

 
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Best Seller");

  const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

  
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_item_id INTEGER UNIQUE,
          name TEXT,
          price REAL,
          image_key TEXT,
          quantity INTEGER
        );`
      );
    });
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM cart", [], (_t, res) => {
          const arr = [];
          for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
          setCart(arr);
        });
      });
    }, [])
  );

 
  const toggleCart = (id) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;

    const inCart = cart.find((c) => c.menu_item_id === id);
    db.transaction(tx => {
      if (inCart) {
       
        tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () => {
          setCart(prev => prev.filter(c => c.menu_item_id !== id));
        });
      } else {
      
        tx.executeSql(
          `INSERT OR REPLACE INTO cart (menu_item_id,name,price,image_key,quantity)
           VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
          [item.id, item.name, item.price, item.image_key, item.id],
          () => setCart(prev => [...prev, { ...item, menu_item_id: id, quantity: 1 }])
        );
      }
    });
  };

  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
     
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backArrowContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.menuText}>Menu</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

      
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                activeFilter === f && styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.activeFilterText,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{activeFilter}</Text>

       
        {menuItems
          .filter(
            (m) => activeFilter === "Best Seller" || m.type === activeFilter
          )
          .map((item) => {
            const img =
              imageMap[item.image_key] || require("../assets/food1.jpg");
            const inCart = cart.some((c) => c.menu_item_id === item.id);
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={img} style={styles.itemImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => toggleCart(item.id)}
                >
                  <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
      </ScrollView>

     
      <TouchableOpacity
        style={styles.cartCard}
        onPress={() => navigation.navigate("AddToCartScreen")}
      >
        {totalItems === 0 ? (
          <Text style={styles.cartView}>Select any item you want</Text>
        ) : (
          <>
            <Text style={styles.cartText}>{totalItems} items</Text>
            <Text style={styles.cartView}>View Cart</Text>
            <Text style={styles.cartText}>Rs. {totalPrice}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    marginHorizontal: 16,
  },
  backArrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  backArrow: { fontSize: 22, color: "#000", fontWeight: "700" },
  headerCenter: { alignItems: "center" },
  restaurantName: { fontSize: 18, fontWeight: "700", color: "#222" },
  menuText: { fontSize: 14, color: "#555", marginTop: 2 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 16,
    marginBottom: 10,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  activeFilter: { backgroundColor: "#FF7000", borderColor: "#FF7000" },
  filterText: { fontSize: 14, color: "#555" },
  activeFilterText: { color: "#fff", fontWeight: "600" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemPrice: { fontSize: 14, color: "#888", marginTop: 4 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addBtnText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  cartCard: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "#d4f5d4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cartText: { fontSize: 16, fontWeight: "600", color: "#222" },
  cartView: { fontSize: 16, fontWeight: "700", color: "#000" },
});
