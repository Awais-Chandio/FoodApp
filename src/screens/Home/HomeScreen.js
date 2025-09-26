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

  // ensure tables exist
  useCreateTables();

  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------- fetch restaurants from DB --------
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

  // decide which image to display
  const getImageSource = (item) => {
    if (!item) return restaurantImages["1"];
    const path = item.image_path;

    if (path) {
      if (/^(https?:|file:|content:|data:)/i.test(path)) {
        return { uri: path };
      }
      const cleaned = path.replace(/\.(png|jpe?g|webp)$/i, "");
      if (restaurantImages[cleaned]) return restaurantImages[cleaned];
      if (restaurantImages[path]) return restaurantImages[path];
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
        {/* 🔴 Price removed completely */}
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

      {/* Add new restaurant */}
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
