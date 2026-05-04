import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import api from "../../services/api";

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Slots Modal state
  const [slotsModalVisible, setSlotsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form Fields
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endTime, setEndTime] = useState("");
  const [endPeriod, setEndPeriod] = useState("AM");
  const [consultationFee, setConsultationFee] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docsRes = await api.get("/auth/doctors");
      setDoctors(docsRes.data);
      const schedRes = await api.get("/schedule");
      setSchedules(schedRes.data);
    } catch (err) {
      Alert.alert("Error", "Could not load data");
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return { time: "", period: "AM" };
    const parts = String(timeStr).split(" ");
    if (parts.length === 2) {
      return { time: parts[0], period: parts[1] };
    }
    return { time: String(timeStr), period: "AM" };
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setSelectedDoctor(null);
    setDate("");
    setStartTime("");
    setStartPeriod("AM");
    setEndTime("");
    setEndPeriod("AM");
    setConsultationFee("");
    setModalVisible(true);
  };

  const openEditModal = (sched) => {
    setIsEditing(true);
    setEditId(sched._id);
    setSelectedDoctor(sched.doctor);
    setDate(sched.date || "");
    
    const start = parseTime(sched.startTime);
    setStartTime(start.time);
    setStartPeriod(start.period);
    
    const end = parseTime(sched.endTime);
    setEndTime(end.time);
    setEndPeriod(end.period);
    
    setConsultationFee(String(sched.consultationFee || ""));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedDoctor || !date || !startTime || !endTime || consultationFee === "") {
      return Alert.alert("Error", "Please fill all fields");
    }

    // Validate Date (No past dates)
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(scheduleDate.getTime())) {
      return Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
    }
    if (scheduleDate < today) {
      return Alert.alert("Error", "Cannot create/update schedule for a past date.");
    }

    const doctorId = selectedDoctor._id || selectedDoctor;
    if (!doctorId) {
      return Alert.alert("Error", "No doctor selected");
    }

    setSaving(true);
    try {
      const payload = {
        doctorId,
        date,
        startTime: `${startTime} ${startPeriod}`,
        endTime: `${endTime} ${endPeriod}`,
        consultationFee: Number(consultationFee)
      };

      if (isEditing) {
        await api.put(`/schedule/${editId}`, payload);
        Alert.alert("Success", "Schedule updated");
      } else {
        await api.post("/schedule", payload);
        Alert.alert("Success", "Schedule created");
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.log("Save error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, hasBookings) => {
    if (hasBookings) {
      return Alert.alert("Locked", "Cannot delete this schedule because it has booked appointments. Please cancel the appointments first.");
    }
    Alert.alert("Delete", "Are you sure you want to delete this schedule?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/schedule/${id}`);
            Alert.alert("Success", "Deleted");
            fetchData();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Delete failed");
          }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7c3aed" />;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.createBtn} onPress={openCreateModal}>
        <Text style={styles.createBtnText}>+ Add New Schedule</Text>
      </TouchableOpacity>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item._id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No schedules found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.docName} numberOfLines={2}>Dr. {item.doctor?.name || "Unknown Doctor"}</Text>
                <Text style={styles.specialization}>{item.doctor?.specialization || "General Physician"}</Text>
              </View>
              <View style={styles.dateTag}>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
            
            <View style={styles.timeSection}>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>⏰ Availability</Text>
                <Text style={styles.timeValue}>{item.startTime} - {item.endTime}</Text>
              </View>
              <View style={styles.feeInfo}>
                <Text style={styles.feeLabel}>Consultation Fee</Text>
                <Text style={styles.feeValue}>Rs. {item.consultationFee}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.viewSlotsBtn} onPress={() => { setSelectedSchedule(item); setSlotsModalVisible(true); }}>
                <Text style={styles.viewSlotsText}>View Slots</Text>
              </TouchableOpacity>
              
              {item.slots?.some(s => s.isBooked) ? (
                <View style={[styles.editBtn, { opacity: 0.5, backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.editBtnText, { color: '#94a3b8' }]}>Locked</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.deleteBtn, item.slots?.some(s => s.isBooked) && { opacity: 0.5, backgroundColor: '#f1f5f9' }]} 
                onPress={() => handleDelete(item._id, item.slots?.some(s => s.isBooked))}
              >
                <Text style={[styles.deleteBtnText, item.slots?.some(s => s.isBooked) && { color: '#94a3b8' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.modalTitle}>{isEditing ? "Edit Schedule" : "New Schedule"}</Text>

                {!isEditing && (
                  <View style={{ marginBottom: 15 }}>
                    <Text style={styles.label}>Select Doctor</Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={doctors}
                      keyExtractor={(d) => d._id}
                      renderItem={({ item: d }) => (
                        <TouchableOpacity
                          style={[styles.docChip, (selectedDoctor?._id === d._id || selectedDoctor === d._id) && styles.docChipActive]}
                          onPress={() => setSelectedDoctor(d)}
                        >
                          <Text style={[styles.docChipText, (selectedDoctor?._id === d._id || selectedDoctor === d._id) && { color: "#fff" }]}>
                            {d.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                <Text style={styles.label}>Date</Text>
                <TextInput style={styles.input} placeholder="e.g. 2023-11-20" value={date} onChangeText={setDate} />
                
                <Text style={styles.label}>Start Time</Text>
                <View style={styles.timeInputRow}>
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="09:00" value={startTime} onChangeText={setStartTime} />
                  <View style={styles.periodToggle}>
                    <TouchableOpacity 
                      style={[styles.periodBtn, startPeriod === "AM" && styles.periodBtnActive]} 
                      onPress={() => setStartPeriod("AM")}
                    >
                      <Text style={[styles.periodBtnText, startPeriod === "AM" && styles.periodBtnTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.periodBtn, startPeriod === "PM" && styles.periodBtnActive]} 
                      onPress={() => setStartPeriod("PM")}
                    >
                      <Text style={[styles.periodBtnText, startPeriod === "PM" && styles.periodBtnTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>End Time</Text>
                <View style={styles.timeInputRow}>
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="05:00" value={endTime} onChangeText={setEndTime} />
                  <View style={styles.periodToggle}>
                    <TouchableOpacity 
                      style={[styles.periodBtn, endPeriod === "AM" && styles.periodBtnActive]} 
                      onPress={() => setEndPeriod("AM")}
                    >
                      <Text style={[styles.periodBtnText, endPeriod === "AM" && styles.periodBtnTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.periodBtn, endPeriod === "PM" && styles.periodBtnActive]} 
                      onPress={() => setEndPeriod("PM")}
                    >
                      <Text style={[styles.periodBtnText, endPeriod === "PM" && styles.periodBtnTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>Consultation Fee</Text>
                <TextInput style={styles.input} placeholder="Rs." keyboardType="numeric" value={consultationFee} onChangeText={setConsultationFee} />

                <View style={styles.row}>
                  <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                    <Text style={[styles.btnText, { color: '#64748b' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Slots Modal */}
      <Modal visible={slotsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.slotsModalOverlay}>
          <View style={styles.slotsModalContent}>
            <View style={styles.slotsHeader}>
              <Text style={styles.slotsModalTitle}>Available Slots</Text>
              <TouchableOpacity onPress={() => setSlotsModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedSchedule?.slots || []}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingVertical: 10 }}
              ListEmptyComponent={<Text style={styles.empty}>No slots available.</Text>}
              renderItem={({ item }) => (
                <View style={[styles.slotItem, item.isBooked && styles.slotBooked]}>
                  <Text style={[styles.slotTime, item.isBooked && { color: "#fff" }]}>
                    {item.startTime} - {item.endTime}
                  </Text>
                  <Text style={[styles.slotStatus, item.isBooked && { color: "#fca5a5" }]}>
                    {item.isBooked ? "Booked" : "Available"}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  createBtn: { backgroundColor: "#7c3aed", margin: 16, padding: 16, borderRadius: 12, alignItems: "center", elevation: 4, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
  
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, borderLeftWidth: 4, borderLeftColor: "#7c3aed" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  docName: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  specialization: { fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  dateTag: { backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dateText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  
  timeSection: { backgroundColor: "#fafafa", borderRadius: 12, padding: 12, marginBottom: 10 },
  timeInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  timeLabel: { fontSize: 13, color: "#64748b" },
  timeValue: { fontSize: 14, fontWeight: "700", color: "#334155" },
  feeInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 8 },
  feeLabel: { fontSize: 13, color: "#64748b" },
  feeValue: { fontSize: 15, fontWeight: "800", color: "#059669" },

  actionRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  viewSlotsBtn: { backgroundColor: "#e0e7ff", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 10 },
  viewSlotsText: { color: "#4f46e5", fontWeight: "700", fontSize: 13 },
  editBtn: { backgroundColor: "#f5f3ff", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 10 },
  editBtnText: { color: "#7c3aed", fontWeight: "700", fontSize: 13 },
  deleteBtn: { backgroundColor: "#fff1f2", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  deleteBtnText: { color: "#e11d48", fontWeight: "700", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24, elevation: 10, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 20, textAlign: "center", color: "#1e293b" },
  label: { fontSize: 14, color: "#475569", marginBottom: 6, fontWeight: "600", marginTop: 10 },
  docChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#f1f5f9", borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  docChipActive: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  docChipText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: "#f8fafc", fontSize: 15, color: "#1e293b" },
  
  timeInputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  periodToggle: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 10, padding: 4, marginLeft: 10 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  periodBtnActive: { backgroundColor: "#fff", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  periodBtnText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  periodBtnTextActive: { color: "#7c3aed" },

  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center", marginHorizontal: 6 },
  cancelBtn: { backgroundColor: "#f1f5f9" },
  saveBtn: { backgroundColor: "#7c3aed" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  empty: { textAlign: "center", marginTop: 50, color: "#94a3b8", fontSize: 16 },
  
  slotsModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  slotsModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%" },
  slotsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 10 },
  slotsModalTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  closeText: { color: "#e11d48", fontWeight: "bold" },
  slotItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f8fafc", padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  slotBooked: { backgroundColor: "#ef4444", borderColor: "#ef4444" },
  slotTime: { fontSize: 15, fontWeight: "600", color: "#334155" },
  slotStatus: { fontSize: 14, fontWeight: "700", color: "#10b981" }
});

