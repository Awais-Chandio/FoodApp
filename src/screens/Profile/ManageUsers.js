import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAdminUsers, deleteAdminUser } from "../../database/dbs"; // adjust path

const ManageUsers = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    fetchAdminUsers((data) => setUsers(data));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUsers();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAdminUser(id, () => {
            Alert.alert("Deleted!", "User has been removed.");
            loadUsers();
          });
        },
      },
    ]);
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.first_name} ({item.age})
      </Text>
      <Text>Gender: {item.gender}</Text>
      <Text>Hobbies: {Array.isArray(item.hobbies) ? item.hobbies.join(", ") : item.hobbies}</Text>
      <Text>Country: {item.country}</Text>
      <Text>DOB: {item.dob}</Text>
      <Text>Bio: {item.bio}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate("Users", { user: item })}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manage Users</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("Users")}
        >
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* User Cards */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No users found
          </Text>
        }
      />
    </View>
  );
};

export default ManageUsers;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#fffcfcff",
    elevation: 1,
  },
  backArrow: { fontSize: 22, color: "#000" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f1e1e",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  addButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 2,
  },
  addButtonText: { fontSize: 14, fontWeight: "600", color: "#000" },
  card: {
    backgroundColor: "#f1f1f1",
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  editBtn: { backgroundColor: "#4CAF50" },
  deleteBtn: { backgroundColor: "#E53935" },
  actionText: { color: "#fff", fontWeight: "600" },
});
