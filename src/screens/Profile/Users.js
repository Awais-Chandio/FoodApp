import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { insertAdminUser, updateAdminUser } from "../../database/dbs";


export const formSchema = {
  form_id: "user_registration_001",
  title: "User Registration Form",
  fields: [
    { id: "first_name", label: "First Name", type: "text", required: true, placeholder: "Enter first name" },
    { id: "last_name", label: "Last Name", type: "text", placeholder: "Enter last name" },
    { id: "first_name1", label: "First Name1", type: "text", required: true, placeholder: "Enter first name1" },
    { id: "name", label: "Nick Name", type: "text", placeholder: "Enter nick name" },
    { id: "age", label: "Age", type: "number" },
    { id: "gender", label: "Gender", type: "radio", options: ["Male", "Female", "Other"], required: true },
    { id: "hobbies", label: "Hobbies", type: "checkbox", options: ["Reading", "Sports", "Music", "Traveling", "Swimming"] },
    { id: "country", label: "Country", type: "dropdown", options: ["USA", "Canada", "UK", "India", "Australia"], required: true },
    { id: "dob", label: "Date of Birth", type: "date", required: true },
    { id: "bio", label: "Short Bio", type: "textarea", max_length: 300 },
    { id: "submit", label: "Register", type: "button" },
  ],
};

const Users = ({ navigation, route }) => {
  const editingUser = route.params?.user || null;

  const getInitialFormData = () => {
    const data = {};
    formSchema.fields.forEach((f) => {
      if (f.type === "checkbox") data[f.id] = []; 
      else if (f.type === "date") data[f.id] = new Date();
      else data[f.id] = "";
    });
    return data;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [showDatePickerField, setShowDatePickerField] = useState(null);


  useEffect(() => {
    if (editingUser) {
      const newData = getInitialFormData();
      Object.keys(newData).forEach((key) => {
        if (editingUser[key] !== undefined) {
          if (key === "dob") {
        
            const d = new Date(editingUser[key]);
            newData[key] = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          } else {
            newData[key] = editingUser[key];
          }
        }
      });
      setFormData(newData);
    }
  }, [editingUser]);

  const toggleHobby = (hobby, fieldId) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId].includes(hobby)
        ? prev[fieldId].filter((h) => h !== hobby)
        : [...prev[fieldId], hobby],
    }));
  };

  const handleSave = () => {
    for (let field of formSchema.fields) {
      if (field.required && !formData[field.id] && field.type !== "button") {
        Alert.alert("Validation", `${field.label} is required`);
        return;
      }
    }

    const userToSave = {};
    Object.keys(formData).forEach((key) => {
      if (key === "submit") return; 
      if (key === "dob" && formData[key] instanceof Date) {
     
        const d = formData[key];
        userToSave[key] = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{formSchema.title}</Text>

      {formSchema.fields
        .filter((f) => f.type !== "button")
        .map((field) => (
          <View key={field.id} style={{ marginBottom: 12 }}>
            <Text style={styles.label}>
              {field.label} {field.required ? "*" : ""}
            </Text>

            {(field.type === "text" || field.type === "number") && (
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                keyboardType={field.type === "number" ? "numeric" : "default"}
                value={formData[field.id]?.toString()}
                onChangeText={(val) => setFormData({ ...formData, [field.id]: val })}
              />
            )}

            {field.type === "radio" &&
              field.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.radioContainer}
                  onPress={() => setFormData({ ...formData, [field.id]: opt })}
                >
                  <Text style={{ marginRight: 8 }}>
                    {formData[field.id] === opt ? "🔘" : "⚪"}
                  </Text>
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}

            {field.type === "checkbox" &&
              field.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxContainer}
                  onPress={() => toggleHobby(opt, field.id)}
                >
                  <Text style={{ marginRight: 8 }}>
                    {formData[field.id].includes(opt) ? "☑️" : "⬜"}
                  </Text>
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}

            {field.type === "dropdown" && (
              <Picker
                selectedValue={formData[field.id]}
                onValueChange={(val) => setFormData({ ...formData, [field.id]: val })}
                style={styles.input}
              >
                <Picker.Item label="Select..." value="" />
                {field.options.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            )}

            {field.type === "date" && (
              <>
                <TouchableOpacity onPress={() => setShowDatePickerField(field.id)}>
                  <Text style={styles.input}>
                    {formData[field.id] instanceof Date
                      ? formData[field.id].toDateString()
                      : formData[field.id]}
                  </Text>
                </TouchableOpacity>
                {showDatePickerField === field.id && (
                  <DateTimePicker
                    value={formData[field.id] instanceof Date ? formData[field.id] : new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, selectedDate) => {
                      setShowDatePickerField(null);
                      if (selectedDate) {
                    
                        setFormData({
                          ...formData,
                          [field.id]: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                        });
                      }
                    }}
                  />
                )}
              </>
            )}

            {field.type === "textarea" && (
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={formData[field.id]}
                onChangeText={(val) => setFormData({ ...formData, [field.id]: val })}
                placeholder="Write here..."
                maxLength={field.max_length}
              />
            )}
          </View>
        ))}

   
      <Button title={editingUser ? "Update User" : "Register"} onPress={handleSave} />
    </ScrollView>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", marginTop: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontWeight: "600", marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 3,
  },
  radioContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
});
