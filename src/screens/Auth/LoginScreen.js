import React, { useState } from "react";
import AntIcon from "react-native-vector-icons/AntDesign";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = () => {
    console.log("Email:", email, "Password:", password);
    navigation.replace("Home"); 
  };

  return (
    <View style={styles.container}>
    
      <Image
        source={require("../../assets/Group-118.png")}
        style={styles.topImage}
        resizeMode="cover"
      />

      <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 15 }}>
        <Image
          source={require("../../assets/Group-6.png")}
          style={{ width: 125, height: 100, marginHorizontal: 10 }}
          resizeMode="contain"
        />
      </View>

      <Text style={{ textAlign: "center", color: "#000", fontSize: 16, marginBottom: 10 }}>
        or login with email
      </Text>

      <View style={styles.content}>
      
        <Text style={{ alignSelf: "flex-start", marginBottom: 5, color: "#333", fontSize: 14 }}>
          Email:
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        
        <Text style={{ alignSelf: "flex-start", marginBottom: 5, color: "#333", fontSize: 14 }}>
          Password:
        </Text>
        <View style={{ width: "100%", position: "relative" }}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword} 
          />

          
          <TouchableOpacity
            style={{ position: "absolute", right: 15, top: 10 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <AntIcon name={showPassword ? "eyeo" : "eye"} size={20} color="#221f1fff" />
          </TouchableOpacity>
        </View>

       
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign in</Text>
        </TouchableOpacity>

   
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(153,146,146,0.25)",
  },
  topImage: {
    width: width,
    height: 250,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  registerRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: "#333",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1918ff",
  },
});
