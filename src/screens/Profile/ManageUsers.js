
// import React, { useEffect, useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   FlatList,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { getAdminUsers, deleteAdminUser } from "../../database/dbs";

// const ManageUsers = () => {
//   const navigation = useNavigation();
//   const [users, setUsers] = useState([]);

 
//   const loadUsers = () => {
//     getAdminUsers((fetchedUsers) => {
//       console.log("Loaded users:", fetchedUsers);
//       setUsers(fetchedUsers || []);
//     });
//   };

//   const handleDelete = (id) => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: () => {
//           deleteAdminUser(id, () => {
//             loadUsers(); 
//             Alert.alert("Deleted!", "User has been removed.");
//           });
//         },
//       },
//     ]);
//   };

  
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadUsers);
//     return unsubscribe;
//   }, [navigation]);

//   const renderUser = ({ item }) => {
//     return (
//       <View style={styles.card}>
//         <Text style={styles.name}>
//           {item.first_name} {item.last_name}
//         </Text>

//         {Object.entries(item).map(([key, value]) => {
//           if (key === "id") return null; 
//           return (
//             <Text key={key} style={styles.field}>
//               {key}: {Array.isArray(value) ? value.join(", ") : value}
//             </Text>
//           );
//         })}

//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.editBtn]}
//             onPress={() => navigation.navigate("Users", { user: item })}
//           >
//             <Text style={styles.actionText}>Edit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.deleteBtn]}
//             onPress={() => handleDelete(item.id)}
//           >
//             <Text style={styles.actionText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Text style={styles.backArrow}>←</Text>
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Manage Users</Text>

//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => navigation.navigate("Users")}
//         >
//           <Text style={styles.addButtonText}>+ Add User</Text>
//         </TouchableOpacity>
//       </View>

//       {/* User List */}
//       <FlatList
//         data={users}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderUser}
//         ListEmptyComponent={
//           <Text style={{ textAlign: "center", marginTop: 20 }}>No users found</Text>
//         }
//       />
//     </View>
//   );
// };

// export default ManageUsers;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginTop: 20 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: "#f9f9f9",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   backButton: {
//     padding: 6,
//     borderRadius: 10,
//     backgroundColor: "#fffcfcff",
//     elevation: 1,
//   },
//   backArrow: { fontSize: 22, color: "#000" },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1f1e1e",
//     flex: 1,
//     textAlign: "center",
//     marginRight: 40,
//   },
//   addButton: {
//     backgroundColor: "#FFD700",
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   addButtonText: { fontSize: 14, fontWeight: "600", color: "#000" },
//   card: {
//     backgroundColor: "#f1f1f1",
//     margin: 10,
//     padding: 15,
//     borderRadius: 8,
//   },
//   name: { fontSize: 16, fontWeight: "bold" },
//   field: { fontSize: 14, marginVertical: 2 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   actionBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 8,
//   },
//   editBtn: { backgroundColor: "#4CAF50" },
//   deleteBtn: { backgroundColor: "#E53935" },
//   actionText: { color: "#fff", fontWeight: "600" },
// });


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
import { getAdminUsers, deleteAdminUser } from "../../database/dbs";
import Toast from "react-native-toast-message"; 

const ManageUsers = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    getAdminUsers((fetchedUsers) => {
      console.log("Loaded users:", fetchedUsers);
      setUsers(fetchedUsers || []);
    });
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAdminUser(id, () => {
            loadUsers();

           
            Toast.show({
              type: "success",
              text1: "Deleted!",
              text2: "User has been removed.",
            });
          });
        },
      },
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadUsers);
    return unsubscribe;
  }, [navigation]);

  const renderUser = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {item.first_name} {item.last_name}
        </Text>

        {Object.entries(item).map(([key, value]) => {
          if (key === "id") return null;
          return (
            <Text key={key} style={styles.field}>
              {key}: {Array.isArray(value) ? value.join(", ") : value}
            </Text>
          );
        })}

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
  };

  return (
    <View style={styles.container}>
     
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
  field: { fontSize: 14, marginVertical: 2 },
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
