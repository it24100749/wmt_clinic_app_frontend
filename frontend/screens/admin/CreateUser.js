import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import api from "../../services/api";

export default function CreateUser({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);

  const SPECIALIZATIONS = ["General Physician", "Cardiology", "Pediatrics", "Orthopedics", "Dermatology", "Neurology"];

  const handleCreate = async () => {
    if (!name || !email || !password || !role) {
      return Alert.alert("Error", "Please fill all fields");
    }
    if (role === "doctor" && !specialization) {
      return Alert.alert("Error", "Please select a specialization for the doctor");
    }

    setLoading(true);
    try {
      await api.post("/auth/users", { name, email, password, role, specialization });
      Alert.alert("Success", "User created successfully!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Creation Failed", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Create New User</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Select Role:</Text>
      <View style={styles.rolesContainer}>
        {["doctor", "pharmacist", "admin", "patient"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            onPress={() => {
              setRole(r);
              if (r !== "doctor") setSpecialization("");
            }}
          >
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {role === "doctor" && (
        <>
          <Text style={styles.label}>Select Specialization:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specializationScroll}>
            {SPECIALIZATIONS.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[styles.roleBtn, specialization === spec && styles.roleBtnActive]}
                onPress={() => setSpecialization(spec)}
              >
                <Text style={[styles.roleText, specialization === spec && styles.roleTextActive]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create User</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 14, marginBottom: 16, fontSize: 15, backgroundColor: "#f9f9f9"
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 10 },
  rolesContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  specializationScroll: { marginBottom: 24 },
  roleBtn: {
    borderWidth: 1, borderColor: "#7c3aed", borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16, margin: 4,
    backgroundColor: "#fff"
  },
  roleBtnActive: { backgroundColor: "#7c3aed" },
  roleText: { color: "#7c3aed", fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#7c3aed", padding: 15, borderRadius: 10,
    alignItems: "center", marginTop: 10
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
