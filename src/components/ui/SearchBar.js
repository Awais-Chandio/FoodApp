import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, radius, spacing } from "../../constants/designSystem";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  containerStyle,
  inputStyle,
  autoFocus = false,
  editable = true,
  onPress,
  onSubmitEditing,
  onClear,
}) {
  const { colors } = useTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.container,
        createShadow(colors.shadow, 10),
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSoft,
        },
        containerStyle,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.badge }]}>
        <AntDesign name="search1" size={17} color={colors.primaryStrong} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { color: colors.text }, inputStyle]}
        autoFocus={autoFocus}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity style={styles.trailingButton} onPress={onClear} hitSlop={8}>
          <AntDesign name="close-circle" size={18} color={colors.muted} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.trailingButton, { backgroundColor: colors.surfaceMuted }]}>
          <AntDesign name="filter" size={14} color={colors.primaryStrong} />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 62,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: spacing.md + 1,
  },
  trailingButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
