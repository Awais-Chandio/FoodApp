// import React, { useState, useEffect, useCallback } from "react";
// import Snackbar from "react-native-snackbar";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import { updateQuantity, removeFromCart, getCartItems } from "../../database/dbs";

// const imageMap = {
//   food1: require("../../assets/food1.jpg"),
//   food2: require("../../assets/food2.jpg"),
//   food3: require("../../assets/food3.jpg"),
//   Moonland: require("../../assets/Moonland.png"),
//   Starfish: require("../../assets/Starfish.png"),
//   BlackNodles: require("../../assets/BlackNodles.png"),
// };

// export default function AddToCartScreen() {
//   const navigation = useNavigation();
//   const [cartItems, setCartItems] = useState([]);

//   const refreshCart = async () => {
//     const items = await getCartItems();
//     setCartItems(items);
//   };

//   useEffect(() => {
//     refreshCart();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       refreshCart();
//     }, [])
//   );

//   const increaseQuantity = async (id) => {
//     await updateQuantity(id, 1);
//     await refreshCart();
//   };

//   const decreaseQuantity = async (id) => {
//     await updateQuantity(id, -1);
//     await refreshCart();
//   };

//   const deleteItem = async (id) => {
//     await removeFromCart(id);
//     await refreshCart();
//   };

//   const itemTotal = cartItems.reduce(
//     (sum, item) => sum + item.price * (item.quantity || 1),
//     0
//   );
//   const discount = 10;
//   const tax = 2;
//   const grandTotal = itemTotal - discount + tax;

//   const renderItem = ({ item }) => {
//     const imgSource =
//       imageMap[item.image_key] || require("../../assets/food1.jpg");

//     return (
//       <View style={styles.itemCard}>
//         <Image source={imgSource} style={styles.itemImage} />
//         <View style={styles.middleSection}>
//           <Text style={styles.itemName}>{item.name}</Text>
//           <View style={styles.quantityRow}>
//             <TouchableOpacity
//               onPress={() => decreaseQuantity(item.menu_item_id)}
//               style={styles.qtyButton}
//             >
//               <Text style={styles.qtyButtonText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.qtyText}>{item.quantity || 1}</Text>
//             <TouchableOpacity
//               onPress={() => increaseQuantity(item.menu_item_id)}
//               style={styles.qtyButton}
//             >
//               <Text style={styles.qtyButtonText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.rightSection}>
//           <TouchableOpacity onPress={() => deleteItem(item.menu_item_id)}>
//             <Text style={styles.deleteText}>×</Text>
//           </TouchableOpacity>
//           <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>

//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backArrow}>←</Text>
//       </TouchableOpacity>

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Cart</Text>
//       </View>

//       <View style={styles.deliveryHeader}>
//         <Text style={styles.deliveryLabel}>Deliver to</Text>
//         <Text style={styles.deliveryAddress}>
//           242 ST Marks Eve,{"\n"}Finland
//         </Text>
//       </View>

//       <FlatList
//         data={cartItems}
//         keyExtractor={(item) => String(item.menu_item_id)}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 180 }}
//       />


//       <Image
//         source={require("../../assets/BottamBar.png")}
//         style={styles.bottomBarImage}
//         resizeMode="stretch"
//       />


//       <View style={styles.bottomOverlay}>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Items Total</Text>
//           <Text style={styles.priceValue}>${itemTotal.toFixed(2)}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Discount</Text>
//           <Text style={styles.priceValue}>- $ {discount.toFixed(2)}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Tax</Text>
//           <Text style={styles.priceValue}>$ {tax.toFixed(2)}</Text>
//         </View>
//         <View style={[styles.priceRow, { marginTop: 6 }]}>
//           <Text style={[styles.priceLabel, { fontWeight: "bold" }]}>Total</Text>
//           <Text style={[styles.priceValue, { fontWeight: "bold" }]}>
//             ${grandTotal.toFixed(2)}
//           </Text>
//         </View>


//         <TouchableOpacity
//           style={styles.continueBtn}
//           onPress={() => {
//             Snackbar.show({
//               text:
//                 "Thanks for Buying Food with Us\nYour food will arrive in 3 mint",
//               duration: Snackbar.LENGTH_INDEFINITE,
//               numberOfLines: 3,
//               textColor: "white",
//               backgroundColor: "#333",
//               position: "center",
//               action: {
//                 text: "Track Your Order",
//                 textColor: "yellow",
//                 onPress: () => navigation.navigate("TrackOrder"),
//               },
//             });
//           }}
//         >
//           <Text style={styles.continueBtnText}>Continue</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   backBtn: {  width: 40,
//     height: 40,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//     marginTop:10,
//     marginLeft:10
//   },
//   backArrow: { fontSize: 22 },
//   header: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
//   headerTitle: { fontSize: 20, fontWeight: "bold" },
//   deliveryHeader: {
//     backgroundColor: "#FF7000",
//     marginHorizontal: 16,
//     marginBottom: 10,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   deliveryLabel: {
//     fontSize: 14,
//     color: "white",
//     marginBottom: 4,
//     fontWeight: "600",
//   },
//   deliveryAddress: {
//     fontSize: 16,
//     fontWeight: "bold",
//     lineHeight: 20,
//     color: "white",
//   },
//   itemCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     padding: 12,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   middleSection: { flex: 1, marginLeft: 12, justifyContent: "center" },
//   itemName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   quantityRow: { flexDirection: "row", alignItems: "center" },
//   qtyButton: {
//     paddingHorizontal: 10,
//     backgroundColor: "#ddd",
//     borderRadius: 4,
//   },
//   qtyButtonText: { fontSize: 18 },
//   qtyText: { marginHorizontal: 8, fontSize: 16 },
//   rightSection: { justifyContent: "space-between", alignItems: "flex-end" },
//   deleteText: { fontSize: 22, color: "red", marginBottom: 8 },
//   itemPrice: { fontSize: 16, fontWeight: "bold", color: "#333" },

//   /* --- Bottom Bar --- */
//   bottomBarImage: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     height: 250,
//   },
//   bottomOverlay: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     paddingHorizontal: 20,
//     paddingVertical: 4,
//   },
//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   priceLabel: { fontSize: 16, fontWeight: "700", color: "#181717ff" },
//   priceValue: { fontSize: 16, fontWeight: "700", color: "#201f1fff" },


//   continueBtn: {
//     backgroundColor: "#fff",
//     marginTop: 5,
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginBottom: 20
//   },
//   continueBtnText: {
//     color: "black",
//     fontWeight: "bold",
//     fontSize: 18,
//   },
// });



















// This code is working fine before the admin changes 
//  import React, { useState, useEffect, useCallback } from "react";
// import Snackbar from "react-native-snackbar";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import { updateQuantity, removeFromCart, getCartItems } from "../../database/dbs";

// const imageMap = {
//   food1: require("../../assets/food1.jpg"),
//   food2: require("../../assets/food2.jpg"),
//   food3: require("../../assets/food3.jpg"),
//   Moonland: require("../../assets/Moonland.png"),
//   Starfish: require("../../assets/Starfish.png"),
//   BlackNodles: require("../../assets/BlackNodles.png"),
// };

// export default function AddToCartScreen() {
//   const navigation = useNavigation();
//   const [cartItems, setCartItems] = useState([]);

//   const refreshCart = async () => {
//     const items = await getCartItems();
//     setCartItems(items);
//   };

//   useEffect(() => {
//     refreshCart();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       refreshCart();
//     }, [])
//   );

//   const increaseQuantity = async (id) => {
//     await updateQuantity(id, 1);
//     await refreshCart();
//   };

//   const decreaseQuantity = async (id) => {
//     await updateQuantity(id, -1);
//     await refreshCart();
//   };

//   const deleteItem = async (id) => {
//     await removeFromCart(id);
//     await refreshCart();
//   };

//   const itemTotal = cartItems.reduce(
//     (sum, item) => sum + item.price * (item.quantity || 1),
//     0
//   );
//   const discount = 10;
//   const tax = 2;
//   const grandTotal = itemTotal - discount + tax;

//   const renderItem = ({ item }) => {
//     const imgSource =
//       imageMap[item.image_key] || require("../../assets/food1.jpg");

//     return (
//       <View style={styles.itemCard}>
//         <Image source={imgSource} style={styles.itemImage} />
//         <View style={styles.middleSection}>
//           <Text style={styles.itemName}>{item.name}</Text>
//           <View style={styles.quantityRow}>
//             <TouchableOpacity
//               onPress={() => decreaseQuantity(item.menu_item_id)}
//               style={styles.qtyButton}
//             >
//               <Text style={styles.qtyButtonText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.qtyText}>{item.quantity || 1}</Text>
//             <TouchableOpacity
//               onPress={() => increaseQuantity(item.menu_item_id)}
//               style={styles.qtyButton}
//             >
//               <Text style={styles.qtyButtonText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.rightSection}>
//           <TouchableOpacity onPress={() => deleteItem(item.menu_item_id)}>
//             <Text style={styles.deleteText}>×</Text>
//           </TouchableOpacity>
//           <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>

//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backArrow}>←</Text>
//       </TouchableOpacity>

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Cart</Text>
//       </View>

//       <View style={styles.deliveryHeader}>
//         <Text style={styles.deliveryLabel}>Deliver to</Text>
//         <Text style={styles.deliveryAddress}>
//           242 ST Marks Eve,{"\n"}Finland
//         </Text>
//       </View>

//       <FlatList
//         data={cartItems}
//         keyExtractor={(item) => String(item.menu_item_id)}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 180 }}
//       />


//       <Image
//         source={require("../../assets/BottamBar.png")}
//         style={styles.bottomBarImage}
//         resizeMode="stretch"
//       />


//       <View style={styles.bottomOverlay}>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Items Total</Text>
//           <Text style={styles.priceValue}>${itemTotal.toFixed(2)}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Discount</Text>
//           <Text style={styles.priceValue}>- $ {discount.toFixed(2)}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Tax</Text>
//           <Text style={styles.priceValue}>$ {tax.toFixed(2)}</Text>
//         </View>
//         <View style={[styles.priceRow, { marginTop: 6 }]}>
//           <Text style={[styles.priceLabel, { fontWeight: "bold" }]}>Total</Text>
//           <Text style={[styles.priceValue, { fontWeight: "bold" }]}>
//             ${grandTotal.toFixed(2)}
//           </Text>
//         </View>


//         <TouchableOpacity
//           style={styles.continueBtn}
//           onPress={() => {
//             Snackbar.show({
//               text:
//                 "Thanks for Buying Food with Us\nYour food will arrive in 3 mint",
//               duration: Snackbar.LENGTH_INDEFINITE,
//               numberOfLines: 3,
//               textColor: "white",
//               backgroundColor: "#333",
//               position: "center",
//               action: {
//                 text: "Track Your Order",
//                 textColor: "yellow",
//                 onPress: () => navigation.navigate("TrackOrder"),
//               },
//             });
//           }}
//         >
//           <Text style={styles.continueBtnText}>Continue</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   backBtn: {  width: 40,
//     height: 40,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//     marginTop:10,
//     marginLeft:10
//   },
//   backArrow: { fontSize: 22 },
//   header: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
//   headerTitle: { fontSize: 20, fontWeight: "bold" },
//   deliveryHeader: {
//     backgroundColor: "#FF7000",
//     marginHorizontal: 16,
//     marginBottom: 10,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   deliveryLabel: {
//     fontSize: 14,
//     color: "white",
//     marginBottom: 4,
//     fontWeight: "600",
//   },
//   deliveryAddress: {
//     fontSize: 16,
//     fontWeight: "bold",
//     lineHeight: 20,
//     color: "white",
//   },
//   itemCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     padding: 12,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   middleSection: { flex: 1, marginLeft: 12, justifyContent: "center" },
//   itemName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   quantityRow: { flexDirection: "row", alignItems: "center" },
//   qtyButton: {
//     paddingHorizontal: 10,
//     backgroundColor: "#ddd",
//     borderRadius: 4,
//   },
//   qtyButtonText: { fontSize: 18 },
//   qtyText: { marginHorizontal: 8, fontSize: 16 },
//   rightSection: { justifyContent: "space-between", alignItems: "flex-end" },
//   deleteText: { fontSize: 22, color: "red", marginBottom: 8 },
//   itemPrice: { fontSize: 16, fontWeight: "bold", color: "#333" },

//   /* --- Bottom Bar --- */
//   bottomBarImage: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     height: 250,
//   },
//   bottomOverlay: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     paddingHorizontal: 20,
//     paddingVertical: 4,
//   },
//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   priceLabel: { fontSize: 16, fontWeight: "700", color: "#181717ff" },
//   priceValue: { fontSize: 16, fontWeight: "700", color: "#201f1fff" },


//   continueBtn: {
//     backgroundColor: "#fff",
//     marginTop: 5,
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginBottom: 20
//   },
//   continueBtnText: {
//     color: "black",
//     fontWeight: "bold",
//     fontSize: 18,
//   },
// });




















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import db from "../../database/dbs";

// // Same imageMap as MenuScreen
// const imageMap = {
//   Westway: require("../../assets/Westway.png"),
//   Fortune: require("../../assets/Fortune.png"),
//   Seafood: require("../../assets/Seafood.png"),
//   food1: require("../../assets/food1.jpg"),
//   food2: require("../../assets/food2.jpg"),
//   food3: require("../../assets/food3.jpg"),
//   BlackNoodles: require("../../assets/BlackNodles.png"),
//   Starfish: require("../../assets/Starfish.png"),
//   Moonland: require("../../assets/Moonland.png"),
// };

// export default function AddToCartScreen() {
//   const [cartItems, setCartItems] = useState([]);

//   const fetchCart = () => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM cart",
//         [],
//         (_t, res) => {
//           const arr = [];
//           for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
//           setCartItems(arr);
//         },
//         (_t, err) => console.log("Cart fetch error", err)
//       );
//     });
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const removeItem = (menu_item_id) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql("DELETE FROM cart WHERE menu_item_id=?", [menu_item_id]);
//       },
//       (err) => console.log(err),
//       () => fetchCart()
//     );
//   };

//   const increaseQty = (menu_item_id) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           "UPDATE cart SET quantity = quantity + 1 WHERE menu_item_id=?",
//           [menu_item_id]
//         );
//       },
//       (err) => console.log(err),
//       () => fetchCart()
//     );
//   };

//   const decreaseQty = (menu_item_id) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(
//           "UPDATE cart SET quantity = quantity - 1 WHERE menu_item_id=? AND quantity > 1",
//           [menu_item_id]
//         );
//         tx.executeSql("DELETE FROM cart WHERE quantity <= 0 AND menu_item_id=?", [
//           menu_item_id,
//         ]);
//       },
//       (err) => console.log(err),
//       () => fetchCart()
//     );
//   };

//   // Use same image resolution logic as MenuScreen
//   const resolveImageForRow = (item) => {
//     if (!item) return imageMap.food1;
//     const dbPath = (item.image_path || item.image_key || "").trim();
//     if (dbPath) {
//       if (/^(https?:|file:|data:)/i.test(dbPath)) return { uri: dbPath };
//       if (imageMap[dbPath]) return imageMap[dbPath];
//       const key = dbPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
//       if (imageMap[key]) return imageMap[key];
//     }
//     if (item.name && imageMap[item.name]) return imageMap[item.name];
//     return imageMap.food1;
//   };

//   const totalPrice = cartItems.reduce(
//     (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
//     0
//   );

//   return (
//     <View style={styles.container}>
//       {cartItems.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>Your cart is empty</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={cartItems}
//           keyExtractor={(item) => item.menu_item_id.toString()}
//           contentContainerStyle={{ paddingBottom: 120 }}
//           renderItem={({ item }) => (
//             <View style={styles.itemRow}>
//               <Image source={resolveImageForRow(item)} style={styles.itemImage} />
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 <Text style={styles.itemPrice}>Rs. {item.price}</Text>
//                 <View style={styles.qtyRow}>
//                   <TouchableOpacity
//                     style={styles.qtyBtn}
//                     onPress={() => decreaseQty(item.menu_item_id)}
//                   >
//                     <Text style={styles.qtyText}>−</Text>
//                   </TouchableOpacity>
//                   <Text style={styles.qtyValue}>{item.quantity || 1}</Text>
//                   <TouchableOpacity
//                     style={styles.qtyBtn}
//                     onPress={() => increaseQty(item.menu_item_id)}
//                   >
//                     <Text style={styles.qtyText}>+</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => removeItem(item.menu_item_id)}>
//                 <Text style={styles.removeBtn}>Remove</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       )}

//       {cartItems.length > 0 && (
//         <View style={styles.checkoutCard}>
//           <Text style={styles.totalText}>Total: Rs. {totalPrice}</Text>
//           <TouchableOpacity
//             style={styles.checkoutBtn}
//             onPress={() => alert("Checkout clicked")}
//           >
//             <Text style={styles.checkoutText}>Checkout</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
//   emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   emptyText: { fontSize: 18, color: "#555" },
//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 20,
//     marginVertical: 8,
//     padding: 12,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//   },
//   itemImage: { width: 70, height: 70, borderRadius: 8 },
//   itemName: { fontSize: 16, fontWeight: "600", color: "#222" },
//   itemPrice: { fontSize: 14, color: "#666", marginTop: 4 },
//   qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
//   qtyBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   qtyText: { fontSize: 18, fontWeight: "600", color: "#000" },
//   qtyValue: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
//   removeBtn: { color: "#FF3B30", fontWeight: "600" },
//   checkoutCard: {
//     position: "absolute",
//     bottom: 10,
//     left: 20,
//     right: 20,
//     backgroundColor: "#d4f5d4",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   totalText: { fontSize: 16, fontWeight: "600", color: "#222" },
//   checkoutBtn: {
//     backgroundColor: "#FF7F32",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   checkoutText: { color: "#fff", fontWeight: "700" },
// });




















import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import db from "../../database/dbs";

// Image map same as MenuScreen
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
  const [cartItems, setCartItems] = useState([]);

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

  // Total price calculated dynamically from cartItems
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <View style={styles.container}>
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
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => alert("Checkout clicked")}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
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

