import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from "react-native";
import api from "../../services/api";
 
export default function CreateEMR({ route, navigation }) {
  const { appointmentId, patientId, emrData } = route.params || {};
  const isEditing = !!emrData;

  const [diagnosis, setDiagnosis] = useState(emrData?.diagnosis || "");
  const [symptoms, setSymptoms] = useState(emrData?.symptoms || "");
  const [treatment, setTreatment] = useState(emrData?.treatment || "");
  const [notes, setNotes] = useState(emrData?.notes || "");
  const [loading, setLoading] = useState(false);
 
  const submit = async () => {
    if (!appointmentId && !isEditing) return Alert.alert("Error", "Missing data");
    if (!diagnosis) return Alert.alert("Error", "Diagnosis is required");
    
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/emr/${emrData._id}`, { diagnosis, symptoms, treatment, notes });
        Alert.alert("Success", "EMR updated successfully!");
      } else {
        await api.post("/emr", { appointment: appointmentId, patient: patientId, diagnosis, symptoms, treatment, notes });
        Alert.alert("Success", "EMR created successfully!");
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not save EMR");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>{isEditing ? "Edit Medical Record" : "Create Medical Record"}</Text>
        <TextInput style={styles.input} placeholder="Diagnosis *" value={diagnosis} onChangeText={setDiagnosis} multiline />
        <TextInput style={styles.input} placeholder="Symptoms" value={symptoms} onChangeText={setSymptoms} multiline />
        <TextInput style={styles.input} placeholder="Treatment" value={treatment} onChangeText={setTreatment} multiline />
        <TextInput style={styles.input} placeholder="Additional Notes" value={notes} onChangeText={setNotes} multiline />
        <TouchableOpacity style={[styles.button, isEditing && { backgroundColor: "#1a73e8" }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isEditing ? "Update EMR" : "Save EMR"}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  form: { backgroundColor: "#fff", borderRadius: 14, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  title: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, marginBottom: 12, fontSize: 14,
    backgroundColor: "#f9f9f9", minHeight: 48
  },
  button: { backgroundColor: "#0f9d58", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 }
});
 