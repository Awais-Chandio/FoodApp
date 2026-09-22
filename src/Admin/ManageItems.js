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
import { useTheme } from "../Context/ThemeProvider";
import {
  layout,
  radius,
  spacing,
} from "../constants/designSystem";
import * as restaurantRepo from "../database/repositories/restaurantRepo";

export default function ManageItems({ navigation, route }) {
  const editingItem = route.params?.restaurant || null;
  const { colors } = useTheme();

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

    let ratingValue = null;
    if (rating !== "") {
      ratingValue = parseFloat(rating);
      if (Number.isNaN(ratingValue)) {
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
    const onError = (error) =>
      Alert.alert("Error", error?.message || "Database operation failed");

    const fields = {
      name: name.trim(),
      rating: ratingValue,
      time: time.trim(),
      offer: offer.trim(),
      category: category.trim(),
      imagePath: keyOrUrl,
    };

    const saved = editingItem
      ? restaurantRepo.update(editingItem.id, fields)
      : restaurantRepo.insert(fields);
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
          title={editingItem ? "Edit restaurant" : "Add restaurant"}
          subtitle="Keep restaurant setup clean without changing database behavior."
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TextField
            label="Name *"
            value={name}
            onChangeText={setName}
          />

          <TextField
            label="Rating"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            placeholder="Optional"
          />

          <TextField
            label="Time"
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 20 min"
          />

          <TextField
            label="Offer"
            value={offer}
            onChangeText={setOffer}
            placeholder="e.g. 30% OFF"
          />

          <TextField
            label="Category *"
            value={category}
            onChangeText={setCategory}
            placeholder="nearest or popular"
          />

          <TextField
            label="Image key or URL"
            value={imagePath}
            onChangeText={setImagePath}
            placeholder="food1 or https://example.com/pic.jpg"
            multiline
          />

          <AppButton
            label={editingItem ? "Update restaurant" : "Add restaurant"}
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
  saveButton: {
    marginTop: spacing.xxl,
  },
});
