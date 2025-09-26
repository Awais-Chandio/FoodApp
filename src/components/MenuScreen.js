// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
// import db from "../database/dbs";

// // ✅ Add explicit mappings for first 3 restaurants
// const imageMap = {
//   Westway: require("../assets/Westway.png"),
//   Fortune: require("../assets/Fortune.png"),
//   Seafood: require("../assets/Seafood.png"),
//   food1: require("../assets/food1.jpg"),
//   food2: require("../assets/food2.jpg"),
//   food3: require("../assets/food3.jpg"),
//   BlackNodles: require("../assets/BlackNodles.png"),
//   Starfish: require("../assets/Starfish.png"),
//   Moonland: require("../assets/Moonland.png"),
// };

// export default function MenuScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

//   const [menuItems, setMenuItems] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Best Seller");
//   const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

//   useEffect(() => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS cart (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           menu_item_id INTEGER UNIQUE,
//           name TEXT,
//           price REAL,
//           image_key TEXT,
//           quantity INTEGER
//         );`
//       );
//     });
//   }, []);

//   useFocusEffect(
//     React.useCallback(() => {
//       db.transaction((tx) => {
//         tx.executeSql(
//           "SELECT * FROM restaurants",
//           [],
//           (_t, res) => {
//             const arr = [];
//             for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//             setMenuItems(arr);
//           },
//           (_t, err) => {
//             console.log("restaurants fetch error", err);
//             return false;
//           }
//         );

//         tx.executeSql(
//           "SELECT * FROM cart",
//           [],
//           (_t, resCart) => {
//             const arr = [];
//             for (let i = 0; i < resCart.rows.length; i++) arr.push(resCart.rows.item(i));
//             setCart(arr);
//           },
//           (_t, err) => {
//             console.log("cart fetch error", err);
//             return false;
//           }
//         );
//       });
//     }, [])
//   );

//   // ✅ Updated resolveImageForRow
//   const resolveImageForRow = (r) => {
//     if (!r) return imageMap.food1;

//     const dbPath = (r.image_path || r.image_key || "").trim();
//     if (dbPath) {
//       if (/^(https?:|file:|data:)/i.test(dbPath)) return { uri: dbPath };
//       if (imageMap[dbPath]) return imageMap[dbPath];
//       const key = dbPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
//       if (imageMap[key]) return imageMap[key];
//     }

//     // ✅ Explicit match by restaurant name for first 3
//     if (r.name && imageMap[r.name]) return imageMap[r.name];

//     return imageMap.food1;
//   };

//   const toggleCart = (id, name, price = 0, image_key = null) => {
//     const inCart = cart.find((c) => c.menu_item_id === id);
//     db.transaction((tx) => {
//       if (inCart) {
//         tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () => {
//           setCart((prev) => prev.filter((c) => c.menu_item_id !== id));
//         });
//       } else {
//         tx.executeSql(
//           `INSERT OR REPLACE INTO cart (menu_item_id,name,price,image_key,quantity)
//            VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
//           [id, name, price, image_key, id],
//           () =>
//             setCart((prev) => [
//               ...prev,
//               { menu_item_id: id, name, price, image_key, quantity: 1 },
//             ])
//         );
//       }
//     });
//   };

//   const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
//   const totalPrice = cart.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.headerRow}>
//           <TouchableOpacity
//             style={styles.backArrowContainer}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backArrow}>←</Text>
//           </TouchableOpacity>

//           <View style={styles.headerCenter}>
//             <Text style={styles.restaurantName}>{restaurant.name}</Text>
//             <Text style={styles.menuText}>Menu</Text>
//           </View>

//           <View style={{ width: 40 }} />
//         </View>

//         <View style={styles.filterRow}>
//           {filters.map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
//               onPress={() => setActiveFilter(f)}
//             >
//               <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>
//                 {f}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.sectionTitle}>{activeFilter}</Text>

//         {menuItems.map((item) => {
//           const img = resolveImageForRow(item);
//           const inCart = cart.some((c) => c.menu_item_id === item.id);
//           const subtitle = `${item.rating ? `⭐ ${item.rating}` : ""} ${item.time ? `• ${item.time}` : ""}`;
//           return (
//             <View key={item.id} style={styles.itemCard}>
//               <Image source={img} style={styles.itemImage} />
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 {/* Rating & time */}
//                 <Text style={styles.itemSubtitle}>{subtitle}</Text>
//                 {/* Price below rating/time */}
//                 <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.addBtn}
//                 onPress={() =>
//                   toggleCart(item.id, item.name, item.price, item.image_path || item.image_key)
//                 }
//               >
//                 <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })}
//       </ScrollView>

//       <TouchableOpacity
//         style={styles.cartCard}
//         onPress={() => navigation.navigate("AddToCartScreen")}
//       >
//         {totalItems === 0 ? (
//           <Text style={styles.cartView}>Select any item you want</Text>
//         ) : (
//           <>
//             <Text style={styles.cartText}>{totalItems} items</Text>
//             <Text style={styles.cartView}>View Cart</Text>
//             <Text style={styles.cartText}>Rs. {totalPrice}</Text>
//           </>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 60,
//     marginHorizontal: 16,
//   },
//   backArrowContainer: {
//     width: 40,
//     height: 40,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//   },
//   backArrow: { fontSize: 22, color: "#000", fontWeight: "700" },
//   headerCenter: { alignItems: "center" },
//   restaurantName: { fontSize: 18, fontWeight: "700", color: "#222" },
//   menuText: { fontSize: 14, color: "#555", marginTop: 2 },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 16,
//     marginBottom: 10,
//   },
//   filterBtn: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//   },
//   activeFilter: { backgroundColor: "#FF7000", borderColor: "#FF7000" },
//   filterText: { fontSize: 14, color: "#555" },
//   activeFilterText: { color: "#fff", fontWeight: "600" },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#222",
//     marginHorizontal: 20,
//     marginVertical: 12,
//   },
//   itemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fafafa",
//     marginHorizontal: 20,
//     marginVertical: 8,
//     padding: 12,
//     borderRadius: 12,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
//   itemSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
//   itemPrice: { fontSize: 14, color: "#888", marginTop: 2 },
//   addBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   addBtnText: { fontSize: 18, fontWeight: "bold", color: "#000" },
//   cartCard: {
//     position: "absolute",
//     bottom: 10,
//     left: 20,
//     right: 20,
//     backgroundColor: "#d4f5d4",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   cartText: { fontSize: 16, fontWeight: "600", color: "#222" },
//   cartView: { fontSize: 16, fontWeight: "700", color: "#000" },
// });


// above code is old file MenuScreen.js



// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
// import db from "../database/dbs";

// const imageMap = {
//   Westway: require("../assets/Westway.png"),
//   Fortune: require("../assets/Fortune.png"),
//   Seafood: require("../assets/Seafood.png"),
//   food1: require("../assets/food1.jpg"),
//   food2: require("../assets/food2.jpg"),
//   food3: require("../assets/food3.jpg"),
//   BlackNodles: require("../assets/BlackNodles.png"),
//   Starfish: require("../assets/Starfish.png"),
//   Moonland: require("../assets/Moonland.png"),
// };

// export default function MenuScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

//   const [menuItems, setMenuItems] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Best Seller");
//   const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

//   // ✅ Ensure menu & cart tables exist
//   useEffect(() => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS menu_items (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             restaurant_id INTEGER,
//             name TEXT,
//             price REAL,
//             image_path TEXT
//         );`
//       );

//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS cart (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             menu_item_id INTEGER UNIQUE,
//             name TEXT,
//             price REAL,
//             image_key TEXT,
//             quantity INTEGER
//         );`
//       );
//     });
//   }, []);

//   // ✅ Reload menu items & cart every time screen gains focus
//   useFocusEffect(
//     React.useCallback(() => {
//       db.transaction((tx) => {
//         tx.executeSql(
//           "SELECT * FROM menu_items WHERE restaurant_id=?",
//           [restaurant.id],
//           (_t, res) => {
//             const arr = [];
//             for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//             setMenuItems(arr);
//           }
//         );
//         tx.executeSql(
//           "SELECT * FROM cart",
//           [],
//           (_t, resCart) => {
//             const arr = [];
//             for (let i = 0; i < resCart.rows.length; i++) arr.push(resCart.rows.item(i));
//             setCart(arr);
//           }
//         );
//       });
//     }, [restaurant.id])
//   );

//   const resolveImageForRow = (row) => {
//     if (!row) return imageMap.food1;
//     const dbPath = (row.image_path || "").trim();
//     if (dbPath) {
//       if (/^(https?:|file:|data:)/i.test(dbPath)) return { uri: dbPath };
//       if (imageMap[dbPath]) return imageMap[dbPath];
//       const key = dbPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
//       if (imageMap[key]) return imageMap[key];
//     }
//     return imageMap.food1;
//   };

//   const toggleCart = (id, name, price = 0, image_key = null) => {
//     const inCart = cart.find((c) => c.menu_item_id === id);
//     db.transaction((tx) => {
//       if (inCart) {
//         tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () =>
//           setCart((prev) => prev.filter((c) => c.menu_item_id !== id))
//         );
//       } else {
//         tx.executeSql(
//           `INSERT OR REPLACE INTO cart
//            (menu_item_id,name,price,image_key,quantity)
//            VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
//           [id, name, price, image_key, id],
//           () =>
//             setCart((prev) => [
//               ...prev,
//               { menu_item_id: id, name, price, image_key, quantity: 1 },
//             ])
//         );
//       }
//     });
//   };

//   const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
//   const totalPrice = cart.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header + Add Item Button */}
//         <View style={styles.headerRow}>
//           <TouchableOpacity
//             style={styles.backArrowContainer}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backArrow}>←</Text>
//           </TouchableOpacity>

//           <View style={styles.headerCenter}>
//             <Text style={styles.restaurantName}>{restaurant.name}</Text>
//             <Text style={styles.menuText}>Menu</Text>
//           </View>

//           {/* ➕ Add Item Button */}
//           <TouchableOpacity
//             style={styles.addItemBtn}
//             onPress={() =>
//               navigation.navigate("ManageMenuItem", { restaurantId: restaurant.id })
//             }
//           >
//             <Text style={styles.addItemText}>Add Item</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Filters */}
//         <View style={styles.filterRow}>
//           {filters.map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
//               onPress={() => setActiveFilter(f)}
//             >
//               <Text
//                 style={[styles.filterText, activeFilter === f && styles.activeFilterText]}
//               >
//                 {f}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.sectionTitle}>{activeFilter}</Text>

//         {/* Menu List */}
//         {menuItems.map((item) => {
//           const img = resolveImageForRow(item);
//           const inCart = cart.some((c) => c.menu_item_id === item.id);
//           return (
//             <View key={item.id} style={styles.itemCard}>
//               <Image source={img} style={styles.itemImage} />
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.addBtn}
//                 onPress={() =>
//                   toggleCart(item.id, item.name, item.price, item.image_path)
//                 }
//               >
//                 <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })}
//       </ScrollView>

//       {/* Cart bar */}
//       <TouchableOpacity
//         style={styles.cartCard}
//         onPress={() => navigation.navigate("AddToCartScreen")}
//       >
//         {totalItems === 0 ? (
//           <Text style={styles.cartView}>Select any item you want</Text>
//         ) : (
//           <>
//             <Text style={styles.cartText}>{totalItems} items</Text>
//             <Text style={styles.cartView}>View Cart</Text>
//             <Text style={styles.cartText}>Rs. {totalPrice}</Text>
//           </>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 60,
//     marginHorizontal: 16,
//   },
//   backArrowContainer: {
//     width: 40,
//     height: 40,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//   },
//   backArrow: { fontSize: 22, color: "#000", fontWeight: "700" },
//   headerCenter: { alignItems: "center" },
//   restaurantName: { fontSize: 18, fontWeight: "700", color: "#222" },
//   menuText: { fontSize: 14, color: "#555", marginTop: 2 },
//   addItemBtn: {
//     backgroundColor: "#FF7000",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   addItemText: { color: "#fff", fontWeight: "700" },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 16,
//     marginBottom: 10,
//   },
//   filterBtn: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//   },
//   activeFilter: { backgroundColor: "#FF7000", borderColor: "#FF7000" },
//   filterText: { fontSize: 14, color: "#555" },
//   activeFilterText: { color: "#fff", fontWeight: "600" },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#222",
//     marginHorizontal: 20,
//     marginVertical: 12,
//   },
//   itemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fafafa",
//     marginHorizontal: 20,
//     marginVertical: 8,
//     padding: 12,
//     borderRadius: 12,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
//   itemPrice: { fontSize: 14, color: "#888", marginTop: 4 },
//   addBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   addBtnText: { fontSize: 18, fontWeight: "bold", color: "#000" },
//   cartCard: {
//     position: "absolute",
//     bottom: 10,
//     left: 20,
//     right: 20,
//     backgroundColor: "#d4f5d4",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   cartText: { fontSize: 16, fontWeight: "600", color: "#222" },
//   cartView: { fontSize: 16, fontWeight: "700", color: "#000" },
// });






















// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
// import db from "../database/dbs";

// const imageMap = {
//   Westway: require("../assets/Westway.png"),
//   Fortune: require("../assets/Fortune.png"),
//   Seafood: require("../assets/Seafood.png"),
//   food1: require("../assets/food1.jpg"),
//   food2: require("../assets/food2.jpg"),
//   food3: require("../assets/food3.jpg"),
//   BlackNodles: require("../assets/BlackNodles.png"),
//   Starfish: require("../assets/Starfish.png"),
//   Moonland: require("../assets/Moonland.png"),
// };

// const editIcon = require("../assets/edit.png");
// const deleteIcon = require("../assets/delete.png");

// export default function MenuScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

//   const [menuItems, setMenuItems] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Best Seller");
//   const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

//   // Ensure tables exist
//   useEffect(() => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS menu_items (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             restaurant_id INTEGER,
//             name TEXT,
//             price REAL,
//             image_path TEXT
//         );`
//       );
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS cart (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             menu_item_id INTEGER UNIQUE,
//             name TEXT,
//             price REAL,
//             image_key TEXT,
//             quantity INTEGER
//         );`
//       );
//     });
//   }, []);

//   // Reload when screen focused
//   useFocusEffect(
//     React.useCallback(() => {
//       loadData();
//     }, [restaurant.id])
//   );

//   const loadData = () => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM menu_items WHERE restaurant_id=?",
//         [restaurant.id],
//         (_t, res) => {
//           const arr = [];
//           for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//           setMenuItems(arr);
//         }
//       );
//       tx.executeSql("SELECT * FROM cart", [], (_t, resCart) => {
//         const arr = [];
//         for (let i = 0; i < resCart.rows.length; i++) arr.push(resCart.rows.item(i));
//         setCart(arr);
//       });
//     });
//   };

//   const resolveImageForRow = (row) => {
//     const path = (row?.image_path || "").trim();
//     if (!path) return imageMap.food1;
//     if (/^(https?:|file:|content:|data:)/i.test(path)) return { uri: path };
//     const key = path.replace(/\.(png|jpe?g|webp)$/i, "");
//     return imageMap[key] || imageMap.food1;
//   };

//   const toggleCart = (id, name, price = 0, image_key = null) => {
//     const inCart = cart.find((c) => c.menu_item_id === id);
//     db.transaction((tx) => {
//       if (inCart) {
//         tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () =>
//           setCart((prev) => prev.filter((c) => c.menu_item_id !== id))
//         );
//       } else {
//         tx.executeSql(
//           `INSERT OR REPLACE INTO cart
//            (menu_item_id,name,price,image_key,quantity)
//            VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
//           [id, name, price, image_key, id],
//           () =>
//             setCart((prev) => [
//               ...prev,
//               { menu_item_id: id, name, price, image_key, quantity: 1 },
//             ])
//         );
//       }
//     });
//   };

//   // ✅ FIXED: Pass menuItem key instead of item
//   const editItem = (item) => {
//     navigation.navigate("ManageMenuItem", {
//       restaurantId: restaurant.id,
//       menuItem: item,
//     });
//   };

//   const deleteItem = (id) => {
//     Alert.alert("Delete Item", "Are you sure you want to remove this item?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: () => {
//           db.transaction((tx) => {
//             tx.executeSql("DELETE FROM menu_items WHERE id=?", [id], () => {
//               setMenuItems((prev) => prev.filter((m) => m.id !== id));
//             });
//           });
//         },
//       },
//     ]);
//   };

//   const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
//   const totalPrice = cart.reduce(
//     (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
//     0
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <TouchableOpacity
//             style={styles.backArrowContainer}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backArrow}>←</Text>
//           </TouchableOpacity>

//           <View style={styles.headerCenter}>
//             <Text style={styles.restaurantName}>{restaurant.name}</Text>
//             <Text style={styles.menuText}>Menu</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.addItemBtn}
//             onPress={() =>
//               navigation.navigate("ManageMenuItem", { restaurantId: restaurant.id })
//             }
//           >
//             <Text style={styles.addItemText}>Add Item</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Filters */}
//         <View style={styles.filterRow}>
//           {filters.map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
//               onPress={() => setActiveFilter(f)}
//             >
//               <Text
//                 style={[
//                   styles.filterText,
//                   activeFilter === f && styles.activeFilterText,
//                 ]}
//               >
//                 {f}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.sectionTitle}>{activeFilter}</Text>

//         {/* Menu Items */}
//         {menuItems.map((item) => {
//           const img = resolveImageForRow(item);
//           const inCart = cart.some((c) => c.menu_item_id === item.id);
//           return (
//             <View key={item.id} style={styles.itemCard}>
//               <Image source={img} style={styles.itemImage} />

//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//               </View>

//               {/* ✅ Edit & Delete icons stay visible */}
//               <View style={styles.editDeleteRow}>
//                 <TouchableOpacity onPress={() => editItem(item)}>
//                   <Image source={editIcon} style={styles.icon} />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => deleteItem(item.id)}>
//                   <Image source={deleteIcon} style={[styles.icon, { marginLeft: 8 }]} />
//                 </TouchableOpacity>
//               </View>

//               {/* Add/Remove from cart */}
//               <TouchableOpacity
//                 style={styles.addBtn}
//                 onPress={() =>
//                   toggleCart(item.id, item.name, item.price, item.image_path)
//                 }
//               >
//                 <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })}
//       </ScrollView>

//       {/* Cart bar */}
//       <TouchableOpacity
//         style={styles.cartCard}
//         onPress={() => navigation.navigate("AddToCartScreen")}
//       >
//         {totalItems === 0 ? (
//           <Text style={styles.cartView}>Select any item you want</Text>
//         ) : (
//           <>
//             <Text style={styles.cartText}>{totalItems} items</Text>
//             <Text style={styles.cartView}>View Cart</Text>
//             <Text style={styles.cartText}>Rs. {totalPrice}</Text>
//           </>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 60,
//     marginHorizontal: 16,
//   },
//   backArrowContainer: {
//     width: 40,
//     height: 40,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//   },
//   backArrow: { fontSize: 22, color: "#000", fontWeight: "700" },
//   headerCenter: { alignItems: "center" },
//   restaurantName: { fontSize: 18, fontWeight: "700", color: "#222" },
//   menuText: { fontSize: 14, color: "#555", marginTop: 2 },
//   addItemBtn: {
//     backgroundColor: "#FF7000",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   addItemText: { color: "#fff", fontWeight: "700" },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 16,
//     marginBottom: 10,
//   },
//   filterBtn: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//   },
//   activeFilter: { backgroundColor: "#FF7000", borderColor: "#FF7000" },
//   filterText: { fontSize: 14, color: "#555" },
//   activeFilterText: { color: "#fff", fontWeight: "600" },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#222",
//     marginHorizontal: 20,
//     marginVertical: 12,
//   },
//   itemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fafafa",
//     marginHorizontal: 20,
//     marginVertical: 8,
//     padding: 12,
//     borderRadius: 12,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
//   itemPrice: { fontSize: 14, color: "#888", marginTop: 4 },
//   editDeleteRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 8,
//   },
//   icon: { width: 20, height: 20, tintColor: "#333" },
//   addBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginLeft: 6,
//   },
//   addBtnText: { fontSize: 18, fontWeight: "bold", color: "#000" },
//   cartCard: {
//     position: "absolute",
//     bottom: 10,
//     left: 20,
//     right: 20,
//     backgroundColor: "#d4f5d4",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   cartText: { fontSize: 16, fontWeight: "600", color: "#222" },
//   cartView: { fontSize: 16, fontWeight: "700", color: "#000" },
// });



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import db from "../database/dbs";

const imageMap = {
  Westway: require("../assets/Westway.png"),
  Fortune: require("../assets/Fortune.png"),
  Seafood: require("../assets/Seafood.png"),
  food1: require("../assets/food1.jpg"),
  food2: require("../assets/food2.jpg"),
  food3: require("../assets/food3.jpg"),
  BlackNodles: require("../assets/BlackNodles.png"),
  Starfish: require("../assets/Starfish.png"),
  Moonland: require("../assets/Moonland.png"),
};

const editIcon = require("../assets/edit.png");
const deleteIcon = require("../assets/delete.png");

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Best Seller");
  const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

  // ✅ Corrected DB schema: use image_key column
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER,
            name TEXT,
            price REAL,
            image_key TEXT
        );`
      );
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

  // Reload when screen focused
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [restaurant.id])
  );

  const loadData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM menu_items WHERE restaurant_id=?",
        [restaurant.id],
        (_t, res) => {
          const arr = [];
          for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
          setMenuItems(arr);
        }
      );
      tx.executeSql("SELECT * FROM cart", [], (_t, resCart) => {
        const arr = [];
        for (let i = 0; i < resCart.rows.length; i++) arr.push(resCart.rows.item(i));
        setCart(arr);
      });
    });
  };

  const resolveImageForRow = (row) => {
    const path = (row?.image_key || "").trim();   // ✅ use image_key
    if (!path) return imageMap.food1;
    if (/^(https?:|file:|content:|data:)/i.test(path)) return { uri: path };
    const key = path.replace(/\.(png|jpe?g|webp)$/i, "");
    return imageMap[key] || imageMap.food1;
  };

  const toggleCart = (id, name, price = 0, image_key = null) => {
    const inCart = cart.find((c) => c.menu_item_id === id);
    db.transaction((tx) => {
      if (inCart) {
        tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () =>
          setCart((prev) => prev.filter((c) => c.menu_item_id !== id))
        );
      } else {
        tx.executeSql(
          `INSERT OR REPLACE INTO cart
           (menu_item_id,name,price,image_key,quantity)
           VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
          [id, name, price, image_key, id],
          () =>
            setCart((prev) => [
              ...prev,
              { menu_item_id: id, name, price, image_key, quantity: 1 },
            ])
        );
      }
    });
  };

  const editItem = (item) => {
    navigation.navigate("ManageMenuItem", {
      restaurantId: restaurant.id,
      menuItem: item,
    });
  };

  const deleteItem = (id) => {
    Alert.alert("Delete Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          db.transaction((tx) => {
            tx.executeSql("DELETE FROM menu_items WHERE id=?", [id], () => {
              setMenuItems((prev) => prev.filter((m) => m.id !== id));
            });
          });
        },
      },
    ]);
  };

  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalPrice = cart.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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

          <TouchableOpacity
            style={styles.addItemBtn}
            onPress={() =>
              navigation.navigate("ManageMenuItem", { restaurantId: restaurant.id })
            }
          >
            <Text style={styles.addItemText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
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

        {/* Menu Items */}
        {menuItems.map((item) => {
          const img = resolveImageForRow(item);
          const inCart = cart.some((c) => c.menu_item_id === item.id);
          return (
            <View key={item.id} style={styles.itemCard}>
              <Image source={img} style={styles.itemImage} />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
              </View>

              <View style={styles.editDeleteRow}>
                <TouchableOpacity onPress={() => editItem(item)}>
                  <Image source={editIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Image source={deleteIcon} style={[styles.icon, { marginLeft: 8 }]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  toggleCart(item.id, item.name, item.price, item.image_key) // ✅ use image_key
                }
              >
                <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Cart bar */}
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
  addItemBtn: {
    backgroundColor: "#FF7000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addItemText: { color: "#fff", fontWeight: "700" },
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
  editDeleteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  icon: { width: 20, height: 20, tintColor: "#333" },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginLeft: 6,
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
