import React from "react";
import { ImageBackground, View, TextInput, Platform, StyleSheet, Dimensions } from "react-native";
import AntIcon from "react-native-vector-icons/AntDesign";

const { width } = Dimensions.get("window");

export default function HomeHeader() {
    return (
        <ImageBackground
            source={require("../assets/Group-118.png")}
            style={styles.topImage}
            resizeMode="cover"

            imageStyle={{
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
            }}

        >

            <View
                style={{
                    marginTop: 80,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    width: "90%",
                    alignSelf: "center",
                    height: 44,

                    elevation: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },


                }}
            >

                <TextInput
                    placeholder="Find your taste"
                    placeholderTextColor="#888"
                    style={{ flex: 1, marginLeft: 8, paddingVertical: Platform.OS === "ios" ? 10 : 8 }}
                />


            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    topImage: {
        width: width,
        height: 250,

    }
});