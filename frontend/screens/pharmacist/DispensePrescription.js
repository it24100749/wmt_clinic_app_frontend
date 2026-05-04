import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import api from "../../services/api";

export default function DispensePrescription({ route, navigation }) {
  const { prescription } = route.params;
  const [medicines, setMedicines] = useState(
    prescription.medicines.map((m) => ({ ...m, price: m.price ? String(m.price) : "" }))
  );
  const [loading, setLoading] = useState(false);

  const updatePrice = (index, value) => {
    const updated = [...medicines];
    updated[index].price = value;
    setMedicines(updated);
  };

  const handleDispense = async () => {
    // Validate that all prices are entered
    for (let med of medicines) {
      if (!med.price || isNaN(med.price)) {
        return Alert.alert("Error", `Please enter a valid price for ${med.name}`);
      }
    }

    setLoading(true);
    try {
      const formattedMeds = medicines.map((m) => ({ ...m, price: Number(m.price) }));
      await api.put(`/prescriptions/${prescription._id}/dispense`, { medicines: formattedMeds });
      Alert.alert("Success", "Prescription dispensed and billed successfully!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not dispense prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Dispense Prescription</Text>
        <Text style={styles.infoText}>Patient: {prescription.patient?.name}</Text>
        <Text style={styles.infoText}>Doctor: Dr. {prescription.doctor?.name}</Text>
        {prescription.notes ? <Text style={styles.notesText}>Notes: {prescription.notes}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Set Medicine Prices</Text>
      {medicines.map((med, i) => (
        <View key={med._id || i} style={styles.medCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.medName}>💊 {med.name}</Text>
            <Text style={styles.medDetail}>{med.dosage} for {med.duration}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>Rs.</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={med.price}
              onChangeText={(val) => updatePrice(i, val)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleDispense} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm & Dispense</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  headerCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  infoText: { fontSize: 15, color: "#555", marginBottom: 4 },
  notesText: { fontSize: 14, color: "#7c3aed", marginTop: 8, fontStyle: "italic" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  medCard: {
    backgroundColor: "#fff", borderRadius: 10, padding: 14,
    marginBottom: 10, flexDirection: "row", alignItems: "center"
  },
  medName: { fontSize: 15, fontWeight: "bold", color: "#222" },
  medDetail: { fontSize: 13, color: "#666", marginTop: 4 },
  priceContainer: { flexDirection: "row", alignItems: "center", width: 100 },
  currency: { fontSize: 15, fontWeight: "bold", color: "#555", marginRight: 5 },
  input: {
    flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8,
    padding: 10, fontSize: 15, backgroundColor: "#f9f9f9", textAlign: "center"
  },
  button: {
    backgroundColor: "#f59e0b", padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 10, marginBottom: 40
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
