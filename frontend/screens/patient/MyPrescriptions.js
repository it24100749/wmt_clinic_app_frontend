import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import api from "../../services/api";
 
export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    api.get("/prescriptions/my")
      .then((res) => setPrescriptions(res.data))
      .catch(() => Alert.alert("Error", "Could not load prescriptions"))
      .finally(() => setLoading(false));
  }, []);
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;
 
  return (
    <View style={styles.container}>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No prescriptions found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.doctor}>Dr. {item.doctor?.name}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
            <Text style={styles.medTitle}>Medicines:</Text>
            {item.medicines.map((med, i) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>💊 {med.name}</Text>
                <Text style={styles.medDetail}>{med.dosage} — {med.duration}</Text>
                <Text style={styles.medPrice}>Rs. {med.price}</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  doctor: { fontSize: 16, fontWeight: "bold", color: "#222" },
  date: { fontSize: 12, color: "#aaa", marginTop: 2, marginBottom: 8 },
  notes: { fontSize: 13, color: "#555", marginBottom: 8 },
  medTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  medRow: { backgroundColor: "#f5f7fa", borderRadius: 8, padding: 10, marginBottom: 6 },
  medName: { fontSize: 14, fontWeight: "600", color: "#222" },
  medDetail: { fontSize: 12, color: "#666", marginTop: 2 },
  medPrice: { fontSize: 12, color: "#1a73e8", marginTop: 2 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});
 