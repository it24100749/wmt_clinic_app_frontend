import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from "react-native";
import api from "../../services/api";
 
export default function CreatePrescription({ route, navigation }) {
  const { appointmentId, patientId, prescriptionData } = route.params || {};
  const isEditing = !!prescriptionData;

  const [notes, setNotes] = useState(prescriptionData?.notes || "");
  const [medicines, setMedicines] = useState(
    prescriptionData?.medicines || [{ name: "", dosage: "", duration: "", price: "" }]
  );
  const [loading, setLoading] = useState(false);
 
  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };
 
  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "", price: "" }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };
 
  const submit = async () => {
    if (!appointmentId && !isEditing) return Alert.alert("Error", "Missing data");
    
    // Validation: at least one medicine must have a name
    const hasValidMedicine = medicines.some(m => m.name.trim() !== "");
    if (!hasValidMedicine) {
      return Alert.alert("Error", "Please add at least one medicine with a name.");
    }

    setLoading(true);
    try {
      const formattedMeds = medicines
        .filter(m => m.name.trim() !== "") // Remove empty rows
        .map((m) => ({ ...m, price: Number(m.price || 0) }));

      if (isEditing) {
        await api.put(`/prescriptions/${prescriptionData._id}`, { medicines: formattedMeds, notes });
        Alert.alert("Success", "Prescription updated!");
      } else {
        await api.post("/prescriptions", { appointment: appointmentId, patient: patientId, medicines: formattedMeds, notes });
        Alert.alert("Success", "Prescription created!");
      }
      navigation.goBack();
    } catch (err) {
      console.error("Save Prescription Error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Could not save prescription. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>{isEditing ? "Edit Prescription" : "Write Prescription"}</Text>
 
        <Text style={styles.label}>Medicines</Text>
        {medicines.map((med, i) => (
          <View key={i} style={styles.medBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.medNumber}>Medicine {i + 1}</Text>
              {medicines.length > 1 && (
                <TouchableOpacity onPress={() => removeMedicine(i)}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} placeholder="Medicine name" value={med.name} onChangeText={(v) => updateMedicine(i, "name", v)} />
            <TextInput style={styles.input} placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChangeText={(v) => updateMedicine(i, "dosage", v)} />
            <TextInput style={styles.input} placeholder="Duration (e.g. 5 days)" value={med.duration} onChangeText={(v) => updateMedicine(i, "duration", v)} />
          </View>
        ))}
 
        <TouchableOpacity style={styles.addBtn} onPress={addMedicine}>
          <Text style={styles.addBtnText}>+ Add Medicine</Text>
        </TouchableOpacity>
 
        <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
 
        <TouchableOpacity style={[styles.button, isEditing && { backgroundColor: "#1a73e8" }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isEditing ? "Update Prescription" : "Save Prescription"}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  form: { backgroundColor: "#fff", borderRadius: 14, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  title: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, marginBottom: 10, fontSize: 14, backgroundColor: "#f9f9f9"
  },
  medBox: { backgroundColor: "#f0f4ff", borderRadius: 10, padding: 12, marginBottom: 12 },
  medNumber: { fontSize: 13, fontWeight: "bold", color: "#1a73e8", marginBottom: 8 },
  addBtn: { borderWidth: 1.5, borderColor: "#1a73e8", borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 12 },
  addBtnText: { color: "#1a73e8", fontWeight: "600" },
  button: { backgroundColor: "#0f9d58", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 }
});
 