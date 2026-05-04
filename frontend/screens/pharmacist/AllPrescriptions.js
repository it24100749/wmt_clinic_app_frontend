import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import api from "../../services/api";
 
export default function AllPrescriptions({ navigation }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    api.get("/prescriptions")
      .then((res) => setPrescriptions(res.data))
      .catch(() => Alert.alert("Error", "Could not load prescriptions"))
      .finally(() => setLoading(false));
  }, []);
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#f59e0b" />;
 
  return (
    <View style={styles.container}>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No prescriptions found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.patient}>{item.patient?.name}</Text>
              <Text style={styles.doctor}>Dr. {item.doctor?.name}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: item.status === "dispensed" ? "#10b981" : "#f59e0b" }]}>
              {item.status ? item.status.toUpperCase() : "PENDING"}
            </Text>
            {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
            <Text style={styles.medTitle}>Medicines:</Text>
            {item.medicines.map((med, i) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>💊 {med.name}</Text>
                <Text style={styles.medDetail}>{med.dosage} — {med.duration} {med.price ? `— Rs. ${med.price}` : ""}</Text>
              </View>
            ))}
            {(!item.status || item.status === "pending") && (
              <TouchableOpacity
                style={styles.dispenseBtn}
                onPress={() => navigation.navigate("DispensePrescription", { prescription: item })}
              >
                <Text style={styles.dispenseBtnText}>Dispense</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  patient: { fontSize: 15, fontWeight: "bold", color: "#222" },
  doctor: { fontSize: 13, color: "#888" },
  date: { fontSize: 12, color: "#aaa", marginBottom: 4 },
  status: { fontSize: 12, fontWeight: "bold", marginBottom: 8 },
  notes: { fontSize: 13, color: "#555", marginBottom: 8 },
  medTitle: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  medRow: { backgroundColor: "#f5f7fa", borderRadius: 8, padding: 8, marginBottom: 4 },
  medName: { fontSize: 13, fontWeight: "600", color: "#222" },
  medDetail: { fontSize: 12, color: "#666", marginTop: 2 },
  dispenseBtn: { backgroundColor: "#f59e0b", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  dispenseBtnText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});
 