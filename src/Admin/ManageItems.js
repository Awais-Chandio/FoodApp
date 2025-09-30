import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { insertRestaurant, updateRestaurant } from "../database/dbs";

export default function ManageItems({ navigation, route }) {
  const editingItem = route.params?.restaurant || null;

  const [name, setName] = useState(editingItem?.name || "");
  const [rating, setRating] = useState(String(editingItem?.rating ?? ""));
  const [time, setTime] = useState(editingItem?.time || "");
  const [offer, setOffer] = useState(editingItem?.offer || "");
  const [category, setCategory] = useState(editingItem?.category || "");
  const [imagePath, setImagePath] = useState(editingItem?.image_path || "");

  const handleSave = () => {

    if (!name.trim() || !category.trim()) {
      Alert.alert("Validation", "Please fill name and category (at minimum)");
      return;
    }

  
    let ratingVal = null;
    if (rating !== "") {
      ratingVal = parseFloat(rating);
      if (isNaN(ratingVal)) {
        Alert.alert("Validation", "Rating must be a number");
        return;
      }
    }

    const keyOrUrl = imagePath.trim() || null;

    const onSuccess = () => {
      Alert.alert(
        "Success",
        editingItem ? "Restaurant updated" : "Restaurant added",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    };
    const onError = (err) =>
      Alert.alert("Error", err?.message || "Database operation failed");

    if (editingItem) {
      updateRestaurant(
        editingItem.id,
        name.trim(),
        ratingVal,
        time.trim(),
        offer.trim(),
        category.trim(),
        keyOrUrl,
        onSuccess,
        onError
      );
    } else {
      insertRestaurant(
        name.trim(),
        ratingVal,
        time.trim(),
        offer.trim(),
        category.trim(),
        keyOrUrl,
        onSuccess,
        onError
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {editingItem ? "Edit Restaurant" : "Add Restaurant"}
      </Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Rating</Text>
      <TextInput
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        placeholder="optional"
      />

      <Text style={styles.label}>Time (e.g. 20 min)</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />

      <Text style={styles.label}>Offer</Text>
      <TextInput style={styles.input} value={offer} onChangeText={setOffer} />

      <Text style={styles.label}>Category (nearest / popular) *</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

     
      <Text style={styles.label}>Image (asset key or full URL)</Text>
      <TextInput
        style={styles.input}
        value={imagePath}
        onChangeText={setImagePath}
        placeholder="e.g. pizza  OR  https://example.com/pic.jpg"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>
          {editingItem ? "Update" : "Add"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { marginTop: 12, fontSize: 14, color: "#333" },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
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
});
