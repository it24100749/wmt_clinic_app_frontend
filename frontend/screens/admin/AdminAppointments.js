import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import api from "../../services/api";
 
const statusColor = { 
  pending: "#f59e0b", 
  confirmed: "#10b981", 
  cancelled: "#ef4444",
  cancel_requested: "#7c3aed"
};
 
export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.filter(a => a.status !== "cancelled"));
    } catch (err) {
      Alert.alert("Error", "Could not load appointments");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchAppointments(); }, []);
 
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      Alert.alert("Error", "Could not update");
    }
  };
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7c3aed" />;
 
  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No appointments.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.patient?.name}</Text>
              <Text style={[styles.status, { color: statusColor[item.status] }]}>
                {item.status === "cancel_requested" ? "Cancel Requested" : item.status}
              </Text>
            </View>
            <Text style={styles.info}>Doctor: {item.doctor?.name}</Text>
            <Text style={styles.info}>Time: {item.schedule?.date} at {item.slotTime || item.schedule?.startTime}</Text>
            <Text style={styles.info}>Fee: Rs. {item.consultationFee}</Text>
            
            {(item.status === "pending" || item.status === "cancel_requested") && (
              <View style={styles.actions}>
                {item.status === "pending" && (
                  <TouchableOpacity style={styles.confirmBtn} onPress={() => updateStatus(item._id, "confirmed")}>
                    <Text style={styles.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelBtn} onPress={() => updateStatus(item._id, "cancelled")}>
                  <Text style={styles.cancelText}>
                    {item.status === "cancel_requested" ? "Approve Cancellation" : "Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  name: { fontSize: 16, fontWeight: "bold", color: "#222" },
  status: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  info: { fontSize: 13, color: "#666", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  confirmBtn: { flex: 1, backgroundColor: "#dcfce7", borderRadius: 8, padding: 10, alignItems: "center" },
  confirmText: { color: "#10b981", fontWeight: "bold" },
  cancelBtn: { flex: 1, backgroundColor: "#fef2f2", borderRadius: 8, padding: 10, alignItems: "center" },
  cancelText: { color: "#ef4444", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});
 