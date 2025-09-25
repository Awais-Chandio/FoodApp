// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import HomeHeader from "../../components/HomeHeader";


// import { useCreateTables, useRestaurants } from "../../database/dbs";

// const restaurantImages = {
//   "1": require("../../assets/Westway.png"),
//   "2": require("../../assets/Fortune.png"),
//   "3": require("../../assets/Seafood.png"),
//   "4": require("../../assets/food1.jpg"),
//   "5": require("../../assets/food2.jpg"),
//   "6": require("../../assets/food3.jpg"),
//   "7": require("../../assets/Moonland.png"),
//   "8": require("../../assets/Starfish.png"),
//   "9": require("../../assets/BlackNodles.png"),
// };


// const Icons = {
//   mapMarker: require("../../assets/location.png"),
//   home: require("../../assets/home.png"),
//   all: require("../../assets/all.png"),
//   pizza: require("../../assets/pizza.png"),
//   beverages: require("../../assets/beverages.png"),
//   asian: require("../../assets/asian.png"),
// };


// const categories = [
//   { id: "all", name: "All", icon: Icons.all },
//   { id: "pizza", name: "Pizza", icon: Icons.pizza },
//   { id: "beverages", name: "Beverages", icon: Icons.beverages },
//   { id: "asian", name: "Asian", icon: Icons.asian },
// ];

// const HomeScreen = () => {
//   const navigation = useNavigation();


//  useCreateTables();         
//   const { nearest, popular } = useRestaurants();

//   const renderRestaurant = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate("Details", { restaurant: item })}
//     >
//       <Image source={restaurantImages[item.id]} style={styles.image} />
//       {item.offer && (
//         <View style={styles.offerTag}>
//           <Text style={styles.offerText}>{item.offer}</Text>
//         </View>
//       )}
//       <Text style={styles.name}>{item.name}</Text>
//       <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
//     </TouchableOpacity>
//   );

//   const renderCategory = ({ item }) => (
//     <TouchableOpacity style={styles.categoryBtn}>
//       <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
//       <Text style={styles.categoryText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <HomeHeader />

//       <View style={styles.topSection}>
//         <View style={styles.locationRow}>
//           <Image source={Icons.mapMarker} style={styles.locationIcon} />
//           <Text style={styles.locationText}>242 ST Marks Eve, Finland</Text>
//           <Image source={Icons.home} style={styles.locationIcon} />
//         </View>

//         <FlatList
//           data={categories}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCategory}
//           contentContainerStyle={styles.categoriesList}
//         />
//       </View>

//       <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
//       <FlatList
//         data={nearest}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//       />

//       <Text style={styles.sectionTitle}>Popular Restaurants</Text>
//       <FlatList
//         data={popular}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 5 },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-evenly",
//     marginBottom: 16,
//   },
//   locationIcon: { width: 22, height: 22, resizeMode: "contain" },
//   locationText: { marginLeft: 6, fontSize: 16 },
//   categoriesList: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     width: "100%",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   categoryBtn: { alignItems: "center", marginHorizontal: 8 },
//   categoryIcon: { width: 28, height: 28 },
//   categoryText: { marginTop: 4, fontSize: 12 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
//   card: { marginRight: 16, width: 150 },
//   image: { width: 150, height: 100, borderRadius: 10 },
//   offerTag: {
//     position: "absolute",
//     top: 6,
//     left: 6,
//     backgroundColor: "#ff6347",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   offerText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
//   name: { fontWeight: "bold", marginTop: 6, fontSize: 15 },
//   subText: { color: "#555", fontSize: 13 },
// });

// export default HomeScreen;

//  HomeScreen.js before before admin changes 










// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import HomeHeader from "../../components/HomeHeader";
// import {
//   useCreateTables,
//   fetchRestaurants,
//   deleteRestaurant,
// } from "../../database/dbs";

// // fallback images
// const restaurantImages = {
//   "1": require("../../assets/Westway.png"),
//   "2": require("../../assets/Fortune.png"),
//   "3": require("../../assets/Seafood.png"),
//   "4": require("../../assets/food1.jpg"),
//   "5": require("../../assets/food2.jpg"),
//   "6": require("../../assets/food3.jpg"),
//   "7": require("../../assets/Moonland.png"),
//   "8": require("../../assets/Starfish.png"),
//   "9": require("../../assets/BlackNodles.png"),
// };

// const Icons = {
//   mapMarker: require("../../assets/location.png"),
//   home: require("../../assets/home.png"),
//   all: require("../../assets/all.png"),
//   pizza: require("../../assets/pizza.png"),
//   beverages: require("../../assets/beverages.png"),
//   asian: require("../../assets/asian.png"),
// };

// const categories = [
//   { id: "all", name: "All", icon: Icons.all },
//   { id: "pizza", name: "Pizza", icon: Icons.pizza },
//   { id: "beverages", name: "Beverages", icon: Icons.beverages },
//   { id: "asian", name: "Asian", icon: Icons.asian },
// ];

// export default function HomeScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();

//   useCreateTables();

//   const [role, setRole] = useState(route.params?.role || "user");
//   const [nearest, setNearest] = useState([]);
//   const [popular, setPopular] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Load role from AsyncStorage so admin sees icons
//   useEffect(() => {
//     AsyncStorage.getItem("role").then((stored) => {
//       if (stored) setRole(stored);
//     });
//   }, []);

//   const loadRestaurants = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { nearest: n, popular: p } = await fetchRestaurants();
//       setNearest(n);
//       setPopular(p);
//     } catch (err) {
//       console.log("fetchRestaurants error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadRestaurants();
//   }, [loadRestaurants]);

//   useFocusEffect(
//     useCallback(() => {
//       loadRestaurants();
//     }, [loadRestaurants])
//   );

//   const confirmDelete = (item) => {
//     Alert.alert(
//       "Delete Restaurant",
//       `Are you sure you want to delete "${item.name}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () =>
//             deleteRestaurant(
//               item.id,
//               () => loadRestaurants(),
//               (err) => Alert.alert("Error", err?.message || "Could not delete")
//             ),
//         },
//       ]
//     );
//   };

//   const renderRestaurant = ({ item }) => (
//     <View style={styles.card}>
//       {/* --- Image & tap to open details --- */}
//       <TouchableOpacity
//         onPress={() => navigation.navigate("Details", { restaurant: item })}
//         activeOpacity={0.8}
//       >
//         <Image
//           source={restaurantImages[item.id] || restaurantImages["1"]}
//           style={styles.image}
//         />
//         {item.offer && (
//           <View style={styles.offerTag}>
//             <Text style={styles.offerText}>{item.offer}</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* === ADMIN ONLY ACTIONS BELOW IMAGE === */}
//       {role === "admin" && (
//         <View style={styles.adminActions}>
//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() =>
//               navigation.navigate("EditRestaurant", { restaurant: item })
//             }
//           >
//             <AntDesign name="edit" size={22} color="#fff" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => confirmDelete(item)}
//           >
//             <AntDesign name="delete" size={22} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Restaurant Info */}
//       <Text style={styles.name}>{item.name}</Text>
//       <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
//     </View>
//   );

//   const renderCategory = ({ item }) => (
//     <TouchableOpacity style={styles.categoryBtn}>
//       <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
//       <Text style={styles.categoryText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <HomeHeader />

//       {role === "admin" && (
//         <View style={styles.adminBanner}>
//           <Text style={styles.adminText}>Admin Controls</Text>
//           <TouchableOpacity
//             style={styles.adminBtn}
//             onPress={() => navigation.navigate("AddRestaurant")}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>Add / Manage</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.topSection}>
//         <View style={styles.locationRow}>
//           <Image source={Icons.mapMarker} style={styles.locationIcon} />
//           <Text style={styles.locationText}>242 ST Marks Eve, Finland</Text>
//           <Image source={Icons.home} style={styles.locationIcon} />
//         </View>

//         <FlatList
//           data={categories}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCategory}
//           contentContainerStyle={styles.categoriesList}
//         />
//       </View>

//       <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
//       <FlatList
//         data={nearest}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />

//       <Text style={styles.sectionTitle}>Popular Restaurants</Text>
//       <FlatList
//         data={popular}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 5 },

//   adminBanner: {
//     backgroundColor: "#ffcc00",
//     padding: 10,
//     borderRadius: 8,
//     margin: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   adminText: { fontSize: 16, fontWeight: "bold", color: "#000" },
//   adminBtn: {
//     backgroundColor: "#000",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },

//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-evenly",
//     marginBottom: 16,
//   },
//   locationIcon: { width: 22, height: 22, resizeMode: "contain" },
//   locationText: { marginLeft: 6, fontSize: 16 },

//   categoriesList: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 16 },
//   categoryBtn: { alignItems: "center", marginHorizontal: 8 },
//   categoryIcon: { width: 28, height: 28 },
//   categoryText: { marginTop: 4, fontSize: 12 },

//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },

//   card: {
//     width: 180,
//     marginRight: 16,
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 8,
//     paddingBottom: 14,
//     minHeight: 250, // extra room for admin icons
//   },
//   image: { width: "100%", height: 100, borderRadius: 10 },

//   adminActions: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 8,
//     marginBottom: 6,
//   },
//   iconBtn: {
//     backgroundColor: "#333",
//     borderRadius: 6,
//     padding: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   name: { fontWeight: "bold", marginTop: 6, fontSize: 15 },
//   subText: { color: "#555", fontSize: 13, marginBottom: 6 },

//   offerTag: {
//     position: "absolute",
//     top: 6,
//     left: 6,
//     backgroundColor: "#ff6347",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   offerText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
// });

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

// import HomeHeader from "../../components/HomeHeader";
// import {
//   useCreateTables,
//   fetchRestaurants,
//   deleteRestaurant,
// } from "../../database/dbs";

// // fallback images for demo
// const restaurantImages = {
//   "1": require("../../assets/Westway.png"),
//   "2": require("../../assets/Fortune.png"),
//   "3": require("../../assets/Seafood.png"),
//   "4": require("../../assets/food1.jpg"),
//   "5": require("../../assets/food2.jpg"),
//   "6": require("../../assets/food3.jpg"),
//   "7": require("../../assets/Moonland.png"),
//   "8": require("../../assets/Starfish.png"),
//   "9": require("../../assets/BlackNodles.png"),
// };

// // ✅ use only your asset icons
// const Icons = {
//   mapMarker: require("../../assets/location.png"),
//   home: require("../../assets/home.png"),
//   all: require("../../assets/all.png"),
//   pizza: require("../../assets/pizza.png"),
//   beverages: require("../../assets/beverages.png"),
//   asian: require("../../assets/asian.png"),
//   add: require("../../assets/add.png"),
//   edit: require("../../assets/edit.png"),
//   delete: require("../../assets/delete.png"),
// };

// const categories = [
//   { id: "all", name: "All", icon: Icons.all },
//   { id: "pizza", name: "Pizza", icon: Icons.pizza },
//   { id: "beverages", name: "Beverages", icon: Icons.beverages },
//   { id: "asian", name: "Asian", icon: Icons.asian },
// ];

// export default function HomeScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();

//   useCreateTables();

//   const [nearest, setNearest] = useState([]);
//   const [popular, setPopular] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const loadRestaurants = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { nearest: n, popular: p } = await fetchRestaurants();
//       setNearest(n);
//       setPopular(p);
//     } catch (err) {
//       console.log("fetchRestaurants error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadRestaurants();
//   }, [loadRestaurants]);

//   useFocusEffect(
//     useCallback(() => {
//       loadRestaurants();
//     }, [loadRestaurants])
//   );

//   const confirmDelete = (item) => {
//     Alert.alert(
//       "Delete Restaurant",
//       `Are you sure you want to delete "${item.name}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () =>
//             deleteRestaurant(
//               item.id,
//               () => loadRestaurants(),
//               (err) => Alert.alert("Error", err?.message || "Could not delete")
//             ),
//         },
//       ]
//     );
//   };

//   const renderRestaurant = ({ item }) => (
//     <View style={styles.card}>
//       <TouchableOpacity
//         onPress={() => navigation.navigate("Details", { restaurant: item })}
//         activeOpacity={0.8}
//       >
//         <Image
//           source={restaurantImages[item.id] || restaurantImages["1"]}
//           style={styles.image}
//         />
//         {item.offer && (
//           <View style={styles.offerTag}>
//             <Text style={styles.offerText}>{item.offer}</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* === Edit/Delete buttons inside card === */}
//       <View style={styles.adminActions}>
//         <TouchableOpacity
//           style={styles.iconBtn}
//           // ✅ navigate to ManageItems for editing
//           onPress={() => navigation.navigate("ManageItems", { restaurant: item })}
//         >
//           <Image source={Icons.edit} style={styles.assetIcon} />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.iconBtn}
//           onPress={() => confirmDelete(item)}
//         >
//           <Image source={Icons.delete} style={styles.assetIcon} />
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.name}>{item.name}</Text>
//       <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
//     </View>
//   );

//   const renderCategory = ({ item }) => (
//     <TouchableOpacity style={styles.categoryBtn}>
//       <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
//       <Text style={styles.categoryText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <HomeHeader />

//       {/* ✅ TOP Add Button -> ManageItems screen */}
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => navigation.navigate("ManageItems")}
//         activeOpacity={0.7}
//       >
//         <Image source={Icons.add} style={styles.addIcon} />
//         <Text style={styles.addText}>Add</Text>
//       </TouchableOpacity>

//       <View style={styles.topSection}>
//         <View style={styles.locationRow}>
//           <Image source={Icons.mapMarker} style={styles.locationIcon} />
//           <Text style={styles.locationText}>242 ST Marks Eve, Finland</Text>
//           <Image source={Icons.home} style={styles.locationIcon} />
//         </View>

//         <FlatList
//           data={categories}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCategory}
//           contentContainerStyle={styles.categoriesList}
//         />
//       </View>

//       <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
//       <FlatList
//         data={nearest}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />

//       <Text style={styles.sectionTitle}>Popular Restaurants</Text>
//       <FlatList
//         data={popular}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 5 },

//   /* === Add button at top === */
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     marginRight: 16,
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   addIcon: { width: 24, height: 24, marginRight: 6, resizeMode: "contain" },
//   addText: { fontSize: 16, fontWeight: "600", color: "#000" },

//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-evenly",
//     marginBottom: 16,
//   },
//   locationIcon: { width: 22, height: 22, resizeMode: "contain" },
//   locationText: { marginLeft: 6, fontSize: 16 },

//   categoriesList: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 16 },
//   categoryBtn: { alignItems: "center", marginHorizontal: 8 },
//   categoryIcon: { width: 28, height: 28 },
//   categoryText: { marginTop: 4, fontSize: 12 },

//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },

//   card: {
//     width: 180,
//     marginRight: 16,
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 8,
//     paddingBottom: 14,
//     minHeight: 250,
//   },
//   image: { width: "100%", height: 100, borderRadius: 10 },

//   adminActions: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 8,
//     marginBottom: 6,
//   },
//   iconBtn: {
//     backgroundColor: "#333",
//     borderRadius: 6,
//     padding: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   assetIcon: { width: 20, height: 20, tintColor: "#fff" },

//   name: { fontWeight: "bold", marginTop: 6, fontSize: 15 },
//   subText: { color: "#555", fontSize: 13, marginBottom: 6 },

//   offerTag: {
//     position: "absolute",
//     top: 6,
//     left: 6,
//     backgroundColor: "#ff6347",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   offerText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
// });

















// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";

// import HomeHeader from "../../components/HomeHeader";
// import {
//   useCreateTables,
//   fetchRestaurants,
//   deleteRestaurant,
// } from "../../database/dbs";

// // ---------- fallback bundled images ----------
// const restaurantImages = {
//   "1": require("../../assets/Westway.png"),
//   "2": require("../../assets/Fortune.png"),
//   "3": require("../../assets/Seafood.png"),
//   "4": require("../../assets/food1.jpg"),
//   "5": require("../../assets/food2.jpg"),
//   "6": require("../../assets/food3.jpg"),
//   "7": require("../../assets/Moonland.png"),
//   "8": require("../../assets/Starfish.png"),
//   "9": require("../../assets/BlackNodles.png"),
//   chicken: require("../../assets/chicken.jpg"),
// };

// // ---------- asset icons ----------
// const Icons = {
//   mapMarker: require("../../assets/location.png"),
//   home: require("../../assets/home.png"),
//   all: require("../../assets/all.png"),
//   pizza: require("../../assets/pizza.png"),
//   beverages: require("../../assets/beverages.png"),
//   asian: require("../../assets/asian.png"),
//   add: require("../../assets/add.png"),
//   edit: require("../../assets/edit.png"),
//   delete: require("../../assets/delete.png"),
// };

// const categories = [
//   { id: "all", name: "All", icon: Icons.all },
//   { id: "pizza", name: "Pizza", icon: Icons.pizza },
//   { id: "beverages", name: "Beverages", icon: Icons.beverages },
//   { id: "asian", name: "Asian", icon: Icons.asian },
// ];

// export default function HomeScreen() {
//   const navigation = useNavigation();

//   useCreateTables();

//   const [nearest, setNearest] = useState([]);
//   const [popular, setPopular] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const loadRestaurants = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { nearest: n, popular: p } = await fetchRestaurants();
//       setNearest(n);
//       setPopular(p);
//     } catch (err) {
//       console.log("fetchRestaurants error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadRestaurants();
//   }, [loadRestaurants]);

//   useFocusEffect(
//     useCallback(() => {
//       loadRestaurants();
//     }, [loadRestaurants])
//   );

//   const confirmDelete = (item) => {
//     Alert.alert(
//       "Delete Restaurant",
//       `Are you sure you want to delete "${item.name}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             deleteRestaurant(
//               item.id,
//               () => {
//                 Alert.alert("Deleted", `"${item.name}" has been deleted`);
//                 loadRestaurants();
//               },
//               (err) => Alert.alert("Error", err?.message || "Could not delete")
//             );
//           },
//         },
//       ]
//     );
//   };

//   /**
//    * Decide which image source to use:
//    * 1. If item.image_path is a full URL -> network image
//    * 2. If it matches a key in restaurantImages -> bundled asset
//    * 3. Otherwise fallback to id-based default
//    */
//   const getImageSource = (item) => {
//     if (item.image_path) {
//       // network URL?
//       if (item.image_path.startsWith("http://") || item.image_path.startsWith("https://")) {
//         return { uri: item.image_path };
//       }
//       // bundled asset key (e.g. "pizza.png" or just "pizza")
//       const key = item.image_path.replace(/\.(png|jpg|jpeg)$/i, "");
//       if (restaurantImages[key]) return restaurantImages[key];
//     }
//     // fallback to seeded images or default
//     return restaurantImages[item.id] || restaurantImages["1"];
//   };

//   const renderRestaurant = ({ item }) => (
//     <View style={styles.card}>
//       <TouchableOpacity
//         onPress={() => navigation.navigate("Details", { restaurant: item })}
//         activeOpacity={0.8}
//       >
//         <Image source={getImageSource(item)} style={styles.image} />
//         {item.offer && (
//           <View style={styles.offerTag}>
//             <Text style={styles.offerText}>{item.offer}</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       <View style={styles.textContainer}>
//         <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
//         <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
//       </View>

//       {/* bottom-right action icons */}
//       <View style={styles.bottomIcons}>
//         <TouchableOpacity
//           style={styles.iconBtn}
//           onPress={() => navigation.navigate("ManageItems", { restaurant: item })}
//         >
//           <Image source={Icons.edit} style={styles.assetIcon} />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.iconBtn, { marginLeft: 6 }]}
//           onPress={() => confirmDelete(item)}
//         >
//           <Image source={Icons.delete} style={styles.assetIcon} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderCategory = ({ item }) => (
//     <TouchableOpacity style={styles.categoryBtn}>
//       <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
//       <Text style={styles.categoryText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <HomeHeader />

//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => navigation.navigate("ManageItems")}
//         activeOpacity={0.7}
//       >
//         <Image source={Icons.add} style={styles.addIcon} />
//         <Text style={styles.addText}>Add</Text>
//       </TouchableOpacity>

//       <View style={styles.topSection}>
//         <View style={styles.locationRow}>
//           <Image source={Icons.mapMarker} style={styles.locationIcon} />
//           <Text style={styles.locationText}>242 ST Marks Eve, Finland</Text>
//           <Image source={Icons.home} style={styles.locationIcon} />
//         </View>

//         <FlatList
//           data={categories}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCategory}
//           contentContainerStyle={styles.categoriesList}
//         />
//       </View>

//       <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
//       <FlatList
//         data={nearest}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />

//       <Text style={styles.sectionTitle}>Popular Restaurants</Text>
//       <FlatList
//         data={popular}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderRestaurant}
//         ListEmptyComponent={
//           <Text style={{ margin: 10 }}>
//             {loading ? "Loading..." : "No restaurants"}
//           </Text>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 5 },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     marginRight: 16,
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   addIcon: { width: 24, height: 24, marginRight: 6, resizeMode: "contain" },
//   addText: { fontSize: 16, fontWeight: "600", color: "#000" },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-evenly",
//     marginBottom: 16,
//   },
//   locationIcon: { width: 22, height: 22, resizeMode: "contain" },
//   locationText: { marginLeft: 6, fontSize: 16 },
//   categoriesList: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 16 },
//   categoryBtn: { alignItems: "center", marginHorizontal: 8 },
//   categoryIcon: { width: 28, height: 28 },
//   categoryText: { marginTop: 4, fontSize: 12 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
//   card: {
//     width: 180,
//     marginRight: 16,
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 6,
//     flex: 1,
//     paddingBottom: 36,
//   },
//   image: { width: "100%", height: 90, borderRadius: 10 },
//   textContainer: { marginTop: 6 },
//   name: { fontWeight: "bold", fontSize: 14, flexWrap: "wrap" },
//   subText: { color: "#555", fontSize: 12, marginTop: 2, flexWrap: "wrap" },
//   offerTag: {
//     position: "absolute",
//     top: 6,
//     left: 6,
//     backgroundColor: "#ff6347",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   offerText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
//   bottomIcons: {
//     position: "absolute",
//     bottom: 6,
//     right: 6,
//     flexDirection: "row",
//   },
//   iconBtn: {
//     backgroundColor: "#333",
//     borderRadius: 6,
//     padding: 5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   assetIcon: { width: 18, height: 18, tintColor: "#fff" },
// });
















import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import HomeHeader from "../../components/HomeHeader";
import {
  useCreateTables,
  fetchRestaurants,
  deleteRestaurant,
} from "../../database/dbs";

// ---------- fallback bundled images ----------
const restaurantImages = {
  "1": require("../../assets/Westway.png"),
  "2": require("../../assets/Fortune.png"),
  "3": require("../../assets/Seafood.png"),
  "4": require("../../assets/food1.jpg"),
  "5": require("../../assets/food2.jpg"),
  "6": require("../../assets/food3.jpg"),
  "7": require("../../assets/Moonland.png"),
  "8": require("../../assets/Starfish.png"),
  "9": require("../../assets/BlackNodles.png"),
  chicken: require("../../assets/chicken.jpg"),
};

// ---------- asset icons ----------
const Icons = {
  mapMarker: require("../../assets/location.png"),
  home: require("../../assets/home.png"),
  all: require("../../assets/all.png"),
  pizza: require("../../assets/pizza.png"),
  beverages: require("../../assets/beverages.png"),
  asian: require("../../assets/asian.png"),
  add: require("../../assets/add.png"),
  edit: require("../../assets/edit.png"),
  delete: require("../../assets/delete.png"),
};

const categories = [
  { id: "all", name: "All", icon: Icons.all },
  { id: "pizza", name: "Pizza", icon: Icons.pizza },
  { id: "beverages", name: "Beverages", icon: Icons.beverages },
  { id: "asian", name: "Asian", icon: Icons.asian },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  useCreateTables();

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { nearest: n, popular: p } = await fetchRestaurants();
      setNearest(n);
      setPopular(p);
    } catch (err) {
      console.log("fetchRestaurants error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [loadRestaurants])
  );

  const confirmDelete = (item) => {
    Alert.alert(
      "Delete Restaurant",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRestaurant(
              item.id,
              () => {
                Alert.alert("Deleted", `"${item.name}" has been deleted`);
                loadRestaurants();
              },
              (err) => Alert.alert("Error", err?.message || "Could not delete")
            );
          },
        },
      ]
    );
  };

  const getImageSource = (item) => {
    if (item.image_path) {
      if (item.image_path.startsWith("http://") || item.image_path.startsWith("https://")) {
        return { uri: item.image_path };
      }
      const key = item.image_path.replace(/\.(png|jpg|jpeg)$/i, "");
      if (restaurantImages[key]) return restaurantImages[key];
    }
    return restaurantImages[item.id] || restaurantImages["1"];
  };

  const renderRestaurant = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Details", { restaurant: item })}
        activeOpacity={0.8}
      >
        <Image source={getImageSource(item)} style={styles.image} />
        {item.offer && (
          <View style={styles.offerTag}>
            <Text style={styles.offerText}>{item.offer}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
        {/* 🔥 Price display added */}
        <Text style={styles.priceText}>Rs. {item.price?.toFixed(2) || "0"}</Text>
      </View>

      <View style={styles.bottomIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("ManageItems", { restaurant: item })}
        >
          <Image source={Icons.edit} style={styles.assetIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { marginLeft: 6 }]}
          onPress={() => confirmDelete(item)}
        >
          <Image source={Icons.delete} style={styles.assetIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryBtn}>
      <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HomeHeader />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("ManageItems")}
        activeOpacity={0.7}
      >
        <Image source={Icons.add} style={styles.addIcon} />
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>

      <View style={styles.topSection}>
        <View style={styles.locationRow}>
          <Image source={Icons.mapMarker} style={styles.locationIcon} />
          <Text style={styles.locationText}>242 ST Marks Eve, Finland</Text>
          <Image source={Icons.home} style={styles.locationIcon} />
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
      <FlatList
        data={nearest}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRestaurant}
        ListEmptyComponent={
          <Text style={{ margin: 10 }}>
            {loading ? "Loading..." : "No restaurants"}
          </Text>
        }
      />

      <Text style={styles.sectionTitle}>Popular Restaurants</Text>
      <FlatList
        data={popular}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRestaurant}
        ListEmptyComponent={
          <Text style={{ margin: 10 }}>
            {loading ? "Loading..." : "No restaurants"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 5 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginRight: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  addIcon: { width: 24, height: 24, marginRight: 6, resizeMode: "contain" },
  addText: { fontSize: 16, fontWeight: "600", color: "#000" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  locationIcon: { width: 22, height: 22, resizeMode: "contain" },
  locationText: { marginLeft: 6, fontSize: 16 },
  categoriesList: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 16 },
  categoryBtn: { alignItems: "center", marginHorizontal: 8 },
  categoryIcon: { width: 28, height: 28 },
  categoryText: { marginTop: 4, fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  card: {
    width: 180,
    marginRight: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 6,
    flex: 1,
    paddingBottom: 36,
  },
  image: { width: "100%", height: 90, borderRadius: 10 },
  textContainer: { marginTop: 6 },
  name: { fontWeight: "bold", fontSize: 14, flexWrap: "wrap" },
  subText: { color: "#555", fontSize: 12, marginTop: 2, flexWrap: "wrap" },
  priceText: { fontSize: 13, fontWeight: "600", marginTop: 2, color: "#FF7000" }, // added
  offerTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#ff6347",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offerText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  bottomIcons: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
  },
  iconBtn: {
    backgroundColor: "#333",
    borderRadius: 6,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  assetIcon: { width: 18, height: 18, tintColor: "#fff" },
});

