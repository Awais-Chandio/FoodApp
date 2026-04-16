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
import { insertRestaurant, updateRestaurant } from "../database/dbs";

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

    if (editingItem) {
      updateRestaurant(
        editingItem.id,
        name.trim(),
        ratingValue,
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
        ratingValue,
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
          title={editingItem ? "Edit restaurant" : "Add restaurant"}
          subtitle="Keep restaurant setup clean without changing database behavior."
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

          <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            placeholder="Optional"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>Time</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 20 min"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>Offer</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={offer}
            onChangeText={setOffer}
            placeholder="e.g. 30% OFF"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={category}
            onChangeText={setCategory}
            placeholder="nearest or popular"
            placeholderTextColor={colors.textSecondary}
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
            value={imagePath}
            onChangeText={setImagePath}
            placeholder="food1 or https://example.com/pic.jpg"
            placeholderTextColor={colors.textSecondary}
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
