import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, TextInput 
} from "react-native";
import api from "../../services/api";
import { Feather } from "@expo/vector-icons";
 
const statusColor = { open: "#ef4444", "in-progress": "#f59e0b", closed: "#10b981" };
 
export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
 
  const fetchTickets = async () => {
    try {
      const res = await api.get("/support/tickets");
      setTickets(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load tickets");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchTickets(); }, []);
 
  const updateTicket = async (id, status, response = null) => {
    try {
      const payload = { status };
      if (response !== null) payload.response = response;
      
      await api.put(`/support/tickets/${id}`, payload);
      setRespondingTo(null);
      setResponseText("");
      fetchTickets();
      Alert.alert("Success", "Ticket updated successfully");
    } catch (err) {
      Alert.alert("Error", "Could not update ticket");
    }
  };
 
  const deleteTicket = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this ticket?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/support/tickets/${id}`);
              fetchTickets();
            } catch (err) {
              Alert.alert("Error", "Could not delete ticket");
            }
          }
        }
      ]
    );
  };
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7c3aed" />;
 
  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No tickets.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.user}>{item.user?.name}</Text>
              <Text style={[styles.status, { color: statusColor[item.status] }]}>{item.status}</Text>
            </View>
            <Text style={styles.issue}>{item.issue}</Text>
            
            {item.response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Admin Response:</Text>
                <Text style={styles.responseText}>{item.response}</Text>
              </View>
            )}

            {respondingTo === item._id ? (
              <View style={styles.replyBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your response..."
                  value={responseText}
                  onChangeText={setResponseText}
                  multiline
                />
                <View style={styles.replyActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setRespondingTo(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.sendBtn} 
                    onPress={() => updateTicket(item._id, item.status, responseText)}
                  >
                    <Text style={styles.sendText}>Send Response</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actions}>
                {item.status === "open" && (
                  <TouchableOpacity style={styles.progressBtn} onPress={() => updateTicket(item._id, "in-progress")}>
                    <Text style={styles.progressText}>In Progress</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.replyBtn} onPress={() => {
                  setRespondingTo(item._id);
                  setResponseText(item.response || "");
                }}>
                  <Text style={styles.replyBtnText}>{item.response ? "Edit Response" : "Reply"}</Text>
                </TouchableOpacity>
                {item.status !== "closed" && (
                  <TouchableOpacity style={styles.closeBtn} onPress={() => updateTicket(item._id, "closed")}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTicket(item._id)}>
                  <Feather name="trash-2" size={20} color="#ef4444" />
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
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  user: { fontSize: 15, fontWeight: "bold", color: "#222" },
  status: { fontSize: 13, fontWeight: "600" },
  issue: { fontSize: 13, color: "#555", marginTop: 4, marginBottom: 12 },
  responseContainer: { backgroundColor: "#f8f9fa", padding: 10, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: "#7c3aed" },
  responseLabel: { fontSize: 11, fontWeight: "bold", color: "#7c3aed", marginBottom: 2 },
  responseText: { fontSize: 13, color: "#333" },
  replyBox: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: "top", marginBottom: 10 },
  replyActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { padding: 8 },
  cancelText: { color: "#666", fontWeight: "600" },
  sendBtn: { backgroundColor: "#7c3aed", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  sendText: { color: "#fff", fontWeight: "bold" },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  progressBtn: { flex: 1, backgroundColor: "#fef9c3", borderRadius: 8, padding: 10, alignItems: "center" },
  progressText: { color: "#f59e0b", fontWeight: "bold", fontSize: 12 },
  replyBtn: { flex: 1, backgroundColor: "#e0e7ff", borderRadius: 8, padding: 10, alignItems: "center" },
  replyBtnText: { color: "#4f46e5", fontWeight: "bold", fontSize: 12 },
  closeBtn: { flex: 1, backgroundColor: "#dcfce7", borderRadius: 8, padding: 10, alignItems: "center" },
  closeText: { color: "#10b981", fontWeight: "bold", fontSize: 12 },
  deleteBtn: { padding: 5 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});