import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import api from "../../services/api";
 
const statusColor = { pending: "#f59e0b", confirmed: "#10b981", cancelled: "#ef4444" };
 
export default function DoctorAppointments({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/doctor");
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
      Alert.alert("Error", "Could not update status");
    }
  };

  const handleEMR = async (appointmentId, patientId) => {
    try {
      const res = await api.get(`/emr/appointment/${appointmentId}`);
      if (res.data) {
        navigation.navigate("CreateEMR", { emrData: res.data, appointmentId, patientId });
      } else {
        navigation.navigate("CreateEMR", { appointmentId, patientId });
      }
    } catch (err) {
      navigation.navigate("CreateEMR", { appointmentId, patientId });
    }
  };

  const handlePrescription = async (appointmentId, patientId) => {
    try {
      const res = await api.get(`/prescriptions/appointment/${appointmentId}`);
      if (res.data) {
        navigation.navigate("CreatePrescription", { prescriptionData: res.data, appointmentId, patientId });
      } else {
        navigation.navigate("CreatePrescription", { appointmentId, patientId });
      }
    } catch (err) {
      navigation.navigate("CreatePrescription", { appointmentId, patientId });
    }
  };
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0f9d58" />;
 
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
              <Text style={[styles.status, { color: statusColor[item.status] }]}>{item.status}</Text>
            </View>
            <Text style={styles.info}>{item.patient?.email}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>📅 {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.timeLabel}>⏰ {item.slotTime || item.schedule?.startTime}</Text>
            </View>
            {item.status === "confirmed" && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEMR(item._id, item.patient?._id)}>
                  <Text style={styles.actionText}>EMR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handlePrescription(item._id, item.patient?._id)}>
                  <Text style={styles.actionText}>Prescription</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#f1f5f9" }]} onPress={() => navigation.navigate("MedicalHistory", { patientId: item.patient?._id, patientName: item.patient?.name })}>
                  <Text style={[styles.actionText, { color: "#64748b" }]}>History</Text>
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
  timeRow: { flexDirection: "row", gap: 15, marginTop: 6, backgroundColor: "#f8fafc", padding: 8, borderRadius: 8 },
  timeLabel: { fontSize: 12, fontWeight: "600", color: "#475569" },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  confirmBtn: { flex: 1, backgroundColor: "#dcfce7", borderRadius: 8, padding: 10, alignItems: "center" },
  confirmText: { color: "#10b981", fontWeight: "bold" },
  cancelBtn: { flex: 1, backgroundColor: "#fef2f2", borderRadius: 8, padding: 10, alignItems: "center" },
  cancelText: { color: "#ef4444", fontWeight: "bold" },
  actionBtn: { flex: 1, backgroundColor: "#e0e7ff", borderRadius: 8, padding: 10, alignItems: "center" },
  actionText: { color: "#4f46e5", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});
 