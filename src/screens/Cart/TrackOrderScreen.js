import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const TrackOrderScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>


      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>



      <Image
        source={{
          uri: "https://i.ibb.co/X7tV3RC/map-sample.png",
        }}
        style={styles.map}
      />


      <View style={styles.bottomSheet}>

        <View style={styles.row}>
          <Text style={styles.timeIcon}></Text>
          <Text style={styles.deliveryTime}>20 Min</Text>
        </View>


        <View style={styles.personBox}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/41.jpg",
            }}
            style={styles.personImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>George William</Text>
            <Text style={styles.personRole}>Delivery person</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}></Text>
          </TouchableOpacity>
        </View>


        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <Text style={styles.checkIcon}></Text>
            <View>
              <Text style={styles.statusTitle}>Order confirmed</Text>
              <Text style={styles.statusSub}>Your order has been Confirmed</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.checkIcon}></Text>
            <View>
              <Text style={styles.statusTitle}>Order prepared</Text>
              <Text style={styles.statusSub}>Your order has been prepared</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.pendingIcon}></Text>
            <View>
              <Text style={styles.statusTitle}>Delivery in progress</Text>
              <Text style={styles.statusSub}>Hang on! Your food is on the way</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },


  backBtn: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    padding: 5,
  },
  backArrow: { fontSize: 26, fontWeight: "bold", color: "#000" },


  map: {
    width: "100%",
    height: "50%",
    resizeMode: "cover",
  },


  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFD700",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  timeIcon: { fontSize: 22, marginRight: 8 },
  deliveryTime: { fontSize: 18, fontWeight: "bold", color: "#000" },


  personBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  personImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  personName: { fontSize: 16, fontWeight: "bold" },
  personRole: { fontSize: 13, color: "#444" },
  callButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 25,
  },


  statusBox: { marginTop: 10 },
  statusRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 15 },
  checkIcon: { fontSize: 20, marginRight: 10, color: "green" },
  pendingIcon: { fontSize: 20, marginRight: 10, color: "red" },
  statusTitle: { fontSize: 15, fontWeight: "bold", color: "#000" },
  statusSub: { fontSize: 12, color: "#333" },
});

export default TrackOrderScreen;
