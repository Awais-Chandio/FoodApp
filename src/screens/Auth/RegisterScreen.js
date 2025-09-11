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
import { registerUser } from "../../database/dbs"; 

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

   
    registerUser(
      email,
      password,
      () => {
        alert("User registered successfully!");
        navigation.replace("Login");
      },
      (err) => {
        if (err.message.includes("UNIQUE constraint")) {
          alert("Email already exists!");
        } else {
          alert("Error: " + err.message);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
   
      <Image
        source={require("../../assets/Group-118.png")}
        style={styles.topImage}
        resizeMode="cover"
      />

      <Text style={{ textAlign: "center", color: "#000", fontSize: 18, marginVertical: 15 }}>
        Create an Account
      </Text>

      <View style={styles.content}>
       
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

       
        <Text style={styles.label}>Password:</Text>
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
            style={{ ...styles.eyeIcon, top: "30%" }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <AntIcon name={showPassword ? "eyeo" : "eye"} size={22} color="#666" />
          </TouchableOpacity>
        </View>

       
        <Text style={styles.label}>Confirm Password:</Text>
        <View style={{ width: "100%", position: "relative" }}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re enter your password"
            placeholderTextColor="#666"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={{ ...styles.eyeIcon, top: "30%" }}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <AntIcon name={showConfirmPassword ? "eyeo" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

     
        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>

       
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.registerLink}> Login here</Text>
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
    height: 220,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    color: "#333",
    fontSize: 14,
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
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
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
    color: "#111110ff",
  },
});
