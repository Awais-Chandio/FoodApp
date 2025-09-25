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
// import db, { useMenuItems } from "../database/dbs";


// const imageMap = {
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

  
//   const menuItems = useMenuItems(restaurant.id);

 
//   const [cart, setCart] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Best Seller");

//   const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

  
//   useEffect(() => {
//     db.transaction(tx => {
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
//       db.transaction(tx => {
//         tx.executeSql("SELECT * FROM cart", [], (_t, res) => {
//           const arr = [];
//           for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//           setCart(arr);
//         });
//       });
//     }, [])
//   );

 
//   const toggleCart = (id) => {
//     const item = menuItems.find((m) => m.id === id);
//     if (!item) return;

//     const inCart = cart.find((c) => c.menu_item_id === id);
//     db.transaction(tx => {
//       if (inCart) {
       
//         tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () => {
//           setCart(prev => prev.filter(c => c.menu_item_id !== id));
//         });
//       } else {
      
//         tx.executeSql(
//           `INSERT OR REPLACE INTO cart (menu_item_id,name,price,image_key,quantity)
//            VALUES (?,?,?,?,COALESCE((SELECT quantity FROM cart WHERE menu_item_id=?),0)+1)`,
//           [item.id, item.name, item.price, item.image_key, item.id],
//           () => setCart(prev => [...prev, { ...item, menu_item_id: id, quantity: 1 }])
//         );
//       }
//     });
//   };

//   const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
//   const totalPrice = cart.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

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
//               style={[
//                 styles.filterBtn,
//                 activeFilter === f && styles.activeFilter,
//               ]}
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

       
//         {menuItems
//           .filter(
//             (m) => activeFilter === "Best Seller" || m.type === activeFilter
//           )
//           .map((item) => {
//             const img =
//               imageMap[item.image_key] || require("../assets/food1.jpg");
//             const inCart = cart.some((c) => c.menu_item_id === item.id);
//             return (
//               <View key={item.id} style={styles.itemCard}>
//                 <Image source={img} style={styles.itemImage} />
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={styles.itemName}>{item.name}</Text>
//                   <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//                 </View>
//                 <TouchableOpacity
//                   style={styles.addBtn}
//                   onPress={() => toggleCart(item.id)}
//                 >
//                   <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           })}
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


//before 25/09/2025


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
//   // header shows selected restaurant if passed, otherwise default
//   const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

//   // **IMPORTANT**: menuItems now come only from the restaurants table (Home)
//   const [menuItems, setMenuItems] = useState([]); // rows from restaurants
//   const [cart, setCart] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Best Seller");
//   const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

//   // Ensure cart table exists (unchanged)
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

//   // When screen focuses, read restaurants (Home items) and cart
//   useFocusEffect(
//     React.useCallback(() => {
//       db.transaction((tx) => {
//         // get all restaurants (these are the items shown on Home)
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

//         // get cart
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

//   // Resolve image for a restaurant row:
//   // - if image_path is a URL -> { uri }
//   // - if image_path is an asset key -> imageMap[key]
//   // - if name matches an asset key -> imageMap[name] (seeded behavior)
//   // - fallback to food1
//   const resolveImageForRow = (r) => {
//     if (!r) return imageMap.food1;
//     const p = r.image_path || r.image_key || "";
//     if (typeof p === "string" && p.trim()) {
//       const s = p.trim();
//       if (/^https?:\/\//i.test(s) || /^file:\/\//i.test(s) || /^data:/i.test(s)) {
//         return { uri: s };
//       }
//       const key = s.replace(/\.(png|jpg|jpeg)$/i, "");
//       if (imageMap[key]) return imageMap[key];
//     }
//     // try by name
//     if (r.name) {
//       if (imageMap[r.name]) return imageMap[r.name];
//       const compact = String(r.name).replace(/\s+/g, "");
//       if (imageMap[compact]) return imageMap[compact];
//     }
//     return imageMap.food1;
//   };

//   // Toggle cart: use restaurant.id as menu_item_id so newly added Home items map cleanly
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

//         {/* Show only restaurants (items from Home). Each row has a +/− button and image. */}
//         {menuItems
//           .filter((r) => {
//             // user asked: show only Home items. If you still want to filter by 'type' or category,
//             // you can adapt this. For now we show every restaurant (you said "only show all the items that home have").
//             return true;
//           })
//           .map((item) => {
//             const img = resolveImageForRow(item);
//             const inCart = cart.some((c) => c.menu_item_id === item.id);
//             // display rating/time instead of price (restaurants don't have price column)
//             const subtitle = `${item.rating ? `⭐ ${item.rating}` : ""} ${item.time ? `• ${item.time}` : ""}`;
//             return (
//               <View key={item.id} style={styles.itemCard}>
//                 <Image source={img} style={styles.itemImage} />
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={styles.itemName}>{item.name}</Text>
//                   <Text style={styles.itemPrice}>{subtitle}</Text>
//                 </View>
//                 <TouchableOpacity
//                   style={styles.addBtn}
//                   onPress={() => toggleCart(item.id, item.name, item.price || 0, item.image_path || item.image_key)}
//                 >
//                   <Text style={styles.addBtnText}>{inCart ? "−" : "+"}</Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           })}
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
//                 <Text style={styles.itemPrice}>{subtitle}</Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.addBtn}
//                 onPress={() => toggleCart(item.id, item.name, item.price || 0, item.image_path || item.image_key)}
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


// //above code is working but doesnot showing the prices of the items























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
import db from "../database/dbs";

// ✅ Add explicit mappings for first 3 restaurants
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

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = route?.params?.restaurant || { id: 1, name: "Westway" };

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Best Seller");
  const filters = ["Best Seller", "Veg", "Non-Veg", "Beverages"];

  useEffect(() => {
    db.transaction((tx) => {
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
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM restaurants",
          [],
          (_t, res) => {
            const arr = [];
            for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
            setMenuItems(arr);
          },
          (_t, err) => {
            console.log("restaurants fetch error", err);
            return false;
          }
        );

        tx.executeSql(
          "SELECT * FROM cart",
          [],
          (_t, resCart) => {
            const arr = [];
            for (let i = 0; i < resCart.rows.length; i++) arr.push(resCart.rows.item(i));
            setCart(arr);
          },
          (_t, err) => {
            console.log("cart fetch error", err);
            return false;
          }
        );
      });
    }, [])
  );

  // ✅ Updated resolveImageForRow
  const resolveImageForRow = (r) => {
    if (!r) return imageMap.food1;

    const dbPath = (r.image_path || r.image_key || "").trim();
    if (dbPath) {
      if (/^(https?:|file:|data:)/i.test(dbPath)) return { uri: dbPath };
      if (imageMap[dbPath]) return imageMap[dbPath];
      const key = dbPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      if (imageMap[key]) return imageMap[key];
    }

    // ✅ Explicit match by restaurant name for first 3
    if (r.name && imageMap[r.name]) return imageMap[r.name];

    return imageMap.food1;
  };

  const toggleCart = (id, name, price = 0, image_key = null) => {
    const inCart = cart.find((c) => c.menu_item_id === id);
    db.transaction((tx) => {
      if (inCart) {
        tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [id], () => {
          setCart((prev) => prev.filter((c) => c.menu_item_id !== id));
        });
      } else {
        tx.executeSql(
          `INSERT OR REPLACE INTO cart (menu_item_id,name,price,image_key,quantity)
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

  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

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
              style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{activeFilter}</Text>

        {menuItems.map((item) => {
          const img = resolveImageForRow(item);
          const inCart = cart.some((c) => c.menu_item_id === item.id);
          const subtitle = `${item.rating ? `⭐ ${item.rating}` : ""} ${item.time ? `• ${item.time}` : ""}`;
          return (
            <View key={item.id} style={styles.itemCard}>
              <Image source={img} style={styles.itemImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {/* Rating & time */}
                <Text style={styles.itemSubtitle}>{subtitle}</Text>
                {/* Price below rating/time */}
                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  toggleCart(item.id, item.name, item.price, item.image_path || item.image_key)
                }
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
  itemSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  itemPrice: { fontSize: 14, color: "#888", marginTop: 2 },
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
