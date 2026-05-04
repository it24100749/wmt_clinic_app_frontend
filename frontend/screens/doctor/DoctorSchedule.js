import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView
} from "react-native";
import api from "../../services/api";
 
export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
 
  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedule/my");
      setSchedules(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load schedules");
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leave/my");
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { 
    fetchSchedules();
    fetchLeaves(); 
  }, []);
 
  const requestLeave = async () => {
    if (!date || !reason) return Alert.alert("Error", "Fill all fields");
    setSaving(true);
    try {
      await api.post("/leave", { date, reason });
      setDate(""); setReason("");
      fetchLeaves();
      Alert.alert("Success", "Leave request submitted");
    } catch (err) {
      Alert.alert("Error", "Could not request leave");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>My Working Hours</Text>
      {loading ? <ActivityIndicator color="#0f9d58" /> :
        schedules.length === 0 ? <Text style={styles.empty}>No schedules assigned by admin yet.</Text> :
        schedules.map((s) => (
          <View key={s._id} style={styles.card}>
            <Text style={styles.day}>{s.date}</Text>
            <Text style={styles.time}>{s.startTime} — {s.endTime}</Text>
            <Text style={styles.fee}>Fee: Rs. {s.consultationFee}</Text>
          </View>
        ))
      }

      <View style={styles.form}>
        <Text style={styles.formTitle}>Request Time Off</Text>
        <TextInput style={styles.input} placeholder="Date (e.g. YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Reason" value={reason} onChangeText={setReason} multiline />
        <TouchableOpacity style={styles.button} onPress={requestLeave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Request</Text>}
        </TouchableOpacity>
      </View>
 
      <Text style={styles.sectionTitle}>My Leave Requests</Text>
      {leaves.map((l) => (
        <View key={l._id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: l.status === "approved" ? "#10b981" : l.status === "rejected" ? "#ef4444" : "#f59e0b" }]}>
          <Text style={styles.day}>{new Date(l.date).toDateString()}</Text>
          <Text style={styles.time}>{l.reason}</Text>
          <Text style={{ marginTop: 5, fontWeight: "bold", textTransform: "capitalize", color: l.status === "approved" ? "#10b981" : l.status === "rejected" ? "#ef4444" : "#f59e0b" }}>Status: {l.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  form: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 20, marginTop: 10, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  formTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, marginBottom: 10, fontSize: 14, backgroundColor: "#f9f9f9"
  },
  button: { backgroundColor: "#0f9d58", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, elevation: 1
  },
  day: { fontSize: 15, fontWeight: "bold", color: "#222" },
  time: { fontSize: 13, color: "#666", marginTop: 3 },
  fee: { fontSize: 13, color: "#0f9d58", marginTop: 3 },
  empty: { textAlign: "center", color: "#888", marginBottom: 20 }
});
 