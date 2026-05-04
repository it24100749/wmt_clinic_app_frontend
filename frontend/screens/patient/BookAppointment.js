import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from "react-native";
import api from "../../services/api";
 
export default function BookAppointment({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    api.get("/auth/doctors").then((res) => setDoctors(res.data)).catch(console.log);
  }, []);
 
  const loadSchedules = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSchedule(null);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/schedule/${doctor._id}`);
      setSchedules(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load schedules");
    }
  };
 
  const bookAppointment = async () => {
    if (!selectedSchedule) return Alert.alert("Error", "Please select a schedule");
    if (!selectedSlot) return Alert.alert("Error", "Please select a time slot");
    setLoading(true);
    try {
      await api.post("/appointments", {
        doctor: selectedDoctor._id,
        scheduleId: selectedSchedule._id,
        date: selectedSchedule.date,
        slotTime: selectedSlot.startTime
      });
      Alert.alert("Success", "Appointment booked!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Select a Doctor</Text>
      {doctors.map((doc) => (
        <TouchableOpacity
          key={doc._id}
          style={[styles.card, selectedDoctor?._id === doc._id && styles.selected]}
          onPress={() => loadSchedules(doc)}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.name}>Dr. {doc.name}</Text>
              <Text style={styles.specialization}>{doc.specialization || "General Physician"}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Available</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
 
      {schedules.length > 0 && (
        <>
          <Text style={styles.heading}>Select a Schedule</Text>
          {schedules.map((s) => (
            <TouchableOpacity
              key={s._id}
              style={[styles.card, selectedSchedule?._id === s._id && styles.selected]}
              onPress={() => {
                setSelectedSchedule(s);
                setSelectedSlot(null);
              }}
            >
              <Text style={styles.name}>{s.date} — {s.startTime} to {s.endTime}</Text>
              <Text style={styles.email}>Fee: Rs. {s.consultationFee}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
 
      {selectedSchedule && selectedSchedule.slots && selectedSchedule.slots.length > 0 && (
        <>
          <Text style={styles.heading}>Select a Time Slot</Text>
          <View style={styles.slotGrid}>
            {selectedSchedule.slots.map((slot, index) => {
              if (slot.isBooked) return null; // Hide booked slots
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
              )
            })}
          </View>
        </>
      )}
 
      {selectedSlot && (
        <TouchableOpacity style={styles.button} onPress={bookAppointment} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Booking</Text>}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  heading: { fontSize: 17, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: "#eee",
    shadowColor: "#000", shadowOpacity: 0.04, elevation: 1
  },
  selected: { borderColor: "#1a73e8", backgroundColor: "#eef3ff" },
  name: { fontSize: 15, fontWeight: "600", color: "#222" },
  specialization: { fontSize: 13, color: "#1a73e8", marginTop: 2, fontWeight: "500" },
  badge: { backgroundColor: "#e6f4ea", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "#1e8e3e", fontSize: 11, fontWeight: "bold" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  slotCard: {
    backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
    margin: 5, borderWidth: 1, borderColor: "#cbd5e1"
  },
  slotSelected: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  slotText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  button: {
    backgroundColor: "#1a73e8", padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 20, marginBottom: 40
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});