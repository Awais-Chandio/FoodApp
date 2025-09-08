import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import HomeHeader from "../../components/HomeHeader";


const nearestRestaurants = [
  {
    id: "1",
    name: "Westway",
    image: require("../../assets/Westway.png"),
    rating: 4.6,
    time: "15 min",
    offer: "50% OFF",
  },
  {
    id: "2",
    name: "Fortune",
    image: require("../../assets/Fortune.png"),
    rating: 4.8,
    time: "25 min",
  },
  {
    id: "3",
    name: "Seafood",
    image: require("../../assets/Seafood.png"),
    rating: 4.6,
    time: "20 min",
  },
];

const popularRestaurants = [
  {
    id: "1",
    name: "Moonland",
    image: require("../../assets/Moonland.png"),
    rating: 4.6,
    time: "15 min",
  },
  {
    id: "2",
    name: "Starfish",
    image: require("../../assets/Starfish.png"),
    rating: 4.8,
    time: "25 min",
    offer: "30% OFF",
  },
  {
    id: "3",
    name: "Black Noodles",
    image: require("../../assets/BlackNodles.png"),
    rating: 4.9,
    time: "20 min",
  },
];

export default function HomeScreen() {
  const renderRestaurant = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      {item.offer && (
        <View style={styles.offerTag}>
          <Text style={styles.offerText}>{item.offer}</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSub}>
        ⭐ {item.rating} • ⏱ {item.time}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        
        <HomeHeader />

    
        <View style={styles.headerRow}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/location.png")}
                style={styles.icon}
                resizeMode="contain"
              />
              <Text style={styles.locationText}>Home</Text>
            </View>
            <Text style={styles.subText}>Hyderabad, Pakistan</Text>
          </View>

          {/* Right side */}
          <TouchableOpacity>
            <Image
              source={require("../../assets/homeIcon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* 🔹 Categories Row */}
        <View style={styles.categories}>
          <TouchableOpacity style={styles.categoryActive}>
            <Text style={styles.categoryActiveText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Pizza</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Beverages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Asian</Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Nearest Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearest Restaurants</Text>
          <FlatList
            data={nearestRestaurants}
            horizontal
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* 🔹 Popular Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <FlatList
            data={popularRestaurants}
            horizontal
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* 🔹 Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require("../../assets/homeIcon.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require("../../assets/search.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require("../../assets/shopping-cart.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Category</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require("../../assets/user.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20, 
  },
  icon: {
    width: 22,
    height: 22,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
    marginLeft: 26,
    letterSpacing: 0.3,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  category: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  categoryText: {
    color: "#333",
    fontSize: 14,
  },
  categoryActive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFD700",
    borderRadius: 12,
  },
  categoryActiveText: {
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    width: 140,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 100,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    marginLeft: 8,
  },
  cardSub: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    marginLeft: 8,
  },
  offerTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6347",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 6,
  },
  navText: {
    fontSize: 12,
    color: "#333",
    marginBottom:10
  },
});
