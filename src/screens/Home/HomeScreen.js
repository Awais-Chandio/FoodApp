// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";   // ✅ add this
// import HomeHeader from "../../components/HomeHeader";

// // ✅ Local restaurant images
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

// // ✅ Icons
// const Icons = {
//   mapMarker: require("../../assets/location.png"),
//   home: require("../../assets/home.png"),
//   all: require("../../assets/all.png"),
//   pizza: require("../../assets/pizza.png"),
//   beverages: require("../../assets/beverages.png"),
//   asian: require("../../assets/asian.png"),
// };

// // ✅ Static data
// const nearestRestaurants = [
//   { id: "1", name: "Westway", rating: 4.6, time: "15 min", offer: "50% OFF" },
//   { id: "2", name: "Fortune", rating: 4.8, time: "25 min" },
//   { id: "3", name: "Seafood", rating: 4.6, time: "20 min" },
// ];
// const popularRestaurants = [
//   { id: "7", name: "Moonland", rating: 4.6, time: "15 min" },
//   { id: "8", name: "Starfish", rating: 4.8, time: "25 min", offer: "30% OFF" },
//   { id: "9", name: "Black Noodles", rating: 4.9, time: "20 min" },
// ];

// // ✅ Categories
// const categories = [
//   { id: "all", name: "All", icon: Icons.all },
//   { id: "pizza", name: "Pizza", icon: Icons.pizza },
//   { id: "beverages", name: "Beverages", icon: Icons.beverages },
//   { id: "asian", name: "Asian", icon: Icons.asian },
// ];

// const HomeScreen = () => {
//   const navigation = useNavigation();     // ✅ This is required
//   const [nearest] = useState(nearestRestaurants);
//   const [popular] = useState(popularRestaurants);

//   const renderRestaurant = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate("Details", { restaurant: item })
//       }
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
//         keyExtractor={(item) => item.id}
//         renderItem={renderRestaurant}
//       />

//       <Text style={styles.sectionTitle}>Popular Restaurants</Text>
//       <FlatList
//         data={popular}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         renderItem={renderRestaurant}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 16 },
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

// before database connectivity 
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeHeader from "../../components/HomeHeader";


import { useCreateTables, useRestaurants } from "../../database/dbs";

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
};


const Icons = {
  mapMarker: require("../../assets/location.png"),
  home: require("../../assets/home.png"),
  all: require("../../assets/all.png"),
  pizza: require("../../assets/pizza.png"),
  beverages: require("../../assets/beverages.png"),
  asian: require("../../assets/asian.png"),
};


const categories = [
  { id: "all", name: "All", icon: Icons.all },
  { id: "pizza", name: "Pizza", icon: Icons.pizza },
  { id: "beverages", name: "Beverages", icon: Icons.beverages },
  { id: "asian", name: "Asian", icon: Icons.asian },
];

const HomeScreen = () => {
  const navigation = useNavigation();


 useCreateTables();         
  const { nearest, popular } = useRestaurants();

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Details", { restaurant: item })}
    >
      <Image source={restaurantImages[item.id]} style={styles.image} />
      {item.offer && (
        <View style={styles.offerTag}>
          <Text style={styles.offerText}>{item.offer}</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.subText}>⭐ {item.rating} • {item.time}</Text>
    </TouchableOpacity>
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
      />

      <Text style={styles.sectionTitle}>Popular Restaurants</Text>
      <FlatList
        data={popular}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRestaurant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  locationIcon: { width: 22, height: 22, resizeMode: "contain" },
  locationText: { marginLeft: 6, fontSize: 16 },
  categoriesList: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryBtn: { alignItems: "center", marginHorizontal: 8 },
  categoryIcon: { width: 28, height: 28 },
  categoryText: { marginTop: 4, fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  card: { marginRight: 16, width: 150 },
  image: { width: 150, height: 100, borderRadius: 10 },
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
  name: { fontWeight: "bold", marginTop: 6, fontSize: 15 },
  subText: { color: "#555", fontSize: 13 },
});

export default HomeScreen;

