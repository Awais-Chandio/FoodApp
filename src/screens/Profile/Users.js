import React, { useState, useEffect } from "react";
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
import {
  insertAdminUser,
  updateAdminUser,
  initAdminUsersTable,
} from "../../database/dbs"; // adjust path

const Users = ({ navigation, route }) => {
  const editingUser = route.params?.user || null;

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [country, setCountry] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    initAdminUsersTable();

    // If editing, pre-fill data
    if (editingUser) {
      setFirstName(editingUser.first_name);
      setAge(editingUser.age?.toString() || "");
      setGender(editingUser.gender);
      setHobbies(editingUser.hobbies || []);
      setCountry(editingUser.country);
      setDob(new Date(editingUser.dob));
      setBio(editingUser.bio);
    }
  }, [editingUser]);

  const toggleHobby = (hobby) => {
    setHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleSave = () => {
    if (!firstName || !gender || !country) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    const user = {
      id: editingUser?.id,
      first_name: firstName,
      age,
      gender,
      hobbies,
      country,
      dob: dob.toDateString(),
      bio,
    };

    if (editingUser) {
      // update existing user
      updateAdminUser(user, () => {
        Alert.alert("Success", "User updated!");
        navigation.navigate("ManageUsers");
      });
    } else {
      // insert new user
      insertAdminUser(user, () => {
        Alert.alert("Success", "User saved!");
        navigation.navigate("ManageUsers");
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter first name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.label}>Gender *</Text>
      {["Male", "Female", "Other"].map((g) => (
        <TouchableOpacity
          key={g}
          style={styles.radioContainer}
          onPress={() => setGender(g)}
        >
          <Text style={{ marginRight: 8 }}>{gender === g ? "🔘" : "⚪"}</Text>
          <Text>{g}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Hobbies</Text>
      {["Reading", "Sports", "Music", "Traveling"].map((h) => (
        <TouchableOpacity
          key={h}
          style={styles.checkboxContainer}
          onPress={() => toggleHobby(h)}
        >
          <Text style={{ marginRight: 8 }}>
            {hobbies.includes(h) ? "☑️" : "⬜"}
          </Text>
          <Text>{h}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Country *</Text>
      <Picker
        selectedValue={country}
        onValueChange={(val) => setCountry(val)}
        style={styles.input}
      >
        <Picker.Item label="Select Country" value="" />
        {["USA", "Canada", "UK", "India", "Australia"].map((c) => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>

      <Text style={styles.label}>Date of Birth *</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.input}>{dob.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={(e, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Short Bio</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={bio}
        onChangeText={setBio}
        placeholder="Write a short bio..."
      />

      <Button
        title={editingUser ? "Update User" : "Save User"}
        onPress={handleSave}
      />
    </ScrollView>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  label: { fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  radioContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
});
