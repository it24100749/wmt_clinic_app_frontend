import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from "react-native";
import api from "../../services/api";

export default function RescheduleAppointment({ navigation, route }) {
  const { appointment } = route.params;
  const doctorId = appointment.doctor?._id || appointment.doctor;
  const doctorName = appointment.doctor?.name || "Doctor";

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(true);

  useEffect(() => {
    api.get(`/schedule/${doctorId}`)
      .then(res => setSchedules(res.data))
      .catch(() => Alert.alert("Error", "Could not load schedules"))
      .finally(() => setFetchingSchedules(false));
  }, []);

  const handleReschedule = async () => {
    if (!selectedSchedule) return Alert.alert("Error", "Please select a schedule");
    if (!selectedSlot) return Alert.alert("Error", "Please select a time slot");

    setLoading(true);
    try {
      await api.put(`/appointments/reschedule/${appointment._id}`, {
        scheduleId: selectedSchedule._id,
        date: selectedSchedule.date,
        slotTime: selectedSlot.startTime
      });
      Alert.alert("Success", "Appointment rescheduled successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Reschedule failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSchedules) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Rescheduling for</Text>
        <Text style={styles.infoDoctor}>Dr. {doctorName}</Text>
        <Text style={styles.infoNote}>Current slot: {appointment.slotTime} — select a new schedule below</Text>
      </View>

      <Text style={styles.heading}>Select a New Schedule</Text>
      {schedules.length === 0 ? (
        <Text style={styles.empty}>No available schedules for this doctor.</Text>
      ) : (
        schedules.map(s => (
          <TouchableOpacity
            key={s._id}
            style={[styles.card, selectedSchedule?._id === s._id && styles.selected]}
            onPress={() => { setSelectedSchedule(s); setSelectedSlot(null); }}
          >
            <Text style={styles.cardTitle}>{s.date} — {s.startTime} to {s.endTime}</Text>
            <Text style={styles.cardFee}>Fee: Rs. {s.consultationFee}</Text>
          </TouchableOpacity>
        ))
      )}

      {selectedSchedule && selectedSchedule.slots && selectedSchedule.slots.length > 0 && (
        <>
          <Text style={styles.heading}>Select a Time Slot</Text>
          <View style={styles.slotGrid}>
            {selectedSchedule.slots.map((slot, index) => {
              if (slot.isBooked) return null;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.slotCard, selectedSlot?.startTime === slot.startTime && styles.slotSelected]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlot?.startTime === slot.startTime && { color: "#fff" }]}>
                    {slot.startTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {selectedSlot && (
        <TouchableOpacity style={styles.button} onPress={handleReschedule} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Reschedule</Text>}
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  infoCard: {
    backgroundColor: "#eef3ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#c7d7f9"
  },
  infoLabel: { fontSize: 12, color: "#6b7aad", fontWeight: "600", marginBottom: 4 },
  infoDoctor: { fontSize: 17, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  infoNote: { fontSize: 12, color: "#64748b" },
  heading: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 8, marginBottom: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: "#eee",
    shadowColor: "#000", shadowOpacity: 0.04, elevation: 1
  },
  selected: { borderColor: "#1a73e8", backgroundColor: "#eef3ff" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#222" },
  cardFee: { fontSize: 12, color: "#64748b", marginTop: 4 },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  slotCard: {
    backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
    margin: 5, borderWidth: 1, borderColor: "#cbd5e1"
  },
  slotSelected: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  slotText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  button: {
    backgroundColor: "#1a73e8", padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 20
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 20, fontSize: 14 }
});