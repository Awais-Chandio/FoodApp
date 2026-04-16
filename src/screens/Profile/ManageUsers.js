import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@react-native-vector-icons/ant-design";
import Toast from "react-native-toast-message";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, layout, radius, spacing } from "../../constants/designSystem";
import { deleteAdminUser, getAdminUsers } from "../../database/dbs";

const ManageUsers = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    getAdminUsers((fetchedUsers) => {
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
              text1: "Deleted",
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

  const renderUser = ({ item }) => (
    <View
      style={[
        styles.card,
        createShadow(colors.shadow, 10),
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
      ]}
    >
      <Text style={[styles.name, { color: colors.text }]}>
        {item.first_name} {item.last_name}
      </Text>

      {Object.entries(item).map(([key, value]) => {
        if (key === "id") {
          return null;
        }

        return (
          <Text key={key} style={[styles.field, { color: colors.textSecondary }]}>
            {key}: {Array.isArray(value) ? value.join(", ") : value}
          </Text>
        );
      })}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.badge }]}
          onPress={() => navigation.navigate("Users", { user: item })}
        >
          <AntDesign name="edit" size={15} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={() => handleDelete(item.id)}
        >
          <AntDesign name="delete" size={15} color={colors.danger} />
          <Text style={[styles.deleteText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.topRow}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.surface }]}
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="arrow-left" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primaryStrong }]}
                onPress={() => navigation.navigate("Users")}
              >
                <Text style={styles.addButtonText}>Add user</Text>
              </TouchableOpacity>
            </View>
            <SectionHeader
              title="Manage users"
              subtitle="Review and maintain saved admin-side user records."
            />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No users found"
            message="Add a new user to start populating this management list."
            icon="team"
            actionLabel="Add user"
            onActionPress={() => navigation.navigate("Users")}
          />
        }
      />
    </View>
  );
};

export default ManageUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  field: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.lg,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionText: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
  },
  deleteText: {
    marginLeft: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
  },
});
