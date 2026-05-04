import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView
} from "react-native";
import api from "../../services/api";
 
export default function AdminBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentId, setAppointmentId] = useState("");
  const [generating, setGenerating] = useState(false);
 
  const fetchBills = async () => {
    try {
      const res = await api.get("/billing");
      setBills(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load bills");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchBills(); }, []);
 
  const generateBill = async () => {
    if (!appointmentId) return Alert.alert("Error", "Enter appointment ID");
    setGenerating(true);
    try {
      await api.post("/billing/generate", { appointmentId });
      Alert.alert("Success", "Bill generated!");
      setAppointmentId("");
      fetchBills();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not generate bill");
    } finally {
      setGenerating(false);
    }
  };
 
  const markPaid = async (id) => {
    try {
      await api.put(`/billing/${id}`, { status: "paid" });
      fetchBills();
    } catch (err) {
      Alert.alert("Error", "Could not update");
    }
  };
 
  const calculateSummary = () => {
    const total = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const paid = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const unpaid = total - paid;
    return { total, paid, unpaid };
  };

  const summary = calculateSummary();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={styles.summaryValue}>Rs. {summary.total}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: "#10b981", fontSize: 16 }]}>Rs. {summary.paid}</Text>
          </View>
          <View style={[styles.summaryItem, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Unpaid</Text>
            <Text style={[styles.summaryValue, { color: "#f59e0b", fontSize: 16 }]}>Rs. {summary.unpaid}</Text>
          </View>
        </View>
      </View>


 
      <Text style={styles.sectionTitle}>All Bills</Text>
      {loading ? <ActivityIndicator color="#7c3aed" /> :
        bills.map((bill) => (
          <View key={bill._id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.patient}>{bill.patient?.name}</Text>
              <Text style={[styles.status, { color: bill.status === "paid" ? "#10b981" : "#f59e0b" }]}>
                {bill.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.info}>Total: Rs. {bill.totalAmount}</Text>
            <Text style={styles.info}>Consultation: Rs. {bill.consultationFee} | Meds: Rs. {bill.medicationTotal}</Text>
            {bill.status === "unpaid" && (
              <TouchableOpacity style={styles.paidBtn} onPress={() => markPaid(bill._id)}>
                <Text style={styles.paidText}>Mark as Paid</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      }
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  summaryContainer: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 20 },
  summaryItem: { marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryValue: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 4 },
  summaryRow: { flexDirection: "row", marginTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 15 },
  form: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 14, backgroundColor: "#f9f9f9" },
  button: { backgroundColor: "#7c3aed", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  patient: { fontSize: 15, fontWeight: "bold", color: "#222" },
  status: { fontSize: 13, fontWeight: "bold" },
  info: { fontSize: 13, color: "#666", marginTop: 2 },
  paidBtn: { marginTop: 10, backgroundColor: "#f0fdf4", borderRadius: 8, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#86efac" },
  paidText: { color: "#10b981", fontWeight: "bold" }
});
 