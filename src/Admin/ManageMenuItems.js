import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import TextField from "../components/ui/TextField";
import AppButton from "../components/ui/AppButton";
import { BackButton } from "../components/ui/ScreenHeader";
import SectionHeader from "../components/ui/SectionHeader";
import FilterChip from "../components/ui/FilterChip";
import AppText from "../components/ui/AppText";
import { MENU_CATEGORIES } from "../database/seedData";
import { useTheme } from "../Context/ThemeProvider";
import {
  layout,
  radius,
  spacing,
} from "../constants/designSystem";
import * as menuRepo from "../database/repositories/menuRepo";

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
  const [description, setDescription] = useState(editingItem?.description || "");
  const [category, setCategory] = useState(editingItem?.category || "Other");
  const [isVeg, setIsVeg] = useState(Boolean(editingItem?.is_veg));
  const [spiceLevel, setSpiceLevel] = useState(Number(editingItem?.spice_level) || 0);

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

    const details = {
      description: description.trim(),
      category,
      isVeg,
      spiceLevel,
    };

    // Editing keeps the dish's existing `type`; the old code overwrote it with null.
    const saved = editingItem
      ? menuRepo.update(editingItem.id, {
          name: name.trim(),
          price: priceValue,
          type: editingItem.type,
          imageKey: keyOrUrl,
          ...details,
        })
      : menuRepo.insert({
          restaurantId,
          name: name.trim(),
          price: priceValue,
          type: null,
          imageKey: keyOrUrl,
          ...details,
        });
    saved.then(onSuccess, onError);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <SectionHeader
          title={editingItem ? "Edit menu item" : "Add menu item"}
          subtitle="Quick item changes without altering the current menu data flow."
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TextField
            label="Name *"
            value={name}
            onChangeText={setName}
          />

          <TextField
            label="Price (Rs.) *"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <TextField
            label="Image key or URL"
            value={imageKey}
            onChangeText={setImageKey}
            placeholder="food2 or https://example.com/pic.jpg"
            autoCapitalize="none"
            multiline
          />

          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="One or two lines shown on the menu"
            maxLength={80}
            multiline
          />

          <AppText variant="label" style={styles.groupLabel}>
            Category
          </AppText>
          <View style={styles.chips}>
            {MENU_CATEGORIES.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={category === option}
                onPress={() => setCategory(option)}
              />
            ))}
          </View>

          <AppText variant="label" style={styles.groupLabel}>
            Diet
          </AppText>
          <View style={styles.chips}>
            <FilterChip label="Vegetarian" active={isVeg} onPress={() => setIsVeg(true)} />
            <FilterChip label="Non-vegetarian" active={!isVeg} onPress={() => setIsVeg(false)} />
          </View>

          <AppText variant="label" style={styles.groupLabel}>
            Spice level
          </AppText>
          <View style={styles.chips}>
            {["Mild", "Medium", "Hot", "Extra hot"].map((label, level) => (
              <FilterChip
                key={label}
                label={label}
                active={spiceLevel === level}
                onPress={() => setSpiceLevel(level)}
              />
            ))}
          </View>

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
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  groupLabel: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.xxl,
  },
});
