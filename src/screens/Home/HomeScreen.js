import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getRestaurants } from "../../database/dbs";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    // Load restaurants from SQLite
    getRestaurants("nearest", setNearest);
    getRestaurants("popular", setPopular);
  }, []);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Detail", {
          item: {
            id: item.id,
            name: item.name,
            image: require("../assets/food1.jpg"), // 👈 fallback if relative path fails
            price: 200, // 👈 You can replace with real price later
          },
        })
      }
    >
      <Image
        source={
          item.image.includes("http") ? { uri: item.image } : require("../assets/food1.jpg")
        }
        style={styles.image}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          ⭐ {item.rating} | ⏱ {item.time}
        </Text>
        {item.offer ? <Text style={styles.offer}>{item.offer}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Nearest Section */}
      <Text style={styles.heading}>Nearest Restaurants</Text>
      <FlatList
        data={nearest}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        showsHorizontalScrollIndicator={false}
      />

      {/* Popular Section */}
      <Text style={styles.heading}>Popular Restaurants</Text>
      <FlatList
        data={popular}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  card: {
    backgroundColor: "#fff",
    marginRight: 12,
    borderRadius: 10,
    overflow: "hidden",
    width: 180,
    elevation: 2,
  },
  image: { width: "100%", height: 120 },
  name: { fontSize: 16, fontWeight: "bold", margin: 6 },
  sub: { fontSize: 14, color: "gray", marginHorizontal: 6 },
  offer: { fontSize: 14, color: "tomato", fontWeight: "600", margin: 6 },
});
