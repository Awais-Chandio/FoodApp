import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppButton from "../components/ui/AppButton";
import SectionHeader from "../components/ui/SectionHeader";
import { useTheme } from "../Context/ThemeProvider";
import { layout, radius, spacing } from "../constants/designSystem";
import { insertMenuItem, updateMenuItem } from "../database/dbs";

export default function ManageMenuItem({ navigation, route }) {
  const editingItem = route.params?.menuItem ?? null;
  const passedRestaurantId = route.params?.restaurantId ?? null;
  const restaurantId = editingItem?.restaurant_id ?? passedRestaurantId;
  const { colors } = useTheme();

  const [name, setName] = useState(editingItem?.name || "");
  const [price, setPrice] = useState(
    editingItem?.price != null ? String(editingItem.price) : ""
  );
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
    const priceValue = parseFloat(price);
    if (Number.isNaN(priceValue)) {
      Alert.alert("Validation", "Price must be a number");
      return;
    }

    const keyOrUrl = imageKey.trim() || null;
    const onSuccess = () => navigation.goBack();
    const onError = (error) =>
      Alert.alert("Error", error?.message || "Database error");

    if (editingItem) {
      updateMenuItem(
        editingItem.id,
        name.trim(),
        priceValue,
        null,
        keyOrUrl,
        onSuccess,
        onError
      );
    } else {
      insertMenuItem(
        restaurantId,
        name.trim(),
        priceValue,
        null,
        keyOrUrl,
        onSuccess,
        onError
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <SectionHeader
          title={editingItem ? "Edit menu item" : "Add menu item"}
          subtitle="Quick item changes without altering the current menu data flow."
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
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
                backgroundColor: colors.background,
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
              styles.textArea,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={imageKey}
            onChangeText={setImageKey}
            placeholder="food2 or https://example.com/pic.jpg"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            multiline
          />

          <AppButton
            label={editingItem ? "Update item" : "Add item"}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  saveButton: {
    marginTop: spacing.xxl,
  },
});
