
import React, { useContext } from "react";
import {
  ImageBackground,
  View,
  TextInput,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ThemeContext } from "../Context/ThemeProvider";

const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const { colors } = useContext(ThemeContext); 

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
          backgroundColor: colors.input, 
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
          placeholderTextColor={colors.text + "99"} 
          style={{
            flex: 1,
            marginLeft: 8,
            paddingVertical: Platform.OS === "ios" ? 10 : 8,
            color: colors.text, 
          }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  topImage: {
    width: width,
    height: 250,
  },
});
