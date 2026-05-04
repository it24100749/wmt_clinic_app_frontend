import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from "react-native";
import api from "../../services/api";

export default function MedicalHistory({ route, navigation }) {
  const { patientId, patientName } = route.params || {};
  const [emrs, setEmrs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("EMR");

  const fetchData = async () => {
    setLoading(true);
    try {
      const emrRes = await api.get(`/emr/${patientId}`);
      setEmrs(emrRes.data);
      const preRes = await api.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(preRes.data);
    } catch (err) {
      Alert.alert("Error", "Could not load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const deleteEMR = async (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/emr/${id}`);
            fetchData();
          } catch (err) { Alert.alert("Error", "Delete failed"); }
      }}
    ]);
  };

  const deletePrescription = async (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/prescriptions/${id}`);
            fetchData();
          } catch (err) { Alert.alert("Error", "Delete failed"); }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4f46e5" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.patientName}>{patientName}'s History</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === "EMR" && styles.activeTab]} onPress={() => setActiveTab("EMR")}>
            <Text style={[styles.tabText, activeTab === "EMR" && styles.activeTabText]}>Records (EMR)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "Prescription" && styles.activeTab]} onPress={() => setActiveTab("Prescription")}>
            <Text style={[styles.tabText, activeTab === "Prescription" && styles.activeTabText]}>Prescriptions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "EMR" ? (
        <FlatList
          data={emrs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.doctorName}>Dr. {item.doctor?.name || "Unknown"}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => navigation.navigate("CreateEMR", { emrData: item, patientId })}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteEMR(item._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.label}>Diagnosis:</Text>
              <Text style={styles.value}>{item.diagnosis}</Text>
              {item.symptoms && <><Text style={styles.label}>Symptoms:</Text><Text style={styles.value}>{item.symptoms}</Text></>}
              {item.treatment && <><Text style={styles.label}>Treatment:</Text><Text style={styles.value}>{item.treatment}</Text></>}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No medical records found.</Text>}
        />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.doctorName}>Dr. {item.doctor?.name || "Unknown"}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => navigation.navigate("CreatePrescription", { prescriptionData: item, patientId })}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletePrescription(item._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.status, item.status === 'dispensed' ? styles.dispensed : styles.pending]}>{item.status}</Text>
              <Text style={styles.label}>Medicines:</Text>
              {item.medicines.map((m, i) => (
                <Text key={i} style={styles.value}>• {m.name} ({m.dosage}) - {m.duration}</Text>
              ))}
              {item.notes && <><Text style={styles.label}>Notes:</Text><Text style={styles.value}>{item.notes}</Text></>}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No prescriptions found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#fff", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  patientName: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  tabs: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#4f46e5" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 8 },
  date: { fontSize: 13, fontWeight: "bold", color: "#64748b" },
  doctorName: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 15 },
  editText: { color: "#4f46e5", fontWeight: "bold", fontSize: 13 },
  deleteText: { color: "#ef4444", fontWeight: "bold", fontSize: 13 },
  label: { fontSize: 12, fontWeight: "bold", color: "#94a3b8", marginTop: 8, textTransform: "uppercase" },
  value: { fontSize: 15, color: "#334155", marginTop: 2 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  pending: { backgroundColor: '#fef3c7', color: '#d97706' },
  dispensed: { backgroundColor: '#dcfce7', color: '#16a34a' },
  empty: { textAlign: "center", marginTop: 40, color: "#94a3b8" }
});
