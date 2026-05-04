import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from "react-native";
import api from "../../services/api";

const statusColor = { open: "#ef4444", "in-progress": "#f59e0b", closed: "#10b981" };

export default function Support() {
  const [feedback, setFeedback] = useState("");
  const [issue, setIssue] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const fetchMyTickets = async () => {
    try {
      const res = await api.get("/support/my-tickets");
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const submitFeedback = async () => {
    if (!feedback) return Alert.alert("Error", "Please enter your feedback");
    setLoadingFeedback(true);
    try {
      await api.post("/support/feedback", { message: feedback });
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      setFeedback("");
    } catch (err) {
      Alert.alert("Error", "Could not submit feedback");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const submitTicket = async () => {
    if (!issue) return Alert.alert("Error", "Please describe your issue");
    setLoadingTicket(true);
    try {
      await api.post("/support/tickets", { issue });
      Alert.alert("Ticket Created", "Support team will get back to you.");
      setIssue("");
      fetchMyTickets();
    } catch (err) {
      Alert.alert("Error", "Could not create ticket");
    } finally {
      setLoadingTicket(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Submit Feedback</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your feedback..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={submitFeedback} disabled={loadingFeedback}>
          {loadingFeedback ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Feedback</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎫 Create Support Ticket</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe your issue..."
          value={issue}
          onChangeText={setIssue}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: "#6366f1" }]} onPress={submitTicket} disabled={loadingTicket}>
          {loadingTicket ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Ticket</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>📅 My Tickets</Text>
        {loadingList ? (
          <ActivityIndicator color="#7c3aed" />
        ) : tickets.length === 0 ? (
          <Text style={styles.emptyText}>No tickets created yet.</Text>
        ) : (
          tickets.map((item) => (
            <View key={item._id} style={styles.ticketItem}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={[styles.statusText, { color: statusColor[item.status] }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.ticketIssue}>{item.issue}</Text>
              {item.response && (
                <View style={styles.adminResponse}>
                  <Text style={styles.adminResponseLabel}>Admin Response:</Text>
                  <Text style={styles.adminResponseText}>{item.response}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  section: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, fontSize: 14, backgroundColor: "#f9f9f9",
    textAlignVertical: "top", minHeight: 100, marginBottom: 12
  },
  button: {
    backgroundColor: "#1a73e8", padding: 14, borderRadius: 10, alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyText: { textAlign: "center", color: "#888", marginVertical: 10 },
  ticketItem: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee"
  },
  ticketHeader: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 4
  },
  ticketDate: { fontSize: 12, color: "#888" },
  statusText: { fontSize: 11, fontWeight: "bold" },
  ticketIssue: { fontSize: 14, color: "#444" },
  adminResponse: {
    marginTop: 8, backgroundColor: "#f0f7ff", padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#1a73e8"
  },
  adminResponseLabel: { fontSize: 11, fontWeight: "bold", color: "#1a73e8", marginBottom: 2 },
  adminResponseText: { fontSize: 13, color: "#333" }
});