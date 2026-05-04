import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Modal, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";

const roleColor = { admin: "#7c3aed", doctor: "#0f9d58", patient: "#1a73e8", pharmacist: "#f59e0b" };

export default function AllUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", specialization: "" });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("AllUsers Fetch Error:", err.response ? err.response.data : err.message);
      Alert.alert("Error", "Could not load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const openEditModal = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || ""
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editForm.name || !editForm.email || !editForm.role) {
      return Alert.alert("Error", "Please fill required fields");
    }
    try {
      await api.put(`/auth/users/${editingUser}`, editForm);
      Alert.alert("Success", "User updated successfully");
      setEditModalVisible(false);
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = (user) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}?\n\nIf this is a doctor, all their schedules will be deleted and patients' appointments will be cancelled!`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/auth/users/${user._id}`);
              Alert.alert("Deleted", "User deleted successfully");
              fetchUsers();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete user");
            }
          }
        }
      ]
    );
  };
 
  if (loading && !refreshing) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7c3aed" />;
 
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreateUser")}
      >
        <Text style={styles.createBtnText}>+ Create New User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No users found. Pull down to refresh.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={[styles.role, { color: roleColor[item.role] || "#333" }]}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Role (admin/doctor/patient/pharmacist)"
              value={editForm.role}
              onChangeText={(text) => setEditForm({ ...editForm, role: text.toLowerCase() })}
            />
            
            {editForm.role === "doctor" && (
              <TextInput
                style={styles.input}
                placeholder="Specialization"
                value={editForm.specialization}
                onChangeText={(text) => setEditForm({ ...editForm, specialization: text })}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleUpdate}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  createBtn: {
    backgroundColor: "#7c3aed",
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: "#7c3aed",
    justifyContent: "center", alignItems: "center", marginRight: 14
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "bold", color: "#222" },
  email: { fontSize: 13, color: "#888", marginTop: 2 },
  role: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  actions: { flexDirection: "row", alignItems: "center" },
  editBtn: { backgroundColor: "#e2e8f0", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  editBtnText: { color: "#334155", fontSize: 12, fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#fee2e2", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#fff", borderRadius: 12, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  cancelBtn: { backgroundColor: "#f1f5f9", marginRight: 10 },
  saveBtn: { backgroundColor: "#7c3aed" },
  cancelBtnText: { color: "#475569", fontWeight: "bold" },
  saveBtnText: { color: "#fff", fontWeight: "bold" }
});
 