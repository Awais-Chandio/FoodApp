import React, { forwardRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import {
  MAX_FONT_SCALE,
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";

/**
 * Labelled text input with an error line, an optional show/hide toggle for
 * passwords and multiline support. All other props go to the TextInput.
 * The outline uses borderStrong so it stays visible (3:1) in both modes.
 */
const TextField = forwardRef(function TextField(
  { label, error, helper, secure = false, multiline = false, containerStyle, style, ...inputProps },
  ref
) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const hidden = secure && !revealed;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          multiline ? styles.fieldMultiline : null,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.borderStrong,
          },
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSecondary}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          secureTextEntry={hidden}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          accessibilityLabel={label}
          {...inputProps}
          style={[styles.input, multiline ? styles.inputMultiline : null, { color: colors.text }, style]}
        />
        {secure ? (
          <TouchableOpacity
            onPress={() => setRevealed((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
          >
            <AntDesign
              name={revealed ? "eye" : "eye-invisible"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color="dangerText" style={styles.message}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" muted style={styles.message}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamily.bold,
    marginBottom: spacing.sm,
  },
  field: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldMultiline: {
    alignItems: "flex-start",
    paddingTop: spacing.xs,
  },
  input: {
    flex: 1,
    // No lineHeight: it misplaces the text inside a TextInput on iOS.
    fontFamily: typeScale.body.fontFamily,
    fontSize: typeScale.body.fontSize,
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    minHeight: 84,
  },
  message: {
    marginTop: spacing.xs,
  },
});
