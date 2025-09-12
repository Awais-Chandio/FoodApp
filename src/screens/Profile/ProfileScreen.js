import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function ProfileScreen() {
  const user = {
    name: "Mr Ahmed Khan",
    email: "ahmed.khan@example.com",
    phone: "+92 300 1234567",
    address: "Hyderabad, Pakistan",
    avatar: "https://i.pravatar.cc/150?img=3",
  };

  return (
    <ScrollView style={styles.container}>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      
      <View style={styles.profileSection}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

    
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>{user.phone}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Address</Text>
        <Text style={styles.infoValue}>{user.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
        </TouchableOpacity>
      </View>

     
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    backgroundColor: "#FF7F32",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold", color: "#000" },
  email: { fontSize: 14, color: "#666", marginBottom: 10 },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
  },
  infoLabel: { fontSize: 12, color: "#999" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 8,
    color: "#444",
  },
  settingItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: { fontSize: 14, color: "#333" },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 15,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
