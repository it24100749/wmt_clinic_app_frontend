import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import api from "../../services/api";
import { Feather } from "@expo/vector-icons";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const res = await api.get("/support/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this feedback?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/support/feedback/${id}`);
              setFeedbacks(feedbacks.filter(f => f._id !== id));
            } catch (err) {
              Alert.alert("Error", "Could not delete feedback");
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
        data={feedbacks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No feedback entries.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.user}>{item.user?.name || "Unknown User"}</Text>
                <Text style={styles.email}>{item.user?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteFeedback(item._id)}>
                <Feather name="trash-2" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  user: { fontSize: 15, fontWeight: "bold", color: "#222" },
  email: { fontSize: 12, color: "#888" },
  message: { fontSize: 14, color: "#444", marginBottom: 10 },
  date: { fontSize: 11, color: "#aaa", textAlign: "right" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});
