import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { getRestaurants, createTables } from "../../database/dbs";

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

const HomeScreen = () => {
  const [nearest, setNearest] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
  
    createTables(() => {
      getRestaurants("nearest", setNearest);
      getRestaurants("popular", setPopular);
    });
  }, []);

  const renderRestaurant = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={restaurantImages[item.id]}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name}</Text>
      <Text>Rating: {item.rating} | Time: {item.time}</Text>
      {item.offer ? <Text>Offer: {item.offer}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearest Restaurants</Text>
      <FlatList
        data={nearest}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderRestaurant}
      />

      <Text style={styles.title}>Popular Restaurants</Text>
      <FlatList
        data={popular}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderRestaurant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  card: { marginRight: 15, width: 140 },
  image: { width: 140, height: 100, borderRadius: 8 },
  name: { fontWeight: "bold", marginTop: 5 },
});

export default HomeScreen;
