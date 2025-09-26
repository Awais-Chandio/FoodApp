// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { insertMenuItem, updateMenuItem } from "../database/dbs";

// export default function ManageMenuItem({ navigation, route }) {
//   const editingItem = route.params?.menuItem || null;
//   // restaurantId passed when creating a new menu item (Menu screen should pass it)
//   const passedRestaurantId = route.params?.restaurantId ?? null;
//   const restaurantId = editingItem?.restaurant_id ?? passedRestaurantId;

//   const [name, setName] = useState(editingItem?.name || "");
//   const [price, setPrice] = useState(editingItem?.price != null ? String(editingItem.price) : "");
//   // menu_items uses `image_key`; allow existing `image_key` or older `image_path`
//   const [imagePath, setImagePath] = useState(editingItem?.image_key ?? editingItem?.image_path ?? "");

//   const handleSave = () => {
//     if (!name.trim() || !price.trim()) {
//       Alert.alert("Validation", "Name and Price are required");
//       return;
//     }

//     if (!restaurantId && !editingItem) {
//       Alert.alert("Validation", "Restaurant not specified for this menu item");
//       return;
//     }

//     const priceVal = parseFloat(price);
//     if (isNaN(priceVal)) {
//       Alert.alert("Validation", "Price must be a number");
//       return;
//     }

//     const onSuccess = () => {
//       // navigate back to Menu and let it refresh
//       navigation.navigate("Menu", { refresh: true, restaurantId });
//     };

//     const onError = (err) =>
//       Alert.alert("Error", err?.message || "Database operation failed");

//     if (editingItem) {
//       updateMenuItem(
//         editingItem.id,
//         name.trim(),
//         priceVal,
//         null, // type (optional)
//         imagePath.trim() || null,
//         onSuccess,
//         onError
//       );
//     } else {
//       insertMenuItem(
//         restaurantId,
//         name.trim(),
//         priceVal,
//         null, // type (optional)
//         imagePath.trim() || null,
//         onSuccess,
//         onError
//       );
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</Text>

//       <Text style={styles.label}>Name *</Text>
//       <TextInput style={styles.input} value={name} onChangeText={setName} />

//       <Text style={styles.label}>Price (Rs.) *</Text>
//       <TextInput
//         style={styles.input}
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Image (asset key or URL)</Text>
//       <TextInput
//         style={styles.input}
//         value={imagePath}
//         onChangeText={setImagePath}
//         placeholder="pizza OR https://example.com/pic.jpg"
//         autoCapitalize="none"
//       />

//       <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//         <Text style={styles.saveText}>{editingItem ? "Update" : "Add"}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
//   label: { marginTop: 12, fontSize: 14, color: "#333" },
//   input: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e6e6e6",
//     marginTop: 6,
//   },
//   saveBtn: {
//     marginTop: 24,
//     backgroundColor: "#FF7F32",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });



import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { insertMenuItem, updateMenuItem } from "../database/dbs";

export default function ManageMenuItem({ navigation, route }) {
  const editingItem = route.params?.menuItem ?? null;
  const passedRestaurantId = route.params?.restaurantId ?? null;
  const restaurantId = editingItem?.restaurant_id ?? passedRestaurantId;

  const [name, setName] = useState(editingItem?.name || "");
  const [price, setPrice] = useState(
    editingItem?.price != null ? String(editingItem.price) : ""
  );

  // ✅ always use image_key (DB column)
  const [imageKey, setImageKey] = useState(editingItem?.image_key || "");

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
        null,          // optional type
        keyOrUrl,      // ✅ pass image_key
        onSuccess,
        onError
      );
    } else {
      insertMenuItem(
        restaurantId,
        name.trim(),
        priceVal,
        null,          // optional type
        keyOrUrl,      // ✅ pass image_key
        onSuccess,
        onError
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {editingItem ? "Edit Menu Item" : "Add Menu Item"}
      </Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Price (Rs.) *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Image key or URL</Text>
      <TextInput
        style={styles.input}
        value={imageKey}
        onChangeText={setImageKey}
        placeholder="food2 OR https://example.com/pic.jpg"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>{editingItem ? "Update" : "Add"}</Text>
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
