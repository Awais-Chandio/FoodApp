import React, { useState, useContext } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  View,
} from "react-native";
import { insertMenuItem, updateMenuItem } from "../database/dbs";
import { ThemeContext } from "../Context/ThemeProvider";   // 👈 import theme

export default function ManageMenuItem({ navigation, route }) {
  const editingItem = route.params?.menuItem ?? null;
  const passedRestaurantId = route.params?.restaurantId ?? null;
  const restaurantId = editingItem?.restaurant_id ?? passedRestaurantId;

  const [name, setName] = useState(editingItem?.name || "");
  const [price, setPrice] = useState(
    editingItem?.price != null ? String(editingItem.price) : ""
  );
  const [imageKey, setImageKey] = useState(editingItem?.image_key || "");

  const { colors } = useContext(ThemeContext);  

  const handleSave = () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Validation", "Name and Price are required");
      return;
    }
    if (!restaurantId) {
      Alert.alert("Validation", "Restaurant not specified");
      return;
    }
    const priceVal = parseFloat(price);
    if (isNaN(priceVal)) {
      Alert.alert("Validation", "Price must be a number");
      return;
    }

    const keyOrUrl = imageKey.trim() || null;

    const onSuccess = () => navigation.goBack();
    const onError = (err) =>
      Alert.alert("Error", err?.message || "Database error");

    if (editingItem) {
      updateMenuItem(
        editingItem.id,
        name.trim(),
        priceVal,
        null,
        keyOrUrl,
        onSuccess,
        onError
      );
    } else {
      insertMenuItem(
        restaurantId,
        name.trim(),
        priceVal,
        null,
        keyOrUrl,
        onSuccess,
        onError
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {editingItem ? "Edit Menu Item" : "Add Menu Item"}
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.text }]}>Price (Rs.) *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Image key or URL</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={imageKey}
          onChangeText={setImageKey}
          placeholder="food2 OR https://example.com/pic.jpg"
          placeholderTextColor={colors.text + "99"}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>{editingItem ? "Update" : "Add"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16,marginTop:100 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { marginTop: 12, fontSize: 14 },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: "#FF7F32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },


  backBtn: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    padding: 5,

    marginTop:10
  },
  backArrow: { fontSize: 26, fontWeight: "bold" },
});
