import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import api from "../../services/api";

const statusColor = { 
  pending: "#f59e0b", 
  confirmed: "#10b981", 
  cancelled: "#ef4444", 
  cancel_requested: "#6366f1" 
};

const statusBgColor = {
  pending: "#fffbeb",
  confirmed: "#f0fdf4",
  cancelled: "#fef2f2",
  cancel_requested: "#f5f3ff"
};

export default function MyAppointments({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.filter(a => a.status !== "cancelled"));
    } catch (err) {
      Alert.alert("Error", "Could not load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const cancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/cancel/${id}`);
      fetchAppointments();
    } catch (err) {
      Alert.alert("Error", "Could not cancel appointment");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No appointments found.</Text>}
        renderItem={({ item }) => {
          const status = item.status || "pending";
          return (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.doctor} numberOfLines={1}>Dr. {item.doctor?.name || "Unknown"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBgColor[status] || "#f1f5f9" }]}>
                  <Text style={[styles.statusText, { color: statusColor[status] || "#64748b" }]}>
                    {status.replace("_", " ")}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>📧 {item.doctor?.email || "N/A"}</Text>
                <Text style={styles.infoText}>💰 Fee: Rs. {item.consultationFee}</Text>
                <Text style={styles.infoText}>📅 Date: {item.schedule?.date || "N/A"}</Text>
                <Text style={styles.infoText}>⏰ Time: {item.slotTime || item.schedule?.startTime || "N/A"}</Text>
              </View>

              {status === "cancel_requested" ? (
                <View style={styles.requestBadge}>
                  <Text style={styles.requestText}>Cancellation Requested</Text>
                </View>
              ) : status === "pending" ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rescheduleBtn}
                    onPress={() => navigation.navigate("RescheduleAppointment", { appointment: item })}
                  >
                    <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      Alert.alert(
                        "Request Cancellation",
                        "Are you sure you want to request the admin to cancel this appointment?",
                        [
                          { text: "No" },
                          { text: "Yes", onPress: () => cancelAppointment(item._id) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Request to Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : status === "confirmed" && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    Alert.alert(
                      "Request Cancellation",
                      "Are you sure you want to request the admin to cancel this appointment?",
                      [
                        { text: "No" },
                        { text: "Yes", onPress: () => cancelAppointment(item._id) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.cancelBtnText}>Request to Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  card: {
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 16, 
    shadowColor: "#000", 
    shadowOpacity: 0.06, 
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 12,
  },
  doctor: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1e293b",
    flex: 1,
    marginRight: 10
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  infoText: { 
    fontSize: 13, 
    color: "#64748b", 
    marginBottom: 4,
    fontWeight: "500"
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10
  },
  rescheduleBtn: {
    flex: 1,
    backgroundColor: "#eef3ff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c7d7f9"
  },
  rescheduleBtnText: { color: "#1a73e8", fontWeight: "bold", fontSize: 14 },
  cancelBtn: {
    flex: 1,
    marginTop: 0,
    backgroundColor: "#fff1f2",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecdd3"
  },
  cancelBtnText: { color: "#e11d48", fontWeight: "bold", fontSize: 14 },
  requestBadge: { 
    marginTop: 15, 
    backgroundColor: "#fffbeb", 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#fef3c7" 
  },
  requestText: { color: "#d97706", fontSize: 13, fontWeight: "bold", textAlign: "center" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 60, fontSize: 15 }
});