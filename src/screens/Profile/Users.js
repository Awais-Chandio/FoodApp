import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppButton from "../../components/ui/AppButton";
import SectionHeader from "../../components/ui/SectionHeader";
import { useTheme } from "../../Context/ThemeProvider";
import { layout, radius, spacing } from "../../constants/designSystem";
import { insertAdminUser, updateAdminUser } from "../../database/dbs";

export const formSchema = {
  form_id: "user_registration_001",
  title: "User Registration Form",
  fields: [
    {
      id: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name",
    },
    { id: "last_name", label: "Last Name", type: "text", placeholder: "Enter last name" },
    {
      id: "first_name1",
      label: "First Name1",
      type: "text",
      required: true,
      placeholder: "Enter first name1",
    },
    { id: "name", label: "Nick Name", type: "text", placeholder: "Enter nick name" },
    { id: "age", label: "Age", type: "number" },
    {
      id: "gender",
      label: "Gender",
      type: "radio",
      options: ["Male", "Female", "Other"],
      required: true,
    },
    {
      id: "hobbies",
      label: "Hobbies",
      type: "checkbox",
      options: ["Reading", "Sports", "Music", "Traveling", "Swimming"],
    },
    {
      id: "country",
      label: "Country",
      type: "dropdown",
      options: ["USA", "Canada", "UK", "India", "Australia"],
      required: true,
    },
    { id: "dob", label: "Date of Birth", type: "date", required: true },
    { id: "bio", label: "Short Bio", type: "textarea", max_length: 300 },
    { id: "submit", label: "Register", type: "button" },
  ],
};

const Users = ({ navigation, route }) => {
  const { colors } = useTheme();
  const editingUser = route.params?.user || null;

  const getInitialFormData = () => {
    const data = {};
    formSchema.fields.forEach((field) => {
      if (field.type === "checkbox") {
        data[field.id] = [];
      } else if (field.type === "date") {
        data[field.id] = new Date();
      } else {
        data[field.id] = "";
      }
    });
    return data;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [showDatePickerField, setShowDatePickerField] = useState(null);

  useEffect(() => {
    if (!editingUser) {
      return;
    }

    const newData = getInitialFormData();
    Object.keys(newData).forEach((key) => {
      if (editingUser[key] !== undefined) {
        if (key === "dob") {
          const date = new Date(editingUser[key]);
          newData[key] = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
        } else {
          newData[key] = editingUser[key];
        }
      }
    });
    setFormData(newData);
  }, [editingUser]);

  const toggleHobby = (hobby, fieldId) => {
    setFormData((current) => ({
      ...current,
      [fieldId]: current[fieldId].includes(hobby)
        ? current[fieldId].filter((item) => item !== hobby)
        : [...current[fieldId], hobby],
    }));
  };

  const handleSave = () => {
    for (const field of formSchema.fields) {
      if (field.required && !formData[field.id] && field.type !== "button") {
        Alert.alert("Validation", `${field.label} is required`);
        return;
      }
    }

    const userToSave = {};
    Object.keys(formData).forEach((key) => {
      if (key === "submit") {
        return;
      }
      if (key === "dob" && formData[key] instanceof Date) {
        const date = formData[key];
        userToSave[key] = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      } else {
        userToSave[key] = formData[key];
      }
    });

    if (editingUser) {
      updateAdminUser(editingUser.id, userToSave, () => {
        Alert.alert("Success", "User updated!");
        navigation.navigate("ManageUsers");
      });
    } else {
      insertAdminUser(userToSave, () => {
        Alert.alert("Success", "User saved!");
        navigation.navigate("ManageUsers");
      });
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
          title={editingUser ? "Edit user" : "Add user"}
          subtitle="Structured admin form with the same underlying saved schema."
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {formSchema.fields
            .filter((field) => field.type !== "button")
            .map((field) => (
              <View key={field.id} style={styles.fieldBlock}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {field.label} {field.required ? "*" : ""}
                </Text>

                {(field.type === "text" || field.type === "number") && (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                    value={formData[field.id]?.toString()}
                    onChangeText={(value) =>
                      setFormData({ ...formData, [field.id]: value })
                    }
                  />
                )}

                {field.type === "radio" &&
                  field.options.map((option) => {
                    const selected = formData[field.id] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.choiceRow,
                          {
                            backgroundColor: selected
                              ? colors.badge
                              : colors.background,
                            borderColor: selected ? colors.primaryStrong : colors.border,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, [field.id]: option })}
                      >
                        <Text style={[styles.choiceText, { color: colors.text }]}>
                          {selected ? "●" : "○"} {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {field.type === "checkbox" &&
                  field.options.map((option) => {
                    const selected = formData[field.id].includes(option);
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.choiceRow,
                          {
                            backgroundColor: selected
                              ? colors.badge
                              : colors.background,
                            borderColor: selected ? colors.primaryStrong : colors.border,
                          },
                        ]}
                        onPress={() => toggleHobby(option, field.id)}
                      >
                        <Text style={[styles.choiceText, { color: colors.text }]}>
                          {selected ? "☑" : "☐"} {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {field.type === "dropdown" && (
                  <View
                    style={[
                      styles.pickerWrap,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Picker
                      selectedValue={formData[field.id]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, [field.id]: value })
                      }
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="Select..." value="" />
                      {field.options.map((country) => (
                        <Picker.Item key={country} label={country} value={country} />
                      ))}
                    </Picker>
                  </View>
                )}

                {field.type === "date" && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        styles.dateButton,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setShowDatePickerField(field.id)}
                    >
                      <Text style={{ color: colors.text }}>
                        {formData[field.id] instanceof Date
                          ? formData[field.id].toDateString()
                          : formData[field.id]}
                      </Text>
                    </TouchableOpacity>
                    {showDatePickerField === field.id ? (
                      <DateTimePicker
                        value={
                          formData[field.id] instanceof Date
                            ? formData[field.id]
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(_event, selectedDate) => {
                          setShowDatePickerField(null);
                          if (selectedDate) {
                            setFormData({
                              ...formData,
                              [field.id]: new Date(
                                selectedDate.getFullYear(),
                                selectedDate.getMonth(),
                                selectedDate.getDate()
                              ),
                            });
                          }
                        }}
                      />
                    ) : null}
                  </>
                )}

                {field.type === "textarea" && (
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
                    multiline
                    value={formData[field.id]}
                    onChangeText={(value) =>
                      setFormData({ ...formData, [field.id]: value })
                    }
                    placeholder="Write here..."
                    placeholderTextColor={colors.textSecondary}
                    maxLength={field.max_length}
                  />
                )}
              </View>
            ))}

          <AppButton
            label={editingUser ? "Update user" : "Register user"}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Users;

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
  fieldBlock: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    justifyContent: "center",
  },
  dateButton: {
    paddingVertical: spacing.md,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  textArea: {
    minHeight: 104,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  choiceRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
